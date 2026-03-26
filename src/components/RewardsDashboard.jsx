import React, { useState, useEffect } from "react";
import config from '../lib/config/appConfig';
import API from "../lib/api";
import { toast } from "react-hot-toast";
import MonthlyRewardsInfo from "./MonthlyRewardsInfo";
import Loading from "./Loading";

const RewardsDashboard = () => {
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState(null);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [activeProUsers, setActiveProUsers] = useState(null);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);
      const [profile, rewardInfo] = await Promise.all([
        API.getProfile(),
        API.getMonthlyRewardInfo().catch(() => null) // non-blocking
      ]);

      if (!profile || typeof profile !== "object") {
        throw new Error("Invalid response format from server");
      }

      // Set dynamic reward distribution from API
      if (rewardInfo?.success && rewardInfo?.data?.rewardDistribution) {
        setTotalPrizePool(rewardInfo.data.totalPrizePool || 0);
        setActiveProUsers(rewardInfo.data.activeProUsers ?? null);
      }

      const dailyWins = profile?.user?.dailyProgress?.highScoreWins || 0;
      const weeklyWins = profile?.user?.weeklyProgress?.highScoreWins || 0;
      const monthlyWins = profile?.user?.monthlyProgress?.highScoreWins || 0;

      const dailyReq = config.QUIZ_CONFIG.DAILY_REWARD_QUIZ_REQUIREMENT || 5;
      const weeklyReq = config.QUIZ_CONFIG.WEEKLY_REWARD_QUIZ_REQUIREMENT || 20;
      const monthlyReq = config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50;

      const dailyPerc = Math.min(100, Math.round((dailyWins / dailyReq) * 100));
      const weeklyPerc = Math.min(100, Math.round((weeklyWins / weeklyReq) * 100));
      const monthlyPerc = Math.min(100, Math.round((monthlyWins / monthlyReq) * 100));

      setRewards({
        claimableRewards: profile?.user?.claimableRewards || 0,
        dailyProgress: { current: dailyWins, required: dailyReq, percentage: dailyPerc },
        weeklyProgress: { current: weeklyWins, required: weeklyReq, percentage: weeklyPerc },
        monthlyProgress: { current: monthlyWins, required: monthlyReq, percentage: monthlyPerc },
        canUnlockMonthly: Boolean(profile?.user?.monthlyProgress?.rewardEligible),
        unlocked: [],
        claimed: [],
      });
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setError(error.response?.data?.message || "Failed to fetch rewards");
      toast.error("Failed to fetch rewards. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!rewards?.claimableRewards || rewards.claimableRewards <= 0) {
      toast.error("No rewards available to claim");
      return;
    }

    try {
      setClaiming(true);
      const res = await API.claimRewards();
      if (res.success) {
        toast.success(res.message || "Successfully claimed rewards!");
        await fetchRewards(); // Refresh data
      } else {
        toast.error(res.message || "Failed to claim rewards");
      }
    } catch (error) {
      console.error("Claim Error:", error);
      toast.error(error.response?.data?.message || "Error claiming rewards");
    } finally {
      setClaiming(false);
    }
  };

  const handleWithdraw = async () => {
    toast("To withdraw your wallet balance, please visit your Profile or Wallet page.");
  };

  const claimReward = async () => {
    handleClaim();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4 sm:p-8">
        <Loading size="lg" color="blue" message="" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 sm:p-8">
        <div className="text-4xl sm:text-6xl mb-4">❌</div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">
          Error Loading Rewards
        </h3>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
          {error}
        </p>
        <button
          onClick={fetchRewards}
          className="bg-secondary-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-secondary-700 transition-colors text-sm sm:text-base"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="text-center p-4 sm:p-8">
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Failed to load rewards
        </p>
      </div>
    );
  }

  // Safely destructure with fallbacks
  const {
    unlocked = [],
    claimed = [],
    claimableRewards = 0,
    dailyProgress,
    weeklyProgress,
    monthlyProgress,
    canUnlockMonthly = false,
  } = rewards || {};

  const ProgressSection = ({ title, progress, requirementText }) => (
    <div className="mb-6 last:mb-0">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
          {title}: {progress?.current || 0} / {progress?.required}
        </span>
        <span className="text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300">
          {Math.round(progress?.percentage || 0)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
        <div
          className={`${progress?.percentage >= 100 ? 'bg-green-500' : 'bg-secondary-600'} h-2 sm:h-2.5 rounded-full transition-all duration-300`}
          style={{
            width: `${Math.min(progress?.percentage || 0, 100)}%`,
          }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {requirementText}
      </p>
    </div>
  );

  return (
    <div className="container mx-auto py-4 px-4 lg:px-10">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-2 md:p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg sm:text-lg lg:text-2xl font-bold text-gray-800 dark:text-white mb-6 underline decoration-secondary-500 decoration-4 underline-offset-8">
          🏆 Rewards & Challenges
        </h2>

        {/* Progress Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <h3 className="font-bold mb-4 text-secondary-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-600"></span>
              Daily Challenge
            </h3>
            <ProgressSection
              title="Quizzes"
              progress={dailyProgress}
              requirementText={`Reach Daily Level ${config.QUIZ_CONFIG.DAILY_USER_LEVEL_REQUIRED} with ${dailyProgress.required} quizzes (${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+ accuracy)`}
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
            <h3 className="font-bold mb-4 text-purple-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              Weekly Challenge
            </h3>
            <ProgressSection
              title="Quizzes"
              progress={weeklyProgress}
              requirementText={`Reach Weekly Level ${config.QUIZ_CONFIG.WEEKLY_USER_LEVEL_REQUIRED} with ${weeklyProgress.required} quizzes (${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+ accuracy)`}
            />
          </div>

          <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 relative">
            <h3 className="font-bold mb-4 text-secondary-600 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-600"></span>
              Monthly Challenge
            </h3>
            <ProgressSection
              title="Quizzes"
              progress={monthlyProgress}
              requirementText={`Reach Level ${config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with ${monthlyProgress.required} quizzes (${config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+ accuracy)`}
            />
            {canUnlockMonthly && (
              <div className="absolute top-2 right-2 px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded uppercase">
                Qualified
              </div>
            )}
          </div>
        </div>

        {/* Claimable Rewards */}
        {claimableRewards > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-md sm:text-lg font-semibold text-green-800 dark:text-green-300">
                  💰 Claimable Rewards
                </h3>
                <p className="text-green-600 dark:text-green-300 font-bold text-lg sm:text-xl">
                  ₹{claimableRewards.toLocaleString()}
                </p>
              </div>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors text-sm sm:text-base w-full sm:w-auto"
              >
                {claiming ? "Claiming..." : "Claim Rewards"}
              </button>
            </div>
          </div>
        )}


        {/* Unlocked Rewards */}
        {unlocked && unlocked.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
              ✅ Unlocked Rewards
            </h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {unlocked.map((reward, index) => (
                <div
                  key={reward?._id || `unlocked-${reward?.level}-${index}`}
                  className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-lg font-medium text-secondary-800 dark:text-secondary-300">
                      Level {reward?.level || "N/A"}
                    </span>
                    <span className="text-xs text-secondary-600 dark:text-secondary-400">
                      {reward?.dateUnlocked
                        ? new Date(reward.dateUnlocked).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-lg sm:text-lg lg:text-2xl font-bold text-secondary-700 dark:text-secondary-300 mb-3">
                    ₹{(reward?.amount || 0).toLocaleString()}
                  </p>
                  <button
                    onClick={() => claimReward(reward?._id)}
                    disabled={claiming || !reward?._id}
                    className="w-full bg-secondary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    {claiming ? "Claiming..." : "Claim Reward"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claimed Rewards */}
        {claimed && claimed.length > 0 && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
              🎉 Claimed Rewards
            </h3>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {claimed.map((reward, index) => (
                <div
                  key={reward?._id || `claimed-${reward?.level}-${index}`}
                  className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-lg font-medium text-gray-800 dark:text-gray-200">
                      Level {reward?.level || "N/A"}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {reward?.dateClaimed
                        ? new Date(reward.dateClaimed).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <p className="text-lg sm:text-lg lg:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                    ₹{(reward?.amount || 0).toLocaleString()}
                  </p>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ✓ Claimed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Rewards Message */}
        {(!unlocked || unlocked.length === 0) &&
          (!claimed || claimed.length === 0) && (
            <div className="text-center py-6 sm:py-8">
              <div className="text-4xl sm:text-6xl mb-4">🏆</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-2">
                No Rewards Yet
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Reach required levels and high-score quizzes to compete for daily, weekly, and monthly
                positions to earn from{' '}
                <strong>{totalPrizePool > 0 ? `₹${totalPrizePool.toLocaleString('en-IN')}` : activeProUsers ? `₹${(activeProUsers * config.QUIZ_CONFIG.PRIZE_PER_PRO).toLocaleString('en-IN')}` : 'dynamic prize pools'}</strong>!
              </p>
            </div>
          )}

        {/* Requirements Info */}
        <MonthlyRewardsInfo />

        <div className="relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 p-4 sm:p-6 lg:p-8 mt-6 shadow-sm">
          <div className="flex items-center justify-center gap-3">
            <div className="text-sm sm:text-base lg:text-lg font-semibold text-red-800 dark:text-red-100 space-y-3">
              <p>
                🏆 <strong>Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} winners</strong> receive{" "}
                <span className="text-primary-600 dark:text-red-300">
                  cash prizes
                </span>{" "}
                within <strong>7 days</strong> of result declaration.
              </p>
              <p>
                📣 Winners are <strong>publicly declared</strong> and prizes are
                directly transferred to their accounts.
              </p>
              <p>
                💳{" "}
                <span className="text-red-700 dark:text-red-300">
                  To receive cash rewards, you must{" "}
                  <strong>add your bank details</strong> once you reach{" "}
                  <strong>Level 10</strong>.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RewardsDashboard;



