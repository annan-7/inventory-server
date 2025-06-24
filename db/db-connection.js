import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine DB path based on environment
const getDbPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, 'database.db');
  }
  
  // Fallback for production
  return path.join(process.cwd(), 'database.db');
};

const db = new sqlite3.Database(getDbPath(), (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${getDbPath()}`);
    initializeDatabase();
  }
});

function initializeDatabase() {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Users table error:', err);
    else console.log('Users table ready');
  });

  // Create products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      price REAL NOT NULL,
      category TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Products table error:', err);
    else console.log('Products table ready');
  });

  // Create indexes
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_products_name 
    ON products (name COLLATE NOCASE)
  `);
  
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_products_price 
    ON products (price)
  `);
  
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_products_category 
    ON products (category)
  `);
}

export default db;

