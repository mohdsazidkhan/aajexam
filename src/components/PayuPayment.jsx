import React, { useState } from 'react';
import { CheckCircle2, CreditCard, LoaderCircle, ShieldCheck } from 'lucide-react';

import { launchPayuCheckout } from '../lib/utils/payu';

const PayuPayment = ({ plan, userInfo, onError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePayuPayment = async () => {
    setLoading(true);
    const res = await launchPayuCheckout({ plan, userInfo, onError });
    if (res?.success && res.txnid) setPaymentData({ txnid: res.txnid });
    setLoading(false);
  };

  return (
    <div className="font-outfit space-y-2 lg:space-y-4">
      <button
        onClick={handlePayuPayment}
        disabled={loading}
        className={`w-full py-6 px-10 rounded-[2rem] font-black text-sm text-white transition-all shadow-sm border-2 border-white/20 active:translate-y-2 active:shadow-none border-primary-600 ${
          loading
            ? 'bg-slate-400 border-slate-500 cursor-not-allowed shadow-none translate-y-2 opacity-80'
            : 'bg-primary-600 hover:bg-primary-600 hover:-translate-y-1'
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

      <div className="rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm text-slate-600 dark:text-slate-400">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0 text-primary-600 mt-0.5" />
          <p className="font-medium">
            A secure PayU window will open in a new tab. Keep this page open until your payment is completed.
          </p>
        </div>
      </div>

      {paymentData?.txnid && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 text-primary-600">
            <div className="w-10 h-10 bg-primary-600 rounded-lg lg:rounded-xl flex items-center justify-center text-white shadow-sm">
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
