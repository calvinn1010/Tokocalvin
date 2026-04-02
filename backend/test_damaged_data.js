const { pool } = require('./database/db');

async function checkData() {
  try {
    const query = `
      SELECT 
        r.id, r.return_condition, r.damage_notes,
        u.username, u.full_name,
        i.name as instrument_name
      FROM rentals r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN instruments i ON r.instrument_id = i.id
      WHERE r.return_condition IN ('Cukup', 'Rusak')
      LIMIT 5
    `;
    const [rows] = await pool.query(query);
    console.log('--- Damaged Rentals Data Sample ---');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkData();
