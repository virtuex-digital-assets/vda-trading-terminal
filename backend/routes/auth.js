const express = require('express');
const router  = express.Router();
const { register, login, me, setup2FA, verify2FA, disable2FA } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.post('/register', authLimiter, auditLog, register);
router.post('/login',    authLimiter, auditLog, login);
router.get('/me',        apiLimiter, authMiddleware, me);

// 2FA management — requires an authenticated session
router.post('/2fa/setup',   apiLimiter, authMiddleware, setup2FA);
router.post('/2fa/verify',  apiLimiter, authMiddleware, verify2FA);
router.post('/2fa/disable', apiLimiter, authMiddleware, disable2FA);

module.exports = router;
