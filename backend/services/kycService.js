/**
 * KYC (Know Your Customer) Service.
 *
 * Manages identity verification documents and KYC status for traders.
 *
 * KYC levels:
 *   0 – unverified   (default)
 *   1 – basic         (ID document verified)
 *   2 – enhanced      (ID + proof of address verified)
 *   3 – full          (all documents verified, large withdrawals unlocked)
 *
 * Document types:
 *   passport, national_id, drivers_license, utility_bill,
 *   bank_statement, selfie
 */

const { v4: uuidv4 } = require('uuid');

// ── Data stores ────────────────────────────────────────────────────────────

/**
 * KYC profiles  userId → {
 *   userId, level, status, submittedAt, reviewedAt, reviewedBy,
 *   rejectionReason, documents: [docId, ...]
 * }
 */
const kycProfiles = new Map();

/**
 * KYC documents  id → {
 *   id, userId, type, fileName, fileUrl, mimeType, fileSize,
 *   status: 'pending'|'approved'|'rejected',
 *   rejectionReason, uploadedAt, reviewedAt, reviewedBy
 * }
 */
const kycDocuments = new Map();

// ── Helpers ────────────────────────────────────────────────────────────────

const VALID_DOC_TYPES = [
  'passport',
  'national_id',
  'drivers_license',
  'utility_bill',
  'bank_statement',
  'selfie',
  'corporate_registration',
];

const VALID_STATUSES = ['pending', 'approved', 'rejected'];

function getOrCreateProfile(userId) {
  if (!kycProfiles.has(userId)) {
    kycProfiles.set(userId, {
      userId,
      level:           0,
      status:          'not_submitted', // not_submitted | pending | approved | rejected
      submittedAt:     null,
      reviewedAt:      null,
      reviewedBy:      null,
      rejectionReason: null,
      documents:       [],
    });
  }
  return kycProfiles.get(userId);
}

function getProfile(userId) {
  return getOrCreateProfile(userId);
}

function getDocument(docId) {
  return kycDocuments.get(docId) || null;
}

function listDocuments(userId) {
  return [...kycDocuments.values()].filter((d) => d.userId === userId);
}

// ── Document upload ────────────────────────────────────────────────────────

function submitDocument({ userId, type, fileName, fileUrl, mimeType, fileSize }) {
  if (!VALID_DOC_TYPES.includes(type)) {
    throw new Error(`Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}`);
  }

  const id = uuidv4();
  const doc = {
    id,
    userId,
    type,
    fileName:        String(fileName || '').slice(0, 255),
    fileUrl:         String(fileUrl || '').slice(0, 1000),
    mimeType:        String(mimeType || 'application/octet-stream').slice(0, 100),
    fileSize:        Number(fileSize) || 0,
    status:          'pending',
    rejectionReason: null,
    uploadedAt:      new Date().toISOString(),
    reviewedAt:      null,
    reviewedBy:      null,
  };
  kycDocuments.set(id, doc);

  const profile = getOrCreateProfile(userId);
  if (!profile.documents.includes(id)) {
    profile.documents.push(id);
  }
  // Move profile to pending if it was not_submitted
  if (profile.status === 'not_submitted') {
    profile.status      = 'pending';
    profile.submittedAt = new Date().toISOString();
  }

  return doc;
}

// ── Admin review ───────────────────────────────────────────────────────────

function reviewDocument(docId, { status, rejectionReason, reviewedBy }) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error("status must be 'pending', 'approved', or 'rejected'");
  }
  const doc = kycDocuments.get(docId);
  if (!doc) return null;

  doc.status          = status;
  doc.rejectionReason = rejectionReason || null;
  doc.reviewedAt      = new Date().toISOString();
  doc.reviewedBy      = reviewedBy;

  // Recalculate KYC level based on approved docs
  _recalculateLevel(doc.userId);

  return doc;
}

function reviewProfile(userId, { status, level, rejectionReason, reviewedBy }) {
  const profile = getOrCreateProfile(userId);

  if (status)          profile.status          = status;
  if (level !== undefined) profile.level        = level;
  if (rejectionReason) profile.rejectionReason  = rejectionReason;
  profile.reviewedAt  = new Date().toISOString();
  profile.reviewedBy  = reviewedBy;

  return profile;
}

function _recalculateLevel(userId) {
  const profile = getOrCreateProfile(userId);
  const docs     = listDocuments(userId).filter((d) => d.status === 'approved');

  const hasId      = docs.some((d) => ['passport', 'national_id', 'drivers_license'].includes(d.type));
  const hasAddress = docs.some((d) => ['utility_bill', 'bank_statement'].includes(d.type));
  const hasSelfie  = docs.some((d) => d.type === 'selfie');

  if (hasId && hasAddress && hasSelfie) {
    profile.level  = 3;
    profile.status = 'approved';
  } else if (hasId && hasAddress) {
    profile.level  = 2;
    profile.status = 'approved';
  } else if (hasId) {
    profile.level  = 1;
    profile.status = 'approved';
  } else {
    profile.level = 0;
  }
}

// ── Admin – list all pending ───────────────────────────────────────────────

function listPendingProfiles() {
  return [...kycProfiles.values()].filter((p) => p.status === 'pending');
}

function listAllProfiles() {
  return [...kycProfiles.values()];
}

module.exports = {
  getProfile,
  getDocument,
  listDocuments,
  submitDocument,
  reviewDocument,
  reviewProfile,
  listPendingProfiles,
  listAllProfiles,
  VALID_DOC_TYPES,
};
