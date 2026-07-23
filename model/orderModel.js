const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── OrderItem (Embedded) ───────────────────────────
const orderItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Food', 'Tea', 'Coffee', 'Milk', 'Other'],
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// ─── Order ──────────────────────────────────────────
const orderSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['Placed', 'Voided', 'Returned'],
      default: 'Placed',
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (arr) => arr.length > 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'MobileBanking', 'Telebirr'],
      required: true,
    },
  },
  { timestamps: true }
);

// Composite index: orderNumber is unique per restaurant
orderSchema.index({ restaurantId: 1, orderNumber: 1 }, { unique: true });

module.exports = mongoose.model('Order', orderSchema);