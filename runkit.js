// RunKit example for hisab-sdk
const { HisabClient } = require('hisab-sdk');

// Initialize the client (demo mode - no actual API calls)
const hisab = new HisabClient({
  apiKey: 'hisab_live_your_api_key_here'
});

// Display available resources
console.log('🧾 Hisab SDK - Official Node.js SDK for Hisab e-invoicing API\n');

console.log('Available Resources:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('📄 hisab.invoices');
console.log('   • list()        - List invoices with filters');
console.log('   • listAll()     - Auto-paginate through all invoices');
console.log('   • get(id)       - Get single invoice');
console.log('   • create()      - Create draft invoice');
console.log('   • update()      - Update draft invoice');
console.log('   • finalize()    - Finalize and assign number');
console.log('   • markAsPaid()  - Record payment');
console.log('   • void()        - Cancel invoice');
console.log('   • exportPdf()   - Download as PDF');
console.log('   • exportXml()   - Download as UBL XML\n');

console.log('👥 hisab.customers');
console.log('   • list()        - List customers');
console.log('   • listAll()     - Auto-paginate through all');
console.log('   • get(id)       - Get single customer');
console.log('   • create()      - Create B2B or B2C customer');
console.log('   • update()      - Update customer');
console.log('   • archive()     - Soft delete customer');
console.log('   • search()      - Quick search by name/email/ICE\n');

console.log('🏢 hisab.organization');
console.log('   • get()         - Get organization details');
console.log('   • update()      - Update organization\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('Quick Start Example:');
console.log(`
const { HisabClient } = require('hisab-sdk');

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
  items: [{ description: 'Service', quantity: 1, unit_price: 1000, tax_rate: 20 }],
});

const finalized = await hisab.invoices.finalize(invoice.id);
console.log('Invoice:', finalized.invoice_number);
`);

console.log('📚 Full documentation: https://hisab.ma/docs/sdk');
console.log('🐙 GitHub: https://github.com/SallahBoussettah/hisab-sdk');
