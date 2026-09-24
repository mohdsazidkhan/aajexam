"use client";

import React, { useEffect, useState } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Sidebar from "../../Sidebar";

import { Flame, Eye, Heart, MessageCircle, BarChart3, CheckCircle2, TrendingUp } from 'lucide-react';
import { AdminDashboardSkeleton } from '../../admin/Skeletons';
import ViewToggle from '../../ViewToggle';
import ResponsiveTable from '../../ResponsiveTable';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';

const AdminReelAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topReelsView, setTopReelsView] = useState('list');

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
        <div key={reel._id} className="flex items-start sm:items-center gap-3 p-3 rounded-lg lg:rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data.topReels.map((reel, i) => (
        <div key={reel._id} className="p-4 rounded-lg lg:rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-600 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider capitalize">{reel.type}</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-2">
            {reel.questionText || reel.title || 'Untitled'}
          </p>
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <span className="capitalize">{reel.subject}</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-black dark:text-white"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
              <span className="flex items-center gap-1 text-black dark:text-white"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
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
      <div className="adminContent w-full mx-auto text-slate-900 dark:text-white font-outfit flex-1 min-h-0 overflow-auto flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 shrink-0">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 shrink-0"><BarChart3 className="w-6 h-6 text-primary-600 shrink-0" /> Reel Analytics</h1>

          {stats.length > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-1.5 px-2 py-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="p-1 bg-primary-500/10 text-primary-600 rounded-md shrink-0">
                    <stat.icon className="w-3 h-3" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 dark:text-white tabular-nums tracking-tight whitespace-nowrap">
                      {stat.value?.toLocaleString?.() || 0}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-auto overflow-y-auto">
          {loading ? <AdminDashboardSkeleton /> : data ? (
            <div className="space-y-4 pb-4">

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Type Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
                  <h3 className="font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight text-xs">By Type</h3>
                  <div className="space-y-1">
                    {data.typeBreakdown.map(item => (
                      <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5 sm:gap-2 py-1">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 capitalize">{item._id === 'current_affairs' ? 'Current Affairs' : item._id}</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                          <span>{item.count} reels</span>
                          <span>&middot;</span>
                          <span>{item.views} views</span>
                          <span>&middot;</span>
                          <span>{item.likes} likes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3 sm:p-4">
                  <h3 className="font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight text-xs">By Subject</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {data.subjectBreakdown.map(item => (
                      <div key={item._id} className="px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                        <p className="font-black text-slate-900 dark:text-white text-[10px] truncate uppercase tracking-tight">{item._id}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.count} reels &middot; {item.views} views</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Reels */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Top 10 Reels</h3>
                  <ViewToggle currentView={topReelsView} onViewChange={setTopReelsView} views={['table', 'list', 'grid']} />
                </div>
                {topReelsView === 'table' && <TopReelsTableView />}
                {topReelsView === 'list' && <TopReelsListView />}
                {topReelsView === 'grid' && <TopReelsGridView />}
              </div>

            </div>
          ) : (
            <div className="bg-white/80 dark:bg-white/5 backdrop-blur-3xl rounded-2xl lg:rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-white/10 p-24 text-center">
              <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-4 lg:mb-8 opacity-20" />
              <h3 className="text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">No Analytics Data</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Create some reels first to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReelAnalytics;
