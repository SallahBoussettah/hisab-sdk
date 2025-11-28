/**
 * Organization resource for the Hisab SDK
 */

import type { HttpClient } from '../utils/request';
import type {
  Organization,
  UpdateOrganizationInput,
  SingleResponse,
} from '../types';

/**
 * Organization API resource
 *
 * @example
 * ```typescript
 * const hisab = new HisabClient({ apiKey: 'your_key' });
 *
 * // Get organization details
 * const org = await hisab.organization.get();
 * console.log(org.name, org.ice);
 *
 * // Update organization
 * await hisab.organization.update({
 *   email: 'new-contact@company.ma',
 *   phone: '+212 5 22 999999'
 * });
 * ```
 */
export class OrganizationResource {
  constructor(private readonly client: HttpClient) {}

  /**
   * Get organization details
   *
   * Returns the organization associated with the API key.
   *
   * @returns Organization details
   */
  async get(): Promise<Organization> {
    const response = await this.client.get<SingleResponse<Organization>>('/organization');
    return response.data;
  }

  /**
   * Update organization details
   *
   * Updates the organization associated with the API key.
   * Only provided fields will be updated.
   *
   * @param input - Fields to update
   * @returns Updated organization
   *
   * @example
   * ```typescript
   * const updated = await hisab.organization.update({
   *   legal_name: 'My Company SARL',
   *   address: {
   *     street: '123 New Street',
   *     city: 'Casablanca',
   *     postal_code: '20000',
   *     country: 'MA'
   *   },
   *   invoice_prefix: 'INV-'
   * });
   * ```
   */
  async update(input: UpdateOrganizationInput): Promise<Organization> {
    const response = await this.client.put<SingleResponse<Organization>>('/organization', input);
    return response.data;
  }

  /**
   * Get organization branding settings
   *
   * Returns logo and color settings for invoice customization.
   */
  async getBranding(): Promise<{
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    footer_text: string | null;
  }> {
    const response = await this.client.get<SingleResponse<{
      logo_url: string | null;
      primary_color: string | null;
      secondary_color: string | null;
      footer_text: string | null;
    }>>('/organization/branding');
    return response.data;
  }

  /**
   * Update organization branding
   *
   * @param input - Branding settings to update
   * @returns Updated branding settings
   */
  async updateBranding(input: {
    primary_color?: string;
    secondary_color?: string;
    footer_text?: string;
  }): Promise<{
    logo_url: string | null;
    primary_color: string | null;
    secondary_color: string | null;
    footer_text: string | null;
  }> {
    const response = await this.client.put<SingleResponse<{
      logo_url: string | null;
      primary_color: string | null;
      secondary_color: string | null;
      footer_text: string | null;
    }>>('/organization/branding', input);
    return response.data;
  }

  /**
   * Get invoice numbering settings
   *
   * Returns the current invoice prefix and next number.
   */
  async getNumberingSettings(): Promise<{
    invoice_prefix: string;
    next_invoice_number: number;
    fiscal_year_start: number;
  }> {
    const org = await this.get();
    return {
      invoice_prefix: org.invoice_prefix,
      next_invoice_number: org.next_invoice_number,
      fiscal_year_start: org.fiscal_year_start,
    };
  }

  /**
   * Get organization's legal identifiers
   *
   * Returns all legal identifiers (ICE, RC, IF, TP, CNSS).
   */
  async getLegalIdentifiers(): Promise<{
    ice: string;
    rc: string | null;
    if_number: string | null;
    tp: string | null;
    cnss: string | null;
  }> {
    const org = await this.get();
    return {
      ice: org.ice,
      rc: org.rc,
      if_number: org.if_number,
      tp: org.tp,
      cnss: org.cnss,
    };
  }

  /**
   * Get organization dashboard metrics
   *
   * Returns key metrics for the organization dashboard.
   */
  async getMetrics(options: { period?: 'day' | 'week' | 'month' | 'year' } = {}): Promise<{
    total_revenue: string;
    outstanding_amount: string;
    invoice_count: number;
    customer_count: number;
    average_invoice_value: string;
    payment_rate: number;
  }> {
    const response = await this.client.get<SingleResponse<{
      total_revenue: string;
      outstanding_amount: string;
      invoice_count: number;
      customer_count: number;
      average_invoice_value: string;
      payment_rate: number;
    }>>('/organization/metrics', options);
    return response.data;
  }
}
