const express = require('express');
const userController = require('../controllers/user.controller');
const userAddressController = require('../controllers/userAddress.controller');
const { verifyAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/profile', verifyAuth, userController.getProfile);
router.put('/profile', verifyAuth, userController.updateProfile);

// Address Management
router.get('/addresses', verifyAuth, userAddressController.getAddresses);
router.post('/addresses', verifyAuth, userAddressController.addAddress);
router.put('/addresses/:addressId', verifyAuth, userAddressController.updateAddress);
router.delete('/addresses/:addressId', verifyAuth, userAddressController.deleteAddress);
router.patch('/addresses/:addressId/default', verifyAuth, userAddressController.setDefaultAddress);

module.exports = router;

