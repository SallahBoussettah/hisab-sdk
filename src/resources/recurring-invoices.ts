/**
 * Recurring Invoice resource for the Hisab SDK
 */

import type { HttpClient } from '../utils/request';
import { PaginatedIterator } from '../utils/pagination';
import type {
  RecurringInvoice,
  RecurringInvoiceHistoryEntry,
  CreateRecurringInvoiceInput,
  UpdateRecurringInvoiceInput,
  RecurringInvoiceListOptions,
  ResumeRecurringInvoiceInput,
  GenerateInvoiceInput,
  PaginatedResponse,
  SingleResponse,
  Invoice,
} from '../types';

/**
 * Recurring Invoices API resource
 *
 * @example
 * ```typescript
 * const hisab = new HisabClient({ apiKey: 'your_key' });
 *
 * // Create a recurring invoice
 * const recurring = await hisab.recurringInvoices.create({
 *   customer_id: 'cust_123',
 *   frequency: 'monthly',
 *   start_date: '2024-01-01',
 *   items: [{ description: 'Monthly Service', quantity: 1, unit_price: 1000, tax_rate: 20 }]
 * });
 *
 * // List active recurring invoices
 * const list = await hisab.recurringInvoices.list({ status: 'active' });
 *
 * // Pause and resume
 * await hisab.recurringInvoices.pause(recurring.id);
 * await hisab.recurringInvoices.resume(recurring.id);
 *
 * // Manually generate an invoice
 * const invoice = await hisab.recurringInvoices.generate(recurring.id);
 * ```
 */
