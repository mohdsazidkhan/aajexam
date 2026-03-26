import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import API from '../lib/api'

const BackendStatusBanner = () => {
  const [status, setStatus] = useState('checking'); // 'checking', 'online', 'offline'
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      // Try to make a simple API call to check if backend is available
      await API.request('/api/public/health');
      setStatus('online');
      setShowBanner(false);
    } catch (error) {
      setStatus('offline');
      setShowBanner(true);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-400 p-4 mb-4">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {status === 'checking' ? (
            <FaSpinner className="h-5 w-5 text-primary-400 animate-spin" />
          ) : status === 'offline' ? (
            <FaExclamationTriangle className="h-5 w-5 text-primary-400" />
          ) : (
            <FaCheckCircle className="h-5 w-5 text-green-400" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm text-primary-700 dark:text-primary-300">
            <strong>Backend Connection Issue:</strong> Some features may not work properly. 
            Please check your internet connection or try again later.
          </p>
          <div className="mt-2">
            <button
              onClick={checkBackendStatus}
              className="text-sm bg-primary-100 dark:bg-primary-800 hover:bg-primary-200 dark:hover:bg-primary-700 text-primary-800 dark:text-primary-200 px-3 py-1 rounded transition-colors"
            >
              Check Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendStatusBanner;
