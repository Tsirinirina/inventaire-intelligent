import { Accessory } from "@/core/entity/accessory.entity";
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

  fetchSince(since: string): Promise<Accessory[]> {
    return apiClient.get<Accessory[]>(
      `/accessories?since=${encodeURIComponent(since)}`,
    );
  },
};
