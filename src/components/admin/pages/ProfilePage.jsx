'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import { getCurrentUser, secureLogout } from '../../../lib/utils/authUtils';

const FIELD_CLASSNAME = 'w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-black font-bold outline-none focus:border-primary-600 focus:bg-primary-500/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600';

const PASSWORD_FIELDS = [
  { id: 'old', label: 'Current password' },
  { id: 'new', label: 'New password' },
  { id: 'confirm', label: 'Confirm new password' },
];

const AdminProfilePage = () => {
  const { isMounted, router } = useSSR();
  const user = getCurrentUser();

  useAdminMobileHeader({ title: 'Profile' });

  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [saving, setSaving] = useState(false);

  if (!isMounted) return null;

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordData.old || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      await API.changePassword({ oldPassword: passwordData.old, newPassword: passwordData.new });
      toast.success('Password updated.');
      setPasswordData({ old: '', new: '', confirm: '' });
    } catch (error) {
      toast.error(error?.message || 'Could not update password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3 mt-3 xl:mt-4 mb-6">
      {/* Admin hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-950 ring-1 ring-slate-200 dark:ring-white/10 shadow-xl p-4 xl:p-6" style={{ borderRadius: 16 }}>
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '18px 18px' }} />
        <div className="pointer-events-none absolute -top-24 -left-20 -z-10 w-72 h-72 bg-primary-300/30 dark:bg-white/10 blur-3xl" style={{ borderRadius: '50%' }} />
        <div className="pointer-events-none absolute -bottom-28 right-10 -z-10 w-80 h-80 bg-primary-300/20 blur-3xl" style={{ borderRadius: '50%' }} />
        <ShieldCheck className="pointer-events-none absolute right-6 top-3 -z-10 w-28 h-28 xl:w-36 xl:h-36 text-primary-600/10 dark:text-white/5 rotate-12" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 xl:w-20 xl:h-20 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow rotate-[-4deg] text-3xl font-black uppercase shadow-lg" style={{ borderRadius: 22 }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 dark:text-white/60">AajExam · Admin</p>
              <h1 className="text-2xl xl:text-3xl font-black font-outfit uppercase tracking-tight leading-tight text-slate-900 dark:text-white truncate">
                {user?.name || 'Admin'}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary-300 to-primary-400 text-black text-[10px] font-black uppercase tracking-wider shadow">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/20 text-[11px] font-bold text-slate-700 dark:text-white/80 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{user?.email || 'Not available'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-white/10 ring-1 ring-slate-200 dark:ring-white/20 text-[11px] font-bold text-slate-700 dark:text-white/80 capitalize">
                  <User className="w-3.5 h-3.5" /> {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => secureLogout(router)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-500 to-red-600 hover:brightness-110 text-white shadow-lg transition-all"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </section>

      {/* Change password */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-md">
        <div className="relative flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-slate-100 via-slate-50 to-white text-slate-900 border-b border-slate-200 dark:border-transparent dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:text-white">
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }} />
          <span className="relative w-9 h-9 shrink-0 flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-400 text-black shadow rotate-[-4deg]" style={{ borderRadius: 10 }}><Lock className="w-4 h-4" /></span>
          <div className="relative min-w-0">
            <h2 className="text-sm font-black uppercase tracking-[0.14em] leading-tight">Change password</h2>
            <p className="text-[11px] font-bold text-primary-800/70 dark:text-white/70 leading-tight">Use a strong password to keep your account safe.</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="p-4 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            {PASSWORD_FIELDS.map((item) => (
              <div key={item.id} className="space-y-1">
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.14em] px-1">{item.label}</label>
                <div className="relative">
                  <input
                    type={showPass[item.id] ? 'text' : 'password'}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-black text-sm font-bold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    value={passwordData[item.id]}
                    onChange={(event) => setPasswordData({ ...passwordData, [item.id]: event.target.value })}
                  />
                  <button
                    type="button"
                    aria-label={showPass[item.id] ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass({ ...showPass, [item.id]: !showPass[item.id] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-white/10 transition-colors"
                  >
                    {showPass[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-dashed border-slate-200 dark:border-slate-700">
            <button type="submit" disabled={saving} className="w-full xl:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-800 dark:to-primary-950 shadow-md text-white text-xs font-black uppercase tracking-[0.15em] flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all">
              <Lock className="w-4 h-4" /> {saving ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminProfilePage;
