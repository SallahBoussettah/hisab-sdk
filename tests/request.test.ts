/**
 * Tests for HttpClient request handler
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HttpClient } from '../src/utils/request';
import {
  AuthenticationError,
  ValidationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
} from '../src/errors';

function createMockFetch(responses: Array<{ status: number; body?: unknown; headers?: Record<string, string> }>) {
  let callIndex = 0;
  return vi.fn(async () => {
    const res = responses[Math.min(callIndex++, responses.length - 1)];
    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      headers: new Headers(res.headers ?? {}),
      json: async () => res.body ?? {},
      text: async () => JSON.stringify(res.body ?? {}),
      arrayBuffer: async () => new ArrayBuffer(0),
    } as unknown as Response;
  });
}

describe('HttpClient', () => {
  it('should throw if no API key provided', () => {
    expect(() => new HttpClient({ apiKey: '' })).toThrow('API key is required');
  });

  describe('successful requests', () => {
    it('should make a GET request', async () => {
      const mockFetch = createMockFetch([{ status: 200, body: { data: [1, 2, 3] } }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any });

      const result = await client.get<{ data: number[] }>('/invoices');
      expect(result.data).toEqual([1, 2, 3]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should make a POST request with body', async () => {
      const mockFetch = createMockFetch([{ status: 201, body: { id: '123' } }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any });

      const result = await client.post<{ id: string }>('/invoices', { name: 'test' });
      expect(result.id).toBe('123');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should make a PUT request', async () => {
      const mockFetch = createMockFetch([{ status: 200, body: { updated: true } }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any });

      const result = await client.put<{ updated: boolean }>('/invoices/123', { name: 'updated' });
      expect(result.updated).toBe(true);
    });

    it('should make a DELETE request', async () => {
      const mockFetch = createMockFetch([{ status: 200, body: { deleted: true } }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any });

      const result = await client.delete<{ deleted: boolean }>('/invoices/123');
      expect(result.deleted).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should throw AuthenticationError on 401', async () => {
      const mockFetch = createMockFetch([{
        status: 401,
        body: { error: { code: 'UNAUTHORIZED', message: 'Invalid API key' } },
      }]);
      const client = new HttpClient({ apiKey: 'bad-key', fetch: mockFetch as any, retries: 0 });

      await expect(client.get('/invoices')).rejects.toThrow(AuthenticationError);
    });

    it('should throw NotFoundError on 404', async () => {
      const mockFetch = createMockFetch([{
        status: 404,
        body: { error: { code: 'NOT_FOUND', message: 'Not found' } },
      }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any, retries: 0 });

      await expect(client.get('/invoices/missing')).rejects.toThrow(NotFoundError);
    });

    it('should throw ValidationError on 400', async () => {
      const mockFetch = createMockFetch([{
        status: 400,
        body: { error: { code: 'VALIDATION_ERROR', message: 'Invalid input' } },
      }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any, retries: 0 });

      await expect(client.post('/invoices', {})).rejects.toThrow(ValidationError);
    });

    it('should not retry on 4xx errors', async () => {
      const mockFetch = createMockFetch([{
        status: 400,
        body: { error: { code: 'VALIDATION_ERROR', message: 'Bad request' } },
      }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any, retries: 3 });

      await expect(client.get('/test')).rejects.toThrow(ValidationError);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('retry logic', () => {
    it('should retry on 5xx errors', async () => {
      const mockFetch = createMockFetch([
        { status: 500, body: { error: { message: 'Server error' } } },
        { status: 500, body: { error: { message: 'Server error' } } },
        { status: 200, body: { success: true } },
      ]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any, retries: 2 });

      const result = await client.get<{ success: boolean }>('/test');
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('rate limiting', () => {
    it('should throw RateLimitError with retryAfter on 429', async () => {
      const mockFetch = createMockFetch([{
        status: 429,
        body: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } },
        headers: { 'Retry-After': '30' },
      }]);
      const client = new HttpClient({ apiKey: 'test-key', fetch: mockFetch as any, retries: 0 });

      try {
        await client.get('/test');
        expect.fail('Should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RateLimitError);
        expect((err as RateLimitError).retryAfter).toBe(30);
      }
    });
  });

  describe('URL construction', () => {
    it('should build URL with query parameters', async () => {
      const mockFetch = createMockFetch([{ status: 200, body: {} }]);
      const client = new HttpClient({
        apiKey: 'test-key',
        baseUrl: 'https://api.test.com',
        fetch: mockFetch as any,
      });

      await client.get('/invoices', { page: 1, per_page: 20, status: 'draft' });
      const calledUrl = (mockFetch.mock.calls[0] as any[])[0] as string;
      expect(calledUrl).toContain('page=1');
      expect(calledUrl).toContain('per_page=20');
      expect(calledUrl).toContain('status=draft');
    });
  });

  describe('authorization', () => {
    it('should include Bearer token in headers', async () => {
      const mockFetch = createMockFetch([{ status: 200, body: {} }]);
      const client = new HttpClient({ apiKey: 'my-secret-key', fetch: mockFetch as any });

      await client.get('/test');
      const calledInit = (mockFetch.mock.calls[0] as any[])[1] as RequestInit;
      expect((calledInit.headers as Record<string, string>)['Authorization']).toBe('Bearer my-secret-key');
    });
  });
});
