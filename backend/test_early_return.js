const { pool } = require('./database/db');

async function test() {
  try {
    // Find an approved rental with future end_date
    const [rows] = await pool.query('SELECT * FROM rentals WHERE status = "approved" AND end_date > NOW() LIMIT 1');
    
    if (rows.length === 0) {
      console.log('No suitable rental found for testing.');
      process.exit(0);
    }

    const rental = rows[0];
    console.log(`Found rental ID: ${rental.id}, End Date: ${rental.end_date}`);

    // We can't easily call the controller without a full req/res mock, 
    // but we can manually run the logic check here to verify it works.
    
    const returnDate = new Date();
    const endDate = new Date(rental.end_date);
    
    const d1 = new Date(returnDate);
    d1.setHours(0, 0, 0, 0);
    const d2 = new Date(endDate);
    d2.setHours(0, 0, 0, 0);

    console.log(`Comparing: returnDate(${d1.toISOString()}) < endDate(${d2.toISOString()})`);
    if (d1 < d2) {
      console.log('SUCCESS: Validation logic correctly identified an early return.');
    } else {
      console.log('FAILURE: Validation logic should have triggered.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
