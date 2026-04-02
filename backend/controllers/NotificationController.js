const { pool } = require('../database/db');

class NotificationController {
  static async getNotifications(req, res) {
    try {
      // For now, return all notifications that are relevant to admin/petugas
      // or target specific user if user_id is set.
      const [rows] = await pool.query(
        'SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? ORDER BY created_at DESC LIMIT 50',
        [req.user.id]
      );
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = ?', [id]);
      res.json({ success: true, message: 'Notifikasi ditandai sudah dibaca' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async clearAll(req, res) {
    try {
      await pool.query('UPDATE notifications SET is_read = TRUE WHERE user_id IS NULL OR user_id = ?', [req.user.id]);
      res.json({ success: true, message: 'Semua notifikasi dibersihkan' });
    } catch (error) {
      console.error('Error clearing notifications:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = NotificationController;
