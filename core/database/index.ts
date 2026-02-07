import * as SQLite from "expo-sqlite";
import { DATABASE_NAME } from "./config";

let database: SQLite.SQLiteDatabase | null = null;

export function getDatabase() {
  if (!database) {
    database = SQLite.openDatabaseSync(DATABASE_NAME);
  }
  return database;
}

export function initDatabase() {
  const db = getDatabase();

  /* =======================
     SELLERS
  ======================== */
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sellers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      passcode TEXT NOT NULL,
      lastUpdateDate TEXT
    );
  `);

  /* =======================
     PRODUCTS
  ======================== */
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      basePrice REAL NOT NULL,
      quantity INTEGER NOT NULL,
      imageUri TEXT,
      createdAt TEXT NOT NULL,
      stockUpdatedAt TEXT NOT NULL
    );
  `);

  /* =======================
     ACCESSORIES
  ======================== */
  db.execSync(`
    CREATE TABLE IF NOT EXISTS accessories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      basePrice REAL NOT NULL,
      quantity INTEGER NOT NULL,
      imageUri TEXT,
      createdAt TEXT NOT NULL
    );
  `);

  /* =======================
     SALES
     (product OR accessory)
  ======================== */
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,

      sellerId INTEGER NOT NULL,

      productId INTEGER,
      accessoryId INTEGER,

      quantity INTEGER NOT NULL,
      unitPrice REAL NOT NULL,

      color TEXT,
      imei TEXT UNIQUE,
      ram INTEGER,
      rom INTEGER,
      apn INTEGER,

      attachmentUri TEXT,
      createdAt TEXT NOT NULL,

      FOREIGN KEY (sellerId) REFERENCES sellers(id),
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (accessoryId) REFERENCES accessories(id)
    );
  `);
}
