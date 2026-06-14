const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
  avatar: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'pro', 'enterprise'], default: 'free' },
    status: { type: String, enum: ['active', 'inactive', 'cancelled', 'past_due'], default: 'active' },
    stripeCustomerId: { type: String, default: '' },
    stripeSubscriptionId: { type: String, default: '' },
    currentPeriodEnd: { type: Date, default: null },
    cancelAtPeriodEnd: { type: Boolean, default: false },
  },

  // Marketing / Referral
  referralCode: { type: String, unique: true, default: () => uuidv4().slice(0, 8).toUpperCase() },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralCount: { type: Number, default: 0 },
  referralReward: { type: Number, default: 0 }, // days of free Pro

  // Usage limits
  savedPalettes: { type: Number, default: 0 },
  aiGenerations: { type: Number, default: 0 },
  aiGenerationsReset: { type: Date, default: Date.now },

  // Tokens
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,

}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.canUseAI = function () {
  const limits = { free: 5, pro: 100, enterprise: Infinity };
  const now = new Date();
  // Reset monthly
  if (now - this.aiGenerationsReset > 30 * 24 * 60 * 60 * 1000) {
    this.aiGenerations = 0;
    this.aiGenerationsReset = now;
  }
  return this.aiGenerations < limits[this.subscription.plan];
};

userSchema.methods.canSavePalette = function () {
  const limits = { free: 10, pro: Infinity, enterprise: Infinity };
  return this.savedPalettes < limits[this.subscription.plan];
};

module.exports = mongoose.model('User', userSchema);
