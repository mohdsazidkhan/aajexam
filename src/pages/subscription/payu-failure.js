import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import API from '../../lib/api';
import MobileAppWrapper from '../../components/MobileAppWrapper';
import { FaTimesCircle, FaArrowLeft, FaSync, FaSpinner } from 'react-icons/fa';
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

const PayuFailure = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  // Removed mobile app source check for web-first experience
  const [isFromMobileApp] = useState(false);

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        // Get transaction ID from URL query params (sent by backend callback)
        const { txnid: urlTxnid, status: urlStatus, error: urlError } = router.query;

        console.log('PayU Failure - URL params:', { urlTxnid, urlStatus, urlError });

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
          console.log('No transaction ID found in URL or localStorage');
          // If we have URL error, show that instead
          if (urlError) {
            setError(`Payment failed: ${decodeURIComponent(urlError)}`);
          } else {
            setError('No transaction ID found. Please check your payment status.');
          }
          setLoading(false);
          return;
        }

        console.log('Fetching payment data for txnid:', txnid);

        // Fetch payment data from API
        const paymentDataRes = await API.getPaymentData(txnid);

        if (!paymentDataRes.success) {
          throw new Error(paymentDataRes.message || 'Failed to fetch payment data');
        }

        const data = paymentDataRes.data;
        console.log('Payment data received:', data);

        setPaymentData(data);

        // Show appropriate message based on payment status
        if (data.status === 'failure' || data.status === 'failed') {
          toast.error('Payment failed. Please try again.');
        } else if (data.status === 'pending') {
          toast.warning('Payment is still pending. Please wait or try again.');
        } else {
          toast.error('Payment could not be processed. Please try again.');
        }

        // Clear PayU transaction ID from localStorage after processing
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        console.log('Cleared PayU txnid from localStorage');

      } catch (error) {
        console.error('Error fetching payment data:', error);
        setError(error.message || 'Failed to load payment information');
        toast.error('Failed to load payment information');

        // Clear PayU transaction ID from localStorage even on error
        safeLocalStorage.removeItem('payu_txnid');
        safeLocalStorage.removeItem('payu_txnid_timestamp');
        console.log('Cleared PayU txnid from localStorage after error');
      } finally {
        setLoading(false);
      }
    };

    // Only run when router.query is available (after hydration)
    if (router.isReady) {
      fetchPaymentData();
    }
  }, [router.isReady, router.query]);

  const handleTryAgain = () => {
    router.push('/subscription');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <MobileAppWrapper title="Loading Payment Status">
        <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              Loading Payment Status...
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Please wait while we check your payment status
            </p>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  return (
    <MobileAppWrapper title="Payment Failed">
      <Seo
        title="Payment Failed - AajExam Platform"
        description="Your payment attempt was not successful. Please try again or contact support."
        noIndex={true}
      />
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
        <div className="container mx-auto py-4 px-4 lg:px-10">
          <div className="max-w-2xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaTimesCircle className="text-4xl text-primary-600 dark:text-red-400" />
              </div>

              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                Payment Failed
              </h1>

              {error ? (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-6 border border-red-200 dark:border-red-700">
                  <p className="text-red-800 dark:text-red-200">{error}</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-6 mb-8 shadow-lg">
                  {paymentData && (
                    <div className="text-left mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                        Payment Details:
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Plan:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {paymentData.planName || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Amount:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            ₹{paymentData.amount} {paymentData.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Status:</span>
                          <span className="font-semibold text-primary-600 dark:text-red-400">
                            {paymentData.status?.toUpperCase() || 'FAILED'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Transaction ID:</span>
                          <span className="font-semibold text-gray-800 dark:text-white text-xs">
                            {paymentData.txnid || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Receipt:</span>
                          <span className="font-semibold text-gray-800 dark:text-white text-xs">
                            {paymentData.receipt || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">User:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {paymentData.user?.name || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Email:</span>
                          <span className="font-semibold text-gray-800 dark:text-white text-xs">
                            {paymentData.user?.email || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Payment Date:</span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {paymentData.createdAt
                              ? new Date(paymentData.createdAt).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
                    We're sorry, but your payment could not be processed. This could be due to various reasons such as insufficient funds, network issues, or payment gateway problems.
                  </p>
                </div>
              )}

              {!error && (
                <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-3 lg:p-6 mb-8 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    What you can do:
                  </h3>
                  <ul className="text-left space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Check your bank account or card balance</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Ensure your card details are correct</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Try using a different payment method</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span>Contact your bank if the issue persists</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleTryAgain}
                  className="w-full bg-gradient-to-r from-secondary-600 to-indigo-600 hover:from-secondary-700 hover:to-indigo-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <FaSync className="text-sm" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={handleGoHome}
                  className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaArrowLeft className="text-sm" />
                  <span>Go to Home</span>
                </button>

                {/* Mobile app return button removed */}
              </div>

              <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-700">
                <p className="text-sm text-primary-800 dark:text-primary-200">
                  <strong>Note:</strong> If you were charged but didn't receive your subscription, please contact our support team with your transaction details.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default PayuFailure;
