const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, enum: ['free', 'pro', 'enterprise'], unique: true },
  displayName: String,
  price: { monthly: Number, yearly: Number },
  stripePriceIdMonthly: String,
  stripePriceIdYearly: String,
  features: [String],
  limits: {
    savedPalettes: Number,   // -1 = unlimited
    aiGenerations: Number,   // per month, -1 = unlimited
    teamMembers: Number,
    apiAccess: Boolean,
    prioritySupport: Boolean,
  },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);
