import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CircleAlert, LoaderCircle, RefreshCcw } from 'lucide-react';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import Seo from '../../components/Seo';

const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  },
};

const formatCurrency = (amount, currency = 'INR') => {
  const safeAmount = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(safeAmount);
  } catch {
    return `Rs.${safeAmount}`;
  }
};

const PayuFailure = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const fetchPaymentData = async () => {
      try {
        let txnid = router.query.txnid || safeLocalStorage.getItem('payu_txnid');
        const txnidTimestamp = safeLocalStorage.getItem('payu_txnid_timestamp');

        if (txnid && txnidTimestamp) {
          const age = Date.now() - Number.parseInt(txnidTimestamp, 10);
          if (age > 60 * 60 * 1000) {
            safeLocalStorage.removeItem('payu_txnid');
            safeLocalStorage.removeItem('payu_txnid_timestamp');
            txnid = null;
          }
        }

        if (!txnid) {
          const queryError = router.query.error ? decodeURIComponent(router.query.error) : '';
          setError(queryError || 'We could not find the payment reference. Please try again from the subscription page.');
          return;
        }

        const paymentDataRes = await API.getPaymentData(txnid);
        if (!paymentDataRes?.success) {
          throw new Error(paymentDataRes?.message || 'Failed to fetch payment details.');
        }

        const data = paymentDataRes.data;
        setPaymentData(data);

        if (data?.status === 'pending') {
          toast.error('This payment is still pending.');
          setError('Your payment is still pending. Please wait a little longer or check again from the subscription page.');
        } else {
          toast.error('Payment failed. Please try again.');
        }
      } catch (fetchError) {
        setError(fetchError?.message || 'Failed to load payment information.');
        toast.error(fetchError?.message || 'Failed to load payment information.');
      } finally {
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [router.isReady, router.query.error, router.query.txnid]);

  const detailRows = paymentData
    ? [
      { label: 'Plan', value: paymentData.planName || 'N/A' },
      { label: 'Amount', value: formatCurrency(paymentData.amount, paymentData.currency) },
      { label: 'Status', value: paymentData.status || 'failed' },
      { label: 'Transaction ID', value: paymentData.txnid || 'N/A' },
      { label: 'Receipt', value: paymentData.receipt || 'N/A' },
      { label: 'Name', value: paymentData.user?.name || 'N/A' },
      { label: 'Email', value: paymentData.user?.email || 'N/A' },
      {
        label: 'Payment date',
        value: paymentData.createdAt ? new Date(paymentData.createdAt).toLocaleDateString() : 'N/A',
      },
    ]
    : [];

  if (loading) {
    return (
      <MobileAppWrapper title="Checking payment">
        <Seo title="Checking Payment Status - AajExam" description="We are checking your failed payment attempt." noIndex={true} />
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="w-20 h-20 rounded-[2rem] bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <LoaderCircle className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Checking your payment</h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                We are gathering the latest payment details so you know what happened.
              </p>
            </div>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  return (
    <MobileAppWrapper title="Payment failed">
      <Seo
        title="Payment Failed - AajExam Platform"
        description="Your payment attempt was not successful. Please try again or contact support."
        noIndex={true}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <CircleAlert className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl lg:text-xl lg:text-3xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Payment failed</h1>
                <p className="text-base font-medium text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                  {error || 'The payment could not be completed. Please try again or use a different payment method.'}
                </p>
              </div>
            </div>

            {detailRows.length > 0 && (
              <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 space-y-4">
                <h2 className="text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Payment details</h2>
                <div className="space-y-3">
                  {detailRows.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-slate-200 dark:border-slate-800 last:border-b-0">
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white break-all sm:text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 space-y-4">
              <h2 className="text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">What to try next</h2>
              <ul className="space-y-3">
                {[
                  'Check that your card or bank account has enough balance.',
                  'Review the payment method details and try again carefully.',
                  'Use a different payment option if the same method keeps failing.',
                  'Contact support if you were charged but the plan was not activated.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/subscription')}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" />
                Try again
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                Go home
              </button>
            </div>

            <div className="rounded-2xl bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 p-4">
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                If the amount was deducted but your plan was not activated, keep the transaction ID handy and contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PayuFailure;
