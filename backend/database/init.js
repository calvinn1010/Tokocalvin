const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
    const config = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    };

    const dbName = process.env.DB_NAME || 'music_rental_db';

    try {
        // 1. Connect without database to create it if it doesn't exist
        const connection = await mysql.createConnection(config);
        console.log('🔍 Checking database...');
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await connection.end();

        // 2. Connect with database and multipleStatements: true to run schema
        const schemaPath = path.join(__dirname, '..', 'DATA', 'schema.sql');
        if (!fs.existsSync(schemaPath)) {
            console.warn('⚠️ schema.sql not found at', schemaPath);
            return;
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        const dbConnection = await mysql.createConnection({
            ...config,
            database: dbName,
            multipleStatements: true
        });

        console.log('🚀 Applying schema...');

        // Split the SQL to remove comments and handle better if needed, 
        // but multipleStatements: true can handle the whole file.
        await dbConnection.query(schemaSql);

        // Patch for existing tables missing new columns
        console.log('🛠 Checking for schema updates...');
        const [columns] = await dbConnection.query('SHOW COLUMNS FROM rentals');
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('payment_method')) {
            console.log('➕ Adding payment_method to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash'");
        }
        if (!columnNames.includes('payment_status')) {
            console.log('➕ Adding payment_status to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN payment_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending'");
        }
        if (!columnNames.includes('payment_amount')) {
            console.log('➕ Adding payment_amount to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN payment_amount DECIMAL(10,2) DEFAULT 0.00");
        }
        if (!columnNames.includes('payment_date')) {
            console.log('➕ Adding payment_date to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN payment_date DATETIME NULL");
        }
        if (!columnNames.includes('late_fee_per_day')) {
            console.log('➕ Adding late_fee_per_day to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN late_fee_per_day DECIMAL(10,2) DEFAULT 0.00");
        }
        if (!columnNames.includes('late_days')) {
            console.log('➕ Adding late_days to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN late_days INT DEFAULT 0");
        }
        if (!columnNames.includes('late_fee_total')) {
            console.log('➕ Adding late_fee_total to rentals...');
            await dbConnection.query("ALTER TABLE rentals ADD COLUMN late_fee_total DECIMAL(10,2) DEFAULT 0.00");
        }

        console.log('✅ Database schema applied successfully');
        await dbConnection.end();

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        // Don't throw error to allow server to start even if DB fails (e.g. during dev)
        // but in production this should probably be fatal.
    }
}

module.exports = initializeDatabase;
