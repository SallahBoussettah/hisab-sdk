/**
 * Basic usage example for the Hisab SDK
 */

import { HisabClient } from '../src';

async function main() {
  // Initialize the client
  const hisab = new HisabClient({
    apiKey: process.env.HISAB_API_KEY!,
    debug: true, // Enable debug logging
  });

  try {
    // Test connection
    await hisab.testConnection();
    console.log('Connected to Hisab API!');

    // Get organization details
    const org = await hisab.organization.get();
    console.log('\nOrganization:', org.name);
    console.log('ICE:', org.ice);

    // List customers
    const customers = await hisab.customers.list({ per_page: 5 });
    console.log('\nCustomers:', customers.data.length);

    // List invoices
    const invoices = await hisab.invoices.list({ per_page: 5 });
    console.log('Invoices:', invoices.data.length);

    // Check rate limits
    const rateLimit = hisab.getRateLimit();
    if (rateLimit) {
      console.log(`\nRate limit: ${rateLimit.remaining}/${rateLimit.limit}`);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
