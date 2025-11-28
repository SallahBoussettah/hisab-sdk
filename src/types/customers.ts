/**
 * Customer-related types
 */

import { Address, AddressInput, ListOptions } from './common';

/**
 * Customer type (B2B requires ICE, B2C does not)
 */
export type CustomerType = 'b2b' | 'b2c';

/**
 * Customer status values
 */
export type CustomerStatus = 'active' | 'inactive' | 'archived';

/**
 * Full customer object returned by API
 */
export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  status: CustomerStatus;
  /** ICE number (required for B2B, 15 digits) */
  ice: string | null;
  /** Legal company name */
  legal_name: string | null;
  /** Registre de Commerce number */
  rc: string | null;
  email: string | null;
  phone: string | null;
  address: Address;
  notes: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new customer
 */
export interface CreateCustomerInput {
  /** Customer display name (required) */
  name: string;
  /** Customer type (required) */
  type: CustomerType;
  /** ICE number (required for B2B, exactly 15 digits) */
  ice?: string;
  /** Legal company name */
  legal_name?: string;
  /** Registre de Commerce number */
  rc?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Address information */
  address?: AddressInput;
  /** Internal notes */
  notes?: string;
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Input for updating an existing customer
 */
export interface UpdateCustomerInput {
  /** Customer display name */
  name?: string;
  /** Customer type */
  type?: CustomerType;
  /** ICE number (required for B2B) */
  ice?: string;
  /** Legal company name */
  legal_name?: string;
  /** Registre de Commerce number */
  rc?: string;
  /** Email address */
  email?: string;
  /** Phone number */
  phone?: string;
  /** Address information */
  address?: AddressInput;
  /** Internal notes */
  notes?: string;
  /** Tags for categorization */
  tags?: string[];
  /** Customer status */
  status?: CustomerStatus;
}

/**
 * Options for listing customers
 */
export interface CustomerListOptions extends ListOptions {
  /** Search by name, email, or ICE */
  search?: string;
  /** Filter by customer type */
  type?: CustomerType;
  /** Filter by status */
  status?: CustomerStatus;
}
