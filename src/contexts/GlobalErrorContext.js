import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const GlobalErrorContext = createContext();

export const useGlobalError = () => {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
};

export const GlobalErrorProvider = ({ children }) => {
  const [errors, setErrors] = useState([]);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const handleError = useCallback((error, customMessage = null) => {
    console.error('Global Error:', error);

    // Extract error message
    let errorMessage = customMessage || 'An unexpected error occurred';

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Show toast notification
    toast.error(errorMessage);

    // Add to errors list for debugging
    const errorObj = {
      id: Date.now(),
      message: errorMessage,
      timestamp: new Date().toISOString(),
      stack: error?.stack,
      url: error?.config?.url,
      method: error?.config?.method,
      status: error?.response?.status
    };

    setErrors(prev => [errorObj, ...prev.slice(0, 9)]); // Keep only last 10 errors

    // Show error modal for critical errors
    if (error?.response?.status >= 500) {
      setIsErrorModalOpen(true);
    }

    return errorMessage;
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearError = useCallback((errorId) => {
    setErrors(prev => prev.filter(error => error.id !== errorId));
  }, []);

  const closeErrorModal = useCallback(() => {
    setIsErrorModalOpen(false);
  }, []);

  const checkRateLimitError = useCallback((message) => {
    if (!message || typeof message !== 'string') return false;
    const lowerMessage = message.toLowerCase();
    return lowerMessage.includes('rate limit') || lowerMessage.includes('too many requests') || lowerMessage.includes('429');
  }, []);

  const value = {
    errors,
    isErrorModalOpen,
    handleError,
    clearErrors,
    clearError,
    closeErrorModal,
    checkRateLimitError
  };

  return (
    <GlobalErrorContext.Provider value={value}>
      {children}
      {isErrorModalOpen && (
        <ErrorModal
          isOpen={isErrorModalOpen}
          onClose={closeErrorModal}
          errors={errors}
          clearError={clearError}
        />
      )}
    </GlobalErrorContext.Provider>
  );
};

// Error Modal Component
const ErrorModal = ({ isOpen, onClose, errors, clearError }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Error Log
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {errors.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No errors logged
            </p>
          ) : (
            <div className="space-y-4">
              {errors.map((error) => (
                <div key={error.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-red-800 dark:text-red-200 font-medium">
                        {error.message}
                      </p>
                      <div className="mt-2 text-sm text-red-600 dark:text-red-400 space-y-1">
                        {error.timestamp && (
                          <p>Time: {new Date(error.timestamp).toLocaleString()}</p>
                        )}
                        {error.url && (
                          <p>URL: {error.method?.toUpperCase()} {error.url}</p>
                        )}
                        {error.status && (
                          <p>Status: {error.status}</p>
                        )}
                      </div>
                      {error.stack && (
                        <details className="mt-2">
                          <summary className="text-sm text-red-600 dark:text-red-400 cursor-pointer">
                            Stack Trace
                          </summary>
                          <pre className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded overflow-x-auto">
                            {error.stack}
                          </pre>
                        </details>
                      )}
                    </div>
                    <button
                      onClick={() => clearError(error.id)}
                      className="ml-4 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              errors.forEach(error => clearError(error.id));
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};

export default GlobalErrorContext;
