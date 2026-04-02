const RentalController = require('./controllers/RentalController2');
const { pool } = require('./database/db');

async function testSave() {
    // We need an approved rental to return.
    const [rentals] = await pool.query('SELECT id FROM rentals WHERE status = "approved" LIMIT 1');
    if (rentals.length === 0) {
        console.log('No approved rentals to test with.');
        process.exit(0);
    }
    const id = rentals[0].id;
    console.log(`Testing return on rental ID: ${id}`);

    const req = {
        params: { id: id },
        body: { 
            status: 'returned', 
            returnCondition: 'Rusak', 
            damageNotes: 'Test manual damage documentation' 
        },
        user: { id: 1, role: 'petugas' }
    };
    
    const res = {
        status: function(code) { this.statusCode = code; return this; },
        json: function(data) {
            console.log('Response:', JSON.stringify(data, null, 2));
            return this;
        }
    };

    try {
        await RentalController.updateRentalStatus(req, res);
        
        // Now check if it actually saved in the DB
        const [saved] = await pool.query('SELECT return_condition, damage_notes FROM rentals WHERE id = ?', [id]);
        console.log('Saved Data in DB:', JSON.stringify(saved[0], null, 2));
    } catch (err) {
        console.error('Error during test:', err);
    } finally {
        process.exit();
    }
}

testSave();
