/**
 * Tests for SDK exports
 */

import { describe, it, expect } from 'vitest';
import * as SDK from '../src/index';

describe('SDK Exports', () => {
  describe('Main exports', () => {
    it('should export HisabClient', () => {
      expect(SDK.HisabClient).toBeDefined();
      expect(typeof SDK.HisabClient).toBe('function');
    });

    it('should export VERSION', () => {
      expect(SDK.VERSION).toBeDefined();
      expect(typeof SDK.VERSION).toBe('string');
    });
  });

  describe('Resource exports', () => {
    it('should export InvoicesResource', () => {
      expect(SDK.InvoicesResource).toBeDefined();
    });

    it('should export CustomersResource', () => {
      expect(SDK.CustomersResource).toBeDefined();
    });

    it('should export OrganizationResource', () => {
      expect(SDK.OrganizationResource).toBeDefined();
    });
  });

  describe('Error exports', () => {
    it('should export HisabError', () => {
      expect(SDK.HisabError).toBeDefined();
    });

    it('should export ValidationError', () => {
      expect(SDK.ValidationError).toBeDefined();
    });

    it('should export AuthenticationError', () => {
      expect(SDK.AuthenticationError).toBeDefined();
    });

    it('should export ForbiddenError', () => {
      expect(SDK.ForbiddenError).toBeDefined();
    });

    it('should export NotFoundError', () => {
      expect(SDK.NotFoundError).toBeDefined();
    });

    it('should export RateLimitError', () => {
      expect(SDK.RateLimitError).toBeDefined();
    });

    it('should export NetworkError', () => {
      expect(SDK.NetworkError).toBeDefined();
    });

    it('should export TimeoutError', () => {
      expect(SDK.TimeoutError).toBeDefined();
    });
  });

  describe('Webhook utility exports', () => {
    it('should export verifyWebhookSignature', () => {
      expect(SDK.verifyWebhookSignature).toBeDefined();
      expect(typeof SDK.verifyWebhookSignature).toBe('function');
    });

    it('should export verifyWebhookSignatureWithReason', () => {
      expect(SDK.verifyWebhookSignatureWithReason).toBeDefined();
      expect(typeof SDK.verifyWebhookSignatureWithReason).toBe('function');
    });

    it('should export verifyWebhookSignatureAsync', () => {
      expect(SDK.verifyWebhookSignatureAsync).toBeDefined();
      expect(typeof SDK.verifyWebhookSignatureAsync).toBe('function');
    });

    it('should export parseWebhookEvent', () => {
      expect(SDK.parseWebhookEvent).toBeDefined();
      expect(typeof SDK.parseWebhookEvent).toBe('function');
    });

    it('should export isInvoiceEvent', () => {
      expect(SDK.isInvoiceEvent).toBeDefined();
      expect(typeof SDK.isInvoiceEvent).toBe('function');
    });

    it('should export isCustomerEvent', () => {
      expect(SDK.isCustomerEvent).toBeDefined();
      expect(typeof SDK.isCustomerEvent).toBe('function');
    });

    it('should export constructWebhookPayload', () => {
      expect(SDK.constructWebhookPayload).toBeDefined();
      expect(typeof SDK.constructWebhookPayload).toBe('function');
    });

    it('should export generateTestSignature', () => {
      expect(SDK.generateTestSignature).toBeDefined();
      expect(typeof SDK.generateTestSignature).toBe('function');
    });
  });

  describe('Pagination exports', () => {
    it('should export PaginatedIterator', () => {
      expect(SDK.PaginatedIterator).toBeDefined();
    });
  });
});
