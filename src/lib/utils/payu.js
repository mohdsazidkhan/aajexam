// Centralised PayU launcher. Builds the order, persists txnid for the
// success/failure landing pages and POSTs the form to PayU in a new tab.
// Both the inline `<PayuPayment>` widget and the one-click "Buy PRO" button
// on the subscription page call this so the flow stays consistent.

import { toast } from 'react-hot-toast';

import API from '../api';

const safeLocalStorage = {
    setItem: (key, value) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(key, value);
        }
    },
    getItem: (key) => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(key);
        }
        return null;
    }
};

export const resolveCurrentUser = (userInfo) => {
    if (userInfo?._id) return userInfo;
    const stored = safeLocalStorage.getItem('userInfo');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
};

export const launchPayuCheckout = async ({ plan, userInfo, onError } = {}) => {
    const resolvedUser = resolveCurrentUser(userInfo);
    if (!resolvedUser?._id) {
        toast.error('Please log in to continue with payment.');
        return { success: false, reason: 'unauthenticated' };
    }

    try {
        const orderRes = await API.createPayuSubscriptionOrder({
            planId: (plan?.key || '').toLowerCase(),
            userId: resolvedUser._id
        });

        if (!orderRes?.success) {
            throw new Error(orderRes?.message || 'Failed to create the payment order.');
        }

        const txnid = orderRes.paymentParams?.txnid;
        if (txnid) {
            safeLocalStorage.setItem('payu_txnid', txnid);
            safeLocalStorage.setItem('payu_txnid_timestamp', Date.now().toString());
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderRes.paymentUrl;
        form.target = '_blank';

        Object.entries(orderRes.paymentParams || {}).forEach(([key, value]) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        toast.success('Opening the secure payment page...');
        return { success: true, txnid };
    } catch (error) {
        if (error?.message?.includes('User not found')) {
            toast.error('Your session expired. Please log in again.');
        } else if (error?.message?.includes('Invalid plan')) {
            toast.error('That plan is not available right now.');
        } else if (error?.message?.includes('PayU payment gateway not configured')) {
            toast.error('Payments are temporarily unavailable. Please try again later.');
        } else {
            toast.error(error?.message || 'Failed to start the payment.');
        }
        onError?.(error);
        return { success: false, error };
    }
};
