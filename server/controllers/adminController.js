const User = require('../models/User');
const Palette = require('../models/Palette');

// @GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalPalettes, freeUsers, proUsers, enterpriseUsers, newThisMonth] =
      await Promise.all([
        User.countDocuments(),
        Palette.countDocuments(),
        User.countDocuments({ 'subscription.plan': 'free' }),
        User.countDocuments({ 'subscription.plan': 'pro' }),
        User.countDocuments({ 'subscription.plan': 'enterprise' }),
        User.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(1)) },
        }),
      ]);

    res.json({
      totalUsers,
      totalPalettes,
      subscriptions: { free: freeUsers, pro: proUsers, enterprise: enterpriseUsers },
      newThisMonth,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role;
    const plan = req.query.plan;

    const query = {};
    if (search) query.$or = [{ name: /search/i }, { email: new RegExp(search, 'i') }];
    if (role) query.role = role;
    if (plan) query['subscription.plan'] = plan;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    res.json({ users, total, pages: Math.ceil(total / limit), page });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'user'].includes(role))
      return res.status(400).json({ message: 'دور غير صالح' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    res.json({ message: 'تم تحديث الدور', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/plan
const updateUserPlan = async (req, res) => {
  try {
    const { plan } = req.body;
    if (!['free', 'pro', 'enterprise'].includes(plan))
      return res.status(400).json({ message: 'خطة غير صالحة' });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { 'subscription.plan': plan, 'subscription.status': 'active' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    res.json({ message: 'تم تحديث الاشتراك', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @PUT /api/admin/users/:id/toggle-active
const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `تم ${user.isActive ? 'تفعيل' : 'إيقاف'} الحساب`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    await Palette.deleteMany({ user: req.params.id });
    res.json({ message: 'تم حذف المستخدم' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/admin/marketing
const getMarketingStats = async (req, res) => {
  try {
    const topReferrers = await User.find({ referralCount: { $gt: 0 } })
      .select('name email referralCode referralCount referralReward')
      .sort({ referralCount: -1 })
      .limit(10);

    const totalReferrals = await User.countDocuments({ referredBy: { $ne: null } });
    const conversionRate = await User.countDocuments({
      referredBy: { $ne: null },
      'subscription.plan': { $ne: 'free' },
    });

    res.json({ topReferrers, totalReferrals, paidConversions: conversionRate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  updateUserPlan,
  toggleUserActive,
  deleteUser,
  getMarketingStats,
};
