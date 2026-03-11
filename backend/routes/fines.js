const express = require('express');
const router = express.Router();
const FineController = require('../controllers/FineController');
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get fine statistics (must be before /:id route)
router.get('/stats', auth, checkRole('admin', 'petugas'), FineController.getFineStats);

// Get fine settings (must be before /:id route)
router.get('/settings', auth, checkRole('admin', 'petugas'), FineController.getFineSettings);

// Update fine settings (admin only)
router.put('/settings', auth, checkRole('admin'), FineController.updateFineSettings);

// Get all fines (admin & petugas only)
router.get('/', auth, checkRole('admin', 'petugas'), FineController.getAllFines);

// Calculate fine for a rental
router.post('/:id/calculate', auth, checkRole('admin', 'petugas'), FineController.calculateFine);

// Mark fine as paid
router.put('/:id/pay', auth, checkRole('admin', 'petugas'), FineController.markFinePaid);

module.exports = router;