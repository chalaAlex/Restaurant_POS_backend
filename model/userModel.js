
const mongoose = require('mongoose');
const { Schema } = mongoose;
const validator = require('validator');

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
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (value) {
          // Ethiopian phone number validation (09XX XXX XXX or 251XXX XXX XXX)
          return /^(09\d{8}|251\d{9})$/.test(value.replace(/\s/g, ''));
        },
        message: 'Please provide a valid Ethiopian phone number',
      },
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