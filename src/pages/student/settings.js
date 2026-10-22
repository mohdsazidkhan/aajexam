'use client';

import { SettingsPageSkeleton } from '../../components/common/skeletons/PageSkeletons';
import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, m as motion } from 'framer-motion';
import { Building2, CreditCard, Eye, EyeOff, Facebook, Globe, Info, Instagram, Lock, ShieldCheck, Twitter, User, Youtube } from 'lucide-react';
import { toast } from 'react-hot-toast';

import API from '../../lib/api';
import { getCurrentUser } from '../../lib/utils/authUtils';
import MobileAppWrapper from '../../components/common/MobileAppWrapper';
import StateCitySelect from '../../components/common/StateCitySelect';
import Card from '../../components/common/ui/Card';
import Button from '../../components/common/ui/Button';
import Loading from '../../components/common/Loading';
import Seo from '../../components/common/Seo';
import useTranslate from '../../hooks/useTranslate';
import { QUALIFICATIONS, GENDERS, HEARD_FROM, MIN_AGE_YEARS, MAX_AGE_YEARS } from '../../lib/constants/profileOptions';
import { calcAge } from '../../lib/utils/age';

const FIELD_CLASSNAME = 'w-full h-10 px-3 rounded-xl text-sm border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-black font-bold outline-none focus:border-primary-700 focus:bg-primary-500/5 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600';

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
  { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/username' },
  { key: 'x', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/username' },
  { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@username' },
];

// 'YYYY-MM-DD' for <input type="date"> bounds, in the visitor's local calendar.
const toDateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const SettingsPage = () => {
  const { translate } = useTranslate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({});
  const [bank, setBank] = useState({});
  const [passwordData, setPasswordData] = useState({ old: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });

  // Age is derived from the date of birth, never stored.
  const age = useMemo(() => calcAge(profile.dateOfBirth), [profile.dateOfBirth]);
  const dobBounds = useMemo(() => {
    const now = new Date();
    return {
      min: toDateInput(new Date(now.getFullYear() - MAX_AGE_YEARS, now.getMonth(), now.getDate())),
      max: toDateInput(new Date(now.getFullYear() - MIN_AGE_YEARS, now.getMonth(), now.getDate())),
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [profileResult, bankResult] = await Promise.allSettled([
          API.getProfile(),
          API.getBankDetails(),
        ]);

        if (profileResult.status === 'fulfilled') {
          const loaded = profileResult.value?.user || {};
          // The date comes back as an ISO timestamp; the date input wants YYYY-MM-DD.
          setProfile({ ...loaded, dateOfBirth: typeof loaded.dateOfBirth === 'string' ? loaded.dateOfBirth.slice(0, 10) : '' });
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
      // Target exams are managed from the Theme Settings panel; don't let this form overwrite them.
      const { targetExams: _t, primaryTargetExam: _p, ...profileFields } = profile;
      const res = await API.updateProfile(profileFields);
      // The cached localStorage user (read by e.g. the city-prompt modal,
      // navbar) is never refreshed otherwise, so it'd keep showing stale
      // values — like an empty city — until the next login.
      if (res?.success && res.user) {
        const stored = getCurrentUser();
        if (stored) localStorage.setItem('userInfo', JSON.stringify({ ...stored, ...res.user }));
      }
      toast.success(translate('Profile updated.'));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBank = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await API.saveBankDetails(bank);
      toast.success(translate('Bank details saved.'));
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();

    if (!passwordData.old || !passwordData.new || !passwordData.confirm) {
      toast.error(translate('Please fill in all password fields.'));
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error(translate('New password and confirmation do not match.'));
      return;
    }

    setSaving(true);
    try {
      await API.changePassword({ oldPassword: passwordData.old, newPassword: passwordData.new });
      toast.success(translate('Password updated.'));
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
    return (
      <MobileAppWrapper title={translate('Account Settings')}>
        <div className="container mx-auto mt-2"><SettingsPageSkeleton /></div>
      </MobileAppWrapper>
    );
  }

  return (
    <MobileAppWrapper title={translate('Account Settings')}>
      <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white mt-0">
        <Seo title="Account Settings - AajExam" noIndex={true} />

        <div className="container mx-auto mt-2 space-y-3 xl:space-y-4">
          <div className="flex flex-row items-center justify-between gap-3">
            <div>
              <h1 className="text-xl xl:text-3xl font-black font-outfit tracking-tighter leading-none text-content-primary">{translate('Settings')}</h1>
            </div>

            <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1 p-1 bg-background-surface-secondary dark:bg-slate-800/50 rounded-xl w-fit max-w-[70%] border border-slate-200 dark:border-slate-800/50 shadow-sm relative z-20 flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg text-[10px] uppercase font-black tracking-wider transition-all duration-300 whitespace-nowrap flex-shrink-0 ${activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'text-content-secondary hover:text-primary-600 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                >
                  <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : 'text-primary-600'}`} />
                  {translate(tab.label)}
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
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="p-3 xl:p-5 space-y-3 xl:space-y-4 rounded-2xl border-none shadow-sm bg-background-surface">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-lg xl:text-xl font-black font-outfit tracking-tight leading-none text-content-primary">{translate('Your Profile')}</h2>
                        </div>
                        <div className="p-2 bg-primary-600 text-white rounded-xl shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                      </div>

                      <form onSubmit={handleUpdateProfile} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Full name')}</label>
                            <input className={FIELD_CLASSNAME} value={profile.name || ''} onChange={(event) => setProfile({ ...profile, name: event.target.value })} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Email')}</label>
                            <input disabled className={`${FIELD_CLASSNAME} opacity-60 cursor-not-allowed`} value={profile.email || ''} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Phone number')}</label>
                            <input className={FIELD_CLASSNAME} value={profile.phone || ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Username')}</label>
                            <input disabled className={`${FIELD_CLASSNAME} opacity-60 cursor-not-allowed`} value={profile.username ? `@${profile.username}` : ''} />
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('State & City')}</label>
                            <StateCitySelect
                              compact
                              state={profile.state || ''}
                              city={profile.city || ''}
                              onChange={({ state, city }) => setProfile({ ...profile, state, city })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Qualification')}</label>
                            <select
                              className={FIELD_CLASSNAME}
                              value={profile.qualification || ''}
                              onChange={(event) => setProfile({ ...profile, qualification: event.target.value })}
                            >
                              <option value="">{translate('Select qualification')}</option>
                              {QUALIFICATIONS.map((option) => (
                                <option key={option.value} value={option.value}>{translate(option.label)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Gender')}</label>
                            <select
                              className={FIELD_CLASSNAME}
                              value={profile.gender || ''}
                              onChange={(event) => setProfile({ ...profile, gender: event.target.value })}
                            >
                              <option value="">{translate('Select gender')}</option>
                              {GENDERS.map((option) => (
                                <option key={option.value} value={option.value}>{translate(option.label)}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Date of birth')}</label>
                            <input
                              type="date"
                              className={FIELD_CLASSNAME}
                              min={dobBounds.min}
                              max={dobBounds.max}
                              value={profile.dateOfBirth || ''}
                              onChange={(event) => setProfile({ ...profile, dateOfBirth: event.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Age')}</label>
                            {age ? (
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { value: age.years, label: 'Years' },
                                  { value: age.months, label: 'Months' },
                                  { value: age.days, label: 'Days' },
                                ].map((part) => (
                                  <div key={part.label} className="h-10 px-2 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center gap-1">
                                    <div className="text-sm font-black text-content-primary leading-none">{part.value}</div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-slate-500 leading-none">{translate(part.label)}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className={`${FIELD_CLASSNAME} opacity-60 text-sm`}>{translate('Add your date of birth to see your age.')}</div>
                            )}
                          </div>

                          <div className="space-y-1 sm:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('How did you hear about us?')}</label>
                            <select
                              className={FIELD_CLASSNAME}
                              value={profile.heardFrom || ''}
                              onChange={(event) => setProfile({ ...profile, heardFrom: event.target.value })}
                            >
                              <option value="">{translate('Select an option')}</option>
                              {HEARD_FROM.map((option) => (
                                <option key={option.value} value={option.value}>{option.brand ? option.label : translate(option.label)}</option>
                              ))}
                            </select>
                          </div>

                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Bio')}</label>
                          <textarea
                            rows={2}
                            maxLength={100}
                            className={`${FIELD_CLASSNAME.replace('h-10', 'h-auto py-2')} resize-none`}
                            placeholder={translate('Tell others a little about yourself...')}
                            value={profile.bio || ''}
                            onChange={(event) => setProfile({ ...profile, bio: event.target.value })}
                          />
                          <p className="text-[10px] font-semibold text-slate-400 px-1">{(profile.bio || '').length}/100</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                          {SOCIAL_FIELDS.map((social) => (
                            <div key={social.key} className="space-y-2">
                              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1 flex items-center gap-1.5">
                                <social.icon className="w-3.5 h-3.5" /> {social.label}
                              </label>
                              <input
                                className={FIELD_CLASSNAME}
                                placeholder={social.placeholder}
                                value={profile.socialLinks?.[social.key] || ''}
                                onChange={(event) => setProfile({
                                  ...profile,
                                  socialLinks: { ...(profile.socialLinks || {}), [social.key]: event.target.value }
                                })}
                              />
                            </div>
                          ))}
                        </div>

                        <label className="flex items-center gap-3 p-3 rounded-xl border-2 border-slate-100 dark:border-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded-md accent-primary-500 flex-shrink-0"
                            checked={!!profile.isPublicProfile}
                            onChange={(event) => setProfile({ ...profile, isPublicProfile: event.target.checked })}
                          />
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            <Globe className="w-4 h-4 text-primary-600" />
                            Make my profile public (visible at /u/{profile.username || 'username'})
                          </span>
                        </label>

                        <div className="flex justify-end">
                          <Button size="md" className="w-full xl:w-auto xl:px-8 py-2.5 text-sm font-black shadow-sm" type="submit" disabled={saving}>
                            {saving ? translate('Saving changes...') : translate('Save profile changes')}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div>
                    <Card className="bg-slate-900 border-none text-white rounded-2xl p-3 space-y-1">
                      <div className="flex items-center gap-3">
                        <Info className="w-5 h-5 text-primary-400" />
                        <h3 className="font-outfit font-black tracking-tight text-base">{translate('Why this matters')}</h3>
                      </div>
                      <p className="text-xs font-medium text-slate-300 leading-relaxed">
                        {translate('Correct details help us send rewards and support you when needed.')}
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <div className="p-3 xl:p-5 space-y-3 xl:space-y-4 rounded-2xl border-none shadow-sm bg-background-surface">
                      <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h2 className="text-lg xl:text-xl font-black font-outfit tracking-tight leading-none text-content-primary">{translate('Bank Details')}</h2>
                        </div>
                        <div className="p-2 bg-primary-600 text-white rounded-xl shadow-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                      </div>

                      <form onSubmit={handleUpdateBank} className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Account holder name')}</label>
                            <input className={FIELD_CLASSNAME} value={bank.accountHolderName || ''} onChange={(event) => setBank({ ...bank, accountHolderName: event.target.value })} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Account number')}</label>
                            <input className={FIELD_CLASSNAME} value={bank.accountNumber || ''} onChange={(event) => setBank({ ...bank, accountNumber: event.target.value })} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('Bank name')}</label>
                            <input className={FIELD_CLASSNAME} value={bank.bankName || ''} onChange={(event) => setBank({ ...bank, bankName: event.target.value })} />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate('IFSC code')}</label>
                            <input className={FIELD_CLASSNAME} value={bank.ifscCode || ''} onChange={(event) => setBank({ ...bank, ifscCode: event.target.value })} />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button variant="primary" size="md" className="w-full xl:w-auto xl:px-8 py-2.5 text-sm font-black shadow-sm" type="submit" disabled={saving}>
                            {saving ? translate('Saving details...') : translate('Save bank details')}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>

                  <div>
                    <Card className="rounded-2xl p-3 border-2 border-dashed border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                        <h3 className="font-outfit font-black tracking-tight text-base">{translate('Secure handling')}</h3>
                      </div>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                        {translate('Your bank details are only used to send your reward money. They are kept safe.')}
                      </p>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <div className="p-3 xl:p-5 space-y-3 xl:space-y-4 rounded-2xl border-none shadow-sm bg-background-surface">
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="space-y-1">
                        <h2 className="text-lg xl:text-xl font-black font-outfit tracking-tight leading-none text-content-primary">{translate('Change password')}</h2>
                      </div>
                      <div className="p-2 bg-primary-600 text-white rounded-xl shadow-sm">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'old', label: 'Current password' },
                          { id: 'new', label: 'New password' },
                          { id: 'confirm', label: 'Confirm new password' },
                        ].map((item) => (
                          <div key={item.id} className="space-y-2">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-1">{translate(item.label)}</label>
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

                      <div className="flex justify-end">
                        <Button variant="primary" size="md" className="w-full xl:w-auto xl:px-8 py-2.5 text-sm font-black shadow-sm" type="submit" disabled={saving}>
                          {saving ? translate('Updating password...') : translate('Update password')}
                        </Button>
                      </div>
                    </form>
                  </div>
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

