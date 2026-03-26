import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Seo from '../../components/Seo';

// Safe localStorage access
const safeLocalStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
};

const PayuSuccess = () => {
  const router = useRouter();
  const [verifying, setVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState(null);
  // Removed mobile app source check for web-first experience
  const [isFromMobileApp] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Get transaction ID from URL query params (sent by backend callback)
        const { txnid: urlTxnid, status: urlStatus, amount: urlAmount } = router.query;

        console.log('PayU Success - URL params:', { urlTxnid, urlStatus, urlAmount });

        // Get transaction ID from localStorage (stored before PayU redirect) as fallback
        let txnid = urlTxnid || safeLocalStorage.getItem('payu_txnid');
        const txnidTimestamp = safeLocalStorage.getItem('payu_txnid_timestamp');

        // Check if txnid is not too old (within 1 hour)
        if (txnid && txnidTimestamp) {
          const age = Date.now() - parseInt(txnidTimestamp);
          if (age > 60 * 60 * 1000) { // 1 hour
            console.log('PayU txnid is too old, clearing from localStorage');
            safeLocalStorage.removeItem('payu_txnid');
            safeLocalStorage.removeItem('payu_txnid_timestamp');
            txnid = null;
          }
        }

        if (!txnid) {
          console.log('No transaction ID found in localStorage');
          setVerificationResult({
            success: false,
            message: 'No transaction ID found. Please check your payment status.'
          });
          setVerifying(false);
          return;
        }

        console.log('Fetching payment data for txnid:', txnid);

        // Fetch payment data from API
        const paymentDataRes = await API.getPaymentData(txnid);

        if (!paymentDataRes.success) {
          throw new Error(paymentDataRes.message || 'Failed to fetch payment data');
        }

        const paymentData = paymentDataRes.data;
        console.log('Payment data received:', paymentData);

        if (!paymentData.txnid || !paymentData.status) {
          // If no payment data, show a message and redirect after a delay
          if (!paymentData.txnid && !paymentData.status) {
            console.log('No payment data found, redirecting to subscription page...');
            setTimeout(() => {
              router.push('/subscription');
            }, 5000);
            setVerificationResult({
              success: false,
              message: 'No payment data found. The payment redirect didn\'t include transaction details. Redirecting to subscription page...'
            });
            return;
          }

          throw new Error('Invalid payment data received. Missing transaction ID or status.');
        }

        // Check payment status from API data
        if (paymentData.status === 'success') {
          // Payment was successful - show success message
          setVerificationResult({
            success: true,
            message: 'Payment successful! Your subscription has been activated.',
            subscription: {
              planName: paymentData.planName,
              planId: paymentData.planId,
              amount: paymentData.amount,
              currency: paymentData.currency,
              status: paymentData.status,
              txnid: paymentData.txnid,
              receipt: paymentData.receipt,
              user: paymentData.user,
              createdAt: paymentData.createdAt,
              updatedAt: paymentData.updatedAt
            }
          });
          toast.success('🎉 Payment successful! Subscription activated.');
        } else {
          // Payment failed or pending
          setVerificationResult({
            success: false,
            message: `Payment status: ${paymentData.status}. Please check your payment or try again.`
          });
          toast.error(`Payment status: ${paymentData.status}`);
        }

        // Clear PayU transaction ID from localStorage after processing
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        console.log('Cleared PayU txnid from localStorage');

      } catch (error) {
        toast.error('Payment verification failed: ' + (error.message || 'Unknown error'));
        setVerificationResult({ success: false, message: error.message });
      } finally {
        setVerifying(false);
      }
    };

    // Only run when router.query is available (after hydration)
    if (router.isReady) {
      verifyPayment();
    }
  }, [router.isReady, router.query]);

  const handleGoToSubscription = () => {
    router.push('/subscription');
  };

  const handleGoToLevels = () => {
    router.push('/levels');
  };

  if (verifying) {
    return (
      <MobileAppWrapper title="Payment Verification">
        <div className="min-h-screen bg-subg-light dark:bg-subg-dark flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-secondary-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please wait while we verify your payment
            </p>
            <div className="mt-4">
              <button
                onClick={() => router.push('/subscription')}
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
              >
                Go to Subscription
              </button>
            </div>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  return (
    <MobileAppWrapper title="Payment Success">
      <Seo
        title="Payment Success - AajExam Platform"
        description="Your payment was successful and your subscription is now active."
        noIndex={true}
      />
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        <div className="container mx-auto py-4 px-4 lg:px-10">
          <div className="max-w-2xl mx-auto">
            {verificationResult?.success ? (
              <div className="text-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-4xl text-green-600 dark:text-green-400" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Payment Successful!
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  Your subscription has been activated successfully. You can now access All PRO Features.
                </p>

                {verificationResult.subscription && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-6 mb-8 shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                      Subscription Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {verificationResult.subscription.planName || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          ₹{verificationResult.subscription.amount} {verificationResult.subscription.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Status:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {verificationResult.subscription.status?.toUpperCase() || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Transaction ID:</span>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {verificationResult.subscription.txnid || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Receipt:</span>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {verificationResult.subscription.receipt || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">User:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {verificationResult.subscription.user?.name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Email:</span>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">
                          {verificationResult.subscription.user?.email || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Payment Date:</span>
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {verificationResult.subscription.createdAt
                            ? new Date(verificationResult.subscription.createdAt).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={handleGoToLevels}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Start Learning Now
                  </button>

                  <button
                    onClick={handleGoToSubscription}
                    className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300"
                  >
                    View Subscription Details
                  </button>

                  {/* Mobile app return button removed */}
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTimesCircle className="text-4xl text-primary-600 dark:text-red-400" />
                </div>

                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  Payment Verification Failed
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                  {verificationResult?.message || 'There was an issue verifying your payment. Please contact support if the amount was deducted.'}
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleGoToSubscription}
                    className="w-full bg-gradient-to-r from-secondary-600 to-indigo-600 hover:from-secondary-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    Try Again
                  </button>

                  <button
                    onClick={() => router.push('/')}
                    className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300"
                  >
                    Go to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PayuSuccess;
