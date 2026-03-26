import React from 'react';
import config from '../lib/config/appConfig';
import { useRewards } from '../hooks/useRewards';
import RewardBadge from './RewardBadge';
import { showMonthlyRewardNotification, showQuizProgressNotification } from './RewardNotification';

// Example integration component showing how to use rewards system
const RewardsIntegration = ({ userId, level, isCompleted, leaderboardPosition }) => {
  const {
    checkRewardStatus,
    getQuizProgress,
    canUnlockRewards,
    fetchRewards
  } = useRewards();

  // Check if user reached Level 10 and is eligible for monthly rewards
  React.useEffect(() => {
    if (isCompleted && level === 10) {
      const rewardStatus = checkRewardStatus(level);

      if (rewardStatus === 'monthly') {
        // Show notification for monthly reward eligibility
        showQuizProgressNotification(110, 110);
      }
    }
  }, [isCompleted, level, checkRewardStatus]);

  // Show quiz progress notifications
  React.useEffect(() => {
    const quizProgress = getQuizProgress();
    if (quizProgress) {
      showQuizProgressNotification(quizProgress.current, quizProgress.required);
    }
  }, [getQuizProgress]);

  // Get reward status for this level
  const rewardStatus = checkRewardStatus(level);
  const quizProgress = getQuizProgress();

  return (
    <div className="space-y-4">
      {/* Level Completion Status */}
      {isCompleted && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            🎉 Level {level} Completed!
          </h3>

          {/* Show reward status if applicable */}
          {rewardStatus && (
            <div className="mb-3">
              <RewardBadge level={level} status={rewardStatus} />
            </div>
          )}

          {/* Show monthly reward info */}
          {rewardStatus === 'monthly' && (
            <div className="text-sm text-green-700 dark:text-green-300">
              <p>🎉 You're eligible for monthly rewards! Maintain Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} position with ≥{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy to win from a dynamic prize pool (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO}).</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Progress */}
      {quizProgress && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">📚 Quiz Progress</h4>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {quizProgress.current} / {quizProgress.required} quizzes
            </span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {Math.round(quizProgress.percentage)}%
            </span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800/40 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${quizProgress.percentage}%` }}
            ></div>
          </div>

          {/* Show unlock status */}
          {canUnlockRewards() && (
            <div className="mt-2 text-sm text-green-700 font-medium">
              ✅ All requirements met! Rewards can be unlocked.
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Position */}
      {leaderboardPosition && leaderboardPosition <= 3 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            🏆 Top {leaderboardPosition} Position!
          </h4>

          {rewardStatus === 'monthly' && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              🏆 You're in Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS}! Maintain this position until month end to win from a dynamic prize pool (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO}).
            </p>
          )}

          {rewardStatus === 'unlocked' && (
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              Your reward is unlocked and ready to claim!
            </p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={fetchRewards}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh Rewards
        </button>

        {canUnlockRewards() && (
          <button
            onClick={() => {
              // This would trigger the unlock process
              console.log('Unlocking rewards...');
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Unlock Rewards
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardsIntegration;



