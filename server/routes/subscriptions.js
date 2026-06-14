const router = require('express').Router();
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createCheckout, handleWebhook, cancelSubscription, getPlans, getMyReferrals,
} = require('../controllers/subscriptionController');

// Stripe webhook needs raw body
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/plans', getPlans);
router.post('/checkout', protect, createCheckout);
router.post('/cancel', protect, cancelSubscription);
router.get('/referrals', protect, getMyReferrals);

module.exports = router;
