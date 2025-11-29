/**
 * Tests for HisabClient
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HisabClient } from '../src/client';

describe('HisabClient', () => {
  describe('constructor', () => {
    it('should throw error if API key is not provided', () => {
      expect(() => new HisabClient({ apiKey: '' })).toThrow(
        'Hisab API key is required'
      );
    });

    it('should create client with valid API key', () => {
      const client = new HisabClient({ apiKey: 'hisab_live_test123' });
      expect(client).toBeInstanceOf(HisabClient);
      expect(client.invoices).toBeDefined();
      expect(client.customers).toBeDefined();
      expect(client.organization).toBeDefined();
    });

    it('should warn if API key does not start with hisab_', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      new HisabClient({ apiKey: 'invalid_key_format' });
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('API key does not start with "hisab_"')
      );
      warnSpy.mockRestore();
    });

    it('should not warn for valid API key format', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      new HisabClient({ apiKey: 'hisab_live_validkey' });
      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('getRateLimit', () => {
    it('should return null when no requests have been made', () => {
      const client = new HisabClient({ apiKey: 'hisab_live_test123' });
      expect(client.getRateLimit()).toBeNull();
    });
  });

  describe('resource access', () => {
    it('should have invoices resource', () => {
      const client = new HisabClient({ apiKey: 'hisab_live_test123' });
      expect(client.invoices).toBeDefined();
      expect(typeof client.invoices.create).toBe('function');
      expect(typeof client.invoices.list).toBe('function');
      expect(typeof client.invoices.get).toBe('function');
    });

    it('should have customers resource', () => {
      const client = new HisabClient({ apiKey: 'hisab_live_test123' });
      expect(client.customers).toBeDefined();
      expect(typeof client.customers.create).toBe('function');
      expect(typeof client.customers.list).toBe('function');
      expect(typeof client.customers.get).toBe('function');
    });

    it('should have organization resource', () => {
      const client = new HisabClient({ apiKey: 'hisab_live_test123' });
      expect(client.organization).toBeDefined();
      expect(typeof client.organization.get).toBe('function');
      expect(typeof client.organization.update).toBe('function');
    });
  });
});
