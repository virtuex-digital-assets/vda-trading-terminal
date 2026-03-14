const express = require('express');
const router  = express.Router();
const {
  listDocuments, uploadDocument, reviewDocument,
  getKycStatus, createKycReview,
} = require('../controllers/documentController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

// Documents
router.get('/',              listDocuments);
router.post('/',             uploadDocument);
router.patch('/:id/review', adminOnly, auditLog, reviewDocument);

// KYC
router.get('/kyc/:userId',            getKycStatus);
router.post('/kyc',                   adminOnly, auditLog, createKycReview);

module.exports = router;
