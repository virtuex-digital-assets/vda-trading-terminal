const express = require('express');
const router  = express.Router();
const { register, login, me } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { authLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login',    authLimiter, login);
router.get('/me',        apiLimiter, authMiddleware, me);

module.exports = router;
