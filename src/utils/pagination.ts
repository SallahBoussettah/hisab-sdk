/**
 * Pagination utilities for auto-pagination support
 */

import type { HttpClient } from './request';
import type { PaginatedResponse, ListOptions } from '../types';

/**
 * Options for auto-pagination
 */
export interface AutoPaginateOptions extends ListOptions {
  /** Maximum number of items to fetch (default: unlimited) */
  maxItems?: number;
}

/**
 * Async iterator for auto-pagination
 */
export class PaginatedIterator<T> implements AsyncIterable<T> {
  private readonly client: HttpClient;
  private readonly path: string;
  private readonly options: AutoPaginateOptions;
  private readonly perPage: number;
  private currentPage: number;
  private totalPages: number | null;
  private itemsYielded: number;

  constructor(
    client: HttpClient,
    path: string,
    options: AutoPaginateOptions = {}
  ) {
    this.client = client;
    this.path = path;
    this.options = options;
    this.perPage = options.per_page ?? 100;
    this.currentPage = options.page ?? 1;
    this.totalPages = null;
    this.itemsYielded = 0;
  }

  /**
   * Implement async iterator protocol
   */
  async *[Symbol.asyncIterator](): AsyncIterator<T> {
    // Reset state so the iterator can be reused
    this.currentPage = this.options.page ?? 1;
    this.itemsYielded = 0;
    this.totalPages = null;

    const { maxItems } = this.options;

    while (true) {
      // Check if we've reached the max items limit
      if (maxItems && this.itemsYielded >= maxItems) {
        break;
      }

      // Fetch the current page
      const response = await this.client.get<PaginatedResponse<T>>(this.path, {
        ...this.options,
        page: this.currentPage,
        per_page: this.perPage,
      });

      // Store total pages for reference
      this.totalPages = response.meta.pagination.total_pages;

      // Yield items from this page
      for (const item of response.data) {
        if (maxItems && this.itemsYielded >= maxItems) {
          break;
        }
        yield item;
        this.itemsYielded++;
      }

      // Check if we've reached the last page
      if (this.currentPage >= this.totalPages) {
        break;
      }

      // Move to next page
      this.currentPage++;
    }
  }

  /**
   * Collect all items into an array
   * Warning: Be careful with large datasets
   */
  async toArray(): Promise<T[]> {
    const items: T[] = [];
    for await (const item of this) {
      items.push(item);
    }
    return items;
  }

  /**
   * Get the first item or null
   */
  async first(): Promise<T | null> {
    for await (const item of this) {
      return item;
    }
    return null;
  }

  /**
   * Count total items (makes a single request to get count)
   */
  async count(): Promise<number> {
    const response = await this.client.get<PaginatedResponse<T>>(this.path, {
      ...this.options,
      page: 1,
      per_page: 1,
    });
    return response.meta.pagination.total;
  }

  /**
   * Check if any items exist
   */
  async exists(): Promise<boolean> {
    return (await this.count()) > 0;
  }

  /**
   * Take first n items
   */
  async take(n: number): Promise<T[]> {
    const items: T[] = [];
    let count = 0;
    for await (const item of this) {
      if (count >= n) break;
      items.push(item);
      count++;
    }
    return items;
  }

  /**
   * Filter items with a predicate
   */
  async *filter(predicate: (item: T) => boolean): AsyncGenerator<T> {
    for await (const item of this) {
      if (predicate(item)) {
        yield item;
      }
    }
  }

  /**
   * Map items to a new type
   */
  async *map<U>(mapper: (item: T) => U): AsyncGenerator<U> {
    for await (const item of this) {
      yield mapper(item);
    }
  }

  /**
   * Execute a callback for each item
   */
  async forEach(callback: (item: T) => void | Promise<void>): Promise<void> {
    for await (const item of this) {
      await callback(item);
    }
  }
}

/**
 * Create a paginated iterator for a resource
 */
export function createPaginatedIterator<T>(
  client: HttpClient,
  path: string,
  options?: AutoPaginateOptions
): PaginatedIterator<T> {
  return new PaginatedIterator<T>(client, path, options);
}
