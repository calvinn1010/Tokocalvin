const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { pool } = require('../database/db');
const { auth } = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const upload = require('../middleware/upload');

// Get all instruments
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM instruments i
      LEFT JOIN categories c ON i.category_id = c.id
      ORDER BY i.created_at DESC
    `);

    // Format to match frontend expectation
    const formatted = rows.map(i => ({
      ...i,
      category: i.category_name, // Frontend uses .category name for filtering/display
      price: i.price_per_day     // Frontend uses .price
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Get single instrument
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, c.name as category_name, c.icon as category_icon, c.color as category_color
      FROM instruments i
      LEFT JOIN categories c ON i.category_id = c.id
      WHERE i.id = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Alat musik tidak ditemukan' });
    }

    const instrument = {
      ...rows[0],
      category: rows[0].category_name
    };

    res.json(instrument);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Create instrument (Admin Only)
router.post('/', auth, checkRole('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, category_id, condition, stock, description, price_per_day, brand } = req.body;

    if (!name || !category_id || !condition || stock === undefined || stock === null || stock === '') {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    const stockNum = parseInt(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      return res.status(400).json({ message: 'Stok harus berupa angka positif' });
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      `INSERT INTO instruments (name, category_id, \`condition\`, stock, description, price_per_day, brand, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, category_id, condition, stockNum, description, price_per_day || 0, brand || '', image]
    );

    const [newRows] = await pool.query('SELECT * FROM instruments WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Alat musik berhasil ditambahkan',
      instrument: newRows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Update instrument (Admin Only)
router.put('/:id', auth, checkRole('admin'), upload.single('image'), async (req, res) => {
  try {
    const { name, category_id, condition, stock, description, price_per_day, brand } = req.body;
    const id = req.params.id;

    let query = 'UPDATE instruments SET updated_at = NOW()';
    const params = [];

    if (name) { query += ', name = ?'; params.push(name); }
    if (category_id) { query += ', category_id = ?'; params.push(category_id); }
    if (condition) { query += ', `condition` = ?'; params.push(condition); }
    if (stock !== undefined) { query += ', stock = ?'; params.push(stock); }
    if (description !== undefined) { query += ', description = ?'; params.push(description); }
    if (price_per_day !== undefined) { query += ', price_per_day = ?'; params.push(price_per_day); }
    if (brand !== undefined) { query += ', brand = ?'; params.push(brand); }

    if (req.file) {
      query += ', image = ?';
      params.push(`/uploads/${req.file.filename}`);
    }

    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alat musik tidak ditemukan' });
    }

    const [updatedRows] = await pool.query('SELECT * FROM instruments WHERE id = ?', [id]);

    res.json({
      message: 'Alat musik berhasil diupdate',
      instrument: updatedRows[0]
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

// Delete instrument image (Admin Only)
router.delete('/:id/image', auth, checkRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[DELETE IMAGE] Attempting to delete image for instrument ID: ${id}`);
    
    const [rows] = await pool.query('SELECT name, image FROM instruments WHERE id = ?', [id]);
    console.log(`[DELETE IMAGE] Query result:`, rows);
    
    if (rows.length === 0) {
      console.warn(`[DELETE IMAGE] No instrument found with ID: ${id}`);
      return res.status(404).json({ success: false, message: 'Alat musik tidak ditemukan' });
    }

    if (rows[0].image) {
      try {
        const filePath = path.join(__dirname, '..', rows[0].image);
        console.log(`[DELETE IMAGE] Attempting to delete file: ${filePath}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[DELETE IMAGE] Successfully deleted file: ${filePath}`);
        } else {
          console.warn(`[DELETE IMAGE] File not found: ${filePath}`);
        }
      } catch (err) {
        console.error(`[DELETE IMAGE] Error deleting file:`, err);
        // Continue with DB update even if file deletion fails
      }
    }

    await pool.query('UPDATE instruments SET image = NULL WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'Gambar berhasil dihapus' });
  } catch (error) {
    console.error('[DELETE IMAGE ERROR]:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal menghapus gambar dari server', 
      error: error.message 
    });
  }
});

// Delete instrument (Admin Only)
router.delete('/:id', auth, checkRole('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT image FROM instruments WHERE id = ?', [req.params.id]);
    
    if (rows.length > 0 && rows[0].image) {
      try {
        const filePath = path.join(__dirname, '..', rows[0].image);
        console.log(`[DELETE INSTRUMENT] Attempting to delete file: ${filePath}`);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`[DELETE INSTRUMENT] Successfully deleted file: ${filePath}`);
        } else {
          console.warn(`[DELETE INSTRUMENT] File not found: ${filePath}`);
        }
      } catch (err) {
        console.error(`[DELETE INSTRUMENT] Error deleting file:`, err);
        // Continue with instrument deletion even if file deletion fails
      }
    }

    const [result] = await pool.query('DELETE FROM instruments WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Alat musik tidak ditemukan' });
    }

    res.json({ message: 'Alat musik berhasil dihapus' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;
