'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft, Shield, Star, Users, BookOpen, Clock, Award, MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Head from 'next/head';
import API from '../../../lib/api';
import Card from '../../../components/ui/Card';
import { AdminTableSkeleton } from '../../../components/skeletons/AdminSkeletons';
import AdminRoute from '../../../components/AdminRoute';

const AdminMentorDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.request(`/api/admin/mentors/${id}`);
      if (res?.success) setMentor(res.data);
      else { toast.error('Mentor not found'); router.push('/admin/mentors'); }
    } catch (e) { toast.error('Failed to load'); } finally { setLoading(false); }
  };
  useEffect(() => { if (id) fetchData(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (status, isVerified) => {
    try {
      const res = await API.request(`/api/admin/mentors/${id}`, { method: 'PUT', body: JSON.stringify({ status, isVerified }) });
      if (res?.success) { toast.success('Updated'); fetchData(); }
    } catch (e) { toast.error('Failed'); }
  };

  if (loading) return <AdminTableSkeleton />;
  if (!mentor) return null;

  return (
    <AdminRoute>
      <div className="min-h-screen pb-24">
        <Head><title>{mentor.user?.name || 'Mentor'} - Admin</title></Head>
        <div className="py-0 lg:py-6 space-y-2 lg:space-y-4">
          <Link href="/admin/mentors" className="text-sm font-bold text-primary-700 flex items-center gap-1 hover:underline w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Mentors
          </Link>

          {/* Header */}
          <Card className="p-5 space-y-3">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  {mentor.user?.name || 'Unknown'}
                  {mentor.isVerified && <Shield className="w-4 h-4 text-black dark:text-white" />}
                </h1>
                <p className="text-xs text-slate-400">{mentor.user?.email}</p>
                {mentor.user?.username && <p className="text-[10px] text-slate-400">@{mentor.user.username}</p>}
                {mentor.user?.createdAt && (
                  <p className="text-[10px] text-slate-400 mt-1">Joined: {new Date(mentor.user.createdAt).toLocaleDateString('en-IN')}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-slate-400">Status:</label>
                <select
                  value={mentor.status}
                  onChange={e => updateStatus(e.target.value, e.target.value === 'active' ? true : undefined)}
                  className="px-2 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-800 outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                </select>
                {mentor.status === 'active' && !mentor.isVerified && (
                  <button onClick={() => updateStatus('active', true)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-black dark:text-white rounded-lg text-[10px] font-bold"><Shield className="w-3 h-3 inline mr-1" />Verify</button>
                )}
              </div>
            </div>

            {mentor.verifiedBy && (
              <p className="text-[10px] text-slate-400">Verified by {mentor.verifiedBy.name} on {new Date(mentor.verifiedAt).toLocaleDateString('en-IN')}</p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              <div className="p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <Star className="w-4 h-4 text-black dark:text-white mx-auto mb-1" />
                <p className="text-sm font-black text-slate-900 dark:text-white">{mentor.rating?.toFixed(1) || '0.0'}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">{mentor.totalRatings || 0} Ratings</p>
              </div>
              <div className="p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <Users className="w-4 h-4 text-primary-700 mx-auto mb-1" />
                <p className="text-sm font-black text-slate-900 dark:text-white">{mentor.helpedStudents || 0}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Students Helped</p>
              </div>
              <div className="p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <Clock className="w-4 h-4 text-black dark:text-white mx-auto mb-1" />
                <p className="text-sm font-black text-slate-900 dark:text-white">{mentor.preparationMonths || 0}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">Prep Months</p>
              </div>
              <div className="p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                <MessageCircle className="w-4 h-4 text-black dark:text-white mx-auto mb-1" />
                <p className="text-sm font-black text-slate-900 dark:text-white">{mentor.amaThreads?.length || 0}</p>
                <p className="text-[9px] text-slate-400 uppercase font-bold">AMA Threads</p>
              </div>
            </div>
          </Card>

          {/* Exams Cleared */}
          {mentor.examsCleared?.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><Award className="w-4 h-4 text-primary-700" /> Exams Cleared</h2>
              <div className="space-y-2">
                {mentor.examsCleared.map((e, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-200">{e.examName} ({e.year})</span>
                    <span className="text-slate-400">
                      {e.rank ? `Rank ${e.rank}` : ''}{e.score ? ` · Score ${e.score}` : ''}{e.attempt ? ` · Attempt ${e.attempt}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Specialization */}
          {mentor.specialization?.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Specialization</h2>
              <div className="flex flex-wrap gap-1.5">
                {mentor.specialization.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 rounded-full text-[10px] font-bold">{s}</span>
                ))}
              </div>
            </Card>
          )}

          {/* Strategy */}
          <Card className="p-5 space-y-2">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Preparation Strategy</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{mentor.strategy}</p>
          </Card>

          {/* Daily Routine */}
          {mentor.dailyRoutine && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Daily Routine</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">{mentor.dailyRoutine}</p>
            </Card>
          )}

          {/* Tips */}
          {mentor.tips?.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white">Tips</h2>
              <ul className="space-y-1.5">
                {mentor.tips.map((t, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-2">
                    <span className="text-primary-700 font-black">•</span> {t}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Books Recommended */}
          {mentor.booksRecommended?.length > 0 && (
            <Card className="p-5 space-y-2">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary-700" /> Books Recommended</h2>
              <ul className="space-y-1.5">
                {mentor.booksRecommended.map((b, i) => (
                  <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex gap-2">
                    <span className="text-primary-700 font-black">•</span> {b}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* AMA Threads */}
          {mentor.amaThreads?.length > 0 && (
            <Card className="p-5 space-y-3">
              <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5"><MessageCircle className="w-4 h-4 text-primary-700" /> AMA Threads</h2>
              {mentor.amaThreads.map((t, i) => (
                <div key={i} className="p-3 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Q: {t.question}</p>
                  <p className="text-[9px] text-slate-400">Asked by {t.askedBy?.name || 'Anonymous'} · {t.upvotes || 0} upvotes</p>
                  {t.answer ? (
                    <p className="text-xs text-slate-600 dark:text-slate-300">A: {t.answer}</p>
                  ) : (
                    <p className="text-[10px] text-black dark:text-white font-bold">Not answered yet</p>
                  )}
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminMentorDetail;
