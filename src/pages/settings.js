'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, CreditCard, Eye, EyeOff, Info, Lock, ShieldCheck, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

import API from '../lib/api';
import MobileAppWrapper from '../components/MobileAppWrapper';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Loading from '../components/Loading';
import Seo from '../components/Seo';

const FIELD_CLASSNAME = 'w-full px-4 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-800/20 font-bold outline-none focus:border-primary-500 focus:bg-primary-500/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [bank, setBank] = useState({});
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  useEffect(() => {
    const init = async () => {
      try {
        const [profileResult, bankResult] = await Promise.allSettled([API.getProfile(), API.getBankDetails()]);

        if (profileResult.status === 'fulfilled') {
          setProfile(profileResult.value?.user || {});
        }

        if (bankResult.status === 'fulfilled' && bankResult.value?.success) {
          setBank(bankResult.value.bankDetail || {});
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleUpdateProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await API.updateProfile(profile);
      toast.success('Profile updated.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBank = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await API.saveBankDetails(bank);
      toast.success('Bank details saved.');
    } finally {
      setSaving(false);
    }
  };

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
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'bank', label: 'Bank', icon: Building2 },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  if (loading) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><Loading size="md" /></div>;
  }

  return (
    <MobileAppWrapper title="Account Settings">
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 animate-fade-in selection:bg-primary-500 selection:text-white mt-0">
        <Seo title="Account Settings - AajExam" noIndex={true} />

        <div className="container mx-auto px-4 lg:px-8 py-4 py-6 lg:py-12 space-y-6 lg:space-y-12 mt-0 max-w-5xl space-y-12">
          <div className="space-y-4 max-w-3xl px-4 lg:px-0">
            <h1 className="text-3xl lg:text-3xl xl:text-5xl font-black font-outfit tracking-tighter leading-none text-content-primary">Settings</h1>
            <p className="text-sm lg:text-base font-bold text-content-secondary max-w-xl">
              Update your profile, add bank details for withdrawals, and change your password.
            </p>
          </div>

          <div className="px-4 lg:px-0">
            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 p-1.5 bg-background-surface-secondary dark:bg-slate-800/50 rounded-2xl w-fit border border-border-primary/50 shadow-sm relative z-20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 lg:px-6 py-2.5 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-duo-primary scale-105'
                    : 'text-content-secondary hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-primary-500'}`} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <Card className="p-8 lg:p-10 space-y-8 rounded-[3rem] border-none shadow-xl bg-background-surface">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-xl lg:text-3xl font-black font-outfit tracking-tighter leading-none text-content-primary">Your Profile</h2>
                          <p className="text-sm font-bold text-content-secondary">Keep your details up to date.</p>
                        </div>
                        <div className="p-4 bg-primary-500 text-white rounded-3xl shadow-duo-primary">
                          <User className="w-6 h-6" />
                        </div>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Full name</label>
                            <input className={FIELD_CLASSNAME} value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Email</label>
                            <input disabled className={`${FIELD_CLASSNAME} opacity-60 cursor-not-allowed`} value={profile.email || ''} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Phone number</label>
                            <input className={FIELD_CLASSNAME} value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Username</label>
                            <input disabled className={`${FIELD_CLASSNAME} opacity-60 cursor-not-allowed`} value={profile.username ? `@${profile.username}` : ''} />
                          </div>
                        </div>

                        <Button fullWidth size="lg" className="py-5 text-sm font-black shadow-duo-primary" type="submit" disabled={saving}>
                          {saving ? 'Saving changes...' : 'Save profile changes'}
                        </Button>
                      </form>
                    </Card>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-slate-900 border-none text-white rounded-[2.5rem] space-y-4">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-primary-400" />
                        <h3 className="font-outfit font-black tracking-tight text-lg">Why this matters</h3>
                      </div>
                      <p className="text-sm font-medium text-slate-300 leading-relaxed">
                        Correct details help us send rewards and support you when needed.
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <Card className="p-8 lg:p-10 space-y-8 rounded-[3rem] border-none shadow-xl bg-background-surface">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-xl lg:text-3xl font-black font-outfit tracking-tighter leading-none text-content-primary">Bank Details</h2>
                          <p className="text-sm font-bold text-content-secondary">Add your bank account to receive reward money.</p>
                        </div>
                        <div className="p-4 bg-primary-500 text-white rounded-3xl shadow-duo-primary">
                          <Building2 className="w-6 h-6" />
                        </div>
                      </div>

                      <form onSubmit={handleUpdateBank} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Account holder name</label>
                            <input className={FIELD_CLASSNAME} value={bank.accountHolderName || ''} onChange={(event) => setBank({ ...bank, accountHolderName: event.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Account number</label>
                            <input className={FIELD_CLASSNAME} value={bank.accountNumber || ''} onChange={(event) => setBank({ ...bank, accountNumber: event.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">Bank name</label>
                            <input className={FIELD_CLASSNAME} value={bank.bankName || ''} onChange={(event) => setBank({ ...bank, bankName: event.target.value })} />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">IFSC code</label>
                            <input className={FIELD_CLASSNAME} value={bank.ifscCode || ''} onChange={(event) => setBank({ ...bank, ifscCode: event.target.value })} />
                          </div>
                        </div>

                        <Button variant="primary" fullWidth size="lg" className="py-5 text-sm font-black shadow-duo-primary" type="submit" disabled={saving}>
                          {saving ? 'Saving details...' : 'Save bank details'}
                        </Button>
                      </form>
                    </Card>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
                      <CreditCard className="w-10 h-10 mx-auto text-primary-700 dark:text-primary-500" />
                      <h3 className="font-outfit font-black tracking-tight text-lg">Secure handling</h3>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        Your bank details are only used to send your reward money. They are kept safe.
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="max-w-2xl mx-auto">
                  <Card className="p-6 lg:p-12 rounded-[2rem] lg:rounded-[4rem] space-y-10 border-none shadow-2xl bg-background-surface overflow-hidden relative">
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1">
                        <h2 className="text-xl md:text-2xl lg:text-4xl font-black font-outfit tracking-tighter leading-none text-content-primary">Change password</h2>
                        <p className="text-sm font-bold text-content-secondary">Use a strong password to keep your account safe.</p>
                      </div>
                      <div className="p-4 bg-red-500 text-white rounded-3xl shadow-duo-red">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {[
                        { id: 'old', label: 'Current password' },
                        { id: 'new', label: 'New password' },
                        { id: 'confirm', label: 'Confirm new password' },
                      ].map((item) => (
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

                      <Button variant="primary" fullWidth size="lg" className="py-5 text-sm font-black shadow-duo-primary" type="submit" disabled={saving}>
                        {saving ? 'Updating password...' : 'Update password'}
                      </Button>
                    </form>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </MobileAppWrapper>
  );
};

export default SettingsPage;

