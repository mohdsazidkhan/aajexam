import { useState, useEffect } from 'react';
import { FaTimes, FaRocket, FaGift, FaCreditCard, FaShieldAlt, FaGraduationCap, FaBookOpen } from 'react-icons/fa';
import useTranslate from '../../hooks/useTranslate';

const SystemUpdateModal = ({ isOpen, onClose }) => {
  const { translate, rich } = useTranslate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("aajexam_platform_update_v2");
    if (isOpen && !seen) {
      setIsVisible(true);
      localStorage.setItem("aajexam_platform_update_v2", "true");
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 xl:p-4 font-outfit">
      <div
        className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-background-surface rounded-3xl max-w-4xl w-full max-h-[75vh] overflow-y-auto transition-all duration-500 transform border border-border-primary font-outfit scrollbar-none ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* HEADER */}
        <div className="bg-primary-600 text-on-primary p-4 xl:p-10 rounded-t-[2.5rem] border-b-2 border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-background-surface rounded-2xl flex items-center justify-center transform">
                <FaGraduationCap className="text-3xl text-primary-600" />
              </div>
              <section>
                <h2 className="text-xl xl:text-2xl font-bold tracking-tight">{translate('AajExam — Exam Focused!')}</h2>
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-primary-100 opacity-80 mt-1">{translate('Dedicated Exam Preparation Platform')}</p>
              </section>
            </div>
            <button aria-label={translate('Close')}
              onClick={handleClose}
              className="w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:translate-y-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 xl:p-10 space-y-8">

          {/* PLATFORM UPDATE */}
          <section className="border border-border-primary dark:border-white rounded-2xl p-6">
            <h3 className="text-sm xl:text-lg font-bold text-content-primary mb-2 flex items-center tracking-tight">
              <FaShieldAlt className="text-content-primary mr-2" /> Platform Update
            </h3>
            <p className="text-sm text-content-primary font-medium">
              {rich("AajExam is now <0>100% dedicated to Government Exam Preparation!</0> We've streamlined the platform to focus entirely on helping you crack your dream exam.", [(c) => <span className="font-bold">{c}</span>])}
            </p>
          </section>

          {/* WHAT'S NEW */}
          <section className="border border-primary-300 dark:border-primary-600 rounded-2xl p-6">
            <h3 className="text-sm xl:text-lg font-bold text-primary-600 mb-3 tracking-tight">
              {translate('✅ What\'s Available')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-bold text-primary-600 text-sm">{translate('Real Exam Patterns')}</p>
                  <p className="text-xs text-primary-600">{translate('SSC, UPSC, Banking, Railway & more')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-bold text-primary-600 text-sm">{translate('Full-Length Mock Tests')}</p>
                  <p className="text-xs text-primary-600">{translate('With section-wise analysis')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="font-bold text-primary-600 text-sm">{translate('Test Leaderboards')}</p>
                  <p className="text-xs text-primary-600">{translate('Compare your rank with others')}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">📈</span>
                <div>
                  <p className="font-bold text-primary-600 text-sm">{translate('Detailed Analytics')}</p>
                  <p className="text-xs text-primary-600">{translate('Track accuracy, speed & progress')}</p>
                </div>
              </div>
            </div>
          </section>

          {/* DATA SAFE NOTICE */}
          <section className="bg-primary-600 text-on-primary rounded-3xl p-6 border border-white dark:border-slate-700">
            <h3 className="text-sm xl:text-lg font-bold mb-2 flex items-center tracking-tight">
              <FaShieldAlt className="mr-3" /> Your Data is Safe
            </h3>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              {translate('Your account, subscription, and referral rewards are completely safe. All your exam preparation data has been preserved on this platform.')}
            </p>
          </section>

          {/* APP LINKS */}
          <section className="border border-primary-300 dark:border-primary-600 rounded-2xl p-6">
            <h3 className="text-sm xl:text-lg font-bold text-primary-600 mb-4 flex items-center tracking-tight">
              <span className="text-xl mr-2">📱</span>
              {translate('Our Apps')}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.aajexam.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all active:translate-y-1 font-bold uppercase text-xs tracking-[0.08em]"
              >
                <FaGraduationCap className="mr-3" />
                {translate('AajExam App (Exams)')}
              </a>
              <a
                href="https://subgquiz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-all active:translate-y-1 font-bold uppercase text-xs tracking-[0.08em]"
              >
                <FaBookOpen className="mr-3" />
                {translate('SubgQuiz (Quizzes)')}
              </a>
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <footer className="bg-background-surface-secondary p-8 rounded-b-[2.5rem] border-t-2 border-border-primary">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] text-center sm:text-left leading-loose">
              {translate('Crack your dream exam with AajExam.')}
            </p>
            <button
              onClick={handleClose}
              className="bg-primary-600 text-on-primary px-12 py-5 rounded-2xl text-xs font-bold uppercase tracking-[0.08em] transition-all active:translate-y-1"
            >
              {translate('Start Preparing!')}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SystemUpdateModal;
