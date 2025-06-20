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

function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) console.error('Table creation error:', err);
    else console.log('Items table ready');
  });
}

