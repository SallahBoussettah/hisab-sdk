/**
 * Common types used across the SDK
 */

/**
 * Pagination information returned by list endpoints
 */
export interface Pagination {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

/**
 * Base list options for paginated endpoints
 */
export interface ListOptions {
  /** Page number (1-based) */
  page?: number;
  /** Number of items per page (max 100) */
  per_page?: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: {
    pagination: Pagination;
  };
}

/**
 * Single item API response
 */
export interface SingleResponse<T> {
  success: true;
  data: T;
}

/**
 * Error detail from validation or business logic errors
 */
export interface ErrorDetail {
  field?: string;
  message: string;
}

/**
 * API error response structure
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ErrorDetail[];
  };
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T> = SingleResponse<T> | PaginatedResponse<T> | ErrorResponse;

/**
 * Address object used for customers and organizations
 */
export interface Address {
  street: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
}

/**
 * Input address for create/update operations
 */
export interface AddressInput {
  street?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

/**
 * HTTP methods supported by the SDK
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Rate limit information from response headers
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * SDK configuration options
 */
export interface HisabClientOptions {
  /** Your Hisab API key (required) */
  apiKey: string;

  /** Base URL for API requests (default: 'https://hisab.ma/api/v1') */
  baseUrl?: string;

  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;

  /** Number of automatic retries on failure (default: 3) */
  retries?: number;

  /** Custom fetch implementation (for testing or special environments) */
  fetch?: typeof fetch;

  /** Custom headers to include in all requests */
  headers?: Record<string, string>;

  /** Enable debug logging (default: false) */
  debug?: boolean;
}

/**
 * Request configuration for internal use
 */
export interface RequestConfig {
  method: HttpMethod;
  path: string;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  responseType?: 'json' | 'blob' | 'text';
}
