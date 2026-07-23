const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── AuditLog ───────────────────────────────────────
const auditLogSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ['Void', 'Return'],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    newValue: {
      type: Schema.Types.Mixed,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);