/**
 * Hisab SDK - Official client library for the Hisab e-invoicing API
 *
 * @packageDocumentation
 *
 * @example
 * ```typescript
 * import { HisabClient, verifyWebhookSignature } from 'hisab-sdk';
 *
 * // Create client
 * const hisab = new HisabClient({
 *   apiKey: 'hisab_live_your_api_key_here'
 * });
 *
 * // Create an invoice
 * const invoice = await hisab.invoices.create({
 *   customer_id: 'cust_123',
 *   issue_date: '2024-11-28',
 *   items: [{
 *     description: 'Consulting Services',
 *     quantity: 10,
 *     unit_price: 500,
 *     tax_rate: 20
 *   }]
 * });
 *
 * // Finalize invoice
 * const finalized = await hisab.invoices.finalize(invoice.id);
 * console.log('Invoice number:', finalized.invoice_number);
 *
 * // Export as PDF
 * const pdf = await hisab.invoices.exportPdf(invoice.id);
 *
 * // Verify webhook signatures
 * const isValid = verifyWebhookSignature({
 *   payload: req.body,
 *   signature: req.headers['x-webhook-signature'],
 *   timestamp: req.headers['x-webhook-timestamp'],
 *   secret: process.env.HISAB_WEBHOOK_SECRET
 * });
 * ```
 */

// Main client
export { HisabClient } from './client';

// Resource classes (for advanced use cases)
export { InvoicesResource } from './resources/invoices';
export { CustomersResource } from './resources/customers';
export { OrganizationResource } from './resources/organization';

// Error classes
export {
  HisabError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from './errors';

// Webhook utilities
export {
  verifyWebhookSignature,
  verifyWebhookSignatureWithReason,
  verifyWebhookSignatureAsync,
  parseWebhookEvent,
  isInvoiceEvent,
  isCustomerEvent,
  constructWebhookPayload,
  generateTestSignature,
} from './utils/webhooks';

// Pagination utilities
export { PaginatedIterator } from './utils/pagination';
export type { AutoPaginateOptions } from './utils/pagination';

// All types
export type {
  // Common types
  Pagination,
  ListOptions,
  PaginatedResponse,
  SingleResponse,
  ErrorDetail,
  ErrorResponse,
  ApiResponse,
  Address,
  AddressInput,
  HttpMethod,
  RateLimitInfo,
  HisabClientOptions,

  // Invoice types
  InvoiceStatus,
  CustomerSummary,
  InvoiceItem,
  Invoice,
  CreateInvoiceItemInput,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  MarkAsPaidInput,
  VoidInvoiceInput,
  InvoiceListOptions,
  ExportPdfOptions,

  // Customer types
  CustomerType,
  CustomerStatus,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListOptions,

  // Organization types
  Organization,
  UpdateOrganizationInput,

  // Webhook types
  WebhookEventType,
  WebhookEvent,
  WebhookInvoiceData,
  InvoiceCreatedData,
  InvoiceUpdatedData,
  InvoiceFinalizedData,
  InvoiceSentData,
  InvoicePaidData,
  InvoiceVoidedData,
  WebhookCustomerData,
  CustomerCreatedData,
  CustomerUpdatedData,
  CustomerDeletedData,
  InvoiceCreatedEvent,
  InvoiceUpdatedEvent,
  InvoiceFinalizedEvent,
  InvoiceSentEvent,
  InvoicePaidEvent,
  InvoiceVoidedEvent,
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  CustomerDeletedEvent,
  TypedWebhookEvent,
  VerifyWebhookSignatureOptions,
  WebhookVerificationResult,
} from './types';

// Version
export const VERSION = '0.1.0';
