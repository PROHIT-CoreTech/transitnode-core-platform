const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema(
  {
    planKey: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    title: {
      type: String,
      required: true
    },
    badgeText: {
      type: String,
      default: 'TRANCEZARDS'
    },
    tagline: {
      type: String,
      default: ''
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    originalPrice: {
      type: Number,
      default: null
    },
    currency: {
      type: String,
      default: 'INR'
    },
    priceDisplay: {
      type: String,
      default: '₹0'
    },
    durationDays: {
      type: Number,
      default: 365
    },
    durationLabel: {
      type: String,
      default: '1 Year'
    },
    features: [
      {
        type: String
      }
    ],
    buttonText: {
      type: String,
      default: 'Upgrade to 1 Year'
    },
    accentColor: {
      type: String,
      default: 'blue' // blue, emerald, amber, purple
    },
    isPopular: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
