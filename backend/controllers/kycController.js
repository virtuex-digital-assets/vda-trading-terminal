/**
 * KYC controller – handles KYC document upload, profile status, and admin review.
 */

const kycService = require('../services/kycService');

// ── Trader endpoints ───────────────────────────────────────────────────────

/**
 * GET /api/kyc/profile
 * Returns the authenticated user's KYC profile.
 */
function getMyProfile(req, res) {
  const profile = kycService.getProfile(req.user.id);
  const docs     = kycService.listDocuments(req.user.id);
  res.json({ profile, documents: docs });
}

/**
 * POST /api/kyc/documents
 * Body: { type, fileName, fileUrl, mimeType, fileSize }
 * Submits a KYC document for review.
 */
function submitDocument(req, res) {
  const { type, fileName, fileUrl, mimeType, fileSize } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required' });
  if (!fileName && !fileUrl) return res.status(400).json({ error: 'fileName or fileUrl is required' });

  try {
    const doc = kycService.submitDocument({
      userId:   req.user.id,
      type,
      fileName,
      fileUrl,
      mimeType,
      fileSize,
    });
    res.status(201).json({ document: doc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * GET /api/kyc/documents
 * Returns the authenticated user's KYC documents.
 */
function getMyDocuments(req, res) {
  const docs = kycService.listDocuments(req.user.id);
  res.json({ documents: docs });
}

// ── Admin endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/kyc/admin/profiles
 * Returns all KYC profiles (admin only).
 * Query: ?status=pending|approved|rejected
 */
function listProfiles(req, res) {
  const { status } = req.query;
  let profiles = status === 'pending'
    ? kycService.listPendingProfiles()
    : kycService.listAllProfiles();

  if (status && status !== 'pending') {
    profiles = profiles.filter((p) => p.status === status);
  }

  res.json({ profiles, total: profiles.length });
}

/**
 * GET /api/kyc/admin/profiles/:userId
 * Returns a specific user's KYC profile (admin only).
 */
function getProfile(req, res) {
  const profile = kycService.getProfile(req.params.userId);
  const docs     = kycService.listDocuments(req.params.userId);
  res.json({ profile, documents: docs });
}

/**
 * PATCH /api/kyc/admin/documents/:docId
 * Body: { status: 'approved'|'rejected', rejectionReason? }
 * Reviews a KYC document (admin only).
 */
function reviewDocument(req, res) {
  const { status, rejectionReason } = req.body;
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const doc = kycService.reviewDocument(req.params.docId, {
      status,
      rejectionReason,
      reviewedBy: req.user.id,
    });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    res.json({ document: doc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

/**
 * PATCH /api/kyc/admin/profiles/:userId
 * Body: { status, level, rejectionReason? }
 * Manually overrides a user's KYC profile (admin only).
 */
function reviewProfile(req, res) {
  const { status, level, rejectionReason } = req.body;

  try {
    const profile = kycService.reviewProfile(req.params.userId, {
      status,
      level,
      rejectionReason,
      reviewedBy: req.user.id,
    });
    res.json({ profile });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getMyProfile,
  submitDocument,
  getMyDocuments,
  listProfiles,
  getProfile,
  reviewDocument,
  reviewProfile,
};
