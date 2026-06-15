const router = require('express').Router();
const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createCheckout, handleWebhook, createPortal, cancelSubscription,
  reactivateSubscription, getPlans, getMyReferrals,
} = require('../controllers/subscriptionController');

// Stripe webhook needs raw body — must be before any json middleware
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

router.get('/plans', getPlans);
router.post('/checkout', protect, createCheckout);
router.post('/portal', protect, createPortal);
router.post('/cancel', protect, cancelSubscription);
router.post('/reactivate', protect, reactivateSubscription);
router.get('/referrals', protect, getMyReferrals);

module.exports = router;
