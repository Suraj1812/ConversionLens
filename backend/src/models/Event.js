import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      trim: true
    },
    eventType: {
      type: String,
      enum: ['view', 'add_to_cart', 'purchase'],
      required: true
    },
    productId: {
      type: String,
      required: true,
      trim: true
    },
    productTitle: {
      type: String,
      trim: true
    },
    sessionId: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    pageUrl: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      enum: ['shopify_theme', 'shopify_pixel', 'dashboard', 'api'],
      default: 'shopify_theme'
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true
    },
    value: {
      type: Number,
      min: 0
    },
    quantity: {
      type: Number,
      min: 1
    },
    orderId: {
      type: String,
      trim: true
    },
    meta: {
      type: Map,
      of: mongoose.Schema.Types.Mixed
    }
  },
  {
    versionKey: false,
    timestamps: {
      createdAt: 'ingestedAt',
      updatedAt: false
    }
  }
);

eventSchema.index({ eventId: 1 }, { unique: true, sparse: true });
eventSchema.index({ eventType: 1, timestamp: -1 });
eventSchema.index({ productId: 1, eventType: 1, timestamp: -1 });
eventSchema.index({ sessionId: 1, timestamp: 1 });

export default mongoose.model('Event', eventSchema);
