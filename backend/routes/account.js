const express = require('express');
const router  = express.Router();
const { getAccount, setLeverage } = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

router.get('/',           getAccount);
router.patch('/leverage', setLeverage);

module.exports = router;
