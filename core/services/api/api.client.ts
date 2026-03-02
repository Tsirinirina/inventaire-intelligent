// ─── Erreur HTTP typée ───────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Client HTTP ─────────────────────────────────────────────────────────────
class ApiClient {
  private baseUrl: string = "";
  private authToken: string | null = null;
  private readonly timeout = 15_000;

  configure(baseUrl: string, token?: string | null) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    if (token !== undefined) this.authToken = token;
  }

  /** Met à jour le token sans toucher à l'URL */
  setToken(token: string | null) {
    this.authToken = token;
  }

  isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  private async request<T>(
    method: string,
    path: string,
    options?: { body?: unknown; signal?: AbortSignal },
  ): Promise<T> {
    if (!this.baseUrl) {
      throw new ApiError(0, "URL du serveur non configurée");
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(this.authToken
            ? { Authorization: `Bearer ${this.authToken}` }
            : {}),
        },
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: options?.signal ?? controller.signal,
      });

      if (!res.ok) {
        const err = await res
          .json()
          .catch(() => ({ message: `HTTP ${res.status}` }));
        throw new ApiError(res.status, err.message ?? `HTTP ${res.status}`);
      }

      // 204 No Content
      if (res.status === 204) return undefined as unknown as T;

      // Le serveur NestJS wrappe toutes les réponses : { success: true, data: T }
      const json = await res.json();
      return (json.data !== undefined ? json.data : json) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  get<T>(path: string, signal?: AbortSignal) {
    return this.request<T>("GET", path, { signal });
  }

  post<T>(path: string, body: unknown, signal?: AbortSignal) {
    return this.request<T>("POST", path, { body, signal });
  }

  put<T>(path: string, body: unknown, signal?: AbortSignal) {
    return this.request<T>("PUT", path, { body, signal });
  }

  patch<T>(path: string, body: unknown, signal?: AbortSignal) {
    return this.request<T>("PATCH", path, { body, signal });
  }

  delete<T>(path: string, signal?: AbortSignal) {
    return this.request<T>("DELETE", path, { signal });
  }

  /** Upload multipart (pour les images) */
  async upload<T>(path: string, formData: FormData): Promise<T> {
    if (!this.baseUrl) throw new ApiError(0, "URL du serveur non configurée");

    const res = await fetch(`${this.baseUrl}/api/v1${path}`, {
      method: "POST",
      headers: this.authToken
        ? { Authorization: `Bearer ${this.authToken}` }
        : {},
      body: formData,
    });

    if (!res.ok) {
      const err = await res
        .json()
        .catch(() => ({ message: `HTTP ${res.status}` }));
      throw new ApiError(res.status, err.message ?? `HTTP ${res.status}`);
    }

    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
  }
}

/** Singleton partagé dans toute l'app */
export const apiClient = new ApiClient();
