import { Accessory } from "@/core/entity/accessory.entity";
import { ServerAccessory } from "@/core/types/sync.types";
import { apiClient } from "./api.client";

export interface AccessoryApiResponse {
  syncId: string;
  updatedAt: string;
}

export const accessoryApi = {
  create(accessory: Omit<Accessory, "id">): Promise<AccessoryApiResponse> {
    return apiClient.post<AccessoryApiResponse>("/accessories", accessory);
  },

  update(
    syncId: string,
    accessory: Omit<Accessory, "id">,
  ): Promise<AccessoryApiResponse> {
    return apiClient.put<AccessoryApiResponse>(
      `/accessories/${syncId}`,
      accessory,
    );
  },

  /** Pull des changements depuis le serveur (sync bidirectionnelle) */
  fetchSince(since?: string | null): Promise<ServerAccessory[]> {
    const query = since ? `?since=${encodeURIComponent(since)}` : "";
    return apiClient.get<ServerAccessory[]>(`/accessories${query}`);
  },
};
