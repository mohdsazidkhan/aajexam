import { useState, useEffect, useCallback } from 'react';
import API from '../lib/api';
import config from '../lib/config/appConfig';

export const useRewards = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRewards = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError(null);

      // Use profile data as rewards source in monthly system
      const response = await API.getProfile();

      if (!response || typeof response !== 'object') {
        throw new Error('Invalid response format from server');
      }
      console.log(response, 'responseresponse');

      // Shape minimal rewards state for components
      const shaped = {
        claimableRewards: response?.user?.claimableRewards || 0,
        quizProgress: {
          current: response?.user?.monthlyProgress?.highScoreWins || 0,
          required: config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT,
          percentage: Math.min(100, Math.round(((response?.user?.monthlyProgress?.highScoreWins || 0) / config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT) * 100))
        },
        monthlyProgress: response?.user?.monthlyProgress || {},
        user: response?.user || {}
      };

      setRewards(shaped);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch rewards');
      console.error('Rewards fetch error:', err);
      setRewards(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  const retry = () => {
    setRetryCount(prev => prev + 1);
    fetchRewards(true);
  };

  const refresh = () => {
    fetchRewards();
  };

  return {
    rewards,
    loading,
    error,
    retry,
    refresh,
    retryCount
  };
};

export default useRewards;