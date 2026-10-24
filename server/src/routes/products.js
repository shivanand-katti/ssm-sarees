import { Router } from 'express';
import Product from '../models/Product.js';

const router = Router();

// GET /api/products?category=Silk&search=rose&page=1&limit=12
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 12));
    const filter = { active: true };

    if (typeof req.query.category === 'string' && req.query.category !== 'All sarees') {
      filter.category = req.query.category;
    }
    if (typeof req.query.search === 'string' && req.query.search.trim()) {
      filter.$text = { $search: req.query.search.trim().slice(0, 100) };
    }

    const [items, total] = await Promise.all([
      Product.find(filter).sort({ featured: -1, createdAt: -1 })
        .skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter)
    ]);

    res.json({ items, page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, active: true }).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json(product);
  } catch (error) {
    return next(error);
  }
});

export default router;