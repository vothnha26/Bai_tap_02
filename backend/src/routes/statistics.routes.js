const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statistics.controller');
const { verifyAuth, verifyAdmin } = require('../middlewares/auth.middleware');

// Chỉ ADMIN mới được xem thống kê
router.get('/', verifyAuth, verifyAdmin, statisticsController.getAdminStats);

module.exports = router;
