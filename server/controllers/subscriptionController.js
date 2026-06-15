const User = require('../models/User');

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return require('stripe')(process.env.STRIPE_SECRET_KEY);
};

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
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ message: 'بوابة الدفع غير متاحة حالياً' });

    const { plan, interval } = req.body;
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
      subscription_data: {
        metadata: { userId: user._id.toString(), plan },
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/subscriptions/webhook
const handleWebhook = async (req, res) => {
  const stripe = getStripe();
  if (!stripe) return res.status(503).json({ message: 'غير متاح' });

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;
        const user = await User.findById(session.metadata.userId);
        if (!user) break;

        // Retrieve subscription details for period end
        const stripeSub = await stripe.subscriptions.retrieve(session.subscription);
        user.subscription.plan = session.metadata.plan;
        user.subscription.status = 'active';
        user.subscription.stripeSubscriptionId = session.subscription;
        user.subscription.currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);
        user.subscription.cancelAtPeriodEnd = false;
        await user.save();
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const user = await User.findOne({ 'subscription.stripeSubscriptionId': sub.id });
        if (!user) break;

        // Determine plan from metadata or price
        const planFromMeta = sub.metadata?.plan;
        const status = sub.status; // active | past_due | canceled | etc.

        user.subscription.status = status === 'active' ? 'active' : status === 'past_due' ? 'past_due' : 'inactive';
        user.subscription.currentPeriodEnd = new Date(sub.current_period_end * 1000);
        user.subscription.cancelAtPeriodEnd = sub.cancel_at_period_end;

        // If plan is in metadata, use it
        if (planFromMeta && ['pro', 'enterprise'].includes(planFromMeta)) {
          user.subscription.plan = planFromMeta;
        }

        // If subscription became active again (from past_due), restore plan
        if (status === 'active' && user.subscription.plan === 'free') {
          if (planFromMeta) user.subscription.plan = planFromMeta;
        }

        await user.save();
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        await User.findOneAndUpdate(
          { 'subscription.stripeSubscriptionId': sub.id },
          {
            'subscription.plan': 'free',
            'subscription.status': 'inactive',
            'subscription.stripeSubscriptionId': '',
            'subscription.currentPeriodEnd': null,
            'subscription.cancelAtPeriodEnd': false,
          }
        );
        break;
      }

      case 'invoice.payment_succeeded': {
        // Subscription renewed — reset AI generations monthly counter
        const inv = event.data.object;
        if (inv.billing_reason === 'subscription_cycle') {
          await User.findOneAndUpdate(
            { 'subscription.stripeCustomerId': inv.customer },
            { aiGenerations: 0, aiGenerationsReset: new Date() }
          );
        }
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
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  res.json({ received: true });
};

// @POST /api/subscriptions/portal  — Stripe Billing Portal
const createPortal = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ message: 'بوابة الدفع غير متاحة حالياً' });

    const user = await User.findById(req.user._id);
    const customerId = user.subscription.stripeCustomerId;
    if (!customerId) return res.status(400).json({ message: 'لا يوجد اشتراك مرتبط بهذا الحساب' });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/dashboard?tab=settings`,
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @POST /api/subscriptions/cancel
const cancelSubscription = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ message: 'بوابة الدفع غير متاحة حالياً' });

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

// @POST /api/subscriptions/reactivate — undo cancel_at_period_end
const reactivateSubscription = async (req, res) => {
  try {
    const stripe = getStripe();
    if (!stripe) return res.status(503).json({ message: 'بوابة الدفع غير متاحة حالياً' });

    const user = await User.findById(req.user._id);
    const subId = user.subscription.stripeSubscriptionId;
    if (!subId) return res.status(400).json({ message: 'لا يوجد اشتراك' });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: false });
    user.subscription.cancelAtPeriodEnd = false;
    await user.save();

    res.json({ message: 'تم إلغاء طلب الإلغاء بنجاح' });
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
        name: 'Free',
        price: { monthly: 0, yearly: 0 },
        features: [
          'Save up to 10 palettes',
          '5 AI generations/month',
          'Contrast Checker',
          'Image to Palette',
          'Color Explorer',
        ],
        limits: { savedPalettes: 10, aiGenerations: 5 },
      },
      {
        id: 'pro',
        name: 'Pro',
        price: { monthly: 9.99, yearly: 7.99 },
        popular: true,
        features: [
          'Unlimited palettes',
          '100 AI generations/month',
          'Everything in Free',
          'Export CSS / SCSS / Tailwind',
          'Priority support',
          'Referral rewards',
        ],
        limits: { savedPalettes: -1, aiGenerations: 100 },
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: { monthly: 29.99, yearly: 24.99 },
        features: [
          'Everything in Pro',
          'Unlimited AI generations',
          'API Access',
          'Multiple team members',
          'Custom dashboard',
          '24/7 dedicated support',
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

module.exports = {
  createCheckout, handleWebhook, createPortal, cancelSubscription,
  reactivateSubscription, getPlans, getMyReferrals,
};
