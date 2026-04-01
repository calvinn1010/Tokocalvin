const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../database/db');

class AuthController {
 static async register(req, res) {
  try {
    const { username, email, password, fullName, } = req.body;

    if (!username || !email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Data wajib diisi'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Username atau email sudah terdaftar'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, email, password, full_name, role)
       VALUES (?, ?, ?, ?, 'user')`,
      [username, email, hashedPassword, fullName,]
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil'
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}
  /**
   * Login user
   * POST /api/auth/login
   */
  static async login(req, res) {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Login gagal' });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ success: false, message: 'Login gagal' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    delete user.password;

    res.json({
      success: true,
      data: { token, user }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}


  /**
   * Get current authenticated user
   * GET /api/auth/me
   */
  static async getCurrentUser(req, res) {
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, full_name AS fullName, role FROM users WHERE id = ?',
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });

    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan server', 
        error: error.message 
      });
    }
  }

  /**
   * Logout user (client-side action, server just validates)
   * POST /api/auth/logout
   */
  static async logout(req, res) {
    try {
      // Dalam implementasi JWT stateless, logout dilakukan di client
      // dengan menghapus token. Server hanya memberikan response sukses.
      
      res.json({
        success: true,
        message: 'Logout berhasil'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan server', 
        error: error.message 
      });
    }
  }

  /**
   * Change password
   * PUT /api/auth/change-password
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validasi input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false,
          message: 'Password lama dan password baru harus diisi' 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false,
          message: 'Password baru minimal 6 karakter' 
        });
      }

      // Get user hashed password from DB
      const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);

      if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'Password lama salah' });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

      res.json({ success: true, message: 'Password berhasil diubah' });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Terjadi kesalahan server', 
        error: error.message 
      });
    }
  }
}

module.exports = AuthController;
