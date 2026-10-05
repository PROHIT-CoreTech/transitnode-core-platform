const mongoose = require('mongoose');

const subscriptionTransactionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    planType: {
      type: String,
      required: true,
    },
    planNameAtPurchase: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentMethod: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure immutable snapshot defaults before saving
subscriptionTransactionSchema.pre('save', function (next) {
  if (this.amountPaid === undefined || this.amountPaid === null) {
    this.amountPaid = this.amount;
  }
  if (!this.planNameAtPurchase) {
    this.planNameAtPurchase = `${this.planType} Plan`;
  }
  next();
});

module.exports = mongoose.model('SubscriptionTransaction', subscriptionTransactionSchema);
