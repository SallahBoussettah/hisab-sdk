# Changelog

All notable changes to the Hisab SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-11-28

### Added

#### Core Features
- `HisabClient` - Main client class for API interaction
- Full TypeScript support with comprehensive type definitions
- Automatic retry logic with exponential backoff (configurable)
- Request timeout handling (default: 30 seconds)
- Debug mode for logging API requests

#### Invoice Management (`hisab.invoices`)
- `list(options?)` - List invoices with pagination and filters
- `listAll(options?)` - Auto-paginate through all invoices
- `get(id)` - Get a single invoice by ID
- `create(input)` - Create a new draft invoice
- `update(id, input)` - Update a draft invoice
- `finalize(id)` - Finalize invoice and assign official number
- `markAsSent(id)` - Mark invoice as sent to customer
- `markAsPaid(id, input?)` - Record payment received
- `void(id, input)` - Cancel/void an invoice (requires reason)
- `exportPdf(id, options?)` - Download invoice as PDF
- `exportXml(id)` - Download invoice as UBL 2.1 XML
- `duplicate(id)` - Create a copy of an invoice
- `getStats(options?)` - Get invoice statistics

#### Customer Management (`hisab.customers`)
- `list(options?)` - List customers with pagination and filters
- `listAll(options?)` - Auto-paginate through all customers
- `get(id)` - Get a single customer by ID
- `create(input)` - Create a new customer (B2B or B2C)
- `update(id, input)` - Update customer details
- `archive(id)` - Soft delete a customer
- `reactivate(id)` - Restore an archived customer
- `search(query, limit?)` - Quick search by name, email, or ICE
- `findByIce(ice)` - Find customer by ICE number
- `getInvoices(id, options?)` - Get customer's invoices
- `getStats()` - Get customer statistics

#### Organization Management (`hisab.organization`)
- `get()` - Get organization details
- `update(input)` - Update organization settings

#### Webhook Utilities
- `verifyWebhookSignature(options)` - Verify webhook signature (HMAC-SHA256)

#### Error Handling
- `HisabError` - Base error class for all API errors
- `ValidationError` - 400 Bad Request errors
- `AuthenticationError` - 401 Unauthorized errors
- `ForbiddenError` - 403 Forbidden errors
- `NotFoundError` - 404 Not Found errors
- `RateLimitError` - 429 Too Many Requests errors
- `NetworkError` - Network/connection errors
- `TimeoutError` - Request timeout errors

#### Pagination
- `PaginatedIterator` - Async iterator for auto-pagination
- `toArray()` method for collecting all results
- Support for `for await...of` loops

### Technical Details
- ESM and CommonJS dual package support
- Node.js 18+ required
- Zero production dependencies
- Built with tsup for optimal bundle size

[0.1.0]: https://github.com/SallahBoussettah/hisab-sdk/releases/tag/v0.1.0
