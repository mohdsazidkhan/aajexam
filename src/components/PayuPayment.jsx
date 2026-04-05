import React, { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';

import API from '../lib/api';

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
  },
};

const PayuPayment = ({ plan, userInfo, onError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const resolvedUser = useMemo(() => {
    if (userInfo?._id) {
      return userInfo;
    }

    const storedUser = safeLocalStorage.getItem('userInfo');
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch {
      return null;
    }
  }, [userInfo]);

  const handlePayuPayment = async () => {
    try {
      setLoading(true);

      if (!resolvedUser?._id) {
        toast.error('Please log in to continue with payment.');
        return;
      }

      const orderRes = await API.createPayuSubscriptionOrder({
        planId: (plan?.key || '').toLowerCase(),
        userId: resolvedUser._id,
      });

      if (!orderRes?.success) {
        throw new Error(orderRes?.message || 'Failed to create the payment order.');
      }

      setPaymentData(orderRes.paymentParams);

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-outfit space-y-4">
      <button
        onClick={handlePayuPayment}
        disabled={loading}
        className={`w-full py-6 px-10 rounded-[2rem] font-black text-sm text-white transition-all shadow-duo-primary border-4 border-white/20 active:translate-y-2 active:shadow-none border-b-[12px] border-primary-700 ${
          loading
            ? 'bg-slate-400 border-slate-500 cursor-not-allowed shadow-none translate-y-2 opacity-80'
            : 'bg-primary-500 hover:bg-primary-600 hover:-translate-y-1'
        }`}
      >
        <span className="flex items-center justify-center gap-4">
          {loading ? (
            <>
              <LoaderCircle className="w-5 h-5 animate-spin" />
              <span>Preparing payment</span>
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5" />
              <span>Continue to secure payment</span>
            </>
          )}
        </span>
      </button>

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-5 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-primary-700 dark:text-primary-500 mt-0.5" />
          <p className="font-medium">
            A secure PayU window opens in a new tab. Keep this page open until your payment is completed.
          </p>
        </div>
      </div>

      {paymentData?.txnid && (
        <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-primary-700 dark:text-primary-500">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-duo-secondary">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">Payment session created</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Reference: {paymentData.txnid.slice(0, 16)}...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayuPayment;


