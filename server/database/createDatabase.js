import db from './connection.js';

const deleteMode = process.argv.includes("--delete");

if(deleteMode){
    db.exec('DROP TABLE IF EXISTS users');
    console.log("Table dropped");
}

await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
    );
    `);


