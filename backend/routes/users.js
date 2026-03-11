const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db');
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Get all users (Admin only)
router.get('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, full_name as fullName, created_at as createdAt FROM users'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Get single user (Admin only)
router.get('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, role, full_name as fullName, created_at as createdAt FROM users WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Create user (Admin only)
router.post('/', auth, checkRole('admin'), async (req, res) => {
  try {
    const { username, email, password, role, fullName } = req.body;

    if (!username || !email || !password || !role || !fullName) {
      return res.status(400).json({ message: 'Semua field harus diisi' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username atau email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, role, full_name) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, role, fullName]
    );

    res.status(201).json({
      message: 'User berhasil dibuat',
      user: { id: result.insertId, username, email, role, fullName }
    });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Update user (Admin only)
router.put('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const { username, email, password, role, fullName } = req.body;
    const id = req.params.id;

    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    let query = 'UPDATE users SET updated_at = NOW()';
    const params = [];

    if (username) { query += ', username = ?'; params.push(username); }
    if (email) { query += ', email = ?'; params.push(email); }
    if (fullName) { query += ', full_name = ?'; params.push(fullName); }
    if (role) { query += ', role = ?'; params.push(role); }
    if (password) {
      query += ', password = ?';
      params.push(await bcrypt.hash(password, 10));
    }

    query += ' WHERE id = ?';
    params.push(id);

    await pool.query(query, params);

    res.json({ message: 'User berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Delete user (Admin only) - Cascade delete related records
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const id = req.params.id;

    if (parseInt(id) === req.user.id) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: 'Tidak bisa menghapus akun sendiri' });
    }

    // Check if user exists
    const [userExists] = await connection.query('SELECT id FROM users WHERE id = ?', [id]);
    if (userExists.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Delete rentals related to this user (includes fine data)
    // Delete both where user_id (rentals by user) and approved_by (approvals by staff)
    await connection.query('DELETE FROM rentals WHERE user_id = ? OR approved_by = ?', [id, id]);
    
    // Delete the user
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]);

    await connection.commit();
    connection.release();

    res.json({ message: 'User dan data terkaitnya berhasil dihapus' });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;
