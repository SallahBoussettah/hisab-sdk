/**
 * Example: Webhook handler for Express.js
 */

import express from 'express';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  TypedWebhookEvent,
} from '../src';

const app = express();

const WEBHOOK_SECRET = process.env.HISAB_WEBHOOK_SECRET!;

// Webhook endpoint - use raw body for signature verification
app.post('/webhooks/hisab', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-webhook-timestamp'] as string;
  const deliveryId = req.headers['x-webhook-delivery-id'] as string;

  console.log('\n========== WEBHOOK RECEIVED ==========');
  console.log('Delivery ID:', deliveryId);

  // Verify signature
  const isValid = verifyWebhookSignature({
    payload: req.body.toString(),
    signature,
    timestamp,
    secret: WEBHOOK_SECRET,
  });

  if (!isValid) {
    console.error('Invalid signature!');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  console.log('Signature valid!');

  // Parse event
  const event: TypedWebhookEvent = parseWebhookEvent(req.body.toString());
  console.log('Event:', event.event);
  console.log('Organization:', event.organization_id);

  // Handle different event types
  switch (event.event) {
    case 'invoice.created':
      handleInvoiceCreated(event);
      break;

    case 'invoice.finalized':
      handleInvoiceFinalized(event);
      break;

    case 'invoice.paid':
      handleInvoicePaid(event);
      break;

    case 'invoice.voided':
      handleInvoiceVoided(event);
      break;

    case 'customer.created':
      handleCustomerCreated(event);
      break;

    case 'customer.deleted':
      handleCustomerDeleted(event);
      break;

    default:
      console.log('Unhandled event type:', event.event);
  }

  console.log('=======================================\n');

  // Always respond quickly with 200
  res.json({ received: true });
});

// Event handlers
function handleInvoiceCreated(event: TypedWebhookEvent) {
  if (event.event !== 'invoice.created') return;

  const { invoice } = event.data;
  console.log('New draft invoice created:');
  console.log('  ID:', invoice.id);
  console.log('  Customer:', invoice.customer_name);
  console.log('  Total:', invoice.total, invoice.currency);

  // Example: Send notification, update CRM, etc.
}

function handleInvoiceFinalized(event: TypedWebhookEvent) {
  if (event.event !== 'invoice.finalized') return;

  const { invoice } = event.data;
  console.log('Invoice finalized:');
  console.log('  Invoice Number:', invoice.invoice_number);
  console.log('  Total:', invoice.total, invoice.currency);

  // Example: Send invoice email, update accounting system
}

function handleInvoicePaid(event: TypedWebhookEvent) {
  if (event.event !== 'invoice.paid') return;

  const { invoice, payment } = event.data;
  console.log('Invoice paid:');
  console.log('  Invoice Number:', invoice.invoice_number);
  console.log('  Amount:', invoice.total, invoice.currency);
  console.log('  Payment Method:', payment?.method || 'N/A');
  console.log('  Reference:', payment?.reference || 'N/A');

  // Example: Update revenue reports, send receipt
}

function handleInvoiceVoided(event: TypedWebhookEvent) {
  if (event.event !== 'invoice.voided') return;

  const { invoice, reason } = event.data;
  console.log('Invoice voided:');
  console.log('  Invoice Number:', invoice.invoice_number);
  console.log('  Reason:', reason);

  // Example: Update accounting records, notify team
}

function handleCustomerCreated(event: TypedWebhookEvent) {
  if (event.event !== 'customer.created') return;

  const { customer } = event.data;
  console.log('New customer created:');
  console.log('  Name:', customer.name);
  console.log('  Type:', customer.type);
  console.log('  ICE:', customer.ice || 'N/A');

  // Example: Sync to CRM, send welcome email
}

function handleCustomerDeleted(event: TypedWebhookEvent) {
  if (event.event !== 'customer.deleted') return;

  const { customer } = event.data;
  console.log('Customer archived:');
  console.log('  ID:', customer.id);
  console.log('  Name:', customer.name);

  // Example: Update CRM, archive related records
}

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Webhook server running on http://localhost:${PORT}`);
  console.log('Webhook endpoint: POST /webhooks/hisab');
});
