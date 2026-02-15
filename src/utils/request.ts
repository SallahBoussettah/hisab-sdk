/**
 * HTTP request handler with retry logic and error handling
 */

import type { HisabClientOptions, RequestConfig, RateLimitInfo } from '../types';
import {
  HisabError,
  NetworkError,
  TimeoutError,
  RateLimitError,
} from '../errors';

const DEFAULT_BASE_URL = 'https://hisab.ma/api/v1';
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 3;

/**
 * HTTP client for making API requests
 */
export class HttpClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly customFetch: typeof fetch;
  private readonly customHeaders: Record<string, string>;
  private readonly debug: boolean;

  /** Last rate limit info from response headers */
  public lastRateLimit: RateLimitInfo | null = null;

  constructor(options: HisabClientOptions) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.maxRetries = options.retries ?? DEFAULT_RETRIES;
    this.customFetch = options.fetch ?? globalThis.fetch;
    this.customHeaders = options.headers ?? {};
    this.debug = options.debug ?? false;
  }

  /**
   * Make an HTTP request with automatic retries
   */
  async request<T>(config: RequestConfig): Promise<T> {
    const { method, path, body, query, headers, timeout, retries, responseType = 'json' } = config;

    // Build URL with query parameters
    const url = this.buildUrl(path, query);

    // Build request options
    const requestHeaders: Record<string, string> = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': responseType === 'json' ? 'application/json' : '*/*',
      ...this.customHeaders,
      ...headers,
    };

    const requestInit: RequestInit = {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    };

    const maxAttempts = (retries ?? this.maxRetries) + 1;
    const requestTimeout = timeout ?? this.timeout;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        if (this.debug) {
          console.log(`[Hisab SDK] ${method} ${url} (attempt ${attempt}/${maxAttempts})`);
        }

        const response = await this.fetchWithTimeout(url, requestInit, requestTimeout);

        // Parse rate limit headers
        this.parseRateLimitHeaders(response.headers);

        // Handle non-2xx responses
        if (!response.ok) {
          const errorBody = await this.safeParseJson(response);
          const error = HisabError.fromResponse(response.status, errorBody, response.headers);

          // Don't retry client errors (except rate limits)
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }

          // Handle rate limiting
          if (error instanceof RateLimitError) {
            const retryAfter = error.retryAfter;

            // If we have retries left, wait and retry
            if (attempt < maxAttempts) {
              if (this.debug) {
                console.log(`[Hisab SDK] Rate limited, waiting ${retryAfter}s before retry`);
              }
              await this.sleep(retryAfter * 1000);
              continue;
            }
          }

          lastError = error;

          // Retry on 5xx errors
          if (response.status >= 500 && attempt < maxAttempts) {
            await this.sleep(this.getBackoffDelay(attempt));
            continue;
          }

          throw error;
        }

        // Parse successful response
        if (responseType === 'blob') {
          return (await response.arrayBuffer()) as T;
        }

        if (responseType === 'text') {
          return (await response.text()) as T;
        }

        return await response.json() as T;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on Hisab API errors (already handled above)
        if (error instanceof HisabError) {
          throw error;
        }

        // Retry on network errors
        if (attempt < maxAttempts) {
          if (this.debug) {
            console.log(`[Hisab SDK] Request failed, retrying in ${this.getBackoffDelay(attempt)}ms`);
          }
          await this.sleep(this.getBackoffDelay(attempt));
          continue;
        }

        // Transform to appropriate error type
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new NetworkError('Network request failed', error);
        }

        if (error instanceof Error && error.name === 'AbortError') {
          throw new TimeoutError('Request timed out', requestTimeout);
        }

        throw error;
      }
    }

    // Should never reach here, but just in case
    throw lastError ?? new NetworkError('Request failed after all retries');
  }

  /**
   * Fetch with timeout support
   */
  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      return await this.customFetch(url, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(
    path: string,
    query?: Record<string, string | number | boolean | undefined>
  ): string {
    // Ensure baseUrl doesn't have trailing slash and path starts with /
    const base = this.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const fullUrl = `${base}${normalizedPath}`;

    const url = new URL(fullUrl);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  /**
   * Parse rate limit headers from response
   */
  private parseRateLimitHeaders(headers: Headers): void {
    const limit = headers.get('X-RateLimit-Limit');
    const remaining = headers.get('X-RateLimit-Remaining');
    const reset = headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      this.lastRateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10),
      };
    }
  }

  /**
   * Safely parse JSON from response
   */
  private async safeParseJson(response: Response): Promise<Record<string, unknown>> {
    try {
      return await response.json();
    } catch {
      return { error: { message: response.statusText || 'Unknown error' } };
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private getBackoffDelay(attempt: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, etc. with jitter
    const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 30000);
    const jitter = Math.random() * 1000;
    return baseDelay + jitter;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods for HTTP verbs
   */
  get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>({ method: 'GET', path, query });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body });
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>({ method: 'DELETE', path });
  }
}
