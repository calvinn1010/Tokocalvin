const { pool } = require('./database/db');

async function createNotificationsTable() {
  try {
    console.log('--- Creating Notifications Table ---');
    
    const query = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        type VARCHAR(50) DEFAULT 'info',
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(query);
    console.log('Notifications table created or already exists.');
    
    // Test if we can insert a record
    // await pool.query("INSERT INTO notifications (title, message, type) VALUES ('Sistem Siap', 'Sistem notifikasi telah aktif.', 'success')");
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to create notifications table:', err.message);
    process.exit(1);
  }
}

createNotificationsTable();
