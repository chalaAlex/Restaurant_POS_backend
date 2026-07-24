const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── OrderItem (Embedded) ───────────────────────────
const orderItemSchema = new Schema(
  {
    foodItemId: {
      type: Schema.Types.ObjectId,
      ref: 'FoodItem',
      required: [true, 'Food item ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Food item name is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: ['Food', 'Tea', 'Coffee', 'Milk', 'Other'],
        message: 'Category must be one of: Food, Tea, Coffee, Milk, Other',
      },
      required: [true, 'Category is required'],
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
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
      required: [true, 'Restaurant ID is required'],
      index: true,
    },
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
    },
    cashierId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier ID is required'],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Placed', 'Voided', 'Returned'],
        message: 'Status must be one of: Placed, Voided, Returned',
      },
      default: 'Placed',
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: [true, 'Order must contain at least one item'],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ['Cash', 'MobileBanking', 'Telebirr'],
        message: 'Payment method must be one of: Cash, MobileBanking, Telebirr',
      },
      required: [true, 'Payment method is required'],
    },
  },
  { timestamps: true }
);

// Composite index: orderNumber is unique per restaurant
orderSchema.index({ restaurantId: 1, orderNumber: 1 }, { unique: true });

// Index for efficient queries
orderSchema.index({ restaurantId: 1, cashierId: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);