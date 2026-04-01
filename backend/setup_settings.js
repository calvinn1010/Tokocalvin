const { pool } = require('./database/db');

async function setupSettingsTable() {
  const connection = await pool.getConnection();
  try {
    console.log('Creating settings table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS settings (
        \`key\` VARCHAR(255) PRIMARY KEY,
        \`value\` TEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Initializing default settings...');
    // Use INSERT IGNORE or check then insert
    await connection.query("INSERT IGNORE INTO settings (`key`, `value`) VALUES ('late_fee_per_day', '10000')");
    await connection.query("INSERT IGNORE INTO settings (`key`, \`value\`) VALUES ('grace_period_hours', '24')");

    console.log('✅ Settings table setup complete.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up settings table:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

setupSettingsTable();
