/**
 * Organization-related types
 */

import { Address, AddressInput } from './common';

/**
 * Organization object returned by API
 */
export interface Organization {
  id: string;
  name: string;
  legal_name: string | null;
  /** ICE number (15 digits) */
  ice: string;
  /** Registre de Commerce number */
  rc: string | null;
  /** Identifiant Fiscal */
  if_number: string | null;
  /** Taxe Professionnelle number */
  tp: string | null;
  /** CNSS number */
  cnss: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: Address;
  /** Logo URL */
  logo_url: string | null;
  /** Default currency */
  default_currency: string;
  /** Fiscal year start month (1-12) */
  fiscal_year_start: number;
  /** Invoice numbering prefix */
  invoice_prefix: string;
  /** Next invoice number */
  next_invoice_number: number;
  created_at: string;
  updated_at: string;
}

/**
 * Input for updating organization details
 */
export interface UpdateOrganizationInput {
  /** Display name */
  name?: string;
  /** Legal company name */
  legal_name?: string;
  /** ICE number (15 digits) */
  ice?: string;
  /** Registre de Commerce number */
  rc?: string;
  /** Identifiant Fiscal */
  if_number?: string;
  /** Taxe Professionnelle number */
  tp?: string;
  /** CNSS number */
  cnss?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Website URL */
  website?: string;
  /** Address information */
  address?: AddressInput;
  /** Default currency code */
  default_currency?: string;
  /** Fiscal year start month (1-12) */
  fiscal_year_start?: number;
  /** Invoice numbering prefix */
  invoice_prefix?: string;
}
