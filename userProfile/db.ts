import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';

dotenv.config({ path: ".env" });

const DATABASE_FILE = './db.sqlite3'; // Path to your SQLite database file

const sqlite = process.env.DEBUG === "TRUE" ? sqlite3.verbose() : sqlite3;

// Open the database and enable foreign keys
const db = new sqlite.Database(DATABASE_FILE, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');

    // Enable foreign key constraints
	console.log("pragma")
    db.run('PRAGMA foreign_keys = ON;', (pragmaErr) => {
        if (pragmaErr) {
            console.error('Failed to enable foreign key constraints:', pragmaErr.message);
        } else {
            console.log('Foreign key constraints are enabled.');
        }
    });
});

export default db;
