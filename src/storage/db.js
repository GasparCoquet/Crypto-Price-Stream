import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { mkdir } from 'fs/promises';
import { dirname } from 'path';

// Open or create a local database file
export async function initDB() {
  const dbPath = 'data/crypto.db';
  
  // Create data directory if it doesn't exist
  await mkdir(dirname(dbPath), { recursive: true });
  
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create table if not exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS prices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts INTEGER,
      datetime TEXT,
      pair TEXT,
      price REAL
    );
  `);

  return db;
}

export async function insertTick(db, { ts, pair, price }) {
  const datetime = new Date(ts).toISOString();
  await db.run(
    `INSERT INTO prices (ts, datetime, pair, price) VALUES (?, ?, ?, ?)`,
    [ts, datetime, pair, price]
  );
}
