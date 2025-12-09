/**
 * Invoice-related types
 */

import { ListOptions } from './common';

/**
 * Invoice status values
 */
export type InvoiceStatus = 'draft' | 'finalized' | 'sent' | 'paid' | 'credited' | 'void';

/**
 * Summary of customer information embedded in invoice
 */
export interface CustomerSummary {
  id: string;
  name: string;
  ice: string | null;
}

/**
 * Invoice line item
 */
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  tax_amount: string;
  subtotal: string;
  total: string;
  sort_order: number;
}

/**
 * Full invoice object returned by API
 */
export interface Invoice {
  id: string;
  invoice_number: string | null;
  status: InvoiceStatus;
  customer: CustomerSummary | null;
  issue_date: string;
  due_date: string | null;
  currency: string;
  subtotal: string;
  total_tax: string;
  total: string;
  discount_type: 'percentage' | 'fixed' | null;
  discount_value: string | null;
  discount_amount: string | null;
  payment_terms: string | null;
  notes: string | null;
  internal_notes: string | null;
  pdf_url: string | null;
  xml_url: string | null;
  items: InvoiceItem[];
  created_at: string;
  updated_at: string;
  finalized_at: string | null;
  sent_at: string | null;
  paid_at: string | null;
  voided_at: string | null;
}

/**
 * Input for creating an invoice item
 */
export interface CreateInvoiceItemInput {
  /** Item description */
  description: string;
  /** Quantity (positive number) */
  quantity: number;
  /** Unit price in MAD (positive number) */
  unit_price: number;
  /** Tax rate percentage (0, 7, 10, 14, or 20) */
  tax_rate: number;
  /** Optional sort order */
  sort_order?: number;
}

/**
 * Input for creating a new invoice
 */
export interface CreateInvoiceInput {
  /** Customer ID (required) */
  customer_id: string;
  /** Issue date in YYYY-MM-DD format */
  issue_date: string;
  /** Due date in YYYY-MM-DD format */
  due_date?: string;
  /** Currency code (default: 'MAD') */
  currency?: string;
  /** Invoice line items (at least one required) */
  items: CreateInvoiceItemInput[];
  /** Discount type */
  discount_type?: 'percentage' | 'fixed';
  /** Discount value */
  discount_value?: number;
  /** Payment terms text */
  payment_terms?: string;
  /** Public notes (visible on invoice) */
  notes?: string;
  /** Internal notes (not visible on invoice) */
  internal_notes?: string;
}

/**
 * Input for updating an existing draft invoice
 */
export interface UpdateInvoiceInput {
  /** Customer ID */
  customer_id?: string;
  /** Issue date in YYYY-MM-DD format */
  issue_date?: string;
  /** Due date in YYYY-MM-DD format */
  due_date?: string;
  /** Currency code */
  currency?: string;
  /** Invoice line items (replaces all existing items) */
  items?: CreateInvoiceItemInput[];
  /** Discount type */
  discount_type?: 'percentage' | 'fixed' | null;
  /** Discount value */
  discount_value?: number | null;
  /** Payment terms text */
  payment_terms?: string | null;
  /** Public notes */
  notes?: string | null;
  /** Internal notes */
  internal_notes?: string | null;
}

/**
 * Input for marking an invoice as paid
 */
export interface MarkAsPaidInput {
  /** Payment method (e.g., 'bank_transfer', 'cash', 'check', 'card') */
  payment_method?: string;
  /** Payment reference/transaction ID */
  payment_reference?: string;
}

/**
 * Input for voiding an invoice
 */
export interface VoidInvoiceInput {
  /** Reason for voiding (required) */
  reason: string;
}

/**
 * Options for listing invoices
 */
export interface InvoiceListOptions extends ListOptions {
  /** Filter by status */
  status?: InvoiceStatus;
  /** Filter by customer ID */
  customer_id?: string;
  /** Filter invoices from this date (YYYY-MM-DD) */
  from_date?: string;
  /** Filter invoices until this date (YYYY-MM-DD) */
  to_date?: string;
}

/**
 * Options for exporting invoice as PDF
 */
export interface ExportPdfOptions {
  /** Locale for PDF generation */
  locale?: 'fr' | 'en' | 'ar';
}
