const { pool } = require('./database/db');

async function verifyPersistence() {
  const connection = await pool.getConnection();
  try {
    console.log('Testing Fine Settings Persistence...');
    
    // 1. Update settings
    console.log('Changing late_fee_per_day to 500000...');
    await connection.query('UPDATE settings SET \`value\` = ? WHERE \`key\` = ?', ['500000', 'late_fee_per_day']);
    
    // 2. Read settings back
    console.log('Reading settings back from database...');
    const [rows] = await connection.query('SELECT `value` FROM settings WHERE `key` = "late_fee_per_day"');
    
    if (rows.length > 0 && rows[0].value === '500000') {
      console.log('✅ PASS: Fine settings persisted correctly to 500,000.');
    } else {
      console.error('❌ FAIL: Fine settings did not persist. Current value:', rows[0] ? rows[0].value : 'none');
    }

    // Reset to default for now (optional, but good practice)
    // await connection.query('UPDATE settings SET `value` = ? WHERE `key` = ?', ['10000', 'late_fee_per_day']);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during verification:', error);
    process.exit(1);
  } finally {
    connection.release();
  }
}

verifyPersistence();
