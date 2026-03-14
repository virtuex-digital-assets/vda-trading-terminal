const express = require('express');
const router  = express.Router();
const {
  listBrokers, getBroker, createBroker, updateBroker, toggleBroker,
  listBrokerAdmins, assignBrokerAdmin,
} = require('../controllers/brokerController');
const { authMiddleware, adminOnly, superAdminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware);

router.get('/',                  adminOnly, listBrokers);
router.get('/:id',               adminOnly, getBroker);
router.get('/:id/admins',        adminOnly, listBrokerAdmins);
router.post('/',                 superAdminOnly, auditLog, createBroker);
router.patch('/:id',             superAdminOnly, auditLog, updateBroker);
router.patch('/:id/status',      superAdminOnly, auditLog, toggleBroker);
router.post('/:id/admins',       superAdminOnly, auditLog, assignBrokerAdmin);

module.exports = router;
