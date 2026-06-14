const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, referralCode } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'البريد الإلكتروني مسجل بالفعل' });

    let referrer = null;
    if (referralCode) {
      referrer = await User.findOne({ referralCode });
      if (referrer) {
        referrer.referralCount += 1;
        referrer.referralReward += 7; // 7 days free Pro
        await referrer.save();
      }
    }

    const user = await User.create({
      name,
      email,
      password,
      referredBy: referrer?._id || null,
    });

    res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبان' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'بيانات غير صحيحة' });

    if (!user.isActive)
      return res.status(403).json({ message: 'الحساب موقوف، تواصل مع الدعم' });

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: sanitizeUser(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token مطلوب' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: 'مستخدم غير موجود' });

    res.json({ token: generateToken(user._id) });
  } catch {
    res.status(401).json({ message: 'Refresh token غير صالح' });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

// @PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ message: 'تم تحديث الملف الشخصي', user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  subscription: user.subscription,
  referralCode: user.referralCode,
  referralCount: user.referralCount,
  referralReward: user.referralReward,
  savedPalettes: user.savedPalettes,
  aiGenerations: user.aiGenerations,
  createdAt: user.createdAt,
});

module.exports = { register, login, refresh, getMe, updateProfile, changePassword };
