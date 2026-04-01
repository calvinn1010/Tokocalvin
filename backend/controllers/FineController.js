const { pool } = require('../database/db');

class FineController {
  // Get all fines (admin & petugas only)
  static async getAllFines(req, res) {
    try {
      const { status = '', userId = '' } = req.query;

      let query = `
        SELECT
          r.id, r.user_id, r.instrument_id, r.start_date, r.end_date,
          r.actual_return_date, r.status, r.late_fee_per_day, r.late_days,
          r.late_fee_total, r.total_price, r.payment_status,
          u.username, u.full_name, u.email, u.phone,
          i.name as instrument_name, i.brand, i.price_per_day,
          c.name as category_name, c.icon, c.color
        FROM rentals r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN instruments i ON r.instrument_id = i.id
        LEFT JOIN categories c ON i.category_id = c.id
        WHERE r.late_days > 0 OR r.late_fee_total > 0
      `;

      const params = [];

      if (userId) {
        query += ' AND r.user_id = ?';
        params.push(userId);
      }

      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      query += ' ORDER BY r.actual_return_date DESC, r.created_at DESC';

      const [fines] = await pool.query(query, params);

      res.json({ success: true, data: fines });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get fine settings (harga denda per hari)
  static async getFineSettings(req, res) {
    try {
      const [rows] = await pool.query('SELECT `key`, `value` FROM settings WHERE `key` IN ("late_fee_per_day", "grace_period_hours")');
      
      const settings = {
        late_fee_per_day: 10000,
        grace_period_hours: 24
      };

      rows.forEach(row => {
        if (row.key === 'late_fee_per_day') settings.late_fee_per_day = parseFloat(row.value);
        if (row.key === 'grace_period_hours') settings.grace_period_hours = parseInt(row.value);
      });

      res.json({ success: true, data: settings });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update fine settings (admin only)
  static async updateFineSettings(req, res) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { late_fee_per_day, grace_period_hours } = req.body;

      if (late_fee_per_day < 0 || grace_period_hours < 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: 'Nilai tidak boleh negatif' });
      }

      if (late_fee_per_day !== undefined) {
        await connection.query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', [late_fee_per_day.toString(), 'late_fee_per_day']);
      }
      
      if (grace_period_hours !== undefined) {
        await connection.query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', [grace_period_hours.toString(), 'grace_period_hours']);
      }

      await connection.commit();

      const settings = {
        late_fee_per_day: parseFloat(late_fee_per_day),
        grace_period_hours: parseInt(grace_period_hours)
      };

      res.json({
        success: true,
        message: 'Pengaturan denda berhasil diupdate',
        data: settings
      });

    } catch (error) {
      await connection.rollback();
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    } finally {
      connection.release();
    }
  }

  // Calculate and apply fine for a rental
  static async calculateFine(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      let { late_fee_per_day } = req.body;

      // If late_fee_per_day is not provided, fetch from settings
      if (late_fee_per_day === undefined || late_fee_per_day === null) {
        const [settings] = await connection.query('SELECT `value` FROM settings WHERE `key` = "late_fee_per_day"');
        late_fee_per_day = settings.length > 0 ? parseFloat(settings[0].value) : 10000;
      }

      const [rentals] = await connection.query('SELECT * FROM rentals WHERE id = ?', [id]);

      if (rentals.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
      }

      const rental = rentals[0];

      if (!rental.actual_return_date) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Alat belum dikembalikan' });
      }

      const returnDate = new Date(rental.actual_return_date);
      const endDate = new Date(rental.end_date);
      const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      let lateDays = 0;
      if (returnDate > (endDate.getTime() + gracePeriod)) {
        lateDays = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));
      }

      const lateFeeTotal = lateDays * parseFloat(late_fee_per_day);

      await connection.query(
        'UPDATE rentals SET late_fee_per_day = ?, late_days = ?, late_fee_total = ? WHERE id = ?',
        [late_fee_per_day, lateDays, lateFeeTotal, id]
      );

      await connection.commit();
      connection.release();

      const [updated] = await pool.query('SELECT * FROM rentals WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Denda berhasil dihitung',
        data: updated[0]
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Mark fine as paid
  static async markFinePaid(req, res) {
    try {
      const { id } = req.params;

      const [result] = await pool.query(
        'UPDATE rentals SET payment_status = ?, payment_date = NOW() WHERE id = ? AND late_fee_total > 0',
        ['completed', id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Denda tidak ditemukan atau sudah dibayar' });
      }

      const [updated] = await pool.query('SELECT * FROM rentals WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'Denda berhasil ditandai sebagai dibayar',
        data: updated[0]
      });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get fine statistics
  static async getFineStats(req, res) {
    try {
      const [stats] = await pool.query(`
        SELECT
          COUNT(*) as total_fines,
          SUM(late_fee_total) as total_amount,
          AVG(late_days) as avg_late_days,
          MAX(late_days) as max_late_days,
          COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as paid_fines,
          COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as unpaid_fines
        FROM rentals
        WHERE late_fee_total > 0
      `);

      res.json({ success: true, data: stats[0] });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = FineController;