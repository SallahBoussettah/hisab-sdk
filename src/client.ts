/**
 * Main HisabClient class
 */

import type { HisabClientOptions, RateLimitInfo } from './types';
import { HttpClient } from './utils/request';
import { InvoicesResource } from './resources/invoices';
import { CustomersResource } from './resources/customers';
import { OrganizationResource } from './resources/organization';
import { RecurringInvoicesResource } from './resources/recurring-invoices';

/**
 * Hisab API Client
 *
 * The main entry point for the Hisab SDK. Create an instance with your API key
 * to access all API resources.
 *
 * @example
 * ```typescript
 * import { HisabClient } from 'hisab-sdk';
 *
 * const hisab = new HisabClient({
 *   apiKey: 'hisab_live_your_api_key_here',
 * });
 *
 * // Create an invoice
 * const invoice = await hisab.invoices.create({
 *   customer_id: 'cust_123',
 *   issue_date: '2024-11-28',
 *   items: [{
 *     description: 'Web Development Services',
 *     quantity: 10,
 *     unit_price: 500,
 *     tax_rate: 20
 *   }]
 * });
 *
 * // Finalize and export
 * await hisab.invoices.finalize(invoice.id);
 * const pdf = await hisab.invoices.exportPdf(invoice.id);
 * ```
 */
export class HisabClient {
  /** Internal HTTP client */
  private readonly httpClient: HttpClient;

  /** Invoice operations */
  public readonly invoices: InvoicesResource;

  /** Recurring invoice operations */
  public readonly recurringInvoices: RecurringInvoicesResource;

  /** Customer operations */
  public readonly customers: CustomersResource;

  /** Organization operations */
  public readonly organization: OrganizationResource;

  /**
   * Create a new Hisab client
   *
   * @param options - Client configuration
   * @throws Error if API key is not provided
   *
   * @example
   * ```typescript
   * // Basic setup
   * const hisab = new HisabClient({
   *   apiKey: 'hisab_live_your_api_key_here'
   * });
   *
   * // With all options
   * const hisab = new HisabClient({
   *   apiKey: process.env.HISAB_API_KEY,
   *   baseUrl: 'https://hisab.ma/api/v1',
   *   timeout: 30000,
   *   retries: 3,
   *   debug: process.env.NODE_ENV === 'development'
   * });
   * ```
   */
  constructor(options: HisabClientOptions) {
    if (!options.apiKey) {
      throw new Error(
        'Hisab API key is required. Get your API key from https://hisab.ma/dashboard/settings/api-keys'
      );
    }

    // Validate API key format
    if (!options.apiKey.startsWith('hisab_')) {
      console.warn(
        '[Hisab SDK] API key does not start with "hisab_". Make sure you are using a valid API key.'
      );
    }

    // Create HTTP client
    this.httpClient = new HttpClient(options);

    // Initialize resources
    this.invoices = new InvoicesResource(this.httpClient);
    this.recurringInvoices = new RecurringInvoicesResource(this.httpClient);
    this.customers = new CustomersResource(this.httpClient);
    this.organization = new OrganizationResource(this.httpClient);
  }

  /**
   * Get the last rate limit information
   *
   * Returns rate limit headers from the most recent API request.
   *
   * @returns Rate limit info or null if no requests have been made
   *
   * @example
   * ```typescript
   * const invoices = await hisab.invoices.list();
   * const rateLimit = hisab.getRateLimit();
   *
   * console.log(`${rateLimit.remaining}/${rateLimit.limit} requests remaining`);
   * console.log(`Resets at: ${new Date(rateLimit.reset * 1000)}`);
   * ```
   */
  getRateLimit(): RateLimitInfo | null {
    return this.httpClient.lastRateLimit;
  }

  /**
   * Test the API connection
   *
   * Makes a simple request to verify the API key is valid.
   *
   * @returns true if connection is successful
   * @throws HisabError if connection fails
   *
   * @example
   * ```typescript
   * try {
   *   await hisab.testConnection();
   *   console.log('API connection successful!');
   * } catch (error) {
   *   console.error('Failed to connect:', error.message);
   * }
   * ```
   */
  async testConnection(): Promise<boolean> {
    await this.organization.get();
    return true;
  }
}
