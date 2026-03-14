const express = require('express');
const router  = express.Router();
const {
  listSettings, getSetting, updateSetting, bulkUpdateSettings,
} = require('../controllers/settingsController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(apiLimiter, authMiddleware);

router.get('/',          listSettings);
router.get('/:key',      getSetting);
router.patch('/:key',    adminOnly, auditLog, updateSetting);
router.post('/bulk',     adminOnly, auditLog, bulkUpdateSettings);

module.exports = router;
