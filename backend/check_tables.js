const { pool } = require('./database/db');

async function checkTables() {
  try {
    const [rows] = await pool.query('SHOW TABLES');
    console.log('Tables in database:', JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTables();
