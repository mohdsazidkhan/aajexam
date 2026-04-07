'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
	Plus,
	Trophy,
	Search,
	LayoutGrid,
	List,
	Table as TableIcon,
	Eye,
	Trash2,
	CircleCheck,
	Clock,
	CircleAlert,
	Zap,
	BarChart3,
	Layers,
	FileText,
	ChevronRight,
	TrendingUp,
	ShieldCheck,
	MoreVertical,
	Edit,
	ArrowRight,
	Sparkles,
	Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import { getCurrentUser } from '../../../utils/authUtils';
import UnifiedFooter from '../../UnifiedFooter';
import Loading from '../../Loading';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

// Redesigned ViewToggle Inline for consistency
const ViewToggle = ({ currentView, onViewChange, views = ['grid', 'list', 'table'] }) => {
	return (
		<div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl shadow-inner">
			{views.includes('grid') && (
				<button onClick={() => onViewChange('grid')} className={`p-2 rounded-xl transition-all ${currentView === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
					<LayoutGrid className="w-4 h-4" />
				</button>
			)}
			{views.includes('list') && (
				<button onClick={() => onViewChange('list')} className={`p-2 rounded-xl transition-all ${currentView === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
					<List className="w-4 h-4" />
				</button>
			)}
			{views.includes('table') && (
				<button onClick={() => onViewChange('table')} className={`p-2 rounded-xl transition-all ${currentView === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-700 dark:text-primary-500' : 'text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}>
					<TableIcon className="w-4 h-4" />
				</button>
			)}
		</div>
	);
};

const MyUserQuizzes = () => {
	const router = useRouter();
	const user = getCurrentUser();

	const [quizzes, setQuizzes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
	const [stats, setStats] = useState(null);
	const [viewMode, setViewMode] = useState('grid');

	const fetchQuizzes = useCallback(async () => {
		setLoading(true);
		try {
			const params = filter !== 'all' ? { status: filter } : {};
			const response = await API.getMyQuizzes(params);
			if (response?.success) setQuizzes(response.data || []);
		} catch (err) { toast.error('Archive retrieval failed'); }
		finally { setLoading(false); }
	}, [filter]);

	const fetchStats = useCallback(async () => {
		try {
			const response = await API.getQuizCreationStats();
			if (response?.success) setStats(response.data);
		} catch (err) { console.error('Stats offline'); }
	}, []);

	useEffect(() => {
		fetchQuizzes();
		fetchStats();
	}, [fetchQuizzes, fetchStats]);

	const handleDelete = async (id) => {
		if (!window.confirm('Erase this architecture from the archives?')) return;
		try {
			await API.deleteUserQuiz(id);
			toast.success('Asset Erased Successfully');
			fetchQuizzes();
		} catch (err) { toast.error('Erase protocol failed'); }
	};

	const getStatusConfig = (status) => {
		switch (status) {
			case 'approved': return { color: 'emerald', icon: CircleCheck, label: 'PUBLISHED' };
			case 'rejected': return { color: 'primary', icon: CircleAlert, label: 'REDACTED' };
			default: return { color: 'secondary', icon: Clock, label: 'PENDING SYNC' };
		}
	};

	const renderGridView = () => (
		<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
			{quizzes.map((quiz, idx) => {
				const conf = getStatusConfig(quiz.status);
				return (
					<motion.div key={quiz._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
						<Card className="h-full flex flex-col group border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500/30 transition-all relative overflow-hidden">
							<div className="p-5 lg:p-8 flex-1 space-y-4 lg:space-y-6 relative z-10">
								<div className="flex justify-between items-start">
									<div className={`p-4 bg-${conf.color}-500/10 text-${conf.color}-500 rounded-2xl shadow-sm`}>
										<Layers className="w-6 h-6" />
									</div>
									<span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border border-${conf.color}-500/20 bg-${conf.color}-500/5 text-${conf.color}-500 flex items-center gap-2`}>
										<conf.icon className="w-3 h-3" /> {conf.label}
									</span>
								</div>

								<div className="space-y-2">
									<h3 className="text-xl font-black font-outfit uppercase leading-tight group-hover:text-primary-700 dark:text-primary-500 transition-colors line-clamp-2">
										{quiz.title}
									</h3>
									<p className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide line-clamp-2">
										{quiz.description || 'No blueprint description provided.'}
									</p>
								</div>

								<div className="grid grid-cols-2 gap-4 pt-2">
									<div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
										<p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Sector</p>
										<p className="text-[10px] font-black text-slate-900 dark:text-white uppercase truncate">{quiz.category?.name || 'GENERIC'}</p>
									</div>
									<div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
										<p className="text-[8px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Questions</p>
										<p className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{quiz.questionCount || 0} UNITS</p>
									</div>
								</div>

								{quiz.status === 'approved' && quiz.rewardAmount > 0 && (
									<div className="p-4 bg-emerald-500/10 rounded-2xl flex items-center justify-between">
										<p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ASSET BOUNTY EARNED</p>
										<p className="text-lg font-black font-outfit text-emerald-500">₹{quiz.rewardAmount}</p>
									</div>
								)}

								{quiz.adminNotes && (
									<div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl space-y-1">
										<p className="text-[8px] font-black text-primary-700 dark:text-primary-500 uppercase tracking-widest">ADMIN FREQUENCY LOG</p>
										<p className="text-xs font-bold text-slate-700 dark:text-slate-400 line-clamp-2 italic">"{quiz.adminNotes}"</p>
									</div>
								)}
							</div>

							<div className="p-6 bg-slate-50/50 dark:bg-slate-900/50 flex gap-4 relative z-10">
								{quiz.status === 'pending' && (
									<button onClick={() => handleDelete(quiz._id)} className="flex-1 py-4 bg-white dark:bg-slate-800 text-primary-700 dark:text-primary-500 border-2 border-primary-500/10 rounded-xl hover:bg-primary-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
										<Trash2 className="w-4 h-4 mx-auto" />
									</button>
								)}
								<button onClick={() => router.push(`/pro/quiz/${quiz._id}`)} className="flex-[3] py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 text-[10px] font-black uppercase tracking-widest transition-all shadow-duo-secondary">
									ANALYZE ASSEMBLY
								</button>
							</div>

							<Sparkles className="absolute -bottom-8 -left-8 w-24 lg:w-48 h-24 lg:h-48 text-primary-700 dark:text-primary-500/5 group-hover:text-primary-700 dark:text-primary-500/10 transition-colors pointer-events-none" />
						</Card>
					</motion.div>
				);
			})}
		</div>
	);

	return (
		<div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white">
			<div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 space-y-12">

				{/* --- Archive Hero --- */}
				<section className="relative py-4 lg:py-6 text-center space-y-4 lg:space-y-8">
					<motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="w-20 h-20 bg-primary-500/10 text-primary-700 dark:text-primary-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-sm">
						<Layers className="w-10 h-10" />
					</motion.div>
					<div className="space-y-4">
						<h1 className="text-2xl lg:text-5xl font-black font-outfit uppercase tracking-tight">Architect <span className="text-primary-700 dark:text-primary-500">Archives</span></h1>
						<p className="text-sm font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] max-w-2xl mx-auto">Database of synthesized knowledge and academy assets</p>
					</div>

					<div className="flex flex-wrap justify-center gap-4 pt-6">
						<Button variant="ghost" onClick={() => router.push('/pro/user-quiz-rewards')} className="px-8 py-5 rounded-3xl bg-white dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest shadow-sm">
							<Trophy className="w-4 h-4 mr-2 text-primary-700 dark:text-primary-500" /> REWARDS HUB
						</Button>
						<Button variant="secondary" size="lg" onClick={() => router.push('/pro/quiz/create')} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-secondary">
							<Plus className="w-4 h-4 mr-2" /> NEW ARCHITECTURE
						</Button>
					</div>
				</section>

				{/* --- Archive Milestones --- */}
				{stats && (
					<section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
						{[
							{ label: 'PUBLISHED ASSETS', val: stats.totalApproved || 0, icon: ShieldCheck, color: 'emerald' },
							{ label: 'MONTHLY QUOTA', val: `${stats.monthlyCount || 0}/${stats.monthlyLimit || 99}`, icon: Clock, color: 'secondary' },
							{ label: 'NEXT TIER', val: stats.nextMilestone?.tier || 'ELITE', icon: Target, color: 'primary' },
							{ label: 'PRECISION', val: `${stats.progressToNextMilestone}%`, icon: Zap, color: 'secondary' }
						].map((s, i) => (
							<Card key={i} className="p-6 border-b-4 border-slate-100 dark:border-slate-800 hover:border-slate-200">
								<div className="flex items-center gap-4">
									<div className={`p-4 bg-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500/10 text-${s.color === 'primary' ? 'primary' : s.color === 'secondary' ? 'secondary' : s.color}-500 rounded-2xl`}>
										<s.icon className="w-6 h-6" />
									</div>
									<div className="min-w-0">
										<p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
										<p className="text-xl font-black font-outfit uppercase truncate">{s.val}</p>
									</div>
								</div>
							</Card>
						))}
					</section>
				)}

				{/* --- Archive Navigation Hub --- */}
				<section className="flex flex-col lg:flex-row justify-between items-center gap-8 bg-white dark:bg-slate-800/50 backdrop-blur-xl p-4 lg:p-8 rounded-[1rem] lg:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl">
					<div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-full">
						{['all', 'pending', 'approved', 'rejected'].map(f => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-600'}`}
							>
								{f}
							</button>
						))}
					</div>

					<ViewToggle
						currentView={viewMode}
						onViewChange={setViewMode}
						views={['grid', 'list', 'table']}
					/>
				</section>

				{/* --- Archive Results --- */}
				<AnimatePresence mode="wait">
					{loading ? (
						<div className="py-24 flex justify-center"><Loading size="lg" /></div>
					) : quizzes.length === 0 ? (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-24 text-center space-y-8">
							<div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto">
								<FileText className="w-12 h-12 text-slate-300" />
							</div>
							<div className="space-y-2">
								<h3 className="text-xl font-black font-outfit uppercase">Archives Void</h3>
								<p className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest leading-none">Zero {filter !== 'all' ? filter : ''} architectures detected in this sector.</p>
							</div>
							<Button variant="secondary" onClick={() => router.push('/pro/quiz/create')} className="px-8 py-5 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-duo-secondary">
								START NEW ASSEMBLY
							</Button>
						</motion.div>
					) : (
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
							{/* Simple implementation of other views for now, prioritizing Grid */}
							{viewMode === 'grid' ? (
								renderGridView()
							) : (
								<Card className="p-8 text-center text-slate-600 dark:text-slate-400 uppercase font-black text-[10px] tracking-widest">
									{viewMode} View Optimized for Academy Terminal Mode (Desktop Only)
									<div className="mt-8">
										<Button variant="ghost" onClick={() => setViewMode('grid')}>RETURN TO VISUAL GRID</Button>
									</div>
								</Card>
							)}
						</motion.div>
					)}
				</AnimatePresence>

			</div>
			<UnifiedFooter />
		</div>
	);
};

export default MyUserQuizzes;


