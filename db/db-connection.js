import sqlite3 from 'sqlite3';
import path from 'path';
import { open } from 'sqlite';

// Determine DB path based on environment
const getDbPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.join(__dirname, 'database.db');
  }
  
  // In production (packaged Electron app)
  if (process.env.ELECTRON_RUNNING) {
    const userDataPath = require('electron').app.getPath('userData');
    return path.join(userDataPath, 'app-database.db');
  }
  
  // Fallback for non-Electron production
  return path.join(process.resourcesPath, 'database.db');
};

export const db = new sqlite3.Database(getDbPath(), (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log(`Connected to SQLite database at ${getDbPath()}`);
    initializeDatabase();
  }
});

function initializeDatabase()  {
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

