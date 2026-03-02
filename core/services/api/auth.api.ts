import { apiClient } from "./api.client";

export interface LoginResult {
  token: string;
  seller: { syncId: string; name: string };
}

export interface FindOrCreateResult {
  syncId: string;
  name: string;
  created: boolean;
}

export const authApi = {
  /**
   * Crée le vendeur côté serveur s'il n'existe pas (route publique).
   * Doit être appelé AVANT login car le serveur hash le passcode avec bcrypt.
   */
  findOrCreateSeller(
    name: string,
    passcode: string,
  ): Promise<FindOrCreateResult> {
    return apiClient.post<FindOrCreateResult>("/sellers/find-or-create", {
      name,
      passcode,
    });
  },

  /**
   * Authentifie le vendeur côté serveur et retourne un JWT.
   */
  login(name: string, passcode: string): Promise<LoginResult> {
    return apiClient.post<LoginResult>("/auth/login", { name, passcode });
  },
};
