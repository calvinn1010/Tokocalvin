const { pool } = require('../database/db');

class RentalController {
  static async getAllRentals(req, res) {
    try {
      const { status = '', userId = '' } = req.query;

      let query = `
        SELECT 
          r.id, r.user_id, r.instrument_id, r.start_date, r.end_date,
          r.status, r.notes, r.total_days, r.total_price, r.approved_by,
          r.approved_at, r.actual_return_date, r.rejection_reason,
          r.payment_method, r.payment_status, r.payment_amount, r.payment_date,
          r.created_at, r.updated_at,
          u.username, u.full_name, u.email, u.phone,
          i.name as instrument_name, i.brand, i.price_per_day, i.stock,
          c.name as category_name, c.icon, c.color,
          a.username as approver_username, a.full_name as approver_name
        FROM rentals r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN instruments i ON r.instrument_id = i.id
        LEFT JOIN categories c ON i.category_id = c.id
        LEFT JOIN users a ON r.approved_by = a.id
        WHERE 1=1
      `;

      const params = [];

      if (req.user.role === 'user') {
        query += ' AND r.user_id = ?';
        params.push(req.user.id);
      } else if (userId) {
        query += ' AND r.user_id = ?';
        params.push(userId);
      }

      if (status) {
        query += ' AND r.status = ?';
        params.push(status);
      }

      query += ' ORDER BY r.created_at DESC';

      const [rentals] = await pool.query(query, params);

      res.json({ success: true, data: rentals });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRentalById(req, res) {
    try {
      const [rentals] = await pool.query(
        `SELECT r.*, u.username, u.full_name, u.email, u.phone, u.address,
                i.name as instrument_name, i.brand, i.price_per_day, 
                c.name as category_name, c.icon, c.color,
                a.username as approver_username, a.full_name as approver_name
         FROM rentals r
         LEFT JOIN users u ON r.user_id = u.id
         LEFT JOIN instruments i ON r.instrument_id = i.id
         LEFT JOIN categories c ON i.category_id = c.id
         LEFT JOIN users a ON r.approved_by = a.id
         WHERE r.id = ?`,
        [req.params.id]
      );

      if (rentals.length === 0) {
        return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
      }

      const rental = rentals[0];

      if (req.user.role === 'user' && rental.user_id !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Akses ditolak' });
      }

      res.json({ success: true, data: rental });

    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createRental(req, res) {
    // Only users (peminjam) can create rental requests
    if (req.user.role !== 'user') {
      return res.status(403).json({
        success: false,
        message: 'Hanya peminjam (user) yang dapat mengajukan peminjaman'
      });
    }

    // Log incoming payload for debugging UI submission issues
    console.log('createRental payload from user', req.user?.id, JSON.stringify(req.body));

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { instrumentId, startDate, endDate, notes, paymentMethod = 'cash' } = req.body;

      // Ensure instrumentId is an integer
      const instId = parseInt(instrumentId);
      if (isNaN(instId)) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'instrumentId tidak valid' });
      }

      if (!instrumentId || !startDate || !endDate) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Tanggal mulai tidak valid' });
      }

      if (end <= start) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Tanggal selesai harus lebih besar' });
      }

      const [instruments] = await connection.query(
        'SELECT * FROM instruments WHERE id = ?',
        [instId]
      );

