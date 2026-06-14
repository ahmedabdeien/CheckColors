require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Trust Render/Vercel proxy
app.set('trust proxy', 1);

// Security
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: 'طلبات كثيرة، انتظر قليلاً' }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

// Body parser (webhook route needs raw body, so it's handled in routes/subscriptions.js)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/palettes', require('./routes/palettes'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'المسار غير موجود' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'خطأ في الخادم' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
