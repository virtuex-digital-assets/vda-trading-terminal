/**
 * Copy Trading routes.
 */
const express = require('express');
const router  = express.Router();
const copyCtrl = require('../controllers/copyTradingController');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter, authMiddleware);

// Strategy management
router.get('/strategies',                        copyCtrl.listStrategies);
router.post('/strategies',                       copyCtrl.createStrategy);
router.get('/strategies/:id',                    copyCtrl.getStrategy);
router.patch('/strategies/:id',                  copyCtrl.updateStrategy);

// Leaderboard (public-ish, still requires auth)
router.get('/leaderboard',                       copyCtrl.getLeaderboard);

// Subscriptions
router.get('/subscriptions',                     copyCtrl.getMySubscriptions);
router.post('/subscriptions',                    copyCtrl.subscribe);
router.delete('/subscriptions/:id',              copyCtrl.unsubscribe);

// Admin: list all strategies
router.get('/admin/strategies',                  adminOnly, copyCtrl.adminListStrategies);

module.exports = router;
