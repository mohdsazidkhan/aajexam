import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { ArrowRight, CheckCircle2, CircleAlert, LayoutDashboard, LoaderCircle } from 'lucide-react';

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

const PayuSuccess = () => {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const verifyPayment = async () => {
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
          setVerificationResult({
            success: false,
            message: 'We could not find your payment reference. Please open the subscription page to confirm your status.',
          });
          return;
        }

        const paymentDataRes = await API.getPaymentData(txnid);
        if (!paymentDataRes?.success) {
          throw new Error(paymentDataRes?.message || 'Failed to fetch payment details.');
        }

        const paymentData = paymentDataRes.data;
        if (!paymentData?.txnid || !paymentData?.status) {
          throw new Error('Payment details are incomplete. Please check your subscription status.');
        }

        if (paymentData.status === 'success') {
          setVerificationResult({
            success: true,
            message: 'Your payment was verified and your membership is now active.',
            subscription: {
              planName: paymentData.planName,
              amount: paymentData.amount,
              currency: paymentData.currency,
              status: paymentData.status,
              txnid: paymentData.txnid,
              receipt: paymentData.receipt,
              user: paymentData.user,
              createdAt: paymentData.createdAt,
            },
          });
          toast.success('Payment verified successfully.');
        } else {
          setVerificationResult({
            success: false,
            message: `Your payment is currently marked as ${paymentData.status}. Please check your subscription page or try again.`,
          });
          toast.error(`Payment status: ${paymentData.status}`);
        }
      } catch (error) {
        setVerificationResult({
          success: false,
          message: error?.message || 'Payment verification failed.',
        });
        toast.error(error?.message || 'Payment verification failed.');
      } finally {
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [router.isReady, router.query.txnid]);

  const detailRows = verificationResult?.subscription
    ? [
      { label: 'Plan', value: verificationResult.subscription.planName || 'N/A' },
      { label: 'Amount', value: formatCurrency(verificationResult.subscription.amount, verificationResult.subscription.currency) },
      { label: 'Status', value: verificationResult.subscription.status || 'active' },
      { label: 'Transaction ID', value: verificationResult.subscription.txnid || 'N/A' },
      { label: 'Receipt', value: verificationResult.subscription.receipt || 'N/A' },
      { label: 'Name', value: verificationResult.subscription.user?.name || 'N/A' },
      { label: 'Email', value: verificationResult.subscription.user?.email || 'N/A' },
      {
        label: 'Payment date',
        value: verificationResult.subscription.createdAt
          ? new Date(verificationResult.subscription.createdAt).toLocaleDateString()
          : 'N/A',
      },
    ]
    : [];

  if (verifying) {
    return (
      <MobileAppWrapper title="Verifying payment">
        <Seo title="Verifying Payment - AajExam" description="We are checking your payment status." noIndex={true} />
        <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
            <div className="w-20 h-20 rounded-[2rem] bg-primary-500/10 text-primary-700 dark:text-primary-500 flex items-center justify-center mx-auto">
              <LoaderCircle className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Verifying your payment</h1>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                This only takes a moment. Keep this page open while we confirm your transaction.
              </p>
            </div>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  const success = verificationResult?.success;

  return (
    <MobileAppWrapper title={success ? "Payment success" : "Payment status"}>
      <Seo
        title="Payment Status - AajExam Platform"
        description="Check the status of your recent payment and subscription."
        noIndex={true}
      />
      <div className="min-h-screen bg-white dark:bg-slate-950 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-8">
            <div className="text-center space-y-4">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto ${success ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                {success ? <CheckCircle2 className="w-12 h-12" /> : <CircleAlert className="w-12 h-12" />}
              </div>
              <div className="space-y-2">
                <h1 className="text-xl lg:text-xl lg:text-3xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">
                  {success ? 'Payment successful' : 'We could not confirm the payment'}
                </h1>
                <p className="text-base font-medium text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                  {verificationResult?.message}
                </p>
              </div>
            </div>

            {success && detailRows.length > 0 && (
              <div className="rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 lg:p-8 space-y-4">
                <h2 className="text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">Transaction details</h2>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {success ? (
                <>
                  <button
                    onClick={() => router.push('/levels')}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg flex items-center justify-center gap-3"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Go to levels
                  </button>
                  <button
                    onClick={() => router.push('/subscription')}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <ArrowRight className="w-5 h-5" />
                    Back to plans
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/subscription')}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg"
                  >
                    Try payment again
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300"
                  >
                    Go home
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PayuSuccess;
