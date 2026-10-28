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

const FIELD_CLASSNAME = 'w-full px-4 py-3.5 rounded-2xl border border-border-primary bg-background-surface font-bold outline-none focus:border-primary-600 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600';

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
      <section className="relative isolate overflow-hidden border border-border-primary p-4 xl:p-6 bg-background-surface" style={{ borderRadius: 16 }}>
        <ShieldCheck className="pointer-events-none absolute right-6 top-3 -z-10 w-28 h-28 xl:w-36 xl:h-36 text-primary-600/10 dark:text-white/5 rotate-12" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 xl:w-20 xl:h-20 shrink-0 flex items-center justify-center text-on-primary text-3xl font-bold bg-primary-600" style={{ borderRadius: 22 }}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-content-muted dark:text-white/60">AajExam · Admin</p>
              <h1 className="text-2xl xl:text-3xl font-bold font-outfit tracking-tight leading-tight text-content-primary truncate">
                {user?.name || 'Admin'}
              </h1>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-on-primary text-[10px] font-bold uppercase tracking-[0.08em] bg-primary-600">
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-primary text-[11px] font-bold text-content-secondary dark:text-white/80 min-w-0">
                  <Mail className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{user?.email || 'Not available'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border-primary text-[11px] font-bold text-content-secondary dark:text-white/80 capitalize">
                  <User className="w-3.5 h-3.5" /> {user?.role || 'Admin'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => secureLogout(router)}
            className="shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-[0.08em] hover:brightness-110 text-white transition-all bg-red-600"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
      </section>

      {/* Change password */}
      <section className="relative overflow-hidden bg-background-surface rounded-2xl border border-border-primary">
        <section className="relative flex items-center gap-3 px-4 py-2.5 text-content-primary border-b border-border-primary dark:border-transparent bg-background-surface">
          <span className="relative w-9 h-9 shrink-0 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 10 }}><Lock className="w-4 h-4" /></span>
          <section className="relative min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-[0.08em] leading-tight">Change password</h2>
            <p className="text-[11px] font-bold text-primary-800/70 dark:text-white/70 leading-tight">Use a strong password to keep your account safe.</p>
          </section>
        </section>

        <form onSubmit={handleChangePassword} className="p-4 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
            {PASSWORD_FIELDS.map((item) => (
              <div key={item.id} className="space-y-1">
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] px-1">{item.label}</label>
                <div className="relative">
                  <input
                    type={showPass[item.id] ? 'text' : 'password'}
                    className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-border-primary bg-background-surface text-sm font-bold outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all"
                    value={passwordData[item.id]}
                    onChange={(event) => setPasswordData({ ...passwordData, [item.id]: event.target.value })}
                  />
                  <button
                    type="button"
                    aria-label={showPass[item.id] ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass({ ...showPass, [item.id]: !showPass[item.id] })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-content-muted hover:text-primary-600 transition-colors"
                  >
                    {showPass[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-dashed border-border-primary">
            <button type="submit" disabled={saving} className="w-full xl:w-auto px-6 py-2.5 rounded-xl text-on-primary text-xs font-bold uppercase tracking-[0.08em] flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all bg-primary-600">
              <Lock className="w-4 h-4" /> {saving ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default AdminProfilePage;
