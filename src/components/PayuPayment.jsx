import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import API from '../lib/api';
import config from '../lib/config/appConfig';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

// Safe localStorage access
const safeLocalStorage = {
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }
};

const PayuPayment = ({ plan, userInfo, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const handlePayuPayment = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      if (!userInfo || !userInfo._id) {
        toast.error('Please login to proceed with payment');
        return;
      }

      console.log('Creating PayU order for:', { 
        planId: plan.key, 
        userId: userInfo._id,
        plan: plan 
      });
      
      // Create PayU order
      const orderRes = await API.createPayuSubscriptionOrder({
        planId: (plan.key || '').toLowerCase(),
        userId: userInfo._id
      });

      console.log('PayU order created:', orderRes);

      if (orderRes.success) {
        setPaymentData(orderRes.paymentParams);
        
        // Store transaction ID in localStorage for later retrieval
        const txnid = orderRes.paymentParams.txnid;
        if (txnid) {
          safeLocalStorage.setItem('payu_txnid', txnid);
          safeLocalStorage.setItem('payu_txnid_timestamp', Date.now().toString());
          console.log('Stored PayU txnid in localStorage:', txnid);
        }
        
        // Create form and submit to PayU
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = orderRes.paymentUrl;
        form.target = '_blank';

        // Add all PayU parameters as hidden inputs
        Object.keys(orderRes.paymentParams).forEach(key => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = orderRes.paymentParams[key];
          form.appendChild(input);
        });

        // Add form to DOM and submit
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);

        toast.success('Redirecting to PayU payment gateway...');
      } else {
        throw new Error(orderRes.message || 'Failed to create PayU order');
      }

    } catch (error) {
      console.error('Error creating PayU payment:', error);
      
      // Provide more specific error messages
      if (error.message.includes('User not found')) {
        toast.error('User not found. Please login again.');
      } else if (error.message.includes('Invalid plan')) {
        toast.error('Invalid subscription plan selected.');
      } else if (error.message.includes('PayU payment gateway not configured')) {
        toast.error('Payment system is temporarily unavailable. Please try again later.');
      } else {
        toast.error('Failed to create payment order: ' + (error.message || 'Unknown error'));
      }
      
      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payu-payment-container">
      <button
        onClick={handlePayuPayment}
        disabled={loading}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg group-hover:shadow-3xl ${
          loading 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-secondary-600 to-indigo-600 hover:from-secondary-700 hover:to-indigo-700'
        }`}
      >
        <span className="flex items-center justify-center space-x-2">
          {loading ? (
            <>
              <FaSpinner className="text-sm animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <FaCreditCard className="text-sm" />
              <span>Pay with PayU</span>
            </>
          )}
        </span>
      </button>
      
      {paymentData && (
        <div className="mt-4 p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg border border-secondary-200 dark:border-secondary-700">
          <div className="flex items-center space-x-2 text-secondary-600 dark:text-secondary-400">
            <FaCheckCircle className="text-sm" />
            <span className="text-sm font-medium">Payment initiated successfully</span>
          </div>
          <p className="text-xs text-secondary-500 dark:text-secondary-300 mt-1">
            Transaction ID: {paymentData.txnid}
          </p>
        </div>
      )}
    </div>
  );
};

export default PayuPayment;
