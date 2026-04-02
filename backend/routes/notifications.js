const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const checkRole = require('../middleware/checkRole');
const { auth } = require('../middleware/auth');

// All notification routes are protected
// Should be accessible by admin and petugas
router.use(auth);
router.use(checkRole('admin', 'petugas'));

router.get('/', NotificationController.getNotifications);
router.put('/:id/read', NotificationController.markAsRead);
router.put('/clear', NotificationController.clearAll);

module.exports = router;
