const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');

const PLANS = {
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY,
    yearly: process.env.STRIPE_PRO_YEARLY,
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY,
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY,
  },
};

// @POST /api/subscriptions/checkout
const createCheckout = async (req, res) => {
  try {
    const { plan, interval } = req.body; // plan: pro|enterprise, interval: monthly|yearly
    if (!PLANS[plan]) return res.status(400).json({ message: 'خطة غير صالحة' });

    const priceId = PLANS[plan][interval];
    if (!priceId) return res.status(400).json({ message: 'الفترة غير صالحة' });

    const user = await User.findById(req.user._id);
    let customerId = user.subscription.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name });
      customerId = customer.id;
      user.subscription.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/dashboard?subscription=success`,
      cancel_url: `${process.env.CLIENT_URL}/pricing?subscription=cancelled`,
      metadata: { userId: user._id.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/subscriptions/webhook  (Stripe webhook)
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).json({ message: 'Webhook signature invalid' });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const user = await User.findById(session.metadata.userId);
      if (user) {
        user.subscription.plan = session.metadata.plan;
        user.subscription.status = 'active';
        user.subscription.stripeSubscriptionId = session.subscription;
        await user.save();
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await User.findOneAndUpdate(
        { 'subscription.stripeSubscriptionId': sub.id },
        { 'subscription.plan': 'free', 'subscription.status': 'inactive' }
      );
      break;
    }
    case 'invoice.payment_failed': {
      const inv = event.data.object;
      await User.findOneAndUpdate(
        { 'subscription.stripeCustomerId': inv.customer },
        { 'subscription.status': 'past_due' }
      );
      break;
    }
  }

  res.json({ received: true });
};

// @POST /api/subscriptions/cancel
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const subId = user.subscription.stripeSubscriptionId;
    if (!subId) return res.status(400).json({ message: 'لا يوجد اشتراك نشط' });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    user.subscription.cancelAtPeriodEnd = true;
    await user.save();

    res.json({ message: 'سيتم إلغاء اشتراكك في نهاية الفترة الحالية' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @GET /api/subscriptions/plans
const getPlans = async (req, res) => {
  res.json({
    plans: [
      {
        id: 'free',
        name: 'مجاني',
        price: { monthly: 0, yearly: 0 },
        features: [
          'حفظ حتى 10 باليتات',
          '5 توليدات AI شهرياً',
          'فحص التباين',
          'استخراج ألوان من الصور',
          'مستكشف الألوان',
        ],
        limits: { savedPalettes: 10, aiGenerations: 5 },
      },
      {
        id: 'pro',
        name: 'احترافي',
        price: { monthly: 9.99, yearly: 7.99 },
        popular: true,
        features: [
          'باليتات غير محدودة',
          '100 توليد AI شهرياً',
          'جميع ميزات المجاني',
          'تصدير بصيغ متعددة',
          'دعم أولوية',
          'كود إحالة خاص',
        ],
        limits: { savedPalettes: -1, aiGenerations: 100 },
      },
      {
        id: 'enterprise',
        name: 'مؤسسي',
        price: { monthly: 29.99, yearly: 24.99 },
        features: [
          'كل ميزات Pro',
          'AI غير محدود',
          'وصول API',
          'أعضاء فريق متعددون',
          'لوحة تحكم مخصصة',
          'دعم مخصص 24/7',
        ],
        limits: { savedPalettes: -1, aiGenerations: -1 },
      },
    ],
  });
};

// @GET /api/subscriptions/my-referrals
const getMyReferrals = async (req, res) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('name email subscription.plan createdAt')
      .sort({ createdAt: -1 });

    res.json({
      referralCode: req.user.referralCode,
      referralCount: req.user.referralCount,
      referralReward: req.user.referralReward,
      referrals,
      referralLink: `${process.env.CLIENT_URL}/register?ref=${req.user.referralCode}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createCheckout, handleWebhook, cancelSubscription, getPlans, getMyReferrals };
