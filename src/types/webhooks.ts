/**
 * Webhook-related types
 */

/**
 * All supported webhook event types
 */
export type WebhookEventType =
  | 'invoice.created'
  | 'invoice.updated'
  | 'invoice.finalized'
  | 'invoice.sent'
  | 'invoice.paid'
  | 'invoice.voided'
  | 'customer.created'
  | 'customer.updated'
  | 'customer.deleted';

/**
 * Base webhook event structure
 */
export interface WebhookEvent<T = unknown> {
  /** Event type */
  event: WebhookEventType;
  /** Event-specific data */
  data: T;
  /** Organization ID that triggered the event */
  organization_id: string;
  /** Event creation timestamp */
  created_at: string;
}

/**
 * Invoice data in webhook events
 */
export interface WebhookInvoiceData {
  id: string;
  invoice_number: string | null;
  status: string;
  customer_id: string | null;
  customer_name?: string;
  total: string;
  currency: string;
  issue_date?: string;
  created_at?: string;
  updated_at?: string;
  finalized_at?: string;
  sent_at?: string;
  paid_at?: string;
  voided_at?: string;
}

/**
 * Invoice created event data
 */
export interface InvoiceCreatedData {
  invoice: WebhookInvoiceData;
}

/**
 * Invoice updated event data
 */
export interface InvoiceUpdatedData {
  invoice: WebhookInvoiceData;
  changes: string[];
}

/**
 * Invoice finalized event data
 */
export interface InvoiceFinalizedData {
  invoice: WebhookInvoiceData;
}

/**
 * Invoice sent event data
 */
export interface InvoiceSentData {
  invoice: WebhookInvoiceData;
}

/**
 * Invoice paid event data
 */
export interface InvoicePaidData {
  invoice: WebhookInvoiceData;
  payment?: {
    method?: string;
    reference?: string;
  };
}

/**
 * Invoice voided event data
 */
export interface InvoiceVoidedData {
  invoice: WebhookInvoiceData;
  reason?: string;
}

/**
 * Customer data in webhook events
 */
export interface WebhookCustomerData {
  id: string;
  name: string;
  type: string;
  ice: string | null;
  email: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Customer created event data
 */
export interface CustomerCreatedData {
  customer: WebhookCustomerData;
}

/**
 * Customer updated event data
 */
export interface CustomerUpdatedData {
  customer: WebhookCustomerData;
  changes: string[];
}

/**
 * Customer deleted (archived) event data
 */
export interface CustomerDeletedData {
  customer: {
    id: string;
    name: string;
  };
}

/**
 * Type-safe webhook event types
 */
export type InvoiceCreatedEvent = WebhookEvent<InvoiceCreatedData> & { event: 'invoice.created' };
export type InvoiceUpdatedEvent = WebhookEvent<InvoiceUpdatedData> & { event: 'invoice.updated' };
export type InvoiceFinalizedEvent = WebhookEvent<InvoiceFinalizedData> & { event: 'invoice.finalized' };
export type InvoiceSentEvent = WebhookEvent<InvoiceSentData> & { event: 'invoice.sent' };
export type InvoicePaidEvent = WebhookEvent<InvoicePaidData> & { event: 'invoice.paid' };
export type InvoiceVoidedEvent = WebhookEvent<InvoiceVoidedData> & { event: 'invoice.voided' };
export type CustomerCreatedEvent = WebhookEvent<CustomerCreatedData> & { event: 'customer.created' };
export type CustomerUpdatedEvent = WebhookEvent<CustomerUpdatedData> & { event: 'customer.updated' };
export type CustomerDeletedEvent = WebhookEvent<CustomerDeletedData> & { event: 'customer.deleted' };

/**
 * Union of all typed webhook events
 */
export type TypedWebhookEvent =
  | InvoiceCreatedEvent
  | InvoiceUpdatedEvent
  | InvoiceFinalizedEvent
  | InvoiceSentEvent
  | InvoicePaidEvent
  | InvoiceVoidedEvent
  | CustomerCreatedEvent
  | CustomerUpdatedEvent
  | CustomerDeletedEvent;

/**
 * Options for verifying webhook signatures
 */
export interface VerifyWebhookSignatureOptions {
  /** Raw request body as string */
  payload: string;
  /** Signature from X-Webhook-Signature header */
  signature: string;
  /** Timestamp from X-Webhook-Timestamp header */
  timestamp: string;
  /** Your webhook secret */
  secret: string;
  /** Tolerance in seconds for timestamp validation (default: 300) */
  tolerance?: number;
}

/**
 * Webhook signature verification result
 */
export interface WebhookVerificationResult {
  valid: boolean;
  error?: string;
}
