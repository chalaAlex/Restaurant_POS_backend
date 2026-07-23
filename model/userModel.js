
const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── User ───────────────────────────────────────────
const userSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Owner', 'Cashier'],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Composite index: phone is unique per restaurant, not globally
userSchema.index({ restaurantId: 1, phone: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);