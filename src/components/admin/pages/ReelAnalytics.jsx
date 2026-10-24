"use client";

import React, { useEffect, useState } from "react";
import API from '../../../lib/api';
import { toast } from 'react-hot-toast';
import Sidebar from "../Sidebar";

import { Flame, Eye, Heart, MessageCircle, BarChart3, CheckCircle2, TrendingUp } from 'lucide-react';
import { AdminDashboardSkeleton } from '../Skeletons';
import ViewToggle from '../../common/ViewToggle';
import ResponsiveTable from '../../common/ResponsiveTable';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminReelAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topReelsView, setTopReelsView] = useState('grid');

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

  const stats = data ? [
    { label: 'Total Reels', value: data.overview.totalReels, icon: Flame },
    { label: 'Published', value: data.overview.publishedReels, icon: CheckCircle2 },
    { label: 'Pending', value: data.overview.pendingReels, icon: TrendingUp },
    { label: 'Total Views', value: data.overview.totalViews, icon: Eye },
    { label: 'Total Likes', value: data.overview.totalLikes, icon: Heart },
    { label: 'Total Answers', value: data.overview.totalAnswers, icon: MessageCircle },
  ] : [];

  const topReelsColumns = [
    {
      key: 'title',
      header: 'Reel',
      render: (_, reel) => (
        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
          {reel.questionText || reel.title || 'Untitled'}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (_, reel) => (
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{reel.type} &middot; {reel.subject}</span>
      )
    },
    {
      key: 'likesCount',
      header: 'Likes',
      align: 'center',
      render: (_, reel) => (
        <span className="flex items-center justify-center gap-1 text-xs font-black text-black dark:text-white"><Heart className="w-3.5 h-3.5" /> {reel.likesCount}</span>
      )
    },
    {
      key: 'viewsCount',
      header: 'Views',
      align: 'center',
      render: (_, reel) => (
        <span className="flex items-center justify-center gap-1 text-xs font-black text-black dark:text-white"><Eye className="w-3.5 h-3.5" /> {reel.viewsCount}</span>
      )
    }
  ];

  const TopReelsTableView = () => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <ResponsiveTable
        data={data.topReels}
        columns={topReelsColumns}
        viewModes={['table']}
        defaultView={'table'}
        showPagination={false}
        showViewToggle={false}
      />
    </div>
  );

  const TopReelsListView = () => (
    <div className="space-y-1">
      {data.topReels.map((reel, i) => (
        <div key={reel._id} className="flex items-start sm:items-center gap-3 p-3 rounded-lg xl:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0 mt-0.5 sm:mt-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 sm:truncate">
              {reel.questionText || reel.title || 'Untitled'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider capitalize">{reel.type} &middot; {reel.subject}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-black dark:text-white"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-black dark:text-white"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TopReelsGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {data.topReels.map((reel, i) => (
        <div key={reel._id} className="group p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary-300 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 shadow ${i < 3 ? 'bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200'}`}>{i + 1}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-400/20 dark:text-primary-200 capitalize">{reel.type?.replace('_', ' ')}</span>
          </div>
          <p className="flex-1 text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {reel.questionText || reel.title || 'Untitled'}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-wider">
            <span className="capitalize text-slate-500 dark:text-slate-400 truncate">{reel.subject}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center gap-1"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center gap-1"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  useAdminMobileHeader({ title: 'Reel Analytics' });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-slate-900 dark:text-white">
      <Sidebar />
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-4 shrink-0">
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-3 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all min-w-0">
                  <div className="p-2 bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] rounded-lg shadow shrink-0">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-black text-slate-900 dark:text-white tabular-nums tracking-tight leading-tight whitespace-nowrap">
                      {stat.value?.toLocaleString?.() || 0}
                    </div>
                    <div className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-auto overflow-y-auto">
          {loading ? <AdminDashboardSkeleton /> : data ? (
            <div className="space-y-3 pb-4">

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {/* Type Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-md relative before:content-[''] before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b-full before:bg-gradient-to-r before:from-primary-500/70 before:via-primary-300/70 before:to-primary-500/70">
                  <h3 className="flex items-center gap-2.5 font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight text-xs"><span className="w-7 h-7 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 8 }}><Flame className="w-3.5 h-3.5" /></span>By Type</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {(() => {
                      const maxCount = Math.max(1, ...data.typeBreakdown.map(i => i.count || 0));
                      return data.typeBreakdown.map(item => (
                        <div key={item._id} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-black text-xs text-slate-800 dark:text-slate-100 capitalize">{item._id === 'current_affairs' ? 'Current Affairs' : item._id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-primary-100 text-primary-800 dark:bg-primary-400/20 dark:text-primary-200">{item.count} reels</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200 flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-200 flex items-center gap-1"><Heart className="w-3 h-3" />{item.likes}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300" style={{ width: `${Math.round(((item.count || 0) / maxCount) * 100)}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4 shadow-md relative before:content-[''] before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b-full before:bg-gradient-to-r before:from-primary-500/70 before:via-primary-300/70 before:to-primary-500/70">
                  <h3 className="flex items-center gap-2.5 font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight text-xs"><span className="w-7 h-7 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 8 }}><BarChart3 className="w-3.5 h-3.5" /></span>By Subject</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const maxViews = Math.max(1, ...data.subjectBreakdown.map(i => i.views || 0));
                      return data.subjectBreakdown.map(item => (
                        <div key={item._id} className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-primary-300 hover:shadow-md transition-all">
                          <p className="font-black text-slate-900 dark:text-white text-[11px] truncate uppercase tracking-tight">{item._id}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black uppercase tracking-wider">
                            <span className="px-1.5 py-0.5 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-400/20 dark:text-primary-200">{item.count} reels</span>
                            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-300" style={{ width: `${Math.round(((item.views || 0) / maxViews) * 100)}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              {/* Top Reels */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-4 shadow-md relative before:content-[''] before:absolute before:inset-x-3 before:top-0 before:h-[3px] before:rounded-b-full before:bg-gradient-to-r before:from-primary-500/70 before:via-primary-300/70 before:to-primary-500/70">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2.5 font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm"><span className="w-7 h-7 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-[#000] shadow rotate-[-4deg]" style={{ borderRadius: 8 }}><Eye className="w-3.5 h-3.5" /></span>Top 10 Reels</h3>
                  <ViewToggle currentView={topReelsView} onViewChange={setTopReelsView} views={['table', 'list', 'grid']} />
                </div>
                {topReelsView === 'table' && <TopReelsTableView />}
                {topReelsView === 'list' && <TopReelsListView />}
                {topReelsView === 'grid' && <TopReelsGridView />}
              </div>

            </div>
          ) : (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl xl:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
              <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-4 xl:mb-4 opacity-20" />
              <h3 className="text-xl xl:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">No Analytics Data</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Create some reels first to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReelAnalytics;
