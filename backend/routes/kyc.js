/**
 * KYC routes.
 *
 * Trader routes:
 *   GET    /api/kyc/profile           – get own profile + documents
 *   GET    /api/kyc/documents         – list own documents
 *   POST   /api/kyc/documents         – submit a document
 *
 * Admin routes:
 *   GET    /api/kyc/admin/profiles           – list all profiles
 *   GET    /api/kyc/admin/profiles/:userId   – get user's profile
 *   PATCH  /api/kyc/admin/profiles/:userId   – override profile status
 *   PATCH  /api/kyc/admin/documents/:docId   – review a document
 */

const express = require('express');
const router  = express.Router();
const kycCtrl = require('../controllers/kycController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

// All KYC routes require authentication
router.use(apiLimiter, authMiddleware);

// ── Trader routes ────────────────────────────────────────────────────────
router.get('/profile',               kycCtrl.getMyProfile);
router.get('/documents',             kycCtrl.getMyDocuments);
router.post('/documents',            auditLog, kycCtrl.submitDocument);

// ── Admin routes ─────────────────────────────────────────────────────────
router.get('/admin/profiles',                  adminLimiter, adminOnly, kycCtrl.listProfiles);
router.get('/admin/profiles/:userId',          adminLimiter, adminOnly, kycCtrl.getProfile);
router.patch('/admin/profiles/:userId',        adminLimiter, adminOnly, auditLog, kycCtrl.reviewProfile);
router.patch('/admin/documents/:docId',        adminLimiter, adminOnly, auditLog, kycCtrl.reviewDocument);

module.exports = router;
