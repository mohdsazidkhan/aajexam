'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, LogOut, Mail, ShieldCheck, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../../lib/api';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useSSR } from '../../../hooks/useSSR';
import { useAdminMobileHeader } from '../../../contexts/AdminMobileHeaderContext';
import { getCurrentUser, secureLogout } from '../../../lib/utils/authUtils';

const FIELD_CLASSNAME = 'w-full px-4 py-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black font-bold outline-none focus:border-primary-700 focus:bg-primary-500/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600';

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
    <div className="space-y-4 lg:space-y-6 mt-4 mb-4">
      {/* Admin info */}
      <Card className="p-5 lg:p-8" radius="3xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full overflow-hidden bg-primary-600 p-[3px] flex-shrink-0">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-900 dark:text-white text-xl lg:text-2xl font-black uppercase">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>

            <div className="min-w-0 space-y-1.5">
              <h1 className="text-xl lg:text-2xl font-black font-outfit tracking-tight text-content-primary truncate">
                {user?.name || 'Admin'}
              </h1>
              <span className="inline-flex items-center gap-1.5 py-1 rounded-full bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 text-[10px] font-black uppercase tracking-wide">
                <ShieldCheck className="w-3.5 h-3.5" /> Admin
              </span>
            </div>
          </div>

          <div className="hidden sm:block w-px self-stretch bg-slate-200 dark:bg-slate-800 mx-1" />

          <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-0 sm:flex sm:items-center sm:gap-6 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 p-3 sm:p-0 rounded-xl border border-slate-200 dark:border-slate-800 sm:border-none">
              <div className="p-2 bg-background-surface-secondary rounded-lg text-content-secondary flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-content-secondary">Email</p>
                <p className="text-sm font-semibold text-content-primary truncate">{user?.email || 'Not available'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 min-w-0 p-3 sm:p-0 rounded-xl border border-slate-200 dark:border-slate-800 sm:border-none">
              <div className="p-2 bg-background-surface-secondary rounded-lg text-content-secondary flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-content-secondary">Role</p>
                <p className="text-sm font-semibold text-content-primary truncate">{user?.role || 'Admin'}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-5 lg:p-8 space-y-6" radius="3xl">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg lg:text-xl font-black font-outfit tracking-tight text-content-primary">Change password</h2>
            <p className="text-sm font-medium text-content-secondary">Use a strong password to keep your account safe.</p>
          </div>
          <div className="p-3 bg-primary-600 text-white rounded-2xl shadow-sm hidden sm:block">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {PASSWORD_FIELDS.map((item) => (
              <div key={item.id} className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">{item.label}</label>
                <div className="relative">
                  <input
                    type={showPass[item.id] ? 'text' : 'password'}
                    className={`${FIELD_CLASSNAME} pr-12`}
                    value={passwordData[item.id]}
                    onChange={(event) => setPasswordData({ ...passwordData, [item.id]: event.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass({ ...showPass, [item.id]: !showPass[item.id] })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPass[item.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button variant="primary" size="md" className="w-full lg:w-auto text-sm font-black shadow-sm" type="submit" disabled={saving}>
            {saving ? 'Updating password...' : 'Update password'}
          </Button>
        </form>
      </Card>

      {/* Logout */}
      <Card className="p-5 lg:p-8" radius="3xl">
        <button
          onClick={() => secureLogout(router)}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-black uppercase tracking-wide bg-red-500 hover:bg-red-600 text-white shadow-sm transition-colors"
        >
          <LogOut className="w-4 h-4" /> Log out
        </button>
      </Card>
    </div>
  );
};

export default AdminProfilePage;
