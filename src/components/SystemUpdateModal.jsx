import { useState, useEffect } from 'react';
import { FaTimes, FaRocket, FaGift, FaCreditCard, FaShieldAlt, FaGraduationCap, FaBookOpen } from 'react-icons/fa';

const SystemUpdateModal = ({ isOpen, onClose }) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4 font-outfit">
      <div
        className={`absolute inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      <div
        className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm max-w-4xl w-full max-h-[75vh] overflow-y-auto transition-all duration-500 transform border-2 border-slate-200 dark:border-slate-800 font-outfit scrollbar-none ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {/* HEADER */}
        <div className="bg-primary-600 text-white p-4 lg:p-10 rounded-t-[2.5rem] shadow-sm border-b-2 border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center shadow-sm transform -rotate-6">
                <FaGraduationCap className="text-3xl text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-black uppercase tracking-tighter">AajExam — Exam Focused!</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary-100 opacity-80 mt-1">Dedicated Exam Preparation Platform</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all active:translate-y-1"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
        </div>

        {/* BODY */}
        <div className="p-4 lg:p-10 space-y-8">

          {/* PLATFORM UPDATE */}
          <div className="bg-slate-100 dark:bg-slate-800 dark:bg-white/20 border border-slate-200 dark:border-slate-800 dark:border-white rounded-2xl p-6">
            <h3 className="text-sm lg:text-lg font-black text-black dark:text-white mb-2 flex items-center uppercase tracking-tight">
              <FaShieldAlt className="text-black dark:text-white mr-2" /> Platform Update
            </h3>
            <p className="text-sm text-black dark:text-white font-medium">
              AajExam is now <span className="font-black">100% dedicated to Government Exam Preparation!</span> We've streamlined the platform to focus entirely on helping you crack your dream exam.
            </p>
          </div>

          {/* WHAT'S NEW */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-600 rounded-2xl p-6">
            <h3 className="text-sm lg:text-lg font-black text-primary-600 dark:text-primary-200 mb-3 uppercase tracking-tight">
              ✅ What's Available
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-bold text-primary-600 dark:text-primary-200 text-sm">Real Exam Patterns</p>
                  <p className="text-xs text-primary-600">SSC, UPSC, Banking, Railway & more</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">📊</span>
                <div>
                  <p className="font-bold text-primary-600 dark:text-primary-200 text-sm">Full-Length Mock Tests</p>
                  <p className="text-xs text-primary-600">With section-wise analysis</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">🏆</span>
                <div>
                  <p className="font-bold text-primary-600 dark:text-primary-200 text-sm">Test Leaderboards</p>
                  <p className="text-xs text-primary-600">Compare your rank with others</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-xl">📈</span>
                <div>
                  <p className="font-bold text-primary-600 dark:text-primary-200 text-sm">Detailed Analytics</p>
                  <p className="text-xs text-primary-600">Track accuracy, speed & progress</p>
                </div>
              </div>
            </div>
          </div>

          {/* DATA SAFE NOTICE */}
          <div className="bg-primary-600 text-white rounded-[2rem] p-6 shadow-sm border-2 border-white dark:border-slate-700">
            <h3 className="text-sm lg:text-lg font-black mb-2 flex items-center uppercase tracking-tight">
              <FaShieldAlt className="mr-3" /> Your Data is Safe
            </h3>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              Your account, subscription, and wallet balance are completely safe. All your exam preparation data has been preserved on this platform.
            </p>
          </div>

          {/* APP LINKS */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-300 dark:border-primary-600 rounded-2xl p-6">
            <h3 className="text-sm lg:text-lg font-black text-primary-600 dark:text-primary-200 mb-4 flex items-center uppercase tracking-tight">
              <span className="text-xl mr-2">📱</span>
              Our Apps
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.aajexam.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-sm active:translate-y-1 font-black uppercase text-xs tracking-widest"
              >
                <FaGraduationCap className="mr-3" />
                AajExam App (Exams)
              </a>
              <a
                href="https://subgquiz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-4 bg-gray-700 text-white rounded-2xl hover:bg-gray-800 transition-all active:translate-y-1 font-black uppercase text-xs tracking-widest"
              >
                <FaBookOpen className="mr-3" />
                SubgQuiz (Quizzes)
              </a>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-b-[2.5rem] border-t-2 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest text-center sm:text-left leading-loose">
              Crack your dream exam with AajExam.
            </p>
            <button
              onClick={handleClose}
              className="bg-primary-600 text-white px-12 py-5 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all active:translate-y-1 shadow-sm"
            >
              Start Preparing!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemUpdateModal;
