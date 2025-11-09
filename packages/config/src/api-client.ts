/**
 * Centralized API client utilities
 * Provides standardized fetch wrappers with error handling, retries, and type safety
 */

import { HTTP_STATUS, RETRY_CONFIG, TIME_CONSTANTS } from './constants';

export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

export interface ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;
}

export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;
  private retries: number;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    this.timeout = options.timeout || 30000;
    this.retries = options.retries ?? RETRY_CONFIG.MAX_RETRIES;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createTimeoutSignal(): AbortSignal {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), this.timeout);
    return controller.signal;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retryCount = 0
  ): Promise<Response> {
    const signal = this.createTimeoutSignal();
    const requestOptions: RequestInit = {
      ...options,
      signal,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      // Retry on server errors (5xx) or network errors
      if (
        (response.status >= 500 || !response.ok) &&
        retryCount < this.retries
      ) {
        const delay =
          RETRY_CONFIG.INITIAL_DELAY *
          Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount);
        await this.sleep(Math.min(delay, RETRY_CONFIG.MAX_DELAY));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }

      return response;
    } catch (error) {
      // Retry on network errors
      if (retryCount < this.retries && error instanceof Error) {
        const delay =
          RETRY_CONFIG.INITIAL_DELAY *
          Math.pow(RETRY_CONFIG.BACKOFF_MULTIPLIER, retryCount);
        await this.sleep(Math.min(delay, RETRY_CONFIG.MAX_DELAY));
        return this.fetchWithRetry(url, options, retryCount + 1);
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        name: 'ApiError',
        message: `API request failed: ${response.statusText}`,
        status: response.status,
        statusText: response.statusText,
      };

      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }

      throw error;
    }

    // Handle 204 No Content
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return undefined as T;
    }

    try {
      return await response.json();
    } catch {
      return (await response.text()) as T;
    }
  }

  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'GET',
    });
    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async put<T>(path: string, data?: unknown, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async patch<T>(
    path: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.handleResponse<T>(response);
  }

  async delete<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${path}`;
    const response = await this.fetchWithRetry(url, {
      ...options,
      method: 'DELETE',
    });
    return this.handleResponse<T>(response);
  }
}

// Default API client instance
export const apiClient = new ApiClient();

// Factory function for creating API clients
export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
