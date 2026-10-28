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
        <span className="text-xs sm:text-sm font-bold text-content-primary">
          {reel.questionText || reel.title || 'Untitled'}
        </span>
      )
    },
    {
      key: 'category',
      header: 'Category',
      render: (_, reel) => (
        <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] capitalize">{reel.type} &middot; {reel.subject}</span>
      )
    },
    {
      key: 'likesCount',
      header: 'Likes',
      align: 'center',
      render: (_, reel) => (
        <span className="flex items-center justify-center gap-1 text-xs font-bold text-content-primary"><Heart className="w-3.5 h-3.5" /> {reel.likesCount}</span>
      )
    },
    {
      key: 'viewsCount',
      header: 'Views',
      align: 'center',
      render: (_, reel) => (
        <span className="flex items-center justify-center gap-1 text-xs font-bold text-content-primary"><Eye className="w-3.5 h-3.5" /> {reel.viewsCount}</span>
      )
    }
  ];

  const TopReelsTableView = () => (
    <div className="bg-background-surface rounded-2xl border border-border-primary overflow-hidden">
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
        <div key={reel._id} className="flex items-start sm:items-center gap-3 p-3 rounded-lg xl:rounded-xl hover:bg-background-surface-secondary transition-colors">
          <span className="w-6 h-6 rounded-full bg-background-surface-secondary flex items-center justify-center text-[10px] font-bold text-content-muted shrink-0 mt-0.5 sm:mt-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-bold text-content-primary line-clamp-2 sm:truncate">
              {reel.questionText || reel.title || 'Untitled'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] capitalize">{reel.type} &middot; {reel.subject}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-content-primary"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-content-primary"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const TopReelsGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {data.topReels.map((reel, i) => (
        <div key={reel._id} className="group p-3 rounded-xl bg-background-surface border border-border-primary hover:border-primary-300 hover:-translate-y-0.5 transition-all flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i < 3 ? 'text-on-primary bg-primary-600' : 'bg-background-surface-secondary text-content-secondary'}`}>{i + 1}</span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em] text-primary-600 capitalize">{reel.type?.replace('_', ' ')}</span>
          </div>
          <p className="flex-1 text-xs sm:text-sm font-bold text-content-primary line-clamp-2 leading-snug">
            {reel.questionText || reel.title || 'Untitled'}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-dashed border-border-primary text-[10px] font-bold uppercase tracking-[0.08em]">
            <span className="capitalize text-content-muted truncate">{reel.subject}</span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-background-surface-secondary text-content-secondary flex items-center gap-1"><Heart className="w-3 h-3" /> {reel.likesCount}</span>
              <span className="px-2 py-0.5 rounded-full bg-background-surface-secondary text-content-secondary flex items-center gap-1"><Eye className="w-3 h-3" /> {reel.viewsCount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  useAdminMobileHeader({ title: 'Reel Analytics' });

  return (
    <div className="h-[calc(100dvh-64px)] max-md:h-[calc(100dvh-112px)] overflow-hidden flex flex-col font-outfit text-content-primary">
      <Sidebar />
      <div className="py-4 w-full mx-auto text-content-primary font-outfit flex-1 min-h-0 overflow-auto flex flex-col">

        {/* Header */}
        <div className="flex flex-col gap-3 mb-4 shrink-0">
          {stats.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-3 py-2.5 bg-background-surface rounded-xl border border-border-primary hover:-translate-y-0.5 transition-all min-w-0">
                  <div className="p-2 text-on-primary rounded-lg shrink-0 bg-primary-600">
                    <stat.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-lg font-bold text-content-primary tabular-nums tracking-tight leading-tight whitespace-nowrap">
                      {stat.value?.toLocaleString?.() || 0}
                    </div>
                    <div className="text-[9px] font-bold text-content-muted uppercase tracking-[0.08em] whitespace-nowrap">{stat.label}</div>
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
                <section className="bg-background-surface rounded-2xl border border-border-primary p-3 sm:p-4 relative">
                  <h3 className="flex items-center gap-2.5 font-bold text-content-primary mb-3 uppercase tracking-tight text-xs"><span className="w-7 h-7 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 8 }}><Flame className="w-3.5 h-3.5" /></span>By Type</h3>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {(() => {
                      const maxCount = Math.max(1, ...data.typeBreakdown.map(i => i.count || 0));
                      return data.typeBreakdown.map(item => (
                        <div key={item._id} className="px-3 py-2 rounded-xl border border-border-primary">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-bold text-xs text-content-primary capitalize">{item._id === 'current_affairs' ? 'Current Affairs' : item._id}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em] text-primary-600">{item.count} reels</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em] bg-background-surface-secondary text-content-secondary flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em] bg-background-surface-secondary text-content-secondary flex items-center gap-1"><Heart className="w-3 h-3" />{item.likes}</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full bg-background-surface-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.round(((item.count || 0) / maxCount) * 100)}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>

                {/* Subject Breakdown */}
                <section className="bg-background-surface rounded-2xl border border-border-primary p-3 sm:p-4 relative">
                  <h3 className="flex items-center gap-2.5 font-bold text-content-primary mb-3 uppercase tracking-tight text-xs"><span className="w-7 h-7 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 8 }}><BarChart3 className="w-3.5 h-3.5" /></span>By Subject</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(() => {
                      const maxViews = Math.max(1, ...data.subjectBreakdown.map(i => i.views || 0));
                      return data.subjectBreakdown.map(item => (
                        <div key={item._id} className="px-3 py-2 rounded-xl border border-border-primary hover:border-primary-300 transition-all">
                          <p className="font-bold text-content-primary text-[11px] truncate uppercase tracking-tight">{item._id}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold uppercase tracking-[0.08em]">
                            <span className="px-1.5 py-0.5 rounded-full text-primary-600">{item.count} reels</span>
                            <span className="text-content-muted flex items-center gap-1"><Eye className="w-3 h-3" />{item.views}</span>
                          </div>
                          <div className="mt-1.5 h-1 rounded-full bg-background-surface-secondary overflow-hidden">
                            <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.round(((item.views || 0) / maxViews) * 100)}%` }} />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </section>
              </div>

              {/* Top Reels */}
              <section className="bg-background-surface rounded-2xl border border-border-primary p-4 sm:p-4 relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2.5 font-bold text-content-primary uppercase tracking-tight text-sm"><span className="w-7 h-7 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 8 }}><Eye className="w-3.5 h-3.5" /></span>Top 10 Reels</h3>
                  <ViewToggle currentView={topReelsView} onViewChange={setTopReelsView} views={['table', 'list', 'grid']} />
                </div>
                {topReelsView === 'table' && <TopReelsTableView />}
                {topReelsView === 'list' && <TopReelsListView />}
                {topReelsView === 'grid' && <TopReelsGridView />}
              </section>

            </div>
          ) : (
            <section className="rounded-2xl xl:rounded-3xl border border-dashed border-border-primary p-24 text-center">
              <BarChart3 className="w-20 h-20 text-slate-300 mx-auto mb-4 xl:mb-4 opacity-20" />
              <h3 className="text-xl xl:text-3xl font-bold text-content-primary tracking-tight mb-4">No Analytics Data</h3>
              <p className="text-content-muted text-[10px] font-bold uppercase tracking-[0.08em]">Create some reels first to see analytics.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReelAnalytics;
