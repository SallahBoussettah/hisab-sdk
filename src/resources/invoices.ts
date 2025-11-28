/**
 * Invoice resource for the Hisab SDK
 */

import type { HttpClient } from '../utils/request';
import { PaginatedIterator } from '../utils/pagination';
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  MarkAsPaidInput,
  VoidInvoiceInput,
  InvoiceListOptions,
  ExportPdfOptions,
  PaginatedResponse,
  SingleResponse,
} from '../types';

/**
 * Invoices API resource
 *
 * @example
 * ```typescript
 * const hisab = new HisabClient({ apiKey: 'your_key' });
 *
 * // List invoices
 * const invoices = await hisab.invoices.list({ status: 'finalized' });
 *
 * // Create and finalize an invoice
 * const draft = await hisab.invoices.create({
 *   customer_id: 'cust_123',
 *   issue_date: '2024-11-28',
 *   items: [{ description: 'Service', quantity: 1, unit_price: 1000, tax_rate: 20 }]
 * });
 * const finalized = await hisab.invoices.finalize(draft.id);
 * ```
 */
export class InvoicesResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List invoices with pagination and filters
   *
   * @param options - Filtering and pagination options
   * @returns Paginated list of invoices
   */
  async list(options: InvoiceListOptions = {}): Promise<PaginatedResponse<Invoice>> {
    const query: Record<string, string | number | undefined> = {
      page: options.page,
      per_page: options.per_page,
      status: options.status,
      customer_id: options.customer_id,
      from_date: options.from_date,
      to_date: options.to_date,
    };

    return this.client.get<PaginatedResponse<Invoice>>('/invoices', query);
  }

  /**
   * Auto-paginate through all invoices
   *
   * @param options - Filtering options
   * @returns Async iterator for invoices
   *
   * @example
   * ```typescript
   * for await (const invoice of hisab.invoices.listAll({ status: 'paid' })) {
   *   console.log(invoice.invoice_number);
   * }
   *
   * // Or collect all at once
   * const allPaid = await hisab.invoices.listAll({ status: 'paid' }).toArray();
   * ```
   */
  listAll(options: Omit<InvoiceListOptions, 'page'> = {}): PaginatedIterator<Invoice> {
    const query: Record<string, string | number | undefined> = {
      status: options.status,
      customer_id: options.customer_id,
      from_date: options.from_date,
      to_date: options.to_date,
      per_page: options.per_page ?? 100,
    };

    return new PaginatedIterator<Invoice>(this.client, '/invoices', query);
  }

  /**
   * Get a single invoice by ID
   *
   * @param id - Invoice ID
   * @returns Invoice details
   */
  async get(id: string): Promise<Invoice> {
    const response = await this.client.get<SingleResponse<Invoice>>(`/invoices/${id}`);
    return response.data;
  }

  /**
   * Create a new draft invoice
   *
   * @param input - Invoice data
   * @returns Created invoice
   */
  async create(input: CreateInvoiceInput): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>('/invoices', input);
    return response.data;
  }

  /**
   * Update a draft invoice
   *
   * Note: Only draft invoices can be updated. Finalized invoices cannot be modified.
   *
   * @param id - Invoice ID
   * @param input - Fields to update
   * @returns Updated invoice
   */
  async update(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
    const response = await this.client.put<SingleResponse<Invoice>>(`/invoices/${id}`, input);
    return response.data;
  }

  /**
   * Finalize an invoice
   *
   * This assigns an official invoice number and makes the invoice immutable.
   * The invoice will follow the organization's numbering sequence.
   *
   * @param id - Invoice ID
   * @returns Finalized invoice with invoice_number assigned
   */
  async finalize(id: string): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(`/invoices/${id}/finalize`);
    return response.data;
  }

  /**
   * Mark an invoice as sent
   *
   * Records that the invoice has been sent to the customer.
   *
   * @param id - Invoice ID
   * @returns Updated invoice
   */
  async markAsSent(id: string): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(`/invoices/${id}/send`);
    return response.data;
  }

  /**
   * Mark an invoice as paid
   *
   * Records that payment has been received for the invoice.
   *
   * @param id - Invoice ID
   * @param input - Optional payment details
   * @returns Updated invoice
   */
  async markAsPaid(id: string, input: MarkAsPaidInput = {}): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(`/invoices/${id}/pay`, input);
    return response.data;
  }

  /**
   * Void an invoice
   *
   * Cancels an invoice. Voided invoices remain in the system for audit purposes
   * but are no longer valid. A reason must be provided.
   *
   * @param id - Invoice ID
   * @param input - Void reason
   * @returns Voided invoice
   */
  async void(id: string, input: VoidInvoiceInput): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(`/invoices/${id}/void`, input);
    return response.data;
  }

  /**
   * Export invoice as PDF
   *
   * Downloads the invoice as a validated PDF with QR code.
   * Only finalized invoices can be exported.
   *
   * @param id - Invoice ID
   * @param options - Export options (locale)
   * @returns PDF file as ArrayBuffer
   *
   * @example
   * ```typescript
   * const pdfBuffer = await hisab.invoices.exportPdf('inv_123', { locale: 'fr' });
   *
   * // In Node.js, save to file
   * const fs = require('fs');
   * fs.writeFileSync('invoice.pdf', Buffer.from(pdfBuffer));
   *
   * // In browser, create download link
   * const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
   * const url = URL.createObjectURL(blob);
   * ```
   */
  async exportPdf(id: string, options: ExportPdfOptions = {}): Promise<ArrayBuffer> {
    const query: Record<string, string | undefined> = {
      locale: options.locale,
    };

    return this.client.request<ArrayBuffer>({
      method: 'GET',
      path: `/invoices/${id}/pdf`,
      query,
      responseType: 'blob',
    });
  }

  /**
   * Export invoice as UBL XML
   *
   * Downloads the invoice in UBL 2.1 format for DGI compliance.
   * Only finalized invoices can be exported.
   *
   * @param id - Invoice ID
   * @returns UBL XML string
   */
  async exportXml(id: string): Promise<string> {
    return this.client.request<string>({
      method: 'GET',
      path: `/invoices/${id}/xml`,
      responseType: 'text',
    });
  }

  /**
   * Duplicate an invoice
   *
   * Creates a new draft invoice based on an existing one.
   * Useful for recurring invoices or corrections.
   *
   * @param id - Invoice ID to duplicate
   * @returns New draft invoice
   */
  async duplicate(id: string): Promise<Invoice> {
    const response = await this.client.post<SingleResponse<Invoice>>(`/invoices/${id}/duplicate`);
    return response.data;
  }

  /**
   * Get invoice statistics
   *
   * Returns summary statistics for invoices.
   */
  async getStats(options: { from_date?: string; to_date?: string } = {}): Promise<{
    total_count: number;
    draft_count: number;
    finalized_count: number;
    sent_count: number;
    paid_count: number;
    void_count: number;
    total_amount: string;
    paid_amount: string;
    outstanding_amount: string;
  }> {
    const response = await this.client.get<SingleResponse<{
      total_count: number;
      draft_count: number;
      finalized_count: number;
      sent_count: number;
      paid_count: number;
      void_count: number;
      total_amount: string;
      paid_amount: string;
      outstanding_amount: string;
    }>>('/invoices/stats', options);
    return response.data;
  }
}
