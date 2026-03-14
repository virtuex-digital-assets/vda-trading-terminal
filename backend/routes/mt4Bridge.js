/**
 * MT4 Bridge routes.
 */
const express = require('express');
const router  = express.Router();
const mt4Ctrl = require('../controllers/mt4Controller');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { adminLimiter } = require('../middleware/rateLimiter');
const { auditLog } = require('../middleware/auditLog');

router.use(adminLimiter, authMiddleware, adminOnly);

router.get('/servers',                        mt4Ctrl.listServers);
router.post('/servers',                       auditLog, mt4Ctrl.addServer);
router.get('/servers/:id',                    mt4Ctrl.getServer);
router.patch('/servers/:id',                  auditLog, mt4Ctrl.updateServer);
router.post('/servers/:id/connect',           auditLog, mt4Ctrl.connect);
router.post('/servers/:id/disconnect',        auditLog, mt4Ctrl.disconnect);
router.get('/servers/:id/positions',          mt4Ctrl.getOpenPositions);
router.get('/servers/:id/balance/:login',     mt4Ctrl.syncBalance);

module.exports = router;
