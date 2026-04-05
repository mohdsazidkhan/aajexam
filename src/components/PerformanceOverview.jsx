'use client';
import { FaGraduationCap, FaTrophy, FaChartLine, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import ProgressBar from './ProgressBar';

export default function PerformanceOverview({ data, loading }) {
    if (loading) return <PerformanceSkeleton />;
    if (!data) return null;

    const { performanceMetrics, primaryTargetExam } = data;
    const { examStats } = performanceMetrics || {};

    const readiness = examStats?.overallReadiness || 0;
    const mockScores = examStats?.averageMockScore || 0;
    const items = examStats?.mockTestsAttempted || 0;

    // Get subject wise accuracy from Map/Object
    const subjectAccuracy = examStats?.subjectAccuracy || {};
    const subjects = Object.entries(subjectAccuracy);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-700 dark:text-primary-500">
                            <FaGraduationCap className="w-5 h-5" />
                        </span>
                        Exam Readiness
                    </h3>
                    <div className="text-right">
                        <p className="text-xs text-slate-700 dark:text-gray-400 font-medium">Target Exam</p>
                        <p className="text-sm font-bold text-primary-700 dark:text-primary-500 dark:text-primary-400">{primaryTargetExam}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-widest mb-1">Overall Readiness</p>
                        <p className={`text-4xl font-extrabold ${readiness >= 75 ? 'text-green-500' : readiness >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                            {readiness}%
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-widest mb-1">Avg. Mock Score</p>
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {mockScores}%
                        </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl">
                        <p className="text-xs font-bold text-slate-700 dark:text-gray-400 uppercase tracking-widest mb-1">Tests Attempted</p>
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {items}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Subject-wise Accuracy</h4>
                    {subjects.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                            {subjects.map(([subject, accuracy]) => (
                                <div key={subject}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 truncate w-3/4">{subject}</span>
                                        <span className={`text-xs font-bold ${accuracy >= 70 ? 'text-green-500' : 'text-amber-500'}`}>{accuracy}%</span>
                                    </div>
                                    <ProgressBar
                                        percent={accuracy}
                                        color={accuracy >= 70 ? 'green' : accuracy >= 40 ? 'orange' : 'red'}
                                        height={6}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center bg-gray-50 dark:bg-gray-900/10 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <FaExclamationCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-700 dark:text-gray-400 italic">Attempt more mock tests to see subject analytics.</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 flex justify-center">
                    <button className="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold rounded-xl transition-colors">
                        VIEW FULL ANALYTICS
                    </button>
                </div>
            </div>
        </div>
    );
}

function PerformanceSkeleton() {
    return (
        <div className="w-full h-80 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-3xl" />
    );
}


