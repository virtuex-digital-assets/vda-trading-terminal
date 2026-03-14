const express = require('express');
const router  = express.Router();
const {
  listConversations, createConversation, getConversation,
  sendMessage, markRead,
} = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

router.get('/conversations',                  listConversations);
router.post('/conversations',                 auditLog, createConversation);
router.get('/conversations/:id',              getConversation);
router.post('/conversations/:id/messages',    auditLog, sendMessage);
router.patch('/conversations/:id/read',       markRead);

module.exports = router;