export class RecurringInvoicesResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List recurring invoices with pagination and filters
   *
   * @param options - Filtering and pagination options
   * @returns Paginated list of recurring invoices
   */
  async list(options: RecurringInvoiceListOptions = {}): Promise<PaginatedResponse<RecurringInvoice>> {
    const query: Record<string, string | number | undefined> = {
      page: options.page,
      per_page: options.per_page,
      status: options.status,
      customer_id: options.customer_id,
      frequency: options.frequency,
      search: options.search,
    };

    return this.client.get<PaginatedResponse<RecurringInvoice>>('/recurring-invoices', query);
  }

  /**
   * Auto-paginate through all recurring invoices
   *
   * @param options - Filtering options
   * @returns Async iterator for recurring invoices
   *
   * @example
   * ```typescript
   * for await (const recurring of hisab.recurringInvoices.listAll({ status: 'active' })) {
   *   console.log(recurring.name, recurring.next_run_date);
   * }
   * ```
   */
  listAll(options: Omit<RecurringInvoiceListOptions, 'page'> = {}): PaginatedIterator<RecurringInvoice> {
    const query: Record<string, string | number | undefined> = {
      status: options.status,
      customer_id: options.customer_id,
      frequency: options.frequency,
      search: options.search,
      per_page: options.per_page ?? 100,
    };

    return new PaginatedIterator<RecurringInvoice>(this.client, '/recurring-invoices', query);
  }

  /**
   * Get a single recurring invoice by ID
   *
   * @param id - Recurring invoice ID
   * @returns Recurring invoice details with history
   */
  async get(id: string): Promise<RecurringInvoice> {
    const response = await this.client.get<SingleResponse<RecurringInvoice>>(`/recurring-invoices/${id}`);
    return response.data;
  }

  /**
   * Create a new recurring invoice
   *
   * @param input - Recurring invoice data
   * @returns Created recurring invoice
   *
   * @example
   * ```typescript
   * const recurring = await hisab.recurringInvoices.create({
   *   customer_id: 'cust_123',
   *   frequency: 'monthly',
   *   start_date: '2024-01-01',
   *   auto_finalize: true,
   *   auto_send: true,
   *   days_until_due: 30,
   *   items: [
   *     { description: 'Monthly Subscription', quantity: 1, unit_price: 500, tax_rate: 20 }
   *   ]
   * });
   * ```
   */
  async create(input: CreateRecurringInvoiceInput): Promise<RecurringInvoice> {
    const response = await this.client.post<SingleResponse<RecurringInvoice>>('/recurring-invoices', input);
    return response.data;
  }

  /**
   * Update a recurring invoice
   *
   * Note: Only active or paused recurring invoices can be updated.
   * Completed or cancelled recurring invoices cannot be modified.
   *
   * @param id - Recurring invoice ID
   * @param input - Fields to update
   * @returns Updated recurring invoice
   */
  async update(id: string, input: UpdateRecurringInvoiceInput): Promise<RecurringInvoice> {
    const response = await this.client.put<SingleResponse<RecurringInvoice>>(`/recurring-invoices/${id}`, input);
    return response.data;
  }

  /**
   * Delete a recurring invoice
   *
   * This permanently removes the recurring invoice and its history.
   * Generated invoices are not affected.
   *
   * @param id - Recurring invoice ID
   */
  async delete(id: string): Promise<void> {
    await this.client.delete(`/recurring-invoices/${id}`);
  }

  /**
   * Pause a recurring invoice
   *
   * Temporarily stops invoice generation. The recurring invoice can be resumed later.
   * Only active recurring invoices can be paused.
   *
   * @param id - Recurring invoice ID
   * @returns Updated status
   */
  async pause(id: string): Promise<{ id: string; status: 'paused' }> {
    const response = await this.client.post<SingleResponse<{ id: string; status: 'paused' }>>(
      `/recurring-invoices/${id}/pause`
    );
    return response.data;
  }

  /**
   * Resume a paused recurring invoice
   *
   * Reactivates invoice generation. Optionally set a new next run date.
   * Only paused recurring invoices can be resumed.
   *
   * @param id - Recurring invoice ID
   * @param input - Optional new next run date
   * @returns Updated status with next run date
   */
  async resume(id: string, input: ResumeRecurringInvoiceInput = {}): Promise<{
    id: string;
    status: 'active';
    next_run_date: string;
  }> {
    const response = await this.client.post<SingleResponse<{
      id: string;
      status: 'active';
      next_run_date: string;
    }>>(`/recurring-invoices/${id}/resume`, input);
    return response.data;
  }

  /**
   * Manually generate an invoice from a recurring invoice
   *
   * Creates a new invoice based on the recurring invoice template.
   * The invoice will be auto-finalized if auto_finalize is enabled.
   *
   * @param id - Recurring invoice ID
   * @param input - Optional issue date
   * @returns Generated invoice
   *
   * @example
   * ```typescript
   * // Generate with today's date
   * const invoice = await hisab.recurringInvoices.generate('rec_123');
   *
   * // Generate with custom date
   * const invoice = await hisab.recurringInvoices.generate('rec_123', {
   *   issue_date: '2024-02-15'
   * });
   * ```
   */
  async generate(id: string, input: GenerateInvoiceInput = {}): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(
      `/recurring-invoices/${id}/generate`,
      input
    );
    return response.data;
  }

  /**
   * Get generation history for a recurring invoice
   *
   * Returns the history of generated invoices, including successes and failures.
   *
   * @param id - Recurring invoice ID
   * @param limit - Maximum number of entries (default: 20, max: 100)
   * @returns List of history entries
   */
  async getHistory(id: string, limit: number = 20): Promise<RecurringInvoiceHistoryEntry[]> {
    const response = await this.client.get<SingleResponse<RecurringInvoiceHistoryEntry[]>>(
      `/recurring-invoices/${id}/history`,
      { limit }
    );
    return response.data;
  }

  /**
   * Get statistics for recurring invoices
   *
   * @returns Summary statistics
   */
  async getStats(): Promise<{
    total_count: number;
    active_count: number;
    paused_count: number;
    completed_count: number;
    cancelled_count: number;
    total_monthly_value: string;
  }> {
    const response = await this.client.get<SingleResponse<{
      total_count: number;
      active_count: number;
      paused_count: number;
      completed_count: number;
      cancelled_count: number;
      total_monthly_value: string;
    }>>('/recurring-invoices/stats');
    return response.data;
  }
}
