import { useState } from 'react';
import {
  FaPlay,
  FaClock,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaDesktop,
  FaTimes,
  FaExpand,
  FaCheckCircle,
  FaSchool,
  FaList,
  FaTrophy
} from 'react-icons/fa';

const TestStartModal = ({
  isOpen,
  onClose,
  onConfirm,
  test = {},
  pattern = {},
  exam = {},
  category = {}
}) => {
  const [acceptedFullscreen, setAcceptedFullscreen] = useState(false);

  if (!isOpen) return null;

  const durationText = test?.duration || pattern?.duration
    ? `${test?.duration || pattern?.duration} minutes`
    : 'Duration not specified';

  const examTitle = exam?.title || 'Exam';
  const categoryName = category?.name || 'Category';
  const testTitle = test?.title || 'Practice Test';
  const sections = pattern?.sections || [];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 md:p-4 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-primary-200 dark:border-primary-700">
        <div className="text-center">
          {/* Header */}
          <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <FaSchool className="text-white text-xl" />
          </div>

          <h2 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Start Mock Test?
          </h2>

          {/* Test Info */}
          <div className="bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20 rounded-xl p-2 md:p-4 mb-2 border border-primary-200 dark:border-primary-600">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-3 text-left">
              {testTitle}
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 text-left">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">📚</span>
                <span>Category: {categoryName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaSchool className="text-secondary-500" />
                <span>Exam: {examTitle}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaClock className="text-green-500" />
                <span>Duration: {durationText}</span>
              </div>
              {pattern?.totalMarks && (
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-primary-500" />
                  <span>Total Marks: {pattern.totalMarks}</span>
                </div>
              )}
              {test?.questions?.length && (
                <div className="flex items-center space-x-2">
                  <FaQuestionCircle className="text-primary-500" />
                  <span>Questions: {test.questions.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sections */}
          {sections.length > 0 && (
            <div className="bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20 rounded-xl p-2 md:p-4 mb-2 border border-secondary-200 dark:border-secondary-600">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-3 text-left flex items-center gap-2">
                <FaList className="text-secondary-500" />
                Sections ({sections.length})
              </h4>
              <div className="space-y-3 text-left">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className={`pb-3 ${index < sections.length - 1 ? 'border-b border-gray-300 dark:border-gray-600' : ''}`}
                  >
                    <p className="font-semibold text-gray-800 dark:text-white text-sm mb-1">
                      {section.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Questions: {section.totalQuestions} | Marks: {section.marksPerQuestion} per question
                    </p>
                    {section.negativePerQuestion > 0 && (
                      <p className="text-xs text-primary-600 dark:text-red-400 mt-1">
                        Negative Marking: -{section.negativePerQuestion} per wrong answer
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-xl p-2 md:p-4 mb-2 border border-primary-200 dark:border-primary-600">
            <div className="flex items-start space-x-3">
              <div className="text-left">
                <h4 className="font-semibold text-primary-800 dark:text-primary-200 mb-2">
                  Important Information
                </h4>
                <ul className="text-sm text-primary-700 dark:text-primary-300 space-y-1 pl-0">
                  <li>• Test will open in fullscreen mode</li>
                  <li>• You must complete the test in one session</li>
                  <li>• Exiting fullscreen will submit your test</li>
                  <li>• Browser back/refresh will submit the test</li>
                  <li>• Make sure you have a stable internet connection</li>
                  {pattern?.negativeMarking > 0 && (
                    <li className="text-primary-600 dark:text-red-400">
                      • Negative marking: -{pattern.negativeMarking} per wrong answer
                    </li>
                  )}
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
                <p className="text-sm text-secondary-700 dark:text-secondary-300 mb-3">
                  This test requires fullscreen mode for a distraction-free experience. Please allow fullscreen permission to continue.
                </p>
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
                I agree to start the test in fullscreen mode
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
              onClick={onConfirm}
              disabled={!acceptedFullscreen}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 ${acceptedFullscreen
                ? 'bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white transform hover:scale-105 cursor-pointer'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed opacity-50'
                }`}
            >
              <FaPlay className="text-sm" />
              <span>Start Test</span>
            </button>
          </div>

          {/* Helper Text */}
          {!acceptedFullscreen && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
              Please accept fullscreen permission to start the test
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestStartModal;

