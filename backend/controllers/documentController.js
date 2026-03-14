/**
 * Document / KYC controller.
 *
 * Manages document uploads (simulated) and KYC review records.
 */

const {
  documents, kycReviews,
  createDocument, createKycReview,
} = require('../models/documentStore');

// ── Documents ─────────────────────────────────────────────────────────────────

function listDocuments(req, res) {
  try {
    let list = [...documents.values()];
    if (req.user.role === 'trader') {
      list = list.filter((d) => d.userId === req.user.id);
    }
    list.sort((a, b) => (b.uploadedAt > a.uploadedAt ? 1 : -1));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function uploadDocument(req, res) {
  try {
    const { type, filename, originalName, mimetype, size } = req.body;
    if (!type || !filename) {
      return res.status(400).json({ error: 'type and filename are required' });
    }
    const doc = createDocument({
      userId: req.user.id,
      type,
      filename,
      originalName: originalName || filename,
      mimetype: mimetype || 'application/octet-stream',
      size: parseInt(size) || 0,
      status: 'pending',
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function reviewDocument(req, res) {
  try {
    const doc = documents.get(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const { status, note } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: "status must be 'approved' or 'rejected'" });
    }
    doc.status = status;
    doc.reviewedBy = req.user.id;
    doc.reviewNote = note || '';
    doc.reviewedAt = new Date().toISOString();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ── KYC ───────────────────────────────────────────────────────────────────────

function getKycStatus(req, res) {
  try {
    const { userId } = req.params;
    const review = [...kycReviews.values()].find((r) => r.userId === userId) || null;
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function createKycReviewHandler(req, res) {
  try {
    const review = createKycReview({ ...req.body, reviewedBy: req.user.id });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listDocuments,
  uploadDocument,
  reviewDocument,
  getKycStatus,
  createKycReview: createKycReviewHandler,
};
