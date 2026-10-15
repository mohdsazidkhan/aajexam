import Coupon from '@/models/Coupon';
import PaymentOrder from '@/models/PaymentOrder';

import { computeDiscount } from './couponPricing';

export const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

// Is this coupon currently redeemable (ignoring who is buying what)?
export const isCouponLive = (coupon, now = new Date()) => {
    if (!coupon || !coupon.isActive) return false;
    if (coupon.startDate && coupon.startDate > now) return false;
    if (coupon.expiryDate <= now) return false;
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return false;
    return true;
};

/**
 * Validates a coupon for a user + plan and prices it.
 * Returns { valid: false, message } or { valid: true, coupon, originalAmount, discount, finalAmount }.
 */
export async function validateCoupon({ code, plan, userId }) {
    const normalized = normalizeCouponCode(code);
    if (!normalized) return { valid: false, message: 'Enter a coupon code' };

    const coupon = await Coupon.findOne({ code: normalized });
    if (!coupon) return { valid: false, message: 'Invalid coupon code' };
    if (!coupon.isActive) return { valid: false, message: 'This coupon is no longer active' };

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) return { valid: false, message: 'This coupon is not active yet' };
    if (coupon.expiryDate <= now) return { valid: false, message: 'This coupon has expired' };
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, message: 'This coupon has reached its usage limit' };
    }
    if (coupon.applicablePlans?.length && !coupon.applicablePlans.includes(plan.id)) {
        return { valid: false, message: 'This coupon is not valid for the selected plan' };
    }
    if (coupon.perUserLimit > 0 && userId) {
        const used = await PaymentOrder.countDocuments({ user: userId, couponCode: coupon.code, status: 'paid' });
        if (used >= coupon.perUserLimit) return { valid: false, message: 'You have already used this coupon' };
    }

    const { discount, finalAmount } = computeDiscount(coupon, plan.price);
    if (discount <= 0) return { valid: false, message: 'This coupon gives no discount on this plan' };

    return { valid: true, coupon, originalAmount: plan.price, discount, finalAmount };
}

// Public-safe shape of a coupon (no internal counters).
export const publicCoupon = (c) => ({
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    maxDiscount: c.maxDiscount || 0,
    expiryDate: c.expiryDate,
    applicablePlans: c.applicablePlans || []
});
