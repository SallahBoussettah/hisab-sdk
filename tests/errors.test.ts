/**
 * Tests for error classes
 */

import { describe, it, expect } from 'vitest';
import {
  HisabError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from '../src/errors';

describe('HisabError', () => {
  it('should create error with all properties', () => {
    const error = new HisabError('Test error', 'TEST_ERROR', 500, undefined, {
      raw: 'response',
    });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.status).toBe(500);
    expect(error.response).toEqual({ raw: 'response' });
    expect(error.name).toBe('HisabError');
  });

  it('should be instanceof Error', () => {
    const error = new HisabError('Test', 'TEST', 500);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(HisabError);
  });

  it('should convert to JSON', () => {
    const error = new HisabError('Test error', 'TEST_ERROR', 500, [
      { field: 'email', message: 'Invalid email' },
    ]);
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'HisabError',
      message: 'Test error',
      code: 'TEST_ERROR',
      status: 500,
      details: [{ field: 'email', message: 'Invalid email' }],
    });
  });

  describe('fromResponse', () => {
    it('should create ValidationError for 400 status', () => {
      const error = HisabError.fromResponse(400, {
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input' },
      });
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.status).toBe(400);
    });

    it('should create AuthenticationError for 401 status', () => {
      const error = HisabError.fromResponse(401, {
        error: { code: 'UNAUTHORIZED', message: 'Invalid API key' },
      });
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.status).toBe(401);
    });

    it('should create ForbiddenError for 403 status', () => {
      const error = HisabError.fromResponse(403, {
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      });
      expect(error).toBeInstanceOf(ForbiddenError);
      expect(error.status).toBe(403);
    });

    it('should create NotFoundError for 404 status', () => {
      const error = HisabError.fromResponse(404, {
        error: { code: 'NOT_FOUND', message: 'Resource not found' },
      });
      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.status).toBe(404);
    });

    it('should create RateLimitError for 429 status', () => {
      const error = HisabError.fromResponse(429, {
        error: { code: 'RATE_LIMIT', message: 'Too many requests' },
      });
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.status).toBe(429);
    });

    it('should create generic HisabError for other statuses', () => {
      const error = HisabError.fromResponse(500, {
        error: { code: 'INTERNAL_ERROR', message: 'Server error' },
      });
      expect(error).toBeInstanceOf(HisabError);
      expect(error.status).toBe(500);
    });

    it('should handle missing error details', () => {
      const error = HisabError.fromResponse(500, {});
      expect(error.code).toBe('UNKNOWN_ERROR');
      expect(error.message).toBe('An unknown error occurred');
    });
  });
});

describe('ValidationError', () => {
  it('should have 400 status', () => {
    const error = new ValidationError('Invalid input');
    expect(error.status).toBe(400);
    expect(error.name).toBe('ValidationError');
  });

  it('should get field errors', () => {
    const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
      { field: 'email', message: 'Invalid email format' },
      { field: 'email', message: 'Email is required' },
      { field: 'name', message: 'Name is required' },
    ]);

    const emailErrors = error.getFieldErrors('email');
    expect(emailErrors).toEqual(['Invalid email format', 'Email is required']);

    const nameErrors = error.getFieldErrors('name');
    expect(nameErrors).toEqual(['Name is required']);

    const phoneErrors = error.getFieldErrors('phone');
    expect(phoneErrors).toEqual([]);
  });

  it('should check if field has errors', () => {
    const error = new ValidationError('Validation failed', 'VALIDATION_ERROR', [
      { field: 'email', message: 'Invalid email' },
    ]);

    expect(error.hasFieldError('email')).toBe(true);
    expect(error.hasFieldError('name')).toBe(false);
  });
});

describe('AuthenticationError', () => {
  it('should have 401 status and default message', () => {
    const error = new AuthenticationError();
    expect(error.status).toBe(401);
    expect(error.message).toBe('Invalid or missing API key');
    expect(error.name).toBe('AuthenticationError');
  });
});

describe('ForbiddenError', () => {
  it('should have 403 status and default message', () => {
    const error = new ForbiddenError();
    expect(error.status).toBe(403);
    expect(error.message).toBe('Insufficient permissions');
    expect(error.name).toBe('ForbiddenError');
  });
});

describe('NotFoundError', () => {
  it('should have 404 status and default message', () => {
    const error = new NotFoundError();
    expect(error.status).toBe(404);
    expect(error.message).toBe('Resource not found');
    expect(error.name).toBe('NotFoundError');
  });
});

describe('RateLimitError', () => {
  it('should have 429 status and retryAfter', () => {
    const error = new RateLimitError('Rate limited', 'RATE_LIMIT', undefined, 120);
    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(120);
    expect(error.name).toBe('RateLimitError');
  });

  it('should have default retryAfter of 60', () => {
    const error = new RateLimitError();
    expect(error.retryAfter).toBe(60);
  });
});

describe('NetworkError', () => {
  it('should have status 0 and preserve cause', () => {
    const cause = new Error('Connection refused');
    const error = new NetworkError('Failed to connect', cause);
    expect(error.status).toBe(0);
    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('NetworkError');
  });
});

describe('TimeoutError', () => {
  it('should have status 0', () => {
    const error = new TimeoutError();
    expect(error.status).toBe(0);
    expect(error.code).toBe('TIMEOUT');
    expect(error.name).toBe('TimeoutError');
  });

  it('should include timeout in message', () => {
    const error = new TimeoutError('Request timed out', 30000);
    expect(error.message).toBe('Request timed out after 30000ms');
  });
});
