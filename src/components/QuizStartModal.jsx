import { useState } from 'react';
import {
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaDesktop,
  FaTimes,
  FaExpand,
  FaCheckCircle
} from 'react-icons/fa';

const QuizStartModal = ({
  isOpen,
  onClose,
  onConfirm,
  quiz = {}
}) => {
  const [acceptedFullscreen, setAcceptedFullscreen] = useState(false);
  const [competitionType, setCompetitionType] = useState('daily');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl border border-primary-200 dark:border-primary-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        <div className="text-center">
          {/* Header */}
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FaPlay className="text-white text-xl" />
          </div>

          <h2 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Start Quiz?
          </h2>

          {/* Quiz Info */}
          {quiz.title && (
            <div className="bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20 rounded-xl p-2 md:p-4 mb-2 border border-primary-200 dark:border-primary-600">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                {quiz.title}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {quiz.questions && (
                  <div className="flex items-center justify-center space-x-2">
                    <FaQuestionCircle className="text-primary-500" />
                    <span>{quiz.questions.length} Questions</span>
                  </div>
                )}
                {quiz.timeLimit && (
                  <div className="flex items-center justify-center space-x-2">
                    <FaClock className="text-green-500" />
                    <span>{quiz.timeLimit} minutes time limit</span>
                  </div>
                )}
                {quiz.category && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-red-500">📚</span>
                    <span>{quiz.category.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Competition Choice */}
          <div className="bg-gradient-to-r from-secondary-50 to-purple-50 dark:from-secondary-900/20 dark:to-purple-900/20 rounded-xl p-3 md:p-4 mb-2 border border-secondary-200 dark:border-secondary-700">
            <h4 className="font-semibold text-secondary-800 dark:text-secondary-200 mb-2 text-left flex items-center">
              <span className="mr-2">🏆</span> Select Competition Type
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCompetitionType(type)}
                  className={`py-2 px-1 rounded-lg text-xs font-bold transition-all duration-300 border-2 ${competitionType === type
                    ? 'bg-secondary-600 text-white border-secondary-600 scale-105 shadow-md'
                    : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-secondary-600 dark:text-secondary-400 mt-2 text-left italic">
              * Progress will be tracked for the selected period
            </p>
          </div>

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl p-2 md:p-4 mb-2 border border-primary-200 dark:border-primary-600">
            <div className="flex items-start space-x-3">
              <div className="text-left">
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1 pl-0">
                  <li>• Quiz will open in fullscreen mode</li>
                  <li>• You must complete the quiz in one session</li>
                  <li>• Exiting fullscreen will submit your quiz</li>
                  <li>• Browser back/refresh will submit the quiz</li>
                  <li>• Make sure you have a stable internet connection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Fullscreen Permission */}
          <div className="bg-gradient-to-r from-secondary-50 from-red-50 dark:from-secondary-900/20 dark:from-red-900/20 rounded-xl p-4 mb-4 border-2 border-secondary-300 dark:border-secondary-600">
            <div className="flex items-start space-x-3 mb-1 lg:mb-3">
              <FaExpand className="text-secondary-600 dark:text-secondary-400 text-xl mt-1 flex-shrink-0" />
              <div className="text-left flex-1">
                <h4 className="font-semibold text-secondary-800 dark:text-secondary-200 mb-1">
                  Fullscreen Required
                </h4>
              </div>
            </div>

            {/* Checkbox */}
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={acceptedFullscreen}
                  onChange={(e) => setAcceptedFullscreen(e.target.checked)}
                  className="w-6 h-6 text-secondary-600 border-2 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-secondary-500 cursor-pointer"
                />
                {acceptedFullscreen && (
                  <FaCheckCircle className="absolute -top-1 -right-1 text-green-500 text-sm" />
                )}
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-white group-hover:text-secondary-600 dark:group-hover:text-secondary-400 transition-colors">
                I agree to start in fullscreen
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-xl transition-colors duration-300 flex items-center justify-center space-x-2"
            >
              <FaTimes className="text-sm" />
              <span>Cancel</span>
            </button>
            <button
              onClick={() => onConfirm(competitionType)}
              disabled={!acceptedFullscreen}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${acceptedFullscreen
                ? 'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white transform hover:scale-105 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
            >
              <FaPlay className="text-sm" />
              <span>Start Quiz</span>
            </button>
          </div>

          {/* Helper Text */}
          {!acceptedFullscreen && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Please accept fullscreen permission to start the quiz
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizStartModal;
