// Shared admin-input validation for coupon create/update. Returns { data } or { message }.
// (Not a route file, so Next does not expose it as an endpoint.)
export function sanitizeCouponInput(body) {
    const description = String(body.description || '').trim();
    if (!description) return { message: 'Description is required' };

    if (!['flat', 'percentage'].includes(body.discountType)) return { message: 'Discount type must be flat or percentage' };

    const discountValue = Number(body.discountValue);
    if (!Number.isFinite(discountValue) || discountValue <= 0) return { message: 'Discount value must be greater than 0' };
    if (body.discountType === 'percentage' && discountValue > 99) return { message: 'Percentage cannot exceed 99' };

    const expiryDate = new Date(body.expiryDate);
    if (Number.isNaN(expiryDate.getTime())) return { message: 'A valid expiry date is required' };

    let startDate = null;
    if (body.startDate) {
        startDate = new Date(body.startDate);
        if (Number.isNaN(startDate.getTime())) return { message: 'Invalid start date' };
        if (startDate >= expiryDate) return { message: 'Start date must be before expiry date' };
    }

    let displayDate = null;
    if (body.displayDate) {
        displayDate = new Date(body.displayDate);
        if (Number.isNaN(displayDate.getTime())) return { message: 'Invalid display date' };
        if (!startDate) return { message: 'Set a start date to use a display date' };
        if (displayDate > startDate) return { message: 'Display date must be on or before the start date' };
    }

    const nonNeg = (v) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Math.floor(Number(v)) : 0);

    return {
        data: {
            description: description.slice(0, 300),
            discountType: body.discountType,
            discountValue,
            maxDiscount: body.discountType === 'percentage' ? nonNeg(body.maxDiscount) : 0,
            startDate,
            displayDate,
            expiryDate,
            isActive: body.isActive !== false,
            usageLimit: nonNeg(body.usageLimit),
            perUserLimit: body.perUserLimit === undefined || body.perUserLimit === '' ? 1 : nonNeg(body.perUserLimit),
            applicablePlans: Array.isArray(body.applicablePlans) ? body.applicablePlans.map(String) : [],
            showInModal: !!body.showInModal
        }
    };
}
