require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Buat folder uploads jika belum ada
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Static files untuk uploads
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/instruments', require('./routes/instruments'));
app.use('/api/rentals', require('./routes/rentals'));
app.use('/api/categories', require('./routes/categories'));

// Log all requests for debugging 404s
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// 404 Handler
app.use((req, res, next) => {
  console.warn(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} tidak ditemukan`
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Music Rental System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      instruments: '/api/instruments',
      rentals: '/api/rentals'
    }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;

// Wrap listen in async to ensure DB is ready
const startServer = async () => {
  try {
    const initializeDatabase = require('./database/init');
    await initializeDatabase();
    
    app.listen(PORT, () => {
      console.log(`Server berjalan di port ${PORT}`);
      console.log(`Mode: ${process.env.NODE_ENV}`);
      console.log('\nDefault Users:');
      console.log('Admin - username: admin, password: admin123');
      console.log('Petugas - username: petugas, password: petugas123');
      console.log('User - username: user, password: user123');
    });
  } catch (error) {
    console.error('Gagal menjalankan server:', error);
  }
};

startServer();
