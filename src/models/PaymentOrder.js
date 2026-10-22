import mongoose from 'mongoose';

const paymentOrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  receipt: { type: String, required: true },
  status: { type: String, enum: ['created', 'authorized', 'paid', 'failed', 'refunded'], default: 'created' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' }, // associated subscription (optional)
  planId: { type: String }, // for subscription orders
  // Coupon applied at checkout (amount above is already the discounted price)
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
  couponCode: { type: String },
  originalAmount: { type: Number },
  discountAmount: { type: Number },
  paymentMethod: { type: String, enum: ['payu'], default: 'payu' },
  // PayU fields
  payuTransactionId: { type: String },
  payuPaymentId: { type: String },
  payuHash: { type: String },
  payuStatus: { type: String },
  payuResponse: { type: mongoose.Schema.Types.Mixed },
  metadata: { type: mongoose.Schema.Types.Mixed },
  notes: { type: String },
  refundId: { type: String },
  refundAmount: { type: Number },
  refundReason: { type: String }
}, { timestamps: true });

paymentOrderSchema.index({ user: 1, createdAt: -1 });

const PaymentOrder = mongoose.models.PaymentOrder || mongoose.model('PaymentOrder', paymentOrderSchema);
export default PaymentOrder;

