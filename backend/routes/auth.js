const express = require('express');
const router  = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.post('/register', authLimiter, auditLog, register);
router.post('/login',    authLimiter, auditLog, login);
router.get('/me',        apiLimiter, authMiddleware, me);

module.exports = router;
