import { useState } from 'react';
import {
  FaPlay,
  FaCheckCircle
} from 'react-icons/fa';
import { HelpCircle, Clock, BookOpen } from 'lucide-react';

const QuizStartModal = ({
  isOpen,
  onClose,
  onConfirm,
  quiz = {}
}) => {
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [competitionType, setCompetitionType] = useState('daily');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-outfit">
      <div className="bg-background-surface rounded-[2.5rem] p-4 lg:p-8 xl:p-10 max-w-lg w-full shadow-2xl border-2 border-b-8 border-border-primary max-h-[90vh] overflow-y-auto scrollbar-none animate-bounce-in">
        <div className="text-center">
          {/* Header */}
          <div className="w-10 lg:w-20 h-10 lg:h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-duo-primary border-4 border-white dark:border-slate-700">
            <FaPlay className="text-white text-xl lg:text-3xl ml-1" />
          </div>

          <h2 className="text-md md:text-xl lg:text-3xl font-black text-content-primary mb-6 uppercase tracking-tighter">
            Ready to <span className="text-primary-600">Practice?</span>
          </h2>

          {/* Quiz Info */}
          {quiz.title && (
            <div className="bg-background-surface-secondary rounded-[2.5rem] p-6 lg:p-8 mb-6 lg:mb-8 border-4 border-border-primary/50 shadow-inner group">
              <h3 className="text-base font-black text-slate-800 dark:text-white mb-6 uppercase tracking-tight leading-tight group-hover:text-primary-600 transition-colors">
                {quiz.title}
              </h3>
              <div className="grid grid-cols-3 gap-3 lg:gap-4">
                <div className="flex flex-col items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                  <HelpCircle className="w-5 h-5 lg:w-6 lg:h-6 text-primary-500" />
                  <span className="text-[8px] font-black text-content-secondary uppercase tracking-widest leading-none">{quiz.questionsCount || quiz.questionCount || quiz.totalQuestions || (quiz.questions ? quiz.questions.length : 0)} Questions</span>
                </div>
                <div className="flex flex-col items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                  <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-secondary-500" />
                  <span className="text-[8px] font-black text-content-secondary uppercase tracking-widest leading-none">{quiz.timeLimit} Minutes</span>
                </div>
                <div className="flex flex-col items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white dark:bg-slate-800/50 rounded-2xl border-2 border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                  <BookOpen className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-500" />
                  <span className="text-[8px] font-black text-content-secondary uppercase tracking-widest leading-none">Course</span>
                </div>
              </div>
            </div>
          )}

          {/* Quiz Mode Choice */}
          <div className="bg-white dark:bg-slate-800/30 rounded-[1rem] lg:rounded-[2rem] p-3 lg:p-6 mb-3 lg:mb-6 border-2 border-slate-200/50 dark:border-slate-700/30">
            <h4 className="text-[10px] font-black text-content-secondary uppercase tracking-[0.3em] mb-4 text-center">
              Choose Quiz Mode
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {['daily', 'weekly', 'monthly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setCompetitionType(type)}
                  className={`py-3 px-1 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2 ${competitionType === type
                    ? 'bg-primary-500 text-white border-white dark:border-slate-700 shadow-duo-secondary scale-105 active:translate-y-1'
                    : 'bg-white dark:bg-slate-800 text-content-secondary border-slate-100 dark:border-slate-700'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Important Rules */}
          <div className="bg-background-surface-secondary rounded-[2.5rem] p-6 lg:p-8 mb-6 lg:mb-8 border-4 border-border-primary/50 shadow-inner">
            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-3">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
              Quiz Rules
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
            </h4>
            <div className="space-y-4">
              {[
                "Enable fullscreen for concentration",
                "Try to answer all questions in one go",
                "Exiting will submit your answers",
                "Refreshing will submit your current progress"
              ].map((rule, idx) => (
                <div key={idx} className="flex items-center gap-4 text-[10px] font-black text-content-secondary dark:text-slate-500 uppercase tracking-widest text-left group/rule">
                  <div className="w-6 h-6 shrink-0 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center border-2 border-slate-100 dark:border-slate-700 shadow-sm group-hover/rule:border-primary-500 transition-colors">
                    <span className="text-primary-600 text-[8px] font-black">{idx + 1}</span>
                  </div>
                  {rule}
                </div>
              ))}
            </div>
          </div>

          {/* Permission Checkbox */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-b-8 border-slate-100 dark:border-slate-800 mb-8">
            <label className="flex items-center gap-4 cursor-pointer group">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 rounded-2xl appearance-none checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer shadow-duo"
                />
                {acceptedRules && (
                  <FaCheckCircle className="absolute inset-0 m-auto text-white text-xl pointer-events-none" />
                )}
              </div>
              <span className="text-content-primary uppercase tracking-widest text-left leading-relaxed text-xs font-black">
                I understand and agree to the rules
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-5 bg-slate-50 dark:bg-slate-800 text-content-secondary rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-duo border-2 border-b-4 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all active:translate-y-1"
            >
              Close
            </button>
            <button
              onClick={() => onConfirm(competitionType)}
              disabled={!acceptedRules}
              className={`flex-[2] px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-4 ${acceptedRules
                ? 'bg-primary-500 text-white border-white/20 shadow-duo-primary border-b-[8px] border-primary-700 active:translate-y-2 active:border-b-0'
                : 'bg-slate-200 dark:bg-slate-700 text-content-secondary border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
                }`}
            >
              Start Quiz
            </button>
          </div>

          {/* Helper Text */}
          {!acceptedRules && (
            <p className="text-xs text-slate-700 dark:text-gray-400 mt-3 text-center font-bold">
              Please accept the rules to start the quiz
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizStartModal;
