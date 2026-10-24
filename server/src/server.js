import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import productRoutes from './routes/products.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:4200')
  .split(',')
  .map((origin) => origin.trim());

app.disable('x-powered-by');
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ssm-sarees-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.path });
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Unexpected server error' });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
      if (process.env.NODE_ENV === 'production') process.exit(1);
    }
  } else {
    console.warn('MONGODB_URI is not configured; API starts without database connection.');
  }

  app.listen(port, () => console.log(`SSM Sarees API listening on port ${port}`));
}

start();