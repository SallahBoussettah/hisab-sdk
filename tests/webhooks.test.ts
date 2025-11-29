/**
 * Tests for webhook utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  verifyWebhookSignature,
  verifyWebhookSignatureWithReason,
  parseWebhookEvent,
  isInvoiceEvent,
  isCustomerEvent,
  constructWebhookPayload,
  generateTestSignature,
} from '../src/utils/webhooks';

describe('Webhook Utilities', () => {
  const testSecret = 'whsec_test_secret_key_123456';
  const testPayload = JSON.stringify({
    event: 'invoice.created',
    data: { invoice: { id: 'inv_123' } },
    organization_id: 'org_123',
    created_at: '2025-11-29T10:00:00Z',
  });

  describe('verifyWebhookSignature', () => {
    it('should return true for valid signature', () => {
      const { signature, timestamp } = generateTestSignature(
        testPayload,
        testSecret
      );
      const isValid = verifyWebhookSignature({
        payload: testPayload,
        signature,
        timestamp,
        secret: testSecret,
      });
      expect(isValid).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const isValid = verifyWebhookSignature({
        payload: testPayload,
        signature: 'v1=invalidsignature',
        timestamp,
        secret: testSecret,
      });
      expect(isValid).toBe(false);
    });

    it('should return false for missing parameters', () => {
      expect(
        verifyWebhookSignature({
          payload: '',
          signature: 'v1=test',
          timestamp: '123',
          secret: testSecret,
        })
      ).toBe(false);

      expect(
        verifyWebhookSignature({
          payload: testPayload,
          signature: '',
          timestamp: '123',
          secret: testSecret,
        })
      ).toBe(false);

      expect(
        verifyWebhookSignature({
          payload: testPayload,
          signature: 'v1=test',
          timestamp: '',
          secret: testSecret,
        })
      ).toBe(false);

      expect(
        verifyWebhookSignature({
          payload: testPayload,
          signature: 'v1=test',
          timestamp: '123',
          secret: '',
        })
      ).toBe(false);
    });
  });

  describe('verifyWebhookSignatureWithReason', () => {
    it('should return valid result for correct signature', () => {
      const { signature, timestamp } = generateTestSignature(
        testPayload,
        testSecret
      );
      const result = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature,
        timestamp,
        secret: testSecret,
      });
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should return error for missing parameters', () => {
      const result = verifyWebhookSignatureWithReason({
        payload: '',
        signature: 'v1=test',
        timestamp: '123',
        secret: testSecret,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'Missing required parameters for signature verification'
      );
    });

    it('should return error for invalid timestamp format', () => {
      const result = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature: 'v1=test',
        timestamp: 'not-a-number',
        secret: testSecret,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid timestamp format');
    });

    it('should return error for expired timestamp', () => {
      const oldTimestamp = String(Math.floor(Date.now() / 1000) - 600); // 10 minutes ago
      const { signature } = generateTestSignature(
        testPayload,
        testSecret,
        parseInt(oldTimestamp)
      );
      const result = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature,
        timestamp: oldTimestamp,
        secret: testSecret,
        tolerance: 300, // 5 minutes
      });
      expect(result.valid).toBe(false);
      expect(result.error).toContain('outside tolerance');
    });

    it('should return error for invalid signature format', () => {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const result = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature: 'invalid-format-no-equals',
        timestamp,
        secret: testSecret,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid signature format');
    });

    it('should return error for unknown signature version', () => {
      const timestamp = String(Math.floor(Date.now() / 1000));
      const result = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature: 'v2=somesignature',
        timestamp,
        secret: testSecret,
      });
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Unknown signature version: v2');
    });

    it('should accept custom tolerance', () => {
      const recentTimestamp = String(Math.floor(Date.now() / 1000) - 400); // 6.6 minutes ago
      const { signature } = generateTestSignature(
        testPayload,
        testSecret,
        parseInt(recentTimestamp)
      );

      // Default tolerance (300s) should fail
      const result1 = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature,
        timestamp: recentTimestamp,
        secret: testSecret,
      });
      expect(result1.valid).toBe(false);

      // Extended tolerance (600s) should pass
      const result2 = verifyWebhookSignatureWithReason({
        payload: testPayload,
        signature,
        timestamp: recentTimestamp,
        secret: testSecret,
        tolerance: 600,
      });
      expect(result2.valid).toBe(true);
    });
  });

  describe('parseWebhookEvent', () => {
    it('should parse valid webhook payload', () => {
      const event = parseWebhookEvent(testPayload);
      expect(event.event).toBe('invoice.created');
      expect(event.organization_id).toBe('org_123');
      expect(event.data).toEqual({ invoice: { id: 'inv_123' } });
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseWebhookEvent('invalid json')).toThrow();
    });
  });

  describe('isInvoiceEvent', () => {
    it('should return true for invoice events', () => {
      const events = [
        { event: 'invoice.created', data: {}, organization_id: '', created_at: '' },
        { event: 'invoice.finalized', data: {}, organization_id: '', created_at: '' },
        { event: 'invoice.paid', data: {}, organization_id: '', created_at: '' },
        { event: 'invoice.voided', data: {}, organization_id: '', created_at: '' },
      ];
      events.forEach((event) => {
        expect(isInvoiceEvent(event)).toBe(true);
      });
    });

    it('should return false for non-invoice events', () => {
      const events = [
        { event: 'customer.created', data: {}, organization_id: '', created_at: '' },
        { event: 'customer.updated', data: {}, organization_id: '', created_at: '' },
      ];
      events.forEach((event) => {
        expect(isInvoiceEvent(event)).toBe(false);
      });
    });
  });

  describe('isCustomerEvent', () => {
    it('should return true for customer events', () => {
      const events = [
        { event: 'customer.created', data: {}, organization_id: '', created_at: '' },
        { event: 'customer.updated', data: {}, organization_id: '', created_at: '' },
        { event: 'customer.deleted', data: {}, organization_id: '', created_at: '' },
      ];
      events.forEach((event) => {
        expect(isCustomerEvent(event)).toBe(true);
      });
    });

    it('should return false for non-customer events', () => {
      const events = [
        { event: 'invoice.created', data: {}, organization_id: '', created_at: '' },
        { event: 'invoice.paid', data: {}, organization_id: '', created_at: '' },
      ];
      events.forEach((event) => {
        expect(isCustomerEvent(event)).toBe(false);
      });
    });
  });

  describe('constructWebhookPayload', () => {
    it('should construct valid payload', () => {
      const payload = constructWebhookPayload(
        'invoice.created',
        { invoice: { id: 'inv_456' } },
        'org_789'
      );
      const parsed = JSON.parse(payload);
      expect(parsed.event).toBe('invoice.created');
      expect(parsed.data).toEqual({ invoice: { id: 'inv_456' } });
      expect(parsed.organization_id).toBe('org_789');
      expect(parsed.created_at).toBeDefined();
    });

    it('should use default organization ID', () => {
      const payload = constructWebhookPayload('customer.created', { customer: {} });
      const parsed = JSON.parse(payload);
      expect(parsed.organization_id).toBe('test-org-id');
    });
  });

  describe('generateTestSignature', () => {
    it('should generate valid signature', () => {
      const { signature, timestamp } = generateTestSignature(
        testPayload,
        testSecret
      );
      expect(signature).toMatch(/^v1=[a-f0-9]{64}$/);
      expect(parseInt(timestamp)).toBeGreaterThan(0);
    });

    it('should use provided timestamp', () => {
      const customTimestamp = 1700000000;
      const { timestamp } = generateTestSignature(
        testPayload,
        testSecret,
        customTimestamp
      );
      expect(timestamp).toBe(String(customTimestamp));
    });

    it('should generate consistent signatures', () => {
      const timestamp = 1700000000;
      const { signature: sig1 } = generateTestSignature(
        testPayload,
        testSecret,
        timestamp
      );
      const { signature: sig2 } = generateTestSignature(
        testPayload,
        testSecret,
        timestamp
      );
      expect(sig1).toBe(sig2);
    });

    it('should generate different signatures for different payloads', () => {
      const timestamp = 1700000000;
      const { signature: sig1 } = generateTestSignature(
        'payload1',
        testSecret,
        timestamp
      );
      const { signature: sig2 } = generateTestSignature(
        'payload2',
        testSecret,
        timestamp
      );
      expect(sig1).not.toBe(sig2);
    });
  });
});
