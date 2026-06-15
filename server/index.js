require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const compression = require('compression');
const connectDB = require('./config/db');

const app = express();
connectDB();

// Trust Render proxy
app.set('trust proxy', 1);

// CORS — يقبل Vercel domains + أي port على localhost
const allowedOrigins = [
  /^http:\/\/localhost(:\d+)?$/,   // any localhost port in dev
  /\.vercel\.app$/,
  /\.check-colors/,
];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Postman / server-to-server
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    callback(allowed ? null : new Error('CORS blocked'), allowed);
  },
  credentials: true,
}));

// Security headers
app.use(helmet());

// Compression
app.use(compression());

// Rate limiting
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: 'طلبات كثيرة، انتظر 15 دقيقة' }, validate: { xForwardedForHeader: false } });
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 300, validate: { xForwardedForHeader: false } });

app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Body parser
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Security middleware
app.use(hpp());            // prevent HTTP param pollution
// Manual NoSQL injection prevention (express-mongo-sanitize incompatible with Express 5)
app.use((req, _res, next) => {
  const strip = (obj) => {
    if (obj && typeof obj === 'object') {
      for (const k of Object.keys(obj)) {
        if (k.startsWith('$')) delete obj[k];
        else strip(obj[k]);
      }
    }
  };
  if (req.body) strip(req.body);
  next();
});

app.use(morgan('dev'));

// Routes
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/palettes',      require('./routes/palettes'));
app.use('/api/colors',        require('./routes/colors'));
app.use('/api/ai',            require('./routes/ai'));
app.use('/api/subscriptions', require('./routes/subscriptions'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 404
app.use((req, res) => res.status(404).json({ message: 'المسار غير موجود' }));

// Global error handler
app.use((err, req, res, next) => {
  if (err.message === 'CORS blocked') return res.status(403).json({ message: 'غير مسموح' });
  console.error(err.stack);
  res.status(500).json({ message: 'خطأ في الخادم' });
});

// Local dev: listen on port. Vercel: export the app as handler
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
