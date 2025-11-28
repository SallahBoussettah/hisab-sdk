/**
 * Example: Auto-pagination and iterator usage
 */

import { HisabClient } from '../src';

async function paginationExamples() {
  const hisab = new HisabClient({
    apiKey: process.env.HISAB_API_KEY!,
  });

  // Example 1: Manual pagination
  console.log('=== Manual Pagination ===\n');
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await hisab.invoices.list({
      page,
      per_page: 10,
      status: 'finalized',
    });

    console.log(`Page ${page}: ${response.data.length} invoices`);

    for (const invoice of response.data) {
      console.log(`  - ${invoice.invoice_number}: ${invoice.total} MAD`);
    }

    hasMore = page < response.meta.pagination.total_pages;
    page++;

    // Safety limit for demo
    if (page > 3) break;
  }

  // Example 2: Auto-pagination with async iterator
  console.log('\n=== Auto-Pagination (Async Iterator) ===\n');

  let count = 0;
  for await (const invoice of hisab.invoices.listAll({ status: 'paid' })) {
    console.log(`${invoice.invoice_number}: ${invoice.total} MAD (${invoice.status})`);
    count++;

    // Safety limit for demo
    if (count >= 10) {
      console.log('... (showing first 10)');
      break;
    }
  }

  // Example 3: Collect all to array
  console.log('\n=== Collect All to Array ===\n');

  const iterator = hisab.customers.listAll({ type: 'b2b', per_page: 50 });
  const totalB2B = await iterator.count();
  console.log(`Total B2B customers: ${totalB2B}`);

  // Example 4: Take first N items
  console.log('\n=== Take First 5 ===\n');

  const topCustomers = await hisab.customers.listAll().take(5);
  for (const customer of topCustomers) {
    console.log(`- ${customer.name} (${customer.type})`);
  }

  // Example 5: Get first item only
  console.log('\n=== Get First Item ===\n');

  const firstInvoice = await hisab.invoices.listAll({ status: 'draft' }).first();
  if (firstInvoice) {
    console.log(`First draft: ${firstInvoice.id}`);
  } else {
    console.log('No draft invoices found');
  }

  // Example 6: Check if any exist
  console.log('\n=== Check Existence ===\n');

  const hasPaidInvoices = await hisab.invoices.listAll({ status: 'paid' }).exists();
  console.log(`Has paid invoices: ${hasPaidInvoices}`);

  // Example 7: ForEach callback
  console.log('\n=== ForEach Callback ===\n');

  count = 0;
  await hisab.invoices.listAll({ status: 'finalized' }).forEach(async (invoice) => {
    // Process each invoice
    console.log(`Processing ${invoice.invoice_number}...`);
    count++;
    if (count >= 3) return; // Early exit doesn't work with forEach
  });

  console.log('\nDone!');
}

paginationExamples().catch(console.error);
