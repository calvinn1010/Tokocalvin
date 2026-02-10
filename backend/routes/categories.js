const express = require('express');
const router = express.Router();
const { pool } = require('../database/db');
const { auth } = require('../middleware/auth');

// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: 'Terjadi kesalahan server', error: error.message });
  }
});

module.exports = router;
