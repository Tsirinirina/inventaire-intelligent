import { apiClient } from "./api.client";

export interface ImageUploadResponse {
  url: string;       // URL publique sur le serveur
  filename: string;
}

/**
 * Upload une image locale vers le serveur.
 * Retourne l'URL distante à stocker à la place du chemin local.
 *
 * NestJS endpoint attendu :
 *   POST /api/v1/uploads/image
 *   Content-Type: multipart/form-data
 *   Body: { file: <binary>, type: "product" | "accessory" }
 */
export async function uploadImage(
  localUri: string,
  type: "product" | "accessory",
): Promise<string> {
  // Si l'URI est déjà une URL distante, on ne re-upload pas
  if (localUri.startsWith("http://") || localUri.startsWith("https://")) {
    return localUri;
  }

  const filename = localUri.split("/").pop() ?? "image.jpg";

  const formData = new FormData();
  formData.append("file", {
    uri: localUri,
    name: filename,
    type: "image/jpeg",
  } as any);
  formData.append("type", type);

  const res = await apiClient.upload<ImageUploadResponse>(
    "/uploads/image",
    formData,
  );
  return res.url;
}
