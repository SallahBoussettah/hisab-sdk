/**
 * Custom error classes for the Hisab SDK
 */

import type { ErrorDetail } from './types';

/**
 * Base error class for all Hisab API errors
 */
export class HisabError extends Error {
  /** API error code */
  readonly code: string;
  /** HTTP status code */
  readonly status: number;
  /** Detailed error information */
  readonly details: ErrorDetail[] | undefined;
  /** Original response body */
  readonly response: unknown | undefined;
  /** Original cause of the error */
  declare cause: Error | undefined;

  constructor(
    message: string,
    code: string,
    status: number,
    details?: ErrorDetail[],
    response?: unknown
  ) {
    super(message);
    this.name = 'HisabError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.response = response;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Create error from API response
   */
  static fromResponse(
    status: number,
    body: { error?: { code?: string; message?: string; details?: ErrorDetail[] } },
    headers?: Headers
  ): HisabError {
    const code = body.error?.code ?? 'UNKNOWN_ERROR';
    const message = body.error?.message ?? 'An unknown error occurred';
    const details = body.error?.details;

    // Return specific error types based on status
    switch (status) {
      case 400:
        return new ValidationError(message, code, details, body);
      case 401:
        return new AuthenticationError(message, code, body);
      case 403:
        return new ForbiddenError(message, code, body);
      case 404:
        return new NotFoundError(message, code, body);
      case 429: {
        const retryAfter = headers
          ? parseInt(headers.get('Retry-After') ?? '60', 10)
          : 60;
        return new RateLimitError(message, code, body, retryAfter);
      }
      default:
        return new HisabError(message, code, status, details, body);
    }
  }

  /**
   * Convert error to JSON-serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
    };
  }
}

/**
 * Validation error (400 Bad Request)
 * Thrown when request data fails validation
 */
export class ValidationError extends HisabError {
  constructor(
    message: string,
    code: string = 'VALIDATION_ERROR',
    details?: ErrorDetail[],
    response?: unknown
  ) {
    super(message, code, 400, details, response);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Get validation errors for a specific field
   */
  getFieldErrors(field: string): string[] {
    return (this.details ?? [])
      .filter((d) => d.field === field)
      .map((d) => d.message);
  }

  /**
   * Check if a specific field has errors
   */
  hasFieldError(field: string): boolean {
    return this.getFieldErrors(field).length > 0;
  }
}

/**
 * Authentication error (401 Unauthorized)
 * Thrown when API key is missing, invalid, or expired
 */
export class AuthenticationError extends HisabError {
  constructor(
    message: string = 'Invalid or missing API key',
    code: string = 'UNAUTHORIZED',
    response?: unknown
  ) {
    super(message, code, 401, undefined, response);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Forbidden error (403 Forbidden)
 * Thrown when API key lacks required permissions
 */
export class ForbiddenError extends HisabError {
  constructor(
    message: string = 'Insufficient permissions',
    code: string = 'FORBIDDEN',
    response?: unknown
  ) {
    super(message, code, 403, undefined, response);
    this.name = 'ForbiddenError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Not found error (404 Not Found)
 * Thrown when requested resource doesn't exist
 */
export class NotFoundError extends HisabError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    response?: unknown
  ) {
    super(message, code, 404, undefined, response);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Rate limit error (429 Too Many Requests)
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends HisabError {
  /** Seconds until rate limit resets */
  readonly retryAfter: number;

  constructor(
    message: string = 'Rate limit exceeded',
    code: string = 'RATE_LIMIT_EXCEEDED',
    response?: unknown,
    retryAfter: number = 60
  ) {
    super(message, code, 429, undefined, response);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Network error
 * Thrown when request fails due to network issues
 */
export class NetworkError extends HisabError {
  constructor(message: string = 'Network request failed', originalCause?: Error) {
    super(message, 'NETWORK_ERROR', 0);
    this.name = 'NetworkError';
    this.cause = originalCause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Timeout error
 * Thrown when request exceeds timeout limit
 */
export class TimeoutError extends HisabError {
  constructor(message: string = 'Request timed out', timeout?: number) {
    super(
      timeout ? `Request timed out after ${timeout}ms` : message,
      'TIMEOUT',
      0
    );
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
