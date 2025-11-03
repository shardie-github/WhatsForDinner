import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import type { APIError, APIResponse } from './contracts';

export interface ApiClientConfig {
  baseURL: string;
  getAccessToken?: () => string | null;
  onTokenExpired?: () => void;
}

class ApiClient {
  private client: AxiosInstance;
  private getAccessToken?: () => string | null;
  private onTokenExpired?: () => void;

  constructor(config: ApiClientConfig) {
    this.getAccessToken = config.getAccessToken;
    this.onTokenExpired = config.onTokenExpired;

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor: add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken?.();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // ETag support for caching
        const cachedETag = this.getCachedETag(config.url || '');
        if (cachedETag && config.headers) {
          config.headers['If-None-Match'] = cachedETag;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor: handle errors, caching
    this.client.interceptors.response.use(
      (response) => {
        // Cache ETag if present
        const etag = response.headers['etag'];
        if (etag && response.config.url) {
          this.setCachedETag(response.config.url, etag);
        }

        return response;
      },
      async (error: AxiosError) => {
        if (error.response?.status === 401 && this.onTokenExpired) {
          this.onTokenExpired();
        }

        // Handle 304 Not Modified
        if (error.response?.status === 304) {
          return { data: this.getCachedResponse(error.config.url || '') };
        }

        return Promise.reject(this.normalizeError(error));
      }
    );
  }

  private normalizeError(error: AxiosError): APIError {
    if (error.response?.data && typeof error.response.data === 'object') {
      return error.response.data as APIError;
    }

    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
  }

  private etagCache = new Map<string, string>();
  private responseCache = new Map<string, unknown>();

  private getCachedETag(url: string): string | null {
    return this.etagCache.get(url) || null;
  }

  private setCachedETag(url: string, etag: string): void {
    this.etagCache.set(url, etag);
  }

  private getCachedResponse(url: string): unknown {
    return this.responseCache.get(url);
  }

  private setCachedResponse(url: string, data: unknown): void {
    this.responseCache.set(url, data);
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<APIResponse<T>>(url, config);
    const data = response.data.data;
    if (url) {
      this.setCachedResponse(url, data);
    }
    return data;
  }

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<APIResponse<T>>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<APIResponse<T>>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<APIResponse<T>>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<APIResponse<T>>(url, config);
    return response.data.data;
  }

  // Retry wrapper with exponential backoff
  async getWithRetry<T>(
    url: string,
    maxRetries = 3,
    config?: AxiosRequestConfig
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await this.get<T>(url, config);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config);
}

export default ApiClient;
