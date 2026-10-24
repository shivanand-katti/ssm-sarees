import { Router } from 'express';
import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

router.post('/create-payment', async (req, res, next) => {
  try {
    const razorpay = getRazorpay();
    if (!razorpay) return res.status(503).json({ error: 'Online payment is not configured yet' });
    const customer = req.body?.customer || {};
    const required = ['name', 'email', 'phone', 'address', 'city', 'state', 'postalCode'];
    for (const key of required) {
      if (typeof customer[key] !== 'string' || !customer[key].trim()) {
        return res.status(400).json({ error: 'Customer field is required: ' + key });
      }
      if (customer[key].length > (key === 'address' ? 500 : 254)) {
        return res.status(400).json({ error: 'Customer field is too long: ' + key });
      }
    }
    if (!emailPattern.test(customer.email) || !/^[0-9+()\-\s]{7,20}$/.test(customer.phone)) {
      return res.status(400).json({ error: 'Enter a valid email address and phone number' });
    }
    if (!Array.isArray(req.body?.items) || req.body.items.length < 1 || req.body.items.length > 30) {
      return res.status(400).json({ error: 'Cart must contain between 1 and 30 line items' });
    }

    const quantities = new Map();
    for (const line of req.body.items) {
      const id = String(line?.productId || '');
      const quantity = Number(line?.quantity);
      if (!/^[a-f\d]{24}$/i.test(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
        return res.status(400).json({ error: 'Each cart line needs a valid productId and quantity from 1 to 20' });
      }
      quantities.set(id, (quantities.get(id) || 0) + quantity);
    }
    const products = await Product.find({ _id: { $in: [...quantities.keys()] }, active: true }).lean();
    if (products.length !== quantities.size) return res.status(400).json({ error: 'One or more products are unavailable' });
    const orderItems = products.map((product) => {
      const quantity = quantities.get(String(product._id));
      if (product.inventory < quantity) throw Object.assign(new Error('Insufficient stock for ' + product.name), { statusCode: 409 });
      return { productId: product._id, name: product.name, slug: product.slug, imageUrl: product.imageUrl, quantity, unitPrice: product.price };
    });
    const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    if (!Number.isSafeInteger(subtotal) || subtotal <= 0 || subtotal > 50000000) {
      return res.status(400).json({ error: 'Order total is outside the allowed range' });
    }

    const orderNumber = 'SSM-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const order = await Order.create({
      orderNumber,
      customer: Object.fromEntries(required.map((key) => [key, customer[key].trim()])),
      items: orderItems,
      subtotal,
      currency: 'INR',
      status: 'pending'
    });
    try {
      const paymentOrder = await razorpay.orders.create({
        amount: subtotal * 100,
        currency: 'INR',
        receipt: orderNumber,
        notes: { orderNumber }
      });
      order.paymentProviderOrderId = paymentOrder.id;
      await order.save();
      return res.status(201).json({
        orderNumber,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        razorpayOrderId: paymentOrder.id,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (error) {
      await Order.findByIdAndUpdate(order._id, { status: 'payment_failed' });
      throw error;
    }
  } catch (error) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.message });
    return next(error);
  }
});

router.post('/verify-payment', async (req, res, next) => {
  try {
    const { razorpay_order_id: providerOrderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (![providerOrderId, paymentId, signature].every((value) => typeof value === 'string' && value.length > 0)) {
      return res.status(400).json({ error: 'Payment verification fields are required' });
    }
    if (!process.env.RAZORPAY_KEY_SECRET) return res.status(503).json({ error: 'Payment verification is not configured' });
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(providerOrderId + '|' + paymentId).digest('hex');
    const supplied = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (supplied.length !== expectedBuffer.length || !crypto.timingSafeEqual(supplied, expectedBuffer)) {
      return res.status(400).json({ error: 'Payment signature could not be verified' });
    }
    const order = await Order.findOne({ paymentProviderOrderId: providerOrderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'paid') return res.json({ success: true, orderNumber: order.orderNumber, status: order.status });
    order.status = 'paid';
    order.paymentId = paymentId;
    order.paidAt = new Date();
    await order.save();

    for (const item of order.items) {
      const updated = await Product.updateOne(
        { _id: item.productId, active: true, inventory: { $gte: item.quantity } },
        { $inc: { inventory: -item.quantity } }
      );
      if (updated.modifiedCount !== 1) {
        console.error('Paid order stock reconciliation required:', order.orderNumber, String(item.productId));
      }
    }
    return res.json({ success: true, orderNumber: order.orderNumber, status: order.status });
  } catch (error) { return next(error); }
});

export default router;
