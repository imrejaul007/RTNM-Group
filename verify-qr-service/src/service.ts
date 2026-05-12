/**
 * REZ Verify QR Service - Product Authentication + Warranty Activation
 * Connected to REZ-Merchant for ownership tracking
 */

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';

const app = express();
app.use(express.json());

// ============================================
// REZ-MERCHANT CONNECTION
// ============================================

const MERCHANT_API = process.env.MERCHANT_API_URL || 'https://rez-merchant.onrender.com';
const AUTH_SERVICE = process.env.AUTH_API || 'https://rez-auth.onrender.com';

// ============================================
// DATABASE SCHEMAS
// ============================================

// Product Schema - connected to Merchant's product catalog
const productSchema = new mongoose.Schema({
  serial_number: { type: String, required: true, unique: true },

  // Merchant connection
  merchant_id: { type: String, required: true },
  merchant_name: String,

  // Product info from Merchant
  product_id: String,           // REZ-Merchant product ID
  sku: String,

  // Product details
  brand: String,
  model: String,
  category: String,
  subcategory: String,
  warranty_months: { type: Number, default: 12 },
  manufactured_date: Date,

  created_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Warranty Schema - linked to Merchant + Consumer
const warrantySchema = new mongoose.Schema({
  serial_number: { type: String, required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },

  // REZ-Merchant connection
  merchant_id: String,
  merchant_name: String,
  order_id: String,              // Purchase order from Merchant
  purchase_transaction_id: String,

  // Customer info (REZ-Consumer user)
  user_id: String,              // REZ-Consumer user ID
  customer_name: String,
  customer_phone: String,
  customer_email: String,

  // Purchase details
  purchase_date: Date,
  invoice_url: String,
  retailer_id: String,
  retailer_name: String,
  price_paid: Number,
  currency: { type: String, default: 'INR' },

  // Warranty tracking
  warranty_months: Number,
  warranty_start_date: Date,
  warranty_expiry_date: Date,
  warranty_status: { type: String, enum: ['pending', 'active', 'expired', 'claimed'] },

  // Claims
  claims: [{
    claim_id: String,
    claim_date: Date,
    issue_type: String,
    description: String,
    status: String,
    resolution: String,
    resolved_by: String,
    resolved_at: Date
  }],

  activated_at: Date,
  activated_by: String,
  ip_address: String,
  device_info: String
});

const Warranty = mongoose.model('Warranty', warrantySchema);

// ============================================
// MERCHANT API CALLS
// ============================================

// Get product from Merchant catalog
async function getProductFromMerchant(serial: string) {
  try {
    const response = await axios.get(`${MERCHANT_API}/api/products/serial/${serial}`, {
      headers: { 'x-api-key': process.env.INTERNAL_API_KEY }
    });
    return response.data;
  } catch (error) {
    return null;
  }
}

// Create customer in Merchant if not exists
async function linkCustomerToMerchant(warranty: any) {
  try {
    await axios.post(`${MERCHANT_API}/api/customers/link-warranty`, {
      user_id: warranty.user_id,
      warranty_id: warranty._id,
      serial_number: warranty.serial_number,
      activated_at: warranty.activated_at
    }, {
      headers: { 'x-api-key': process.env.INTERNAL_API_KEY }
    });
    return true;
  } catch (error) {
    console.error('Failed to link to Merchant:', error);
    return false;
  }
}

// Notify Merchant about warranty activation
async function notifyMerchantWarrantyActivated(warranty: any) {
  try {
    await axios.post(`${MERCHANT_API}/api/warranty/activated`, {
      serial_number: warranty.serial_number,
      merchant_id: warranty.merchant_id,
      user_id: warranty.user_id,
      activated_at: warranty.activated_at,
      warranty_expiry: warranty.warranty_expiry_date
    }, {
      headers: { 'x-api-key': process.env.INTERNAL_API_KEY }
    });
  } catch (error) {
    console.error('Failed to notify Merchant:', error);
  }
}

// ============================================
// VERIFY QR API
// ============================================

// Scan and verify product + get Merchant info
app.post('/api/verify', async (req: Request, res: Response) => {
  try {
    const { serial_number } = req.body;

    // 1. Check local warranty records
    let warranty = await Warranty.findOne({ serial_number });

    if (warranty) {
      // Already activated - show warranty card
      return res.json({
        status: 'ACTIVATED',
        warranty: {
          id: warranty._id,
          product: warranty.serial_number,
          merchant_id: warranty.merchant_name,
          owner: warranty.customer_name,
          phone: warranty.customer_phone,
          purchase_date: warranty.purchase_date,
          warranty_start: warranty.warranty_start_date,
          warranty_expiry: warranty.warranty_expiry_date,
          status: warranty.warranty_status,
          claims: warranty.claims?.length || 0,
          activated_at: warranty.activated_at
        }
      });
    }

    // 2. Check if product exists in Merchant catalog
    const product = await Product.findOne({ serial_number }) ||
                   await getProductFromMerchant(serial_number);

    if (!product) {
      return res.json({
        status: 'INVALID_PRODUCT',
        message: 'Product not registered in system'
      });
    }

    // 3. Return verification + activation prompt
    return res.json({
      status: 'AUTHENTIC',
      product: {
        serial_number,
        brand: product.brand,
        model: product.model,
        category: product.category,
        warranty_months: product.warranty_months,
        merchant: product.merchant_name || product.brand
      },
      action: 'ACTIVATE_WARRANTY'
    });

  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// ============================================
// ACTIVATE WARRANTY (CONNECTED TO MERCHANT + CONSUMER)
// ============================================

app.post('/api/activate-warranty', async (req: Request, res: Response) => {
  try {
    const {
      serial_number,
      user_id,                    // REZ-Consumer user ID
      customer_name,
      customer_phone,
      customer_email,
      purchase_date,
      invoice_url,
      retailer_name,
      price_paid
    } = req.body;

    // 1. Get product from Merchant catalog
    const product = await Product.findOne({ serial_number });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // 2. Calculate warranty expiry
    const startDate = new Date(purchase_date || Date.now());
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + (product.warranty_months || 12));

    // 3. Create warranty record
    const warranty = new Warranty({
      serial_number,
      product_id: product._id,
      merchant_id: product.merchant_id,
      merchant_name: product.merchant_name,
      user_id,
      customer_name,
      customer_phone,
      customer_email,
      purchase_date: startDate,
      invoice_url,
      retailer_name,
      price_paid,
      warranty_months: product.warranty_months,
      warranty_start_date: startDate,
      warranty_expiry_date: expiryDate,
      warranty_status: 'active',
      activated_at: new Date(),
      activated_by: customer_email,
      ip_address: req.ip
    });

    await warranty.save();

    // 4. Link to Merchant (adds to customer's owned products)
    await linkCustomerToMerchant(warranty);

    // 5. Notify Merchant about warranty activation
    await notifyMerchantWarrantyActivated(warranty);

    // 6. Generate customer QR for warranty card
    const warrantyCard = `REZWARRANTY:${warranty._id}:${serial_number}`;

    res.json({
      success: true,
      warranty_id: warranty._id,
      warranty_card: {
        serial_number,
        brand: product.brand,
        model: product.model,
        customer: customer_name,
        activated: startDate,
        expires: expiryDate,
        status: 'ACTIVE',
        merchant: product.merchant_name
      },
      customer_qr: warrantyCard,
      merchant_linked: product.merchant_name
    });

  } catch (error) {
    res.status(500).json({ error: 'Activation failed' });
  }
});

// ============================================
// GET WARRANTY + MERCHANT INFO
// ============================================

app.get('/api/warranty/:serial', async (req, res) => {
  const warranty = await Warranty.findOne({ serial_number: req.params.serial })
    .populate('product_id');

  if (!warranty) {
    return res.json({ status: 'NOT_FOUND' });
  }

  const isExpired = warranty.warranty_expiry_date < new Date();

  res.json({
    status: isExpired ? 'EXPIRED' : warranty.warranty_status.toUpperCase(),
    warranty: {
      id: warranty._id,
      serial_number: warranty.serial_number,
      product: warranty.product_id,
      merchant: {
        id: warranty.merchant_id,
        name: warranty.merchant_name
      },
      customer: {
        name: warranty.customer_name,
        phone: warranty.customer_phone,
        email: warranty.customer_email
      },
      purchase: {
        date: warranty.purchase_date,
        price: warranty.price_paid,
        invoice: warranty.invoice_url
      },
      warranty: {
        start: warranty.warranty_start_date,
        expiry: warranty.warranty_expiry_date,
        status: warranty.warranty_status
      },
      claims: warranty.claims
    }
  });
});

// ============================================
// CLAIM WARRANTY (NOTIFIES MERCHANT)
// ============================================

app.post('/api/claim', async (req, res) => {
  const { warranty_id, issue_type, description } = req.body;

  const warranty = await Warranty.findById(warranty_id);
  if (!warranty) {
    return res.status(404).json({ error: 'Warranty not found' });
  }

  // Add claim
  warranty.claims.push({
    claim_id: new mongoose.Types.ObjectId(),
    claim_date: new Date(),
    issue_type,
    description,
    status: 'PENDING_REVIEW'
  });

  await warranty.save();

  // Notify Merchant about claim
  try {
    await axios.post(`${MERCHANT_API}/api/warranty/claim-filed`, {
      warranty_id,
      merchant_id: warranty.merchant_id,
      serial_number: warranty.serial_number,
      claim_type: issue_type
    }, {
      headers: { 'x-api-key': process.env.INTERNAL_API_KEY }
    });
  } catch (error) {
    console.error('Failed to notify Merchant of claim');
  }

  res.json({ success: true, claim_id: warranty.claims.at(-1).claim_id });
});

export default app;
