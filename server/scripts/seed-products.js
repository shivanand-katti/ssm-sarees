import 'dotenv/config';
import mongoose from 'mongoose';
import Product from '../src/models/Product.js';

const products = [
  {
    name: 'Rani Gulab Kanjivaram Silk Saree',
    slug: 'rani-gulab-kanjivaram-silk',
    description: 'A rich rose-pink silk saree with traditional gold zari-inspired detailing, made for weddings and treasured celebrations.',
    category: 'Silk',
    price: 12990,
    compareAtPrice: 15990,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    inventory: 8,
    featured: true
  },
  {
    name: 'Ivory Garden Handloom Saree',
    slug: 'ivory-garden-handloom',
    description: 'An understated ivory drape with delicate botanical accents for intimate celebrations and elegant daywear.',
    category: 'Cotton',
    price: 4290,
    compareAtPrice: 4990,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    inventory: 12,
    featured: true
  },
  {
    name: 'Emerald Festive Silk Saree',
    slug: 'emerald-festive-silk',
    description: 'A jewel-toned festive saree with a graceful sheen, designed for family occasions and evening celebrations.',
    category: 'Festive',
    price: 8990,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
    inventory: 6,
    featured: true
  },
  {
    name: 'Midnight Blue Contemporary Saree',
    slug: 'midnight-blue-contemporary',
    description: 'A modern occasion saree with a deep blue palette for a polished, contemporary look.',
    category: 'Designer',
    price: 7490,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
    inventory: 5,
    featured: false
  },
  {
    name: 'Everyday Marigold Cotton Saree',
    slug: 'everyday-marigold-cotton',
    description: 'A comfortable cotton saree in a warm marigold tone for easy everyday elegance.',
    category: 'Everyday',
    price: 1890,
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=85',
    inventory: 18,
    featured: false
  },
  {
    name: 'Antique Gold Wedding Silk Saree',
    slug: 'antique-gold-wedding-silk',
    description: 'A timeless wedding-season silk saree inspired by heirloom colours and classic festive styling.',
    category: 'Silk',
    price: 15990,
    compareAtPrice: 18990,
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85',
    inventory: 4,
    featured: true
  }
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Set it in server/.env before seeding.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  for (const product of products) {
    await Product.findOneAndUpdate(
      { slug: product.slug },
      { $set: product },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
  console.log(`Seeded/updated ${products.length} SSM Sarees catalogue products.`);
}

seed()
  .catch((error) => {
    console.error('Product seeding failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
