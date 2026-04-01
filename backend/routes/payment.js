const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');

// Midtrans webhook notification endpoint
router.post('/notification', PaymentController.handleNotification);

module.exports = router;
