import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '', maxlength: 2000 },
  category: { type: String, required: true, enum: ['Silk', 'Festive', 'Everyday', 'Cotton', 'Designer'] },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  imageUrl: { type: String, default: '' },
  inventory: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true }
}, { timestamps: true });

productSchema.index({ active: 1, category: 1, featured: -1 });
productSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Product', productSchema);