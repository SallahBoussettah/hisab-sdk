/**
 * Recurring Invoice-related types
 */

import { ListOptions } from './common';
import { CustomerSummary, CreateInvoiceItemInput } from './invoices';

/**
 * Recurring invoice frequency values
 */
export type RecurringFrequency =
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'biannually'
  | 'yearly';

/**
 * Recurring invoice status values
 */
export type RecurringStatus = 'active' | 'paused' | 'completed' | 'cancelled';

/**
 * Recurring invoice history status
 */
export type RecurringHistoryStatus = 'success' | 'failed' | 'skipped';

/**
 * Recurring invoice line item
 */
export interface RecurringInvoiceItem {
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
 * Recurring invoice generation history entry
 */
export interface RecurringInvoiceHistoryEntry {
  id: string;
  invoice_id: string | null;
  scheduled_date: string;
  generated_at: string;
  status: RecurringHistoryStatus;
  error_message: string | null;
  invoice_number: string | null;
  invoice_total: string | null;
  invoice?: {
    id: string;
    invoice_number: string | null;
    status: string;
    total: string;
  } | null;
}

/**
 * Full recurring invoice object returned by API
 */
export interface RecurringInvoice {
  id: string;
  name: string | null;
  status: RecurringStatus;
  customer: CustomerSummary | null;
  currency: string;
  frequency: RecurringFrequency;
  interval_count: number;
  day_of_month: number | null;
  day_of_week: number | null;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  last_run_date: string | null;
  max_occurrences: number | null;
  occurrences_created: number;
  auto_finalize: boolean;
  auto_send: boolean;
  days_until_due: number;
  subtotal: string;
  total_tax: string;
  total: string;
  notes: string | null;
  payment_terms: string | null;
  internal_notes: string | null;
  items: RecurringInvoiceItem[];
  history?: RecurringInvoiceHistoryEntry[];
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a recurring invoice
 */
export interface CreateRecurringInvoiceInput {
  /** Customer ID (required) */
  customer_id: string;
  /** Optional name for easy identification */
  name?: string;
  /** Currency code (default: 'MAD') */
  currency?: string;
  /** Recurrence frequency */
  frequency: RecurringFrequency;
  /** Interval count (e.g., every 2 months) */
  interval_count?: number;
  /** Day of month for monthly/quarterly/biannual/yearly (1-28) */
  day_of_month?: number;
  /** Day of week for weekly/biweekly (0=Sunday, 6=Saturday) */
  day_of_week?: number;
  /** Start date in YYYY-MM-DD format */
  start_date: string;
  /** End date in YYYY-MM-DD format (null = infinite) */
  end_date?: string;
  /** Maximum number of invoices to generate */
  max_occurrences?: number;
  /** Auto-finalize generated invoices */
  auto_finalize?: boolean;
  /** Auto-send email after generation */
  auto_send?: boolean;
  /** Days until due from issue date */
  days_until_due?: number;
  /** Line items (at least one required) */
  items: CreateInvoiceItemInput[];
  /** Payment terms text */
  payment_terms?: string;
  /** Public notes (visible on invoice) */
  notes?: string;
  /** Internal notes (not visible on invoice) */
  internal_notes?: string;
}

/**
 * Input for updating a recurring invoice
 */
export interface UpdateRecurringInvoiceInput {
  /** Customer ID */
  customer_id?: string;
  /** Name */
  name?: string;
  /** Currency code */
  currency?: string;
  /** Recurrence frequency */
  frequency?: RecurringFrequency;
  /** Interval count */
  interval_count?: number;
  /** Day of month (1-28) */
  day_of_month?: number | null;
  /** Day of week (0-6) */
  day_of_week?: number | null;
  /** Start date */
  start_date?: string;
  /** End date */
  end_date?: string | null;
  /** Maximum occurrences */
  max_occurrences?: number | null;
  /** Auto-finalize */
  auto_finalize?: boolean;
  /** Auto-send */
  auto_send?: boolean;
  /** Days until due */
  days_until_due?: number;
  /** Line items (replaces all existing items) */
  items?: CreateInvoiceItemInput[];
  /** Payment terms */
  payment_terms?: string | null;
  /** Notes */
  notes?: string | null;
  /** Internal notes */
  internal_notes?: string | null;
}

/**
 * Options for listing recurring invoices
 */
export interface RecurringInvoiceListOptions extends ListOptions {
  /** Filter by status */
  status?: RecurringStatus;
  /** Filter by customer ID */
  customer_id?: string;
  /** Filter by frequency */
  frequency?: RecurringFrequency;
  /** Search by name */
  search?: string;
}

/**
 * Input for resuming a paused recurring invoice
 */
export interface ResumeRecurringInvoiceInput {
  /** New next run date (optional) */
  next_run_date?: string;
}

/**
 * Input for manually generating an invoice
 */
export interface GenerateInvoiceInput {
  /** Custom issue date (default: today) */
  issue_date?: string;
}
