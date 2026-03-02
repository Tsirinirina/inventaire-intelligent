import * as SQLite from "expo-sqlite";
import { DEFAULT_SELLER_MOCK } from "../mock/seller.mock";
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

  // Activer les contraintes de clés étrangères
  db.execSync(`PRAGMA foreign_keys = ON;`);

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

  // Ajouter le seller par défaut si non existant
  db.runAsync(
    `INSERT OR IGNORE INTO sellers (name, passcode, lastUpdateDate) VALUES (?, ?, ?)`,
    [
      DEFAULT_SELLER_MOCK.name,
      DEFAULT_SELLER_MOCK.passcode,
      new Date().toDateString(),
    ],
  );

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
      createdAt TEXT NOT NULL,
      stockUpdatedAt TEXT NOT NULL
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
      buyerName TEXT,
      buyerCin TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (sellerId) REFERENCES sellers(id),
      FOREIGN KEY (productId) REFERENCES products(id),
      FOREIGN KEY (accessoryId) REFERENCES accessories(id)
    );
  `);

  /* =======================
     STOCK MOVEMENTS
  ======================== */
  db.execSync(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      itemType TEXT NOT NULL,
      itemId INTEGER NOT NULL,
      itemName TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      createdAt TEXT NOT NULL
    );
  `);

  // Migrations : colonnes ajoutées après la création initiale de la DB
  const migrations = [
    // Buyer info
    `ALTER TABLE sales ADD COLUMN buyerName TEXT`,
    `ALTER TABLE sales ADD COLUMN buyerCin TEXT`,
    // Sync meta — products
    `ALTER TABLE products ADD COLUMN sync_id TEXT`,
    `ALTER TABLE products ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
    `ALTER TABLE products ADD COLUMN synced_at TEXT`,
    // Sync meta — accessories
    `ALTER TABLE accessories ADD COLUMN sync_id TEXT`,
    `ALTER TABLE accessories ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
    `ALTER TABLE accessories ADD COLUMN synced_at TEXT`,
    // Sync meta — sales
    `ALTER TABLE sales ADD COLUMN sync_id TEXT`,
    `ALTER TABLE sales ADD COLUMN sync_status TEXT DEFAULT 'pending'`,
    `ALTER TABLE sales ADD COLUMN synced_at TEXT`,
  ];
  for (const sql of migrations) {
    try {
      db.execSync(sql);
    } catch {
      // Colonne déjà existante — ignoré
    }
  }
}
