import { SQLiteDatabase } from "expo-sqlite";
import { NewSeller, Seller } from "../entity/seller.entity";

/**
 * Créer un seller
 * Vérifie si le nom existe déjà, renvoie une erreur si oui
 */
export function createSeller(db: SQLiteDatabase, dto: NewSeller): Seller {
  // Insérer le nouveau seller
  const result = db!.runSync(
    `INSERT OR IGNORE INTO sellers (name, passcode, lastUpdateDate) VALUES (?, ?, ?)`,
    [dto.name, dto.passcode, dto.lastUpdateDate || new Date().toDateString()],
  );

  // Retourner le seller créé
  return {
    id: result.lastInsertRowId,
    name: dto.name,
    passcode: dto.passcode,
    lastUpdateDate: dto.lastUpdateDate,
  };
}

/**
 * Récupérer un seller par son ID
 */
export function getSellerById(
  db: SQLiteDatabase,
  id: number,
): Seller | null | undefined {
  const result = db!.getAllSync<Seller>(`SELECT * FROM sellers WHERE id = ?`, [
    id,
  ]);
  return result.length > 0 ? result[0] : null;
}

/**
 * Récupérer un seller par son name
 */
export function getSellerByName(
  db: SQLiteDatabase,
  name: string,
): Seller | null {
  const result = db!.getAllSync<Seller>(
    `SELECT * FROM sellers WHERE name = ?`,
    [name],
  );
  return result.length > 0 ? result[0] : null;
}

/**
 * Login seller par name et passcode
 */
export function loginSeller(
  db: SQLiteDatabase,
  name: string,
  passcode: string,
): Seller | null {
  const seller = db!.getAllSync<Seller>(
    `SELECT * FROM sellers WHERE name = ? AND passcode = ?`,
    [name, passcode],
  );

  if (seller.length === 0) {
    return null;
  }

  return seller[0];
}
