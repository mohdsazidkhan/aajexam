// Pure coupon pricing (no DB imports) so the server and the admin form's live preview share one formula.

// PayU rejects amounts below Rs 1, so a coupon can never take a plan to zero.
export const MIN_PAYABLE = 1;

export const computeDiscount = (coupon, price) => {
    let discount = coupon.discountType === 'percentage'
        ? (price * coupon.discountValue) / 100
        : coupon.discountValue;
    if (coupon.discountType === 'percentage' && coupon.maxDiscount > 0) {
        discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(Math.round(discount * 100) / 100, price - MIN_PAYABLE);
    discount = Math.max(0, discount);
    return { discount, finalAmount: Math.round((price - discount) * 100) / 100 };
};
