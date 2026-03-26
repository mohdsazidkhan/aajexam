import React from 'react';
import { useRouter } from 'next/router';
import { FaHeart, FaShareAlt, FaEye, FaCheck, FaTimes, FaReply } from 'react-icons/fa';

const PublicQuestionsList = ({ items = [], onAnswer, onLike, onShare, onView, startIndex = 0 }) => {
  const router = useRouter();

  const timeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase() || 'U';
  };

  const isCurrentUser = (userId) => {
    try {
      const current = JSON.parse(localStorage.getItem('user'));
      return current?._id === userId;
    } catch {
      return false;
    }
  };

  const handleUserClick = (username) => {
    if (username) {
      router.push(`/u/${username}`);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">No questions found</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
      {items.map((row, idx) => {
        const user = row.userId || {};
        const serialNumber = startIndex + idx + 1;
        return (
          <div key={row._id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3" onClick={() => handleUserClick(user.username)}>
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-red-500 text-white flex items-center justify-center font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.name || 'Unknown User'}
                    {user._id && isCurrentUser(user._id) && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">You</span>
                    )}
                  </div>
                  {user.username && (
                    <button

                      className="text-xs font-semibold text-orange-700 dark:text-yellow-400 hover:underline cursor-pointer"
                    >
                      @{user.username}
                    </button>
                  )}
                  <div className="text-xs text-gray-500 dark:text-gray-400">{user.monthlyProgress?.levelName || 'Starter'}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Posted {timeAgo(row.createdAt)}</div>
            </div>

            <div className="mt-3 text-base font-medium text-gray-900 dark:text-white">
              <span className="text-orange-700 dark:text-yellow-500 font-bold mr-2">#{serialNumber}.</span>
              {row.questionText}
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {row.options.map((opt, idx) => {
                const isSelected = typeof row.selectedOptionIndex === 'number' && row.selectedOptionIndex === idx;
                const isCorrect = idx === row.correctAnswer;
                const isWrong = isSelected && !isCorrect;
                const answered = typeof row.selectedOptionIndex === 'number';
                const showFeedback = answered && isSelected;
                const showCorrectAnswer = answered && !isSelected && isCorrect; // Show correct answer even if not selected

                let buttonClasses = 'w-full sm:w-auto px-3 py-2 rounded-lg text-sm text-left border flex items-center justify-between';
                let textColor = 'text-gray-900 dark:text-gray-100';
                let backgroundColor = 'bg-white dark:bg-gray-800';
                let borderColor = 'border-gray-300 dark:border-gray-700';

                if (showFeedback) {
                  if (isCorrect) {
                    backgroundColor = 'bg-green-500';
                    borderColor = 'border-green-600';
                    textColor = 'text-white';
                  } else if (isWrong) {
                    backgroundColor = 'bg-red-500';
                    borderColor = 'border-red-600';
                    textColor = 'text-white';
                  }
                } else if (showCorrectAnswer) {
                  // Show correct answer in green even if not selected
                  backgroundColor = 'bg-green-500';
                  borderColor = 'border-green-600';
                  textColor = 'text-white';
                } else if (isSelected) {
                  backgroundColor = 'bg-blue-50 dark:bg-blue-900/20';
                  borderColor = 'border-blue-500';
                  textColor = 'text-blue-700 dark:text-blue-300';
                }

                if (answered && !isSelected && !isCorrect) {
                  buttonClasses += ' opacity-60 cursor-not-allowed';
                } else if (!answered) {
                  buttonClasses += ' hover:bg-blue-50 dark:hover:bg-gray-700';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => onAnswer(row, idx)}
                    disabled={answered}
                    className={`${buttonClasses} ${backgroundColor} ${textColor} ${borderColor}`}
                  >
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                      <span>{opt}</span>
                    </div>
                    {(showFeedback || showCorrectAnswer) && (
                      <div className="ml-2">
                        {isCorrect && <FaCheck className="text-white" />}
                        {isWrong && <FaTimes className="text-white" />}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex justify-between items-center gap-4">
              <button onClick={() => onLike(row)} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-red-600">
                <FaHeart /> <span className="text-sm">{row.likesCount || 0}</span>
              </button>
              <button onClick={() => onShare(row)} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-blue-600">
                <FaShareAlt /> <span className="text-sm">{row.sharesCount || 0}</span>
              </button>
              <div className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <FaReply /> <span className="text-sm">{row.answersCount || 0}</span>
              </div>
              <button onClick={() => onView(row)} className="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <FaEye /> <span className="text-sm">{row.viewsCount || 0}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PublicQuestionsList;

