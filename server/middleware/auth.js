const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'غير مصرح - يرجى تسجيل الدخول' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'المستخدم غير موجود' });
    if (!req.user.isActive) return res.status(403).json({ message: 'الحساب موقوف' });
    next();
  } catch {
    return res.status(401).json({ message: 'توكن غير صالح' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'غير مصرح - للمدير فقط' });
  }
  next();
};

const proOnly = (req, res, next) => {
  const plan = req.user?.subscription?.plan;
  if (plan === 'free') {
    return res.status(403).json({ message: 'هذه الميزة للمشتركين فقط', upgrade: true });
  }
  next();
};

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const generateRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });

module.exports = { protect, adminOnly, proOnly, generateToken, generateRefreshToken };
