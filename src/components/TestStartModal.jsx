import { useState } from 'react';
import {
  FaPlay,
  FaDesktop,
  FaTimes,
  FaExpand,
  FaSchool,
  FaList,
} from 'react-icons/fa';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Trophy,
  CheckCircle2,
  Zap,
  Info,
  Calendar
} from 'lucide-react';

const TestStartModal = ({
  isOpen,
  onClose,
  onConfirm,
  test = {},
  pattern = {},
  exam = {},
  category = {}
}) => {
  const [acceptedRules, setAcceptedRules] = useState(false);

  if (!isOpen) return null;

  const durationText = test?.duration || pattern?.duration
    ? `${test?.duration || pattern?.duration} mins`
    : 'N/A';

  const examTitle = exam?.name || 'Exam';
  const categoryName = category?.name || 'Category';
  const testTitle = test?.title || 'Practice Quest';
  const sections = pattern?.sections || [];

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 font-outfit">
      <div className="bg-background-surface rounded-[2.5rem] p-4 lg:p-8 xl:p-10 max-w-lg w-full shadow-2xl border-2 border-b-8 border-border-primary max-h-[90vh] overflow-y-auto scrollbar-none animate-bounce-in">
        <div className="text-center">
          {/* Header */}
          <div className="w-10 lg:w-20 h-10 lg:h-20 bg-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-duo-secondary border-4 border-white dark:border-slate-700">
            <FaSchool className="text-white text-xl lg:text-3xl" />
          </div>

          <h2 className="text-md md:text-xl lg:text-3xl font-black text-content-primary mb-3 lg:mb-6 uppercase tracking-tighter">
            Exam <span className="text-primary-600">Practice</span>
          </h2>

          {/* Test Info */}
          <div className="bg-background-surface-secondary rounded-[1rem] lg:rounded-[2rem] p-3 lg:p-6 mb-3 lg:mb-6 border-2 border-border-primary/50 shadow-inner">
            <h3 className="text-content-primary text-sm lg:text-md mb-3 lg:mb-6 uppercase font-black tracking-widest leading-relaxed text-center px-2">
              {testTitle}
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest text-center">{categoryName}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest text-center">{examTitle}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest text-center">{durationText}</span>
              </div>
              {pattern?.totalMarks && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black text-content-secondary uppercase tracking-widest text-center">{pattern.totalMarks} Marks</span>
                </div>
              )}
            </div>
          </div>

          {/* Sections Preview */}
          {sections.length > 0 && (
            <div className="bg-white dark:bg-slate-800/30 rounded-[1rem] lg:rounded-[2rem] p-3 lg:p-6 mb-3 lg:mb-6 border-2 border-slate-200/50 dark:border-slate-700/30">
              <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] mb-6 text-center flex items-center justify-center gap-2">
                <FaList className="w-3 h-3" />
                Exam Stages ({sections.length})
              </h4>
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-slate-100 dark:border-slate-700 text-left group hover:border-primary-500/50 transition-all"
                  >
                    <p className="text-sm font-black text-content-primary uppercase tracking-widest leading-none mb-2">
                      {section.name}
                    </p>
                    <div className="flex gap-4 text-[9px] font-black text-content-secondary uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary-500" /> {section.totalQuestions} Questions</span>
                      <span className="flex items-center gap-1 opacity-50"><Trophy className="w-3 h-3" /> {section.marksPerQuestion * section.totalQuestions} Mks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Rules */}
          <div className="bg-background-surface-secondary rounded-[2rem] p-6 mb-8 border-2 border-border-primary/50 shadow-inner">
            <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-4 text-center">
              Mission Directives
            </h4>
            <ul className="text-[10px] font-black text-content-secondary dark:text-slate-500 uppercase tracking-widest space-y-3 text-left">
              {[
                "Enable fullscreen for full focus",
                "Submit all answers in one session",
                "Leaving early will auto-submit answers",
                pattern?.negativeMarking > 0 ? `Negative Marking: -${pattern.negativeMarking} Marks` : null
              ].filter(Boolean).map((rule, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full shadow-duo" />
                  <span className="leading-tight">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-100 dark:bg-slate-800/30 p-6 rounded-[2rem] border-2 border-b-8 border-slate-200/50 dark:border-slate-700/30 mb-8 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all group">
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 rounded-2xl appearance-none checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer shadow-duo"
                />
                {acceptedRules && (
                  <CheckCircle2 className="absolute inset-0 m-auto text-white w-6 h-6 pointer-events-none" />
                )}
              </div>
              <span className="text-[11px] lg:text-xs font-black text-content-primary uppercase tracking-widest text-left leading-relaxed">
                I agree to follow the quest directives
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-5 bg-slate-100 dark:bg-slate-800 text-content-secondary rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest shadow-duo border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:translate-y-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!acceptedRules}
              className={`flex-[2] px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all border-4 ${acceptedRules
                ? 'bg-primary-500 text-white border-white/20 shadow-duo-primary border-b-[8px] border-primary-700 active:translate-y-2 active:border-b-0'
                : 'bg-slate-200 dark:bg-slate-700 text-content-secondary border-slate-300 dark:border-slate-600 cursor-not-allowed opacity-50'
                }`}
            >
              Start Quest
            </button>
          </div>

          {!acceptedRules && (
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] mt-6 text-center">
              Authorization required to proceed
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestStartModal;


