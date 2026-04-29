// Centralised PayU launcher. Builds the order, persists txnid for the
// success/failure landing pages, and submits the PayU form.
//
// Default behaviour is NEW-TAB ({ newTab: true }) so the subscription
// page stays open behind the PayU checkout. To avoid the "blank tab on
// first click then works after refresh" race that a plain target="_blank"
// form-submit has (the order-create API is async, so the user-gesture
// context is gone by the time we submit), we:
//   1. Synchronously open a placeholder tab with a styled spinner the
//      moment the user clicks (still inside the user-gesture, so the
//      popup blocker stays out of the way).
//   2. Await the order API.
//   3. Write the auto-submit PayU form straight into that already-open
//      tab's document, which navigates it to PayU without losing the
//      gesture or showing a blank screen.
//
// Pass { newTab: false } if you ever want to redirect the current tab
// instead.

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

const escapeHtml = (s) => String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const PLACEHOLDER_HTML = `<!doctype html>
<html><head><title>Opening secure payment…</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff}
  .spinner{width:48px;height:48px;border:4px solid rgba(255,255,255,.2);border-top-color:#3b82f6;border-radius:50%;animation:s 1s linear infinite;margin-bottom:24px}
  @keyframes s{to{transform:rotate(360deg)}}
  h1{font-size:18px;font-weight:700;margin:0 0 8px}
  p{font-size:13px;color:#94a3b8;margin:0;text-align:center;max-width:320px;line-height:1.5}
</style></head>
<body><div class="spinner"></div><h1>Opening secure payment…</h1><p>Please wait while we set up your PayU checkout.</p></body></html>`;

const buildAutoSubmitHtml = (paymentUrl, paymentParams) => `<!doctype html>
<html><head><title>Redirecting to PayU…</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;background:#0f172a;color:#fff}
  .spinner{width:48px;height:48px;border:4px solid rgba(255,255,255,.2);border-top-color:#3b82f6;border-radius:50%;animation:s 1s linear infinite;margin-bottom:24px}
  @keyframes s{to{transform:rotate(360deg)}}
  h1{font-size:18px;font-weight:700;margin:0 0 8px}
  p{font-size:13px;color:#94a3b8;margin:0;text-align:center;max-width:320px;line-height:1.5}
</style></head>
<body>
  <div class="spinner"></div>
  <h1>Redirecting to PayU…</h1>
  <p>If this page does not redirect within 5 seconds, please click the button below.</p>
  <form id="payuForm" method="POST" action="${escapeHtml(paymentUrl)}" style="margin-top:24px">
    ${Object.entries(paymentParams || {}).map(([k, v]) =>
        `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(v)}" />`
    ).join('')}
    <button type="submit" style="background:#3b82f6;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-weight:700;cursor:pointer;font-size:14px">Continue to PayU</button>
  </form>
  <script>document.getElementById('payuForm').submit();</script>
</body></html>`;

// Build a hidden form and submit it. Used for the same-tab path; if a
// `targetWindow` is passed (the new-tab path), we instead write the
// auto-submit HTML straight into that already-opened tab.
const submitForm = ({ paymentUrl, paymentParams, targetWindow }) => {
    if (targetWindow) {
        try {
            const html = buildAutoSubmitHtml(paymentUrl, paymentParams);
            targetWindow.document.open();
            targetWindow.document.write(html);
            targetWindow.document.close();
            return true;
        } catch (_) {
            // Fall through to the legacy in-page form post if the tab handle
            // got stripped (rare; happens after long delays in some browsers).
        }
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = paymentUrl;
    if (targetWindow) form.target = '_blank';

    Object.entries(paymentParams || {}).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    return true;
};

export const launchPayuCheckout = async ({ plan, userInfo, onError, newTab = true } = {}) => {
    const resolvedUser = resolveCurrentUser(userInfo);
    if (!resolvedUser?._id) {
        toast.error('Please log in to continue with payment.');
        return { success: false, reason: 'unauthenticated' };
    }

    // For the new-tab path: open the popup SYNCHRONOUSLY in the user
    // gesture and paint a placeholder immediately so the popup blocker
    // stays out of the way and the user never sees about:blank.
    let popup = null;
    if (newTab && typeof window !== 'undefined') {
        popup = window.open('about:blank', '_blank');
        if (popup && popup.document) {
            try {
                popup.document.open();
                popup.document.write(PLACEHOLDER_HTML);
                popup.document.close();
            } catch (_) { /* cross-origin write may fail */ }
        }
        if (!popup) {
            toast.error('Please allow popups for AajExam to continue payment.');
            return { success: false, reason: 'popup_blocked' };
        }
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

        submitForm({
            paymentUrl: orderRes.paymentUrl,
            paymentParams: orderRes.paymentParams,
            targetWindow: popup
        });

        toast.success('Opening secure payment page...');
        return { success: true, txnid };
    } catch (error) {
        // Close the placeholder tab so the user isn't stuck with a spinner.
        if (popup) { try { popup.close(); } catch (_) { /* noop */ } }

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