      if (instruments.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success: false, message: 'Alat musik tidak ditemukan' });
      }

      const instrument = instruments[0];

      if (!instrument.is_available || instrument.stock <= 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Alat musik tidak tersedia' });
      }

      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalPrice = totalDays * parseFloat(instrument.price_per_day);

      const [result] = await connection.query(
        `INSERT INTO rentals 
         (user_id, instrument_id, start_date, end_date, status, notes, total_days, total_price, 
          payment_method, payment_status, payment_amount)
         VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, 'pending', ?)`,
        [req.user.id, instId, start, end, notes, totalDays, totalPrice, paymentMethod, totalPrice]
      );

      await connection.commit();
      connection.release();

      const [createdRentals] = await pool.query(
        `SELECT r.*, u.username, u.full_name, u.email, i.name as instrument_name, i.price_per_day, c.name as category_name
         FROM rentals r
         LEFT JOIN users u ON r.user_id = u.id
         LEFT JOIN instruments i ON r.instrument_id = i.id
         LEFT JOIN categories c ON i.category_id = c.id
         WHERE r.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Pengajuan peminjaman berhasil dibuat',
        data: createdRentals[0]
      });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateRentalStatus(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;
      const { status, rejectionReason } = req.body;

      if (!['pending', 'approved', 'rejected', 'returned', 'cancelled'].includes(status)) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ success: false, message: 'Status tidak valid' });
      }

      const [rentals] = await connection.query('SELECT * FROM rentals WHERE id = ?', [id]);

      if (rentals.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
      }

      const rental = rentals[0];
      const oldStatus = rental.status;

      const [instruments] = await connection.query('SELECT * FROM instruments WHERE id = ?', [rental.instrument_id]);
      const instrument = instruments[0];

      if (status === 'approved' && oldStatus === 'pending') {
        if (instrument.stock <= 0) {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success: false, message: 'Stok tidak mencukupi' });
        }
        await connection.query(
          'UPDATE instruments SET stock = stock - 1, is_available = ? WHERE id = ?',
          [instrument.stock > 1 ? 1 : 0, rental.instrument_id]
        );
        await connection.query(
          'UPDATE rentals SET approved_by = ?, approved_at = NOW(), payment_status = ? WHERE id = ?',
          [req.user.id, 'completed', id]
        );
      } else if (status === 'returned' && oldStatus === 'approved') {
        await connection.query('UPDATE instruments SET stock = stock + 1, is_available = 1 WHERE id = ?', [rental.instrument_id]);
        await connection.query('UPDATE rentals SET actual_return_date = NOW() WHERE id = ?', [id]);

        // Calculate late fee automatically
        const returnDate = new Date();
        const endDate = new Date(rental.end_date);
        const gracePeriod = 24 * 60 * 60 * 1000; // 24 hours grace period

        let lateDays = 0;
        let lateFeePerDay = 10000; // Default Rp 10,000 per day
        let lateFeeTotal = 0;

        if (returnDate > (endDate.getTime() + gracePeriod)) {
          lateDays = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));
          lateFeeTotal = lateDays * lateFeePerDay;
        }

        await connection.query(
          'UPDATE rentals SET late_fee_per_day = ?, late_days = ?, late_fee_total = ? WHERE id = ?',
          [lateFeePerDay, lateDays, lateFeeTotal, id]
        );
      } else if ((status === 'rejected' || status === 'cancelled') && oldStatus === 'approved') {
        await connection.query('UPDATE instruments SET stock = stock + 1, is_available = 1 WHERE id = ?', [rental.instrument_id]);
      }

      let updateQuery = 'UPDATE rentals SET status = ?';
      const updateParams = [status];

      if (rejectionReason) {
        updateQuery += ', rejection_reason = ?';
        updateParams.push(rejectionReason);
      }

      updateQuery += ' WHERE id = ?';
      updateParams.push(id);

      await connection.query(updateQuery, updateParams);
      await connection.commit();
      connection.release();

      const [updated] = await pool.query('SELECT * FROM rentals WHERE id = ?', [id]);

      res.json({ success: true, message: `Status diubah menjadi ${status}`, data: updated[0] });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteRental(req, res) {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const { id } = req.params;

      const [rentals] = await connection.query('SELECT * FROM rentals WHERE id = ?', [id]);

      if (rentals.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ success: false, message: 'Peminjaman tidak ditemukan' });
      }

      const rental = rentals[0];

      if (req.user.role === 'user') {
        if (rental.user_id !== req.user.id) {
          await connection.rollback();
          connection.release();
          return res.status(403).json({ success: false, message: 'Akses ditolak' });
        }
        if (rental.status !== 'pending') {
          await connection.rollback();
          connection.release();
          return res.status(400).json({ success: false, message: 'Hanya pending yang bisa dihapus' });
        }
      }

      if (rental.status === 'approved') {
        await connection.query('UPDATE instruments SET stock = stock + 1, is_available = 1 WHERE id = ?', [rental.instrument_id]);
      }

      await connection.query('DELETE FROM rentals WHERE id = ?', [id]);
      await connection.commit();
      connection.release();

      res.json({ success: true, message: 'Peminjaman berhasil dihapus' });

    } catch (error) {
      await connection.rollback();
      connection.release();
      console.error('Error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = RentalController;
