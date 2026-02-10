const express = require('express');
const router = express.Router();
const RentalController = require('../controllers/RentalController2');
const { auth, checkRole } = require('../middleware/auth');

// Get all rentals
router.get('/', auth, RentalController.getAllRentals);

// Get single rental
router.get('/:id', auth, RentalController.getRentalById);

// Create new rental (only for users)
router.post('/', auth, RentalController.createRental);

// Update rental status (admin/petugas only)
router.put('/:id/status', auth, checkRole('admin', 'petugas'), RentalController.updateRentalStatus);

// Delete rental
router.delete('/:id', auth, RentalController.deleteRental);

module.exports = router;
