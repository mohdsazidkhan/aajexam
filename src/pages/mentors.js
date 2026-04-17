'use client';
import React, { useState, useEffect } from 'react';
import { Users, Star, Award, MessageCircle, ChevronRight, Shield, Search } from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import API from '../lib/api';
import Card from '../components/ui/Card';
import Loading from '../components/Loading';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ page, limit: 20 });
        if (search) params.set('exam', search);
        const res = await API.request(`/api/mentor?${params}`);
        if (res?.success) { setMentors(res.data || []); setTotalPages(res.pagination?.totalPages || 1); }
      } catch (e) { } finally { setLoading(false); }
    };
    fetchData();
  }, [search, page]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loading size="md" /></div>;

  return (
    <div className="min-h-screen pb-24">
      <Head><title>Mentors - AajExam</title></Head>
      <div className="container mx-auto py-0 lg:py-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-primary-500" /> Mentors</h1>
            <p className="text-sm font-bold text-slate-400">Learn from students who cleared exams</p>
          </div>
          <button onClick={() => router.push('/mentor/apply')} className="px-4 py-2 bg-primary-500 text-white rounded-xl text-xs font-bold">Become Mentor</button>
        </div>

        <div className="my-2 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by exam name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-300" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mentors.map((mentor, i) => (
            <Card key={mentor._id || i} className="p-5 hover:shadow-xl transition-all cursor-pointer border-2 border-slate-100 dark:border-slate-800 hover:border-primary-500"
              onClick={() => router.push(`/mentor/${mentor._id}`)}>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 font-black text-sm">
                    {mentor.user?.name?.charAt(0) || 'M'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">{mentor.user?.name || 'Mentor'}</h3>
                    {mentor.isVerified && <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1"><Shield className="w-3 h-3" /> Verified</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-black text-slate-600">{mentor.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>

                {mentor.examsCleared?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mentor.examsCleared.map((exam, j) => (
                      <span key={j} className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 rounded text-[9px] font-bold text-emerald-600">
                        <Award className="w-3 h-3 inline mr-0.5" />{exam.examName} {exam.year}
                      </span>
                    ))}
                  </div>
                )}

                {mentor.specialization?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {mentor.specialization.map((spec, j) => (
                      <span key={j} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[9px] font-bold text-slate-500">{spec}</span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-1">
                  <span><MessageCircle className="w-3 h-3 inline" /> {mentor.helpedStudents || 0} helped</span>
                  <span className="text-primary-500 flex items-center gap-1">View Profile <ChevronRight className="w-3 h-3" /></span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {mentors.length === 0 && <div className="text-center py-12"><Users className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-400 font-bold">No mentors yet. Be the first!</p></div>}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Prev</button>
            <span className="text-sm font-bold text-slate-500">Page {page} of {totalPages}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl text-sm font-bold disabled:opacity-30">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsPage;
