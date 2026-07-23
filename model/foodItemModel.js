const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── FoodItem ───────────────────────────────────────
const foodItemSchema = new Schema(
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
    imageUrl: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Food', 'Tea', 'Coffee', 'Milk', 'Other'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
