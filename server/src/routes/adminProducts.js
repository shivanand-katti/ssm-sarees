import { Router } from 'express';
import Product from '../models/Product.js';
import { requireAuth, requireAdmin } from '../middleware/requireAuth.js';

const router = Router();
const categories = ['Silk', 'Festive', 'Everyday', 'Cotton', 'Designer'];
router.use(requireAuth, requireAdmin);

function validateProduct(body) {
  const name = String(body?.name || '').trim();
  const slug = String(body?.slug || '').trim().toLowerCase();
  const category = String(body?.category || '');
  const price = Number(body?.price);
  if (!name || name.length > 140) return 'Name is required (maximum 140 characters)';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 160) return 'Slug must use lowercase letters, numbers and hyphens';
  if (!categories.includes(category)) return 'Choose a valid category';
  if (!Number.isFinite(price) || price < 0) return 'Price must be zero or greater';
  if (body.imageUrl && (typeof body.imageUrl !== 'string' || body.imageUrl.length > 2000)) return 'Image URL is too long';
  return null;
}

router.get('/', async (_req, res, next) => {
  try {
    const items = await Product.find({}).sort({ createdAt: -1 }).lean();
    return res.json({ items });
  } catch (error) { return next(error); }
});

router.post('/', async (req, res, next) => {
  try {
    const issue = validateProduct(req.body);
    if (issue) return res.status(400).json({ error: issue });
    const product = await Product.create({
      name: req.body.name.trim(),
      slug: req.body.slug.trim().toLowerCase(),
      description: String(req.body.description || '').slice(0, 2000),
      category: req.body.category,
      price: Number(req.body.price),
      compareAtPrice: req.body.compareAtPrice === '' || req.body.compareAtPrice == null ? undefined : Number(req.body.compareAtPrice),
      imageUrl: req.body.imageUrl || '',
      inventory: Math.max(0, Number.parseInt(req.body.inventory, 10) || 0),
      featured: Boolean(req.body.featured),
      active: req.body.active !== false
    });
    return res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'A product with that slug already exists' });
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const issue = validateProduct(req.body);
    if (issue) return res.status(400).json({ error: issue });
    const product = await Product.findByIdAndUpdate(req.params.id, {
      $set: {
        name: req.body.name.trim(),
        slug: req.body.slug.trim().toLowerCase(),
        description: String(req.body.description || '').slice(0, 2000),
        category: req.body.category,
        price: Number(req.body.price),
        compareAtPrice: req.body.compareAtPrice === '' || req.body.compareAtPrice == null ? undefined : Number(req.body.compareAtPrice),
        imageUrl: req.body.imageUrl || '',
        inventory: Math.max(0, Number.parseInt(req.body.inventory, 10) || 0),
        featured: Boolean(req.body.featured),
        active: req.body.active !== false
      }
    }, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'A product with that slug already exists' });
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ success: true, message: 'Product archived' });
  } catch (error) { return next(error); }
});

router.get('/orders', async (req, res, next) => {
  try {
    const Order = (await import('../models/Order.js')).default;
    const status = typeof req.query.status === 'string' ? req.query.status : '';
    const allowed = ['pending', 'paid', 'payment_failed', 'cancelled'];
    const filter = status && allowed.includes(status) ? { status } : {};
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 25));
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Order.countDocuments(filter)
    ]);
    return res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { return next(error); }
});

router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const allowed = ['cancelled'];
    if (!allowed.includes(req.body?.status)) return res.status(400).json({ error: 'Only cancellation is supported from the admin panel for now' });
    const Order = (await import('../models/Order.js')).default;
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: 'pending' },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Pending order not found' });
    return res.json({ success: true, orderNumber: order.orderNumber, status: order.status });
  } catch (error) { return next(error); }
});

export default router;
