# Hisab SDK

Official Node.js/TypeScript SDK for the [Hisab](https://hisab.ma) e-invoicing API.

[![npm version](https://img.shields.io/npm/v/hisab-sdk.svg)](https://www.npmjs.com/package/hisab-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Features

- Full TypeScript support with comprehensive type definitions
- Auto-pagination for large datasets
- Automatic retry with exponential backoff
- Webhook signature verification
- ESM and CommonJS support
- Zero production dependencies

## Installation

```bash
npm install hisab-sdk
# or
yarn add hisab-sdk
# or
pnpm add hisab-sdk
```

## Quick Start

```typescript
import { HisabClient } from 'hisab-sdk';

const hisab = new HisabClient({
  apiKey: process.env.HISAB_API_KEY,
});

// Create a customer
const customer = await hisab.customers.create({
  name: 'Acme Corporation',
  type: 'b2b',
  ice: '001234567000089',
  email: 'billing@acme.com',
});

// Create and finalize an invoice
const invoice = await hisab.invoices.create({
  customer_id: customer.id,
  issue_date: '2025-11-28',
  due_date: '2025-12-28',
  items: [
    {
      description: 'Consulting Services',
      quantity: 10,
      unit_price: 500,
      tax_rate: 20,
    },
  ],
});

const finalized = await hisab.invoices.finalize(invoice.id);
console.log('Invoice number:', finalized.invoice_number);

// Download PDF
const pdf = await hisab.invoices.exportPdf(finalized.id);
```

## Configuration

```typescript
const hisab = new HisabClient({
  apiKey: 'hisab_live_xxx',           // Required - Your API key
  baseUrl: 'https://hisab.ma/api/v1', // Optional - API base URL
  timeout: 30000,                      // Optional - Request timeout in ms
  retries: 3,                          // Optional - Number of retries
  debug: false,                        // Optional - Enable debug logging
});
```

## API Reference

### Invoices

```typescript
// List invoices
const invoices = await hisab.invoices.list({
  page: 1,
  per_page: 20,
  status: 'finalized',      // draft, finalized, sent, paid, void
  customer_id: 'cust_xxx',
  from_date: '2025-01-01',
  to_date: '2025-12-31',
});

// Auto-paginate through all invoices
for await (const invoice of hisab.invoices.listAll({ status: 'paid' })) {
  console.log(invoice.invoice_number);
}

// Or collect all at once
const allInvoices = await hisab.invoices.listAll().toArray();

// Get single invoice
const invoice = await hisab.invoices.get('inv_xxx');

// Create draft invoice
const draft = await hisab.invoices.create({
  customer_id: 'cust_xxx',
  issue_date: '2025-11-28',
  due_date: '2025-12-28',
  currency: 'MAD',
  items: [
    {
      description: 'Service',
      quantity: 1,
      unit_price: 1000,
      tax_rate: 20,
    },
  ],
  notes: 'Thank you for your business',
});

// Update draft invoice
await hisab.invoices.update('inv_xxx', {
  notes: 'Updated notes',
});

// Finalize invoice (assigns official number)
const finalized = await hisab.invoices.finalize('inv_xxx');

// Mark as sent
await hisab.invoices.markAsSent('inv_xxx');

// Mark as paid
await hisab.invoices.markAsPaid('inv_xxx');

// Void invoice (requires reason)
await hisab.invoices.void('inv_xxx', {
  reason: 'Customer requested cancellation',
});

// Export PDF
const pdf = await hisab.invoices.exportPdf('inv_xxx', { locale: 'fr' });
fs.writeFileSync('invoice.pdf', Buffer.from(pdf));

// Export UBL XML (DGI compliant)
const xml = await hisab.invoices.exportXml('inv_xxx');

// Duplicate invoice
const copy = await hisab.invoices.duplicate('inv_xxx');

// Get statistics
const stats = await hisab.invoices.getStats({
  from_date: '2025-01-01',
  to_date: '2025-12-31',
});
```

### Customers

```typescript
// List customers
const customers = await hisab.customers.list({
  page: 1,
  per_page: 20,
  type: 'b2b',        // b2b or b2c
  status: 'active',   // active or archived
  search: 'acme',
});

// Auto-paginate through all customers
for await (const customer of hisab.customers.listAll({ type: 'b2b' })) {
  console.log(customer.name, customer.ice);
}

// Get single customer
const customer = await hisab.customers.get('cust_xxx');

// Create B2B customer (ICE required)
const b2bCustomer = await hisab.customers.create({
  name: 'Acme Corporation',
  type: 'b2b',
  ice: '001234567000089',
  email: 'billing@acme.com',
  phone: '+212 5 22 123456',
  address: {
    street: '123 Business Ave',
    city: 'Casablanca',
    postal_code: '20000',
    country: 'MA',
  },
});

// Create B2C customer
const b2cCustomer = await hisab.customers.create({
  name: 'Mohammed El Amrani',
  type: 'b2c',
  email: 'mohammed@email.com',
  phone: '+212 6 12 345678',
});

// Update customer
await hisab.customers.update('cust_xxx', {
  email: 'new-email@acme.com',
});

// Archive customer (soft delete)
await hisab.customers.archive('cust_xxx');

// Reactivate archived customer
await hisab.customers.reactivate('cust_xxx');

// Search customers
const results = await hisab.customers.search('acme', 10);

// Find by ICE
const found = await hisab.customers.findByIce('001234567000089');

// Get customer's invoices
const customerInvoices = await hisab.customers.getInvoices('cust_xxx', {
  status: 'paid',
});

// Get statistics
const stats = await hisab.customers.getStats();
```

### Organization

```typescript
// Get organization details
const org = await hisab.organization.get();
console.log(org.legal_name, org.ice);

// Update organization
await hisab.organization.update({
  email: 'contact@company.ma',
  phone: '+212 5 22 123456',
  address: {
    street: 'New Address',
    city: 'Rabat',
  },
});
```

### Recurring Invoices

```typescript
// List recurring invoices
const recurring = await hisab.recurringInvoices.list({
  page: 1,
  per_page: 20,
  status: 'active',
});

// Get single recurring invoice
const schedule = await hisab.recurringInvoices.get('rec_xxx');

// Create recurring invoice
const newRecurring = await hisab.recurringInvoices.create({
  customer_id: 'cust_xxx',
  frequency: 'monthly',
  start_date: '2025-01-01',
  items: [
    {
      description: 'Monthly Retainer',
      quantity: 1,
      unit_price: 5000,
      tax_rate: 20,
    },
  ],
});

// Pause/Resume
await hisab.recurringInvoices.pause('rec_xxx');
await hisab.recurringInvoices.resume('rec_xxx');

// Generate next invoice manually
const invoice = await hisab.recurringInvoices.generateInvoice('rec_xxx');

// View generation history
const history = await hisab.recurringInvoices.getHistory('rec_xxx');
```

### Webhooks

Verify webhook signatures to ensure requests are from Hisab:

```typescript
import { verifyWebhookSignature } from 'hisab-sdk';

// Express.js example
app.post('/webhooks/hisab', express.raw({ type: 'application/json' }), (req, res) => {
  const isValid = verifyWebhookSignature({
    payload: req.body.toString(),
    signature: req.headers['x-webhook-signature'],
    timestamp: req.headers['x-webhook-timestamp'],
    secret: process.env.HISAB_WEBHOOK_SECRET,
  });

  if (!isValid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(req.body);

  switch (event.event) {
    case 'invoice.created':
      console.log('New invoice:', event.data);
      break;
    case 'invoice.finalized':
      console.log('Invoice finalized:', event.data);
      break;
    case 'invoice.paid':
      console.log('Invoice paid:', event.data);
      break;
    case 'customer.created':
      console.log('New customer:', event.data);
      break;
  }

  res.json({ received: true });
});
```

#### Webhook Events

| Event | Description |
|-------|-------------|
| `invoice.created` | New invoice created |
| `invoice.updated` | Invoice updated |
| `invoice.finalized` | Invoice finalized with official number |
| `invoice.sent` | Invoice marked as sent |
| `invoice.paid` | Invoice marked as paid |
| `invoice.voided` | Invoice cancelled/voided |
| `customer.created` | New customer created |
| `customer.updated` | Customer updated |
| `customer.deleted` | Customer archived |

## Error Handling

```typescript
import {
  HisabClient,
  HisabError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  RateLimitError,
  NetworkError,
  TimeoutError,
} from 'hisab-sdk';

try {
  await hisab.invoices.create({ /* ... */ });
} catch (error) {
  if (error instanceof ValidationError) {
    // 400 - Invalid input
    console.log('Validation failed:', error.message);
    console.log('Details:', error.details);
  } else if (error instanceof AuthenticationError) {
    // 401 - Invalid API key
    console.log('Check your API key');
  } else if (error instanceof NotFoundError) {
    // 404 - Resource not found
    console.log('Resource not found:', error.message);
  } else if (error instanceof RateLimitError) {
    // 429 - Too many requests
    console.log('Rate limited, retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof NetworkError) {
    // Network/connection error
    console.log('Network error:', error.message);
  } else if (error instanceof TimeoutError) {
    // Request timed out
    console.log('Request timed out after:', error.timeout, 'ms');
  } else if (error instanceof HisabError) {
    // Other API error
    console.log('API error:', error.code, error.message);
  }
}
```

### Error Classes

| Class | HTTP Status | Description |
|-------|-------------|-------------|
| `ValidationError` | 400 | Invalid request parameters |
| `AuthenticationError` | 401 | Invalid or missing API key |
| `ForbiddenError` | 403 | Insufficient permissions |
| `NotFoundError` | 404 | Resource not found |
| `RateLimitError` | 429 | Too many requests |
| `HisabError` | 5xx | Server error |
| `NetworkError` | - | Connection failed |
| `TimeoutError` | - | Request timed out |

## Pagination

### Auto-Pagination

The SDK provides automatic pagination using async iterators:

```typescript
// Iterate through all invoices
for await (const invoice of hisab.invoices.listAll({ status: 'finalized' })) {
  console.log(invoice.invoice_number);
}

// Collect all to array
const allCustomers = await hisab.customers.listAll({ type: 'b2b' }).toArray();
```

### Manual Pagination

```typescript
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await hisab.invoices.list({
    page,
    per_page: 100,
  });

  for (const invoice of response.data) {
    console.log(invoice.invoice_number);
  }

  hasMore = page < response.meta.pagination.total_pages;
  page++;
}
```

## TypeScript

The SDK is written in TypeScript and provides full type definitions:

```typescript
import type {
  Invoice,
  Customer,
  Organization,
  CreateInvoiceInput,
  CreateCustomerInput,
  InvoiceListOptions,
  CustomerListOptions,
  PaginatedResponse,
} from 'hisab-sdk';
```

## Requirements

- Node.js 18 or higher
- TypeScript 4.7+ (optional, for type support)

## License

MIT - see [LICENSE](LICENSE) for details.

## Links

- [Documentation](https://hisab.ma/docs/sdk)
- [API Reference](https://hisab.ma/docs/api)
- [Changelog](CHANGELOG.md)
- [GitHub](https://github.com/SallahBoussettah/hisab-sdk)
- [Issues](https://github.com/SallahBoussettah/hisab-sdk/issues)
