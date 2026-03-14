/**
 * In-memory document / KYC data store.
 */

const { v4: uuidv4 } = require('uuid');

// ── Documents ────────────────────────────────────────────────────────────────

const documents = new Map();

// ── KYC Reviews ──────────────────────────────────────────────────────────────

const kycReviews = new Map();

// ── Helpers ──────────────────────────────────────────────────────────────────

function createDocument(fields = {}) {
  const id = uuidv4();
  const document = {
    id,
    userId: fields.userId || null,
    type: fields.type || '',
    filename: fields.filename || '',
    originalName: fields.originalName || '',
    mimetype: fields.mimetype || '',
    size: fields.size || 0,
    status: fields.status || 'pending',
    reviewedBy: fields.reviewedBy || null,
    reviewNote: fields.reviewNote || '',
    uploadedAt: new Date().toISOString(),
    reviewedAt: null,
  };
  documents.set(id, document);
  return document;
}

function createKycReview(fields = {}) {
  const id = uuidv4();
  const now = new Date().toISOString();
  const review = {
    id,
    userId: fields.userId || null,
    status: fields.status || 'pending',
    documents: fields.documents || [],
    reviewedBy: fields.reviewedBy || null,
    note: fields.note || '',
    createdAt: now,
    updatedAt: now,
  };
  kycReviews.set(id, review);
  return review;
}

module.exports = {
  documents,
  kycReviews,
  createDocument,
  createKycReview,
};
