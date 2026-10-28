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
  Calendar,
  Lock,
  Crown
} from 'lucide-react';
import { getCurrentUser } from '../../lib/utils/authUtils';
import { ProBadge } from '../common/ui';
import useTranslate from '../../hooks/useTranslate';

const TestStartModal = ({
  isOpen,
  onClose,
  onConfirm,
  test: testProp,
  pattern: patternProp,
  exam: examProp,
  category: categoryProp
}) => {
  const { translate, rich, translateData } = useTranslate();
  // Props may arrive as null (defaults only cover undefined)
  const test = testProp || {};
  const pattern = patternProp || {};
  const exam = examProp || {};
  const category = categoryProp || {};
  const [acceptedRules, setAcceptedRules] = useState(false);

  if (!isOpen) return null;

  const durationText = test?.duration || pattern?.duration
    ? `${test?.duration || pattern?.duration} mins`
    : 'N/A';

  const examTitle = exam?.name || 'Exam';
  const categoryName = category?.name || 'Category';
  const testTitle = test?.title || 'Practice Test';
  const sections = pattern?.sections || [];

  return (
    <div className="fixed inset-0 bg-slate-950/40 flex items-end sm:items-center justify-center z-[9999] p-2 sm:p-4 font-outfit">
      <div className="relative bg-background-surface p-4 sm:p-6 xl:p-10 max-w-lg w-full border border-border-primary max-h-[92vh] overflow-y-auto scrollbar-none animate-bounce-in" style={{ maxHeight: '92dvh', borderRadius: 'var(--radius)' }}>
        <div className="text-center">
          {/* Header */}
          <div className="w-10 xl:w-20 h-10 xl:h-20 text-primary-600 flex items-center justify-center mx-auto mb-6 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
            <FaSchool className="text-xl xl:text-3xl" />
          </div>

          <h2 className="text-md md:text-xl xl:text-2xl font-bold text-content-primary mb-3 xl:mb-6 tracking-tight">
            {rich('Exam <0>Practice</0>', [(c) => <span className="text-primary-600">{c}</span>])}
          </h2>

          {/* Test Info */}
          <section className="dark:bg-background-surface-secondary p-3 xl:p-6 mb-3 xl:mb-6 border border-dashed border-primary-300 dark:border-slate-700" style={{ borderRadius: 'var(--radius)' }}>
            <h3 className="text-content-primary text-sm xl:text-md mb-3 xl:mb-6 uppercase font-bold tracking-[0.08em] leading-relaxed text-center px-2 break-words">
              {translateData(testTitle)}
            </h3>

            {/* Subscription Info */}
            <div className="mb-4">
              {test.isPYQ ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ProBadge size="sm" />
                  <span className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em]">
                    {(test.isLastYear || test.isFree || (test.accessLevel || '').toUpperCase() === 'FREE') ? translate('FREE PAPER') : translate('PRO ONLY PAPERS')}
                  </span>
                </div>
              ) : ((test.accessLevel || '').toUpperCase() === 'PRO' || test.type === 'full_mock') && (
                <div className="flex flex-col items-center gap-2 mb-2">
                   <div className="flex items-center gap-2">
                     <ProBadge size="sm" />
                     <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em]">
                       {getCurrentUser()?.fullMockAttemptCount === 0 ? translate('FIRST MOCK IS FREE!') : translate('PRO ONLY TEST')}
                     </span>
                   </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] text-center">{translateData(categoryName)}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] text-center">{translateData(examTitle)}</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] text-center">{durationText}</span>
              </div>
              {pattern?.totalMarks && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] text-center">{translate('{count} Marks', { count: pattern.totalMarks })}</span>
                </div>
              )}
              {pattern?.negativeMarking > 0 ? (
                <div className="flex flex-col items-center gap-2 col-span-2">
                  <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                    <Info className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em] text-center">
                    {translate('Negative Marking: -{marks} per wrong answer', { marks: pattern.negativeMarking })}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 col-span-2">
                  <div className="w-10 h-10 text-primary-600 rounded-md xl:rounded-md flex items-center justify-center border border-primary-600">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] text-center">
                    {translate('No Negative Marking')}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Sections Preview */}
          {sections.length > 0 && (
            <div className="bg-background-surface p-3 xl:p-6 mb-3 xl:mb-6 border border-border-primary" style={{ borderRadius: 'var(--radius)' }}>
              <h4 className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-6 text-center flex items-center justify-center gap-2">
                <FaList className="w-3 h-3" />
                Exam Stages ({sections.length})
              </h4>
              <div className="space-y-3">
                {sections.map((section, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl border border-border-primary text-left group hover:border-primary-500/50 transition-all"
                  >
                    <p className="text-sm font-bold text-content-primary uppercase tracking-[0.08em] leading-none mb-2">
                      {section.name}
                    </p>
                    <div className="flex gap-4 text-[9px] font-bold text-content-secondary uppercase tracking-[0.1em]">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary-600" /> {translate('{count} Questions', { count: section.totalQuestions })}</span>
                      <span className="flex items-center gap-1 opacity-50"><Trophy className="w-3 h-3" /> {translate('{count} Mks', { count: section.marksPerQuestion * section.totalQuestions })}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Rules */}
          <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-8 border border-border-primary">
            <h4 className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.08em] mb-4 text-center">
              {translate('Test Instructions')}
            </h4>
            <ul className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] space-y-3 text-left">
              {[
                "Enable fullscreen for full focus",
                "Switch between English and Hindi anytime",
                "Submit all answers in one session",
                "Leaving early will auto-submit answers",
                pattern?.negativeMarking > 0 ? translate('Negative Marking: -{marks} Marks', { marks: pattern.negativeMarking }) : null
              ].filter(Boolean).map((rule, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 shrink-0 bg-primary-600 rounded-full" />
                  <span className="leading-tight">{translate(rule)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-border-primary mb-4 sm:mb-8 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-all group">
            <label className="flex items-center gap-3 sm:gap-4 cursor-pointer">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  checked={acceptedRules}
                  onChange={(e) => setAcceptedRules(e.target.checked)}
                  className="w-8 h-8 sm:w-10 sm:h-10 border border-border-primary rounded-xl sm:rounded-2xl appearance-none checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                />
                {acceptedRules && (
                  <CheckCircle2 className="absolute inset-0 m-auto text-white w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
                )}
              </div>
              <span className="text-[11px] xl:text-xs font-bold text-content-primary uppercase tracking-[0.08em] text-left leading-relaxed">
                {translate('I have read and agree to the test instructions')}
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sm:gap-4 sticky bottom-0 -mx-4 sm:mx-0 px-4 sm:px-0 pt-3 pb-1 bg-background-surface">
            <button
              onClick={onClose}
              className="flex-1 px-4 sm:px-6 py-4 sm:py-5 text-content-secondary rounded-2xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] border border-border-primary hover:bg-background-surface-secondary transition-all active:translate-y-1"
            >
              {translate('Cancel')}
            </button>
            <button
              onClick={() => onConfirm()}
              disabled={!acceptedRules}
              className={`flex-[2] px-5 sm:px-8 py-4 sm:py-5 rounded-2xl sm:rounded-2xl text-[10px] font-bold uppercase tracking-[0.08em] transition-all border ${acceptedRules
                ? 'text-on-primary border-primary-300 hover:brightness-105 active:translate-y-0.5 bg-primary-600'
                : 'bg-background-surface-secondary text-content-secondary border-border-primary dark:border-slate-600 cursor-not-allowed opacity-50'
                }`}
            >
              {translate('Start Test')}
            </button>
          </div>

          {!acceptedRules && (
            <p className="text-[9px] font-bold text-content-muted uppercase tracking-[0.1em] mt-3 sm:mt-6 text-center">
              {translate('Please accept the instructions to continue')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestStartModal;


