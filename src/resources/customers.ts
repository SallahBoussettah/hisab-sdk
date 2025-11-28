/**
 * Customer resource for the Hisab SDK
 */

import type { HttpClient } from '../utils/request';
import { PaginatedIterator } from '../utils/pagination';
import type {
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerListOptions,
  PaginatedResponse,
  SingleResponse,
} from '../types';

/**
 * Customers API resource
 *
 * @example
 * ```typescript
 * const hisab = new HisabClient({ apiKey: 'your_key' });
 *
 * // Create a B2B customer
 * const customer = await hisab.customers.create({
 *   name: 'Acme Corp',
 *   type: 'b2b',
 *   ice: '001234567000089',
 *   email: 'billing@acme.com'
 * });
 *
 * // List all customers
 * const customers = await hisab.customers.list({ type: 'b2b' });
 * ```
 */
export class CustomersResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * List customers with pagination and filters
   *
   * @param options - Filtering and pagination options
   * @returns Paginated list of customers
   */
  async list(options: CustomerListOptions = {}): Promise<PaginatedResponse<Customer>> {
    const query: Record<string, string | number | undefined> = {
      page: options.page,
      per_page: options.per_page,
      search: options.search,
      type: options.type,
      status: options.status,
    };

    return this.client.get<PaginatedResponse<Customer>>('/customers', query);
  }

  /**
   * Auto-paginate through all customers
   *
   * @param options - Filtering options
   * @returns Async iterator for customers
   *
   * @example
   * ```typescript
   * for await (const customer of hisab.customers.listAll({ type: 'b2b' })) {
   *   console.log(customer.name, customer.ice);
   * }
   *
   * // Or collect all at once
   * const allB2B = await hisab.customers.listAll({ type: 'b2b' }).toArray();
   * ```
   */
  listAll(options: Omit<CustomerListOptions, 'page'> = {}): PaginatedIterator<Customer> {
    const query: Record<string, string | number | undefined> = {
      search: options.search,
      type: options.type,
      status: options.status,
      per_page: options.per_page ?? 100,
    };

    return new PaginatedIterator<Customer>(this.client, '/customers', query);
  }

  /**
   * Get a single customer by ID
   *
   * @param id - Customer ID
   * @returns Customer details
   */
  async get(id: string): Promise<Customer> {
    const response = await this.client.get<SingleResponse<Customer>>(`/customers/${id}`);
    return response.data;
  }

  /**
   * Create a new customer
   *
   * For B2B customers, the ICE number is required and must be exactly 15 digits.
   * For B2C customers, the ICE is not required.
   *
   * @param input - Customer data
   * @returns Created customer
   *
   * @example
   * ```typescript
   * // Create B2B customer
   * const b2bCustomer = await hisab.customers.create({
   *   name: 'Acme Corporation',
   *   type: 'b2b',
   *   ice: '001234567000089',
   *   email: 'billing@acme.com',
   *   phone: '+212 5 22 123456',
   *   address: {
   *     street: '123 Business Ave',
   *     city: 'Casablanca',
   *     postal_code: '20000',
   *     country: 'MA'
   *   }
   * });
   *
   * // Create B2C customer
   * const b2cCustomer = await hisab.customers.create({
   *   name: 'Mohammed El Amrani',
   *   type: 'b2c',
   *   email: 'mohammed@email.com'
   * });
   * ```
   */
  async create(input: CreateCustomerInput): Promise<Customer> {
    const response = await this.client.post<SingleResponse<Customer>>('/customers', input);
    return response.data;
  }

  /**
   * Update an existing customer
   *
   * @param id - Customer ID
   * @param input - Fields to update
   * @returns Updated customer
   */
  async update(id: string, input: UpdateCustomerInput): Promise<Customer> {
    const response = await this.client.put<SingleResponse<Customer>>(`/customers/${id}`, input);
    return response.data;
  }

  /**
   * Archive a customer (soft delete)
   *
   * Archived customers are hidden from default lists but remain in the system
   * to preserve invoice history. Invoices for archived customers remain valid.
   *
   * @param id - Customer ID
   * @returns Archived customer
   */
  async archive(id: string): Promise<Customer> {
    const response = await this.client.delete<SingleResponse<Customer>>(`/customers/${id}`);
    return response.data;
  }

  /**
   * Search customers by name, email, or ICE
   *
   * Convenience method for quick searches.
   *
   * @param query - Search query
   * @param limit - Maximum results (default: 10)
   * @returns List of matching customers
   */
  async search(query: string, limit: number = 10): Promise<Customer[]> {
    const response = await this.list({
      search: query,
      per_page: limit,
    });
    return response.data;
  }

  /**
   * Find customer by ICE number
   *
   * @param ice - ICE number (15 digits)
   * @returns Customer or null if not found
   */
  async findByIce(ice: string): Promise<Customer | null> {
    const response = await this.list({
      search: ice,
      type: 'b2b',
      per_page: 1,
    });

    // Verify exact ICE match
    const customer = response.data.find((c) => c.ice === ice);
    return customer ?? null;
  }

  /**
   * Get customer statistics
   *
   * Returns summary statistics for customers.
   */
  async getStats(): Promise<{
    total_count: number;
    b2b_count: number;
    b2c_count: number;
    active_count: number;
    archived_count: number;
  }> {
    const response = await this.client.get<SingleResponse<{
      total_count: number;
      b2b_count: number;
      b2c_count: number;
      active_count: number;
      archived_count: number;
    }>>('/customers/stats');
    return response.data;
  }

  /**
   * Get invoices for a customer
   *
   * @param id - Customer ID
   * @param options - Pagination options
   * @returns Paginated list of invoices
   */
  async getInvoices(
    id: string,
    options: { page?: number; per_page?: number; status?: string } = {}
  ): Promise<PaginatedResponse<{
    id: string;
    invoice_number: string | null;
    status: string;
    total: string;
    issue_date: string;
    due_date: string | null;
  }>> {
    return this.client.get(`/customers/${id}/invoices`, options);
  }

  /**
   * Reactivate an archived customer
   *
   * @param id - Customer ID
   * @returns Reactivated customer
   */
  async reactivate(id: string): Promise<Customer> {
    const response = await this.client.put<SingleResponse<Customer>>(`/customers/${id}`, {
      status: 'active',
    });
    return response.data;
  }
}
