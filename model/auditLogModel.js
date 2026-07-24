const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── AuditLog ───────────────────────────────────────
const auditLogSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: [true, 'Restaurant ID is required'],
      index: true,
      immutable: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
      immutable: true,
    },
    action: {
      type: String,
      enum: {
        values: ['Void', 'Return'],
        message: 'Action must be either Void or Return',
      },
      required: [true, 'Action is required'],
      immutable: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Entity ID is required'],
      index: true,
      immutable: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      required: [true, 'Old value is required'],
      immutable: true,
    },
    newValue: {
      type: Schema.Types.Mixed,
      required: [true, 'New value is required'],
      immutable: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      immutable: true,
    },
  },
  {
    timestamps: false,
  }
);

// Composite indexes for efficient queries
auditLogSchema.index({ restaurantId: 1, timestamp: -1 });
auditLogSchema.index({ restaurantId: 1, action: 1 });
auditLogSchema.index({ restaurantId: 1, userId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);