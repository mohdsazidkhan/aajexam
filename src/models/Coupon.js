import mongoose from 'mongoose';

// Admin-created discount code (e.g. DIWALI50) applied at PRO plan checkout.
// The discount is always recomputed server-side from this document - the client
// only ever sends the code string.
const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, match: /^[A-Z0-9_-]{3,30}$/ },
  description: { type: String, required: true, trim: true, maxlength: 300 },
  discountType: { type: String, enum: ['flat', 'percentage'], required: true },
  // flat: rupees off; percentage: 1-99
  discountValue: { type: Number, required: true, min: 1 },
  // percentage coupons only: cap on the rupee discount (0 = no cap)
  maxDiscount: { type: Number, default: 0, min: 0 },
  startDate: { type: Date, default: null },
  expiryDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  // total redemptions allowed across all users (0 = unlimited)
  usageLimit: { type: Number, default: 0, min: 0 },
  // redemptions allowed per user (0 = unlimited)
  perUserLimit: { type: Number, default: 1, min: 0 },
  // plan ids it works on ('pro', 'pro_3m', ...); empty = every plan
  applicablePlans: { type: [String], default: [] },
  // surface this coupon in the on-site offer modal
  showInModal: { type: Boolean, default: false },
  usedCount: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

couponSchema.index({ showInModal: 1, isActive: 1, expiryDate: 1 });

export default mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
