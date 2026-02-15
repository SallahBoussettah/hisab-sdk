/**
 * Hisab SDK Test Script
 *
 * This script demonstrates how to use the Hisab SDK to interact with the API.
 *
 * Usage:
 *   1. Set your API key in the environment variable HISAB_API_KEY
 *   2. Run with: npx tsx examples/test-sdk.ts
 */

import { HisabClient, ValidationError, AuthenticationError, NotFoundError } from '../src';

// Get API key from environment
const API_KEY = process.env.HISAB_API_KEY || 'your_api_key_here';
const BASE_URL = process.env.HISAB_API_URL || 'https://hisab.ma/api/v1';

async function main() {
  console.log('🚀 Hisab SDK Test Script\n');
  console.log(`📡 API URL: ${BASE_URL}`);
  console.log(`🔑 API Key: ${API_KEY.substring(0, 15)}...`);
  console.log('');

  // Initialize the client
  const hisab = new HisabClient({
    apiKey: API_KEY,
    baseUrl: BASE_URL,
    debug: true,
  });

  try {
    // Test 1: List invoices
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Test 1: List Invoices');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const invoices = await hisab.invoices.list({ per_page: 5 });
    console.log(`Found ${invoices.data.length} invoices`);
    if (invoices.data.length > 0) {
      console.log('First invoice:', {
        id: invoices.data[0].id,
        number: invoices.data[0].invoice_number,
        status: invoices.data[0].status,
        total: invoices.data[0].total,
      });
    }
    console.log('✅ List invoices successful!\n');

    // Test 2: List customers
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👥 Test 2: List Customers');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const customers = await hisab.customers.list({ per_page: 5 });
    console.log(`Found ${customers.data.length} customers`);
    if (customers.data.length > 0) {
      console.log('First customer:', {
        id: customers.data[0].id,
        name: customers.data[0].name,
        email: customers.data[0].email,
        type: customers.data[0].type,
      });
    }
    console.log('✅ List customers successful!\n');

    // Test 3: Get organization
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🏢 Test 3: Get Organization');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const org = await hisab.organization.get();
    console.log('Organization:', {
      id: org.id,
      name: org.legal_name,
      ice: org.ice,
      city: org.address?.city,
    });
    console.log('✅ Get organization successful!\n');

    // Test 4: Create a customer
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 Test 4: Create Customer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const newCustomer = await hisab.customers.create({
      name: 'SDK Test Customer ' + Date.now(),
      email: `sdk-test-${Date.now()}@example.com`,
      type: 'b2c',
      phone: '+212600000000',
      address: {
        street: '123 Test Street',
        city: 'Casablanca',
        country: 'MA',
      },
    });
    console.log('Created customer:', {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
    });
    console.log('✅ Create customer successful!\n');

    // Test 5: Create an invoice
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 Test 5: Create Invoice');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const newInvoice = await hisab.invoices.create({
      customer_id: newCustomer.id,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        {
          description: 'SDK Test Service',
          quantity: 2,
          unit_price: 500,
          tax_rate: 20,
        },
      ],
      notes: 'Created via Hisab SDK test',
    });
    console.log('Created invoice:', {
      id: newInvoice.id,
      status: newInvoice.status,
      total: newInvoice.total,
    });
    console.log('✅ Create invoice successful!\n');

    // Test 6: Finalize the invoice
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✔️  Test 6: Finalize Invoice');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const finalizedInvoice = await hisab.invoices.finalize(newInvoice.id);
    console.log('Finalized invoice:', {
      id: finalizedInvoice.id,
      invoice_number: finalizedInvoice.invoice_number,
      status: finalizedInvoice.status,
    });
    console.log('✅ Finalize invoice successful!\n');

    // Test 7: Download PDF
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📥 Test 7: Download PDF');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const pdf = await hisab.invoices.exportPdf(finalizedInvoice.id);
    console.log('Downloaded PDF:', {
      size: pdf.byteLength + ' bytes',
      sizeKB: Math.round(pdf.byteLength / 1024) + ' KB',
    });
    console.log('✅ Download PDF successful!\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 All 7 tests passed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.error('❌ Authentication failed. Check your API key.');
      console.error('   Make sure HISAB_API_KEY is set correctly.');
    } else if (error instanceof ValidationError) {
      console.error('❌ Validation error:', error.message);
      console.error('   Details:', error.details);
    } else if (error instanceof NotFoundError) {
      console.error('❌ Resource not found:', error.message);
    } else {
      console.error('❌ Error:', error);
    }
    process.exit(1);
  }
}

main();
