/**
 * Example: Creating and finalizing an invoice
 */

import { HisabClient, ValidationError } from '../src';

async function createInvoiceExample() {
  const hisab = new HisabClient({
    apiKey: process.env.HISAB_API_KEY!,
  });

  try {
    // Step 1: Get or create a customer
    console.log('Looking for customer...');
    const customers = await hisab.customers.list({ search: 'Test', per_page: 1 });

    let customerId: string;

    if (customers.data.length > 0) {
      customerId = customers.data[0]!.id;
      console.log('Found existing customer:', customers.data[0]!.name);
    } else {
      // Create a new B2C customer
      const newCustomer = await hisab.customers.create({
        name: 'Test Customer',
        type: 'b2c',
        email: 'test@example.com',
      });
      customerId = newCustomer.id;
      console.log('Created new customer:', newCustomer.name);
    }

    // Step 2: Create a draft invoice
    console.log('\nCreating draft invoice...');
    const today = new Date().toISOString().split('T')[0]!;
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]!;

    const draft = await hisab.invoices.create({
      customer_id: customerId,
      issue_date: today,
      due_date: dueDate,
      currency: 'MAD',
      items: [
        {
          description: 'Web Development Services',
          quantity: 10,
          unit_price: 500,
          tax_rate: 20,
        },
        {
          description: 'Hosting (Monthly)',
          quantity: 1,
          unit_price: 100,
          tax_rate: 20,
        },
      ],
      payment_terms: 'Net 30',
      notes: 'Thank you for your business!',
    });

    console.log('Draft created:');
    console.log('  ID:', draft.id);
    console.log('  Status:', draft.status);
    console.log('  Subtotal:', draft.subtotal, draft.currency);
    console.log('  Tax:', draft.total_tax, draft.currency);
    console.log('  Total:', draft.total, draft.currency);

    // Step 3: Finalize the invoice
    console.log('\nFinalizing invoice...');
    const finalized = await hisab.invoices.finalize(draft.id);

    console.log('Invoice finalized:');
    console.log('  Invoice Number:', finalized.invoice_number);
    console.log('  Status:', finalized.status);
    console.log('  Finalized At:', finalized.finalized_at);

    // Step 4: Export as PDF
    console.log('\nExporting PDF...');
    const pdf = await hisab.invoices.exportPdf(finalized.id, { locale: 'fr' });
    console.log('PDF size:', pdf.byteLength, 'bytes');

    // In a real app, you would save this to a file or send to storage
    // const fs = require('fs');
    // fs.writeFileSync(`${finalized.invoice_number}.pdf`, Buffer.from(pdf));

    console.log('\nInvoice flow completed successfully!');
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message);
      console.error('Details:', error.details);
    } else {
      console.error('Error:', error);
    }
  }
}

createInvoiceExample();
