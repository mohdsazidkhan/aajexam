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
    <div className="space-y-6 font-outfit">
      {/* Level Completion Status */}
      {isCompleted && (
        <div className="bg-white dark:bg-slate-800 border-2 border-b-8 border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 shadow-xl">
          <h3 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
            <span className="text-3xl">Ã°Å¸Å½â€°</span> Mission {level} Accomplished!
          </h3>

          {/* Show reward status if applicable */}
          {rewardStatus && (
            <div className="mb-6">
              <RewardBadge level={level} status={rewardStatus} />
            </div>
          )}

          {/* Show monthly reward info */}
          {rewardStatus === 'monthly' && (
            <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
              <p>You're eligible for monthly rewards! Maintain your status with Ã¢â€°Â¥{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% accuracy to win from the collective prize pool.</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz Progress */}
      {quizProgress && (
        <div className="bg-white dark:bg-slate-800 border-2 border-b-8 border-slate-100 dark:border-slate-700 rounded-[2rem] p-8 shadow-xl">
          <h4 className="text-[10px] font-black text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6">Mission Progress</h4>
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-widest">
              {quizProgress.current} / {quizProgress.required} Missions
            </span>
            <span className="text-[10px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">
              {Math.round(quizProgress.percentage)}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-2xl h-4 shadow-inner border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
            <div
              className="bg-primary-500 h-full rounded-2xl transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_0_15px_rgba(239,68,68,0.4)]"
              style={{ width: `${quizProgress.percentage}%` }}
            ></div>
          </div>

          {/* Show unlock status */}
          {canUnlockRewards() && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest text-center border-2 border-green-100 dark:border-green-800">
              Requirements Met! Unlock Now
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Position */}
      {leaderboardPosition && leaderboardPosition <= 3 && (
        <div className="bg-primary-500 text-white rounded-[2rem] p-8 shadow-duo-secondary border-2 border-white dark:border-slate-700">
          <h4 className="text-md md:text-xl lg:text-2xl font-black mb-4 uppercase tracking-tighter flex items-center gap-3">
            <span className="text-3xl">Ã°Å¸Ââ€ </span> Rank {leaderboardPosition}!
          </h4>

          <p className="text-[10px] font-black text-white/80 uppercase tracking-widest leading-loose">
            You're among the legends! Maintain this status to win from the collective prize pool.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={fetchRewards}
          className="flex-1 px-8 py-5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-duo border-2 border-slate-200 dark:border-slate-600 active:translate-y-1 transition-all"
        >
          Check Mission Status
        </button>

        {canUnlockRewards() && (
          <button
            onClick={() => {
              console.log('Unlocking rewards...');
            }}
            className="flex-1 px-8 py-5 bg-primary-500 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-duo-primary active:translate-y-1 transition-all"
          >
            Unlock Mission Reward
          </button>
        )}
      </div>
    </div>
  );
};

export default RewardsIntegration;





