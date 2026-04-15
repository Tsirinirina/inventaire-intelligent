import { SQLiteDatabase } from "expo-sqlite";
import { NewSeller, Seller } from "../entity/seller.entity";
import { useSyncStore } from "../store/sync.store";
import { authApi, AuthenticatedSellerPayload } from "./api/auth.api";

/**
 * Créer un seller
 * Vérifie si le nom existe déjà, renvoie une erreur si oui
 */
export function createSeller(db: SQLiteDatabase, dto: NewSeller): Seller {
  const existing = getSellerByName(db, dto.name);
  if (existing) {
    return existing;
  }

  const lastUpdateDate = dto.lastUpdateDate || new Date().toISOString();
  const result = db!.runSync(
    `INSERT INTO sellers (name, passcode, lastUpdateDate) VALUES (?, ?, ?)`,
    [dto.name, dto.passcode, lastUpdateDate],
  );

  return {
    id: result.lastInsertRowId,
    name: dto.name,
    passcode: dto.passcode,
    lastUpdateDate,
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

export function upsertLocalSellerSession(
  db: SQLiteDatabase,
  name: string,
  passcode: string,
): Seller {
  const existing = getSellerByName(db, name);
  const lastUpdateDate = new Date().toISOString();

  if (existing) {
    db.runSync(
      `UPDATE sellers SET passcode = ?, lastUpdateDate = ? WHERE id = ?`,
      [passcode, lastUpdateDate, existing.id],
    );

    return {
      ...existing,
      passcode,
      lastUpdateDate,
    };
  }

  return createSeller(db, {
    name,
    passcode,
    lastUpdateDate,
  });
}

export async function loginService(
  name: string,
  passcode: string,
): Promise<AuthenticatedSellerPayload> {
  const loginRes = await authApi.login(name, passcode);
  useSyncStore.getState().setAuthToken(loginRes.token);
  return loginRes.seller;
}
