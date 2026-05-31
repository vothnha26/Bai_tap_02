const express = require('express');
const userController = require('../controllers/user.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', verifyAuth, userController.getProfile);
router.put('/profile', verifyAuth, userController.updateProfile);

module.exports = router;
