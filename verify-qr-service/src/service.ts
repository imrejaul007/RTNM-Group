/**
 * REZ Verify QR Service - Product Authentication + Warranty Activation
 * Scan product QR → Verify authenticity → Activate warranty → Link to customer
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// ============================================
// DATABASE SCHEMAS
// ============================================

// Product Schema
const productSchema = new mongoose.Schema({
  serial_number: { type: String, required: true, unique: true },
  brand: String,
  model: String,
  category: String,
  manufactured_date: Date,
  warranty_months: Number,
  created_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Warranty Schema - THIS IS KEY
const warrantySchema = new mongoose.Schema({
  serial_number: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

  // Customer info
  customer_name: String,
  customer_phone: String,
  customer_email: String,
  customer_id: String,

  // Purchase info
  purchase_date: Date,
  invoice_url: String,
  retailer: String,
  price_paid: Number,

  // Warranty tracking
  warranty_start_date: Date,
  warranty_expiry_date: Date,
  warranty_status: { type: String, enum: ['pending', 'active', 'expired', 'claimed'],

  // Claims
  claims: [{
    claim_date: Date,
    issue: String,
    status: String,
    resolution: String
  }],

  activated_at: { type: Date, default: Date.now },
  activated_by: String,
  ip_address: String
});

const Warranty = mongoose.model('Warranty', warrantySchema);

// ============================================
// QR VERIFICATION API
// ============================================

// Scan and verify product
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { serial_number } = req.body;

    const product = await Product.findOne({ serial_number });

    if (!product) {
      return res.json({
        status: 'INVALID',
        message: 'Product not found in our system'
      });
    }

    const warranty = await Warranty.findOne({ serial_number });

    if (warranty?.warranty_status === 'active') {
      return res.json({
        status: 'AUTHENTIC_CLAIMED',
        product,
        warranty: {
          status: warranty.warranty_status,
          expiry: warranty.warranty_expiry_date,
          owner: warranty.customer_name
        }
      });
    }

    return res.json({
      status: 'AUTHENTIC_UNCLAIMED',
      product: {
        brand: product.brand,
        model: product.model,
        category: product.category,
        manufactured: product.manufactured_date
      },
      action: 'ACTIVATE_WARRANTY'
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ============================================
// WARRANTY ACTIVATION API (KEY FEATURE)
// ============================================

app.post('/api/activate-warranty', async (req: Request, res: Response) => {
  try {
    const { serial_number, customer_name, customer_phone, customer_email, purchase_date, invoice_url, retailer, price_paid } = req.body;

    // Verify product exists
    const product = await Product.findOne({ serial_number });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Calculate warranty expiry
    const warrantyMonths = product.warranty_months || 12;
    const startDate = new Date(purchase_date || Date.now());
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);

    // Create warranty record
    const warranty = new Warranty({
      serial_number,
      product_id: product._id,
      customer_name,
      customer_phone,
      customer_email,
      purchase_date: new Date(purchase_date),
      invoice_url,
      retailer,
      price_paid,
      warranty_start_date: startDate,
      warranty_expiry_date: expiryDate,
      warranty_status: 'active',
      activated_at: new Date(),
      activated_by: customer_email,
      ip_address: req.ip
    });

    await warranty.save();

    // Generate customer QR code for future reference
    const customerQrCode = `WARRANTY:${serial_number}:${warranty._id}`;

    res.json({
      success: true,
      warranty_id: warranty._id,
      warranty_card: {
        customer_name,
        product: `${product.brand} ${product.model}`,
        activated: startDate,
        expires: expiryDate,
        status: 'ACTIVE'
      },
      customer_qr_code: customerQrCode
    });

  } catch (error) {
    res.status(500).json({ error: 'Activation failed' });
  }
});

// Check warranty status
app.get('/api/warranty/:serialNumber', async (req, res) => {
  const warranty = await Warranty.findOne({ serial_number: req.params.serialNumber });

  if (!warranty) {
    return res.json({ status: 'NOT_ACTIVATED' });
  }

  const now = new Date();
  const isExpired = warranty.warranty_expiry_date < now;
  const status = isExpired ? 'EXPIRED' : warranty.warranty_status.toUpperCase();

  res.json({
    status,
    activated: warranty.activated_at,
    expires: warranty.warranty_expiry_date,
    owner: warranty.customer_name,
    claims: warranty.claims
  });
});

// File warranty claim
app.post('/api/claim', async (req, res) => {
  const { warranty_id, issue, description } = req.body;

  const warranty = await Warranty.findById(warranty_id);
  if (!warranty) {
    return res.status(404).json({ error: 'Warranty not found' });
  }

  warranty.claims.push({
    claim_date: new Date(),
    issue,
    description,
    status: 'PENDING_REVIEW'
  });

  await warranty.save();
  res.json({ success: true });
});

export default app;
