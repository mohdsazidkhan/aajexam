"use client";

import React, { useEffect, useState } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Loading from '../../Loading';
import { motion } from 'framer-motion';
import Sidebar from "../../Sidebar";

import { Flame, Eye, Heart, MessageCircle, BarChart3, CheckCircle2, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5"
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white truncate">{value?.toLocaleString?.() || 0}</p>
        <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate">{label}</p>
      </div>
    </div>
  </motion.div>
);

const AdminReelAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.getAdminReelsAnalytics();
        if (res?.success) setData(res.data);
      } catch (err) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 adminContent">
          <div className="px-3 py-4 sm:p-6 max-w-7xl mx-auto">

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-5 sm:mb-6 uppercase tracking-tight">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" /> Reel Analytics
            </h1>

            {loading ? <Loading /> : data ? (
              <div className="space-y-5 sm:space-y-8">

                {/* Overview Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <StatCard icon={Flame} label="Total Reels" value={data.overview.totalReels} delay={0} color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
                  <StatCard icon={CheckCircle2} label="Published" value={data.overview.publishedReels} delay={0.05} color="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
                  <StatCard icon={TrendingUp} label="Pending" value={data.overview.pendingReels} delay={0.1} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
                  <StatCard icon={Eye} label="Total Views" value={data.overview.totalViews} delay={0.15} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                  <StatCard icon={Heart} label="Total Likes" value={data.overview.totalLikes} delay={0.2} color="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400" />
                  <StatCard icon={MessageCircle} label="Total Answers" value={data.overview.totalAnswers} delay={0.25} color="bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400" />
                </div>

                {/* Type Breakdown */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight text-sm sm:text-base">By Type</h3>
                  <div className="space-y-4">
                    {data.typeBreakdown.map(item => {
                      const maxCount = Math.max(...data.typeBreakdown.map(i => i.count));
                      const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item._id} className="space-y-1.5">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 capitalize">{item._id === 'current_affairs' ? 'Current Affairs' : item._id}</span>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <span>{item.count} reels</span>
                              <span>&middot;</span>
                              <span>{item.views} views</span>
                              <span>&middot;</span>
                              <span>{item.likes} likes</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight text-sm sm:text-base">By Subject</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {data.subjectBreakdown.map(item => (
                      <div key={item._id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                        <p className="font-black text-slate-900 dark:text-white text-xs sm:text-sm truncate uppercase tracking-tight">{item._id}</p>
                        <p className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">{item.count} reels &middot; {item.views} views</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Reels */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
                  <h3 className="font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight text-sm sm:text-base">Top 10 Reels</h3>
                  <div className="space-y-1">
                    {data.topReels.map((reel, i) => (
                      <div key={reel._id} className="flex items-start sm:items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5 sm:mt-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 sm:truncate">
                            {reel.questionText || reel.title || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{reel.type} &middot; {reel.subject}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
                            <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20">
                <BarChart3 className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                <p className="text-slate-500 font-bold">No analytics data available</p>
                <p className="text-sm text-slate-400 mt-1">Create some reels first to see analytics</p>
              </div>
            )}
          </div>
        </main>
      </div>
  );
};

export default AdminReelAnalytics;
