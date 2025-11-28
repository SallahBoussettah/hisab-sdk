/**
 * Webhook signature verification utilities
 */

import type {
  VerifyWebhookSignatureOptions,
  WebhookVerificationResult,
  WebhookEvent,
  TypedWebhookEvent,
} from '../types';

/**
 * Verify webhook signature using HMAC-SHA256
 *
 * @example
 * ```typescript
 * const isValid = verifyWebhookSignature({
 *   payload: req.body.toString(),
 *   signature: req.headers['x-webhook-signature'],
 *   timestamp: req.headers['x-webhook-timestamp'],
 *   secret: process.env.HISAB_WEBHOOK_SECRET,
 * });
 * ```
 */
export function verifyWebhookSignature(
  options: VerifyWebhookSignatureOptions
): boolean {
  const result = verifyWebhookSignatureWithReason(options);
  return result.valid;
}

/**
 * Verify webhook signature and return detailed result
 */
export function verifyWebhookSignatureWithReason(
  options: VerifyWebhookSignatureOptions
): WebhookVerificationResult {
  const { payload, signature, timestamp, secret, tolerance = 300 } = options;

  // Validate inputs
  if (!payload || !signature || !timestamp || !secret) {
    return {
      valid: false,
      error: 'Missing required parameters for signature verification',
    };
  }

  // Check timestamp is within tolerance (prevent replay attacks)
  const now = Math.floor(Date.now() / 1000);
  const webhookTimestamp = parseInt(timestamp, 10);

  if (isNaN(webhookTimestamp)) {
    return {
      valid: false,
      error: 'Invalid timestamp format',
    };
  }

  if (Math.abs(now - webhookTimestamp) > tolerance) {
    return {
      valid: false,
      error: `Webhook timestamp is outside tolerance (${tolerance}s)`,
    };
  }

  // Extract signature from header (format: "v1=hexstring")
  const parts = signature.split('=');
  if (parts.length !== 2) {
    return {
      valid: false,
      error: 'Invalid signature format',
    };
  }

  const [version, receivedSignature] = parts;

  if (version !== 'v1') {
    return {
      valid: false,
      error: `Unknown signature version: ${version}`,
    };
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`;

  // Use Node.js crypto for sync verification
  return verifyWithNodeCrypto(signedPayload, receivedSignature ?? '', secret);
}

/**
 * Verify signature using Node.js crypto module
 */
function verifyWithNodeCrypto(
  signedPayload: string,
  receivedSignature: string,
  secret: string
): WebhookVerificationResult {
  try {
    // Dynamic import for Node.js crypto
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const crypto = require('crypto');

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Use timing-safe comparison
    const valid = crypto.timingSafeEqual(
      Buffer.from(receivedSignature),
      Buffer.from(expectedSignature)
    );

    return { valid };
  } catch (error) {
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Verify signature using Web Crypto API (async)
 * Use this in browser environments or when you need async verification
 */
export async function verifyWebhookSignatureAsync(
  options: VerifyWebhookSignatureOptions
): Promise<WebhookVerificationResult> {
  const { payload, signature, timestamp, secret, tolerance = 300 } = options;

  // Validate inputs
  if (!payload || !signature || !timestamp || !secret) {
    return {
      valid: false,
      error: 'Missing required parameters for signature verification',
    };
  }

  // Check timestamp
  const now = Math.floor(Date.now() / 1000);
  const webhookTimestamp = parseInt(timestamp, 10);

  if (isNaN(webhookTimestamp)) {
    return {
      valid: false,
      error: 'Invalid timestamp format',
    };
  }

  if (Math.abs(now - webhookTimestamp) > tolerance) {
    return {
      valid: false,
      error: `Webhook timestamp is outside tolerance (${tolerance}s)`,
    };
  }

  // Extract signature
  const parts = signature.split('=');
  if (parts.length !== 2 || parts[0] !== 'v1') {
    return {
      valid: false,
      error: 'Invalid signature format',
    };
  }

  const receivedSignature = parts[1];

  try {
    const signedPayload = `${timestamp}.${payload}`;

    // Import key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Compute signature
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signedPayload)
    );

    // Convert to hex
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures (not timing-safe in browser, but acceptable for most use cases)
    const valid = expectedSignature === receivedSignature;

    return { valid };
  } catch (error) {
    return {
      valid: false,
      error: `Signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse webhook payload into typed event
 *
 * @example
 * ```typescript
 * const event = parseWebhookEvent(payload);
 * if (event.event === 'invoice.paid') {
 *   console.log('Invoice paid:', event.data.invoice.id);
 * }
 * ```
 */
export function parseWebhookEvent(payload: string): TypedWebhookEvent {
  return JSON.parse(payload) as TypedWebhookEvent;
}

/**
 * Type guard to check if event is a specific type
 */
export function isInvoiceEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: `invoice.${string}` } {
  return event.event.startsWith('invoice.');
}

/**
 * Type guard to check if event is a customer event
 */
export function isCustomerEvent(
  event: WebhookEvent
): event is WebhookEvent & { event: `customer.${string}` } {
  return event.event.startsWith('customer.');
}

/**
 * Construct a test webhook payload for local testing
 */
export function constructWebhookPayload<T>(
  event: string,
  data: T,
  organizationId: string = 'test-org-id'
): string {
  const payload: WebhookEvent<T> = {
    event: event as WebhookEvent<T>['event'],
    data,
    organization_id: organizationId,
    created_at: new Date().toISOString(),
  };

  return JSON.stringify(payload);
}

/**
 * Generate a test webhook signature for local testing
 */
export function generateTestSignature(
  payload: string,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: string } {
  const ts = timestamp ?? Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;

  // Use Node.js crypto
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require('crypto');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return {
    signature: `v1=${signature}`,
    timestamp: String(ts),
  };
}
