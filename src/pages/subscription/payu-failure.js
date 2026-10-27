import React, { useEffect, useState } from 'react';
import { useAppRouter as useRouter } from '@/hooks/useAppRouter';
import { toast } from 'react-hot-toast';
import { ArrowLeft, CircleAlert, LoaderCircle, RefreshCcw } from 'lucide-react';

import API from '../../lib/api';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';

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
  const { translate } = useTranslate();
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
          setError(queryError || translate('We could not find the payment reference. Please try again from the subscription page.'));
          return;
        }

        const paymentDataRes = await API.getPaymentData(txnid);
        if (!paymentDataRes?.success) {
          throw new Error(paymentDataRes?.message || translate('Failed to fetch payment details.'));
        }

        const data = paymentDataRes.data;
        setPaymentData(data);

        if (data?.status === 'pending') {
          toast.error(translate('This payment is still pending.'));
          setError(translate('Your payment is still pending. Please wait a little longer or check again from the subscription page.'));
        } else {
          toast.error(translate('Payment failed. Please try again.'));
        }
      } catch (fetchError) {
        setError(fetchError?.message || translate('Failed to load payment information.'));
        toast.error(fetchError?.message || translate('Failed to load payment information.'));
      } finally {
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        setLoading(false);
      }
    };

    fetchPaymentData();
  // eslint-disable-next-line react-hooks/exhaustive-deps -- translate/fetch helper only feed toasts; re-running on language change would refetch or repeat side effects
  }, [router.isReady, router.query.error, router.query.txnid]);

  const detailRows = paymentData
    ? [
      { label: translate('Plan'), value: paymentData.planName || translate('N/A') },
      { label: translate('Amount'), value: formatCurrency(paymentData.amount, paymentData.currency) },
      { label: translate('Status'), value: paymentData.status || 'failed' },
      { label: translate('Transaction ID'), value: paymentData.txnid || translate('N/A') },
      { label: translate('Receipt'), value: paymentData.receipt || translate('N/A') },
      { label: translate('Name'), value: paymentData.user?.name || translate('N/A') },
      { label: translate('Email'), value: paymentData.user?.email || translate('N/A') },
      {
        label: translate('Payment date'),
        value: paymentData.createdAt ? new Date(paymentData.createdAt).toLocaleDateString() : translate('N/A'),
      },
    ]
    : [];

  if (loading) {
    return (
      <MobileAppWrapper title={translate('Checking payment')}>
        <Seo title="Checking Payment Status - AajExam" description="We are checking your failed payment attempt." noIndex={true} />
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md w-full text-center relative overflow-hidden bg-background-surface p-6 xl:p-8 border border-border-primary space-y-5">
            <div className="w-20 h-20 rounded-3xl bg-black/10 dark:bg-white/10 text-content-primary flex items-center justify-center mx-auto">
              <LoaderCircle className="w-10 h-10 animate-spin" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl xl:text-2xl font-bold font-outfit tracking-tight text-content-primary">{translate('Checking your payment')}</h1>
              <p className="text-sm font-medium text-content-secondary">
                {translate('We are gathering the latest payment details so you know what happened.')}
              </p>
            </div>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  return (
    <MobileAppWrapper title={translate('Payment failed')}>
      <Seo
        title="Payment Failed - AajExam Platform"
        description="Your payment attempt was not successful. Please try again or contact support."
        noIndex={true}
      />
      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto">
          <section className="relative overflow-hidden bg-background-surface p-6 xl:p-8 border border-border-primary space-y-6">
            <div className="text-center space-y-2 xl:space-y-4">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto bg-background-surface-secondary text-content-primary">
                <CircleAlert className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl md:text-2xl xl:text-3xl font-bold font-outfit tracking-tight text-content-primary">{translate('Payment failed')}</h1>
                <p className="text-base font-medium text-content-secondary max-w-xl mx-auto">
                  {error || translate('The payment could not be completed. Please try again or use a different payment method.')}
                </p>
              </div>
            </div>

            {detailRows.length > 0 && (
              <section className="rounded-3xl border border-border-primary p-4 xl:p-8 space-y-2 xl:space-y-4">
                <h2 className="text-xl font-bold font-outfit tracking-tight text-content-primary">{translate('Payment details')}</h2>
                <div className="space-y-3">
                  {detailRows.map((item) => (
                    <div key={item.label} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 py-3 border-b border-border-primary last:border-b-0">
                      <span className="text-sm font-semibold text-content-muted">{item.label}</span>
                      <span className="text-sm font-semibold text-content-primary break-all sm:text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-border-primary p-4 xl:p-8 space-y-2 xl:space-y-4">
              <h2 className="text-xl font-bold font-outfit tracking-tight text-content-primary">{translate('What to try next')}</h2>
              <ul className="space-y-3">
                {[
                  'Check that your card or bank account has enough balance.',
                  'Review the payment method details and try again carefully.',
                  'Use a different payment option if the same method keeps failing.',
                  'Contact support if you were charged but the plan was not activated.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm font-medium text-content-secondary">
                    <span className="mt-2 h-2 w-2 rounded-full bg-primary-600 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/student/subscription')}
                className="w-full bg-primary-600 hover:bg-primary-600 text-on-primary py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
              >
                <RefreshCcw className="w-5 h-5" />
                {translate('Try again')}
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full bg-background-surface-secondary hover:bg-background-surface-secondary text-content-primary py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-3"
              >
                <ArrowLeft className="w-5 h-5" />
                {translate('Go home')}
              </button>
            </div>

            <div className="rounded-2xl border border-primary-200 dark:border-primary-600 p-4">
              <p className="text-sm font-medium text-primary-600 dark:text-primary-100">
                {translate('If the amount was deducted but your plan was not activated, keep the transaction ID handy and contact support.')}
              </p>
            </div>
          </section>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PayuFailure;
