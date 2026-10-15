// Single source of truth for purchasable PRO plans (price + duration).
// Every price and duration comes from .env (NEXT_PUBLIC_ so the pricing page and
// the server read the same values). The server always charges from here, never
// from anything the client sends — the client only names a plan id.
//
//   NEXT_PUBLIC_PLAN_PRICE_PRO / NEXT_PUBLIC_PLAN_DAYS_PRO         1 month
//   NEXT_PUBLIC_PLAN_PRICE_PRO_3M / NEXT_PUBLIC_PLAN_DAYS_PRO_3M   3 months
//   NEXT_PUBLIC_PLAN_PRICE_PRO_6M / NEXT_PUBLIC_PLAN_DAYS_PRO_6M   6 months
//   NEXT_PUBLIC_PLAN_PRICE_PRO_12M / NEXT_PUBLIC_PLAN_DAYS_PRO_12M 1 year
//
// The 1-month id stays plain 'pro' so live app builds and old PaymentOrders keep working.
// NOTE: process.env.NEXT_PUBLIC_* must be referenced literally for Next to inline it.

const num = (v, fallback) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : fallback;
};

const RAW_PLANS = [
    { id: 'pro', label: '1 Month', cycle: 'monthly', price: num(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO, 99), days: num(process.env.NEXT_PUBLIC_PLAN_DAYS_PRO, 30) },
    { id: 'pro_3m', label: '3 Months', cycle: 'quarterly', price: num(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO_3M, 199), days: num(process.env.NEXT_PUBLIC_PLAN_DAYS_PRO_3M, 90) },
    { id: 'pro_6m', label: '6 Months', cycle: 'half-yearly', price: num(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO_6M, 349), days: num(process.env.NEXT_PUBLIC_PLAN_DAYS_PRO_6M, 180), badge: 'Most Popular' },
    { id: 'pro_12m', label: '1 Year', cycle: 'yearly', price: num(process.env.NEXT_PUBLIC_PLAN_PRICE_PRO_12M, 599), days: num(process.env.NEXT_PUBLIC_PLAN_DAYS_PRO_12M, 365), badge: 'Best Value' },
];

const round2 = (n) => Math.round(n * 100) / 100;
const monthlyPrice = RAW_PLANS[0].price;

// "Normal price" = what the same period would cost at the 1-month price.
export const PRO_PLANS = RAW_PLANS.map((p) => {
    const months = Math.max(1, Math.round(p.days / 30));
    const normalPrice = monthlyPrice * months;
    const saving = Math.max(0, normalPrice - p.price);
    return {
        ...p,
        tier: 'PRO',
        name: `Pro Plan (${p.label})`,
        months,
        normalPrice,
        saving,
        discountPct: normalPrice > 0 ? Math.round((saving / normalPrice) * 100) : 0,
        perMonth: round2(p.price / months),
    };
});

export const getPlan = (id) => PRO_PLANS.find((p) => p.id === String(id || '').toLowerCase()) || null;
