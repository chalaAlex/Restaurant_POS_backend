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
      required: [true, 'Food item name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },
    imageUrl: {
      type: String,
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
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0.01, 'Price must be greater than zero'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Composite index: name is unique per restaurant (case-insensitive)
foodItemSchema.index(
  { restaurantId: 1, name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
  }
);

module.exports = mongoose.model('FoodItem', foodItemSchema);
