'use client';

import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import API from '../lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';
// MobileAppWrapper import removed
// UnifiedNavbar import removed
import UnifiedFooter from '../components/UnifiedFooter';
import Loading from '../components/Loading';
import Seo from '../components/Seo';

const SettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBank, setSavingBank] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const hasFetchedRef = useRef(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    socialLinks: { facebook: '', x: '', instagram: '', youtube: '' }
  });
  const [bank, setBank] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: ''
  });

  useEffect(() => {
    // Prevent duplicate API calls (React Strict Mode in dev causes double renders)
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    const init = async () => {
      try {
        setLoading(true);

        // Fetch profile and bank details in parallel to reduce API calls
        const [profileRes, bankRes] = await Promise.allSettled([
          API.getProfile(),
          API.getBankDetails().catch(() => ({ success: false, bankDetail: null }))
        ]);

        // Handle profile response
        if (profileRes.status === 'fulfilled') {
          const user = profileRes.value?.user || profileRes.value?.data?.user || profileRes.value;
          if (user) {
            setProfile({
              name: user?.name || '',
              email: user?.email || '',
              phone: user?.phone || '',
              socialLinks: {
                facebook: user?.socialLinks?.facebook || '',
                x: user?.socialLinks?.x || '',
                instagram: user?.socialLinks?.instagram || '',
                youtube: user?.socialLinks?.youtube || ''
              }
            });
          }
        }

        // Handle bank details response
        if (bankRes.status === 'fulfilled' && bankRes.value?.success && bankRes.value?.bankDetail) {
          setBank({
            accountHolderName: bankRes.value.bankDetail.accountHolderName || '',
            accountNumber: bankRes.value.bankDetail.accountNumber || '',
            bankName: bankRes.value.bankDetail.bankName || '',
            ifscCode: bankRes.value.bankDetail.ifscCode || '',
            branchName: bankRes.value.bankDetail.branchName || ''
          });
          setHasBankDetails(true);
        } else {
          setHasBankDetails(false);
        }
      } catch (e) {
        console.error('Init settings error:', e);
        hasFetchedRef.current = false; // Reset on error so it can retry
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setSavingProfile(true);
      const response = await API.updateProfile(profile);
      toast.success('✅ Profile successfully updated!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || '❌ Failed to update profile. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const saveBank = async (e) => {
    e.preventDefault();
    try {
      setSavingBank(true);
      const response = await API.saveBankDetails(bank);
      setHasBankDetails(true);
      toast.success('✅ Bank details successfully saved!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || '❌ Failed to save bank details. Please try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } finally {
      setSavingBank(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();

    // Validation
    if (!passwordData.oldPassword) {
      toast.error('❌ Please enter your old password', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (!passwordData.newPassword) {
      toast.error('❌ Please enter a new password', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('❌ Password must be at least 6 characters long', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('❌ New password and confirm password do not match', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (passwordData.oldPassword === passwordData.newPassword) {
      toast.error('❌ New password must be different from old password', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setChangingPassword(true);
      const response = await API.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('✅ Password successfully changed!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#10b981',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });

      // Reset form
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || '❌ Failed to change password. Please check your old password and try again.', {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: {
          background: '#ef4444',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500'
        }
      });
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <>
        <Seo
          title="Account Settings - SUBG QUIZ Platform"
          description="Manage your SUBG QUIZ account settings. Update your profile information, bank details, notification preferences, and security settings."
          noIndex={true}
        />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <Loading size="md" color="yellow" message="" />
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <Seo
        title="Account Settings - SUBG QUIZ Platform"
        description="Manage your SUBG QUIZ account settings. Update your profile information, bank details, notification preferences, and security settings."
        noIndex={true}
      />

      {/* UnifiedNavbar removed */}
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 lg:px-6 xl:px-8 ">
          <div className="mb-8">
            <h1 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white mb-2">Account Settings</h1>
            <p className="text-sm md:text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400">Manage your profile, password, and bank details</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Profile Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Section */}
              <form onSubmit={saveProfile} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                  <h2 className="text-md lg:text-xl font-semibold text-white flex items-center gap-2">
                    <span>👤</span> Profile Information
                  </h2>
                </div>
                <div className="p-3 lg:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                      <input value={profile.name} onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                      <input type="email" value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="Enter your email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                      <input value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="Enter your phone" />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-md lg:text-lg font-semibold text-gray-900 dark:text-white mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Facebook</label>
                        <input value={profile.socialLinks.facebook} onChange={(e) => setProfile(p => ({ ...p, socialLinks: { ...p.socialLinks, facebook: e.target.value } }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="https://facebook.com/yourusername" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">X (Twitter)</label>
                        <input value={profile.socialLinks.x} onChange={(e) => setProfile(p => ({ ...p, socialLinks: { ...p.socialLinks, x: e.target.value } }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="https://x.com/yourusername" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instagram</label>
                        <input value={profile.socialLinks.instagram} onChange={(e) => setProfile(p => ({ ...p, socialLinks: { ...p.socialLinks, instagram: e.target.value } }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="https://instagram.com/yourusername" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">YouTube</label>
                        <input value={profile.socialLinks.youtube} onChange={(e) => setProfile(p => ({ ...p, socialLinks: { ...p.socialLinks, youtube: e.target.value } }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all" placeholder="https://youtube.com/yourusername" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button disabled={savingProfile} type="submit" className="w-full lg:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {savingProfile ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>

              {/* Change Password Section */}
              <form onSubmit={changePassword} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                  <h2 className="text-md lg:text-xl font-semibold text-white flex items-center gap-2">
                    <FaLock className="text-white" />
                    Change Password
                  </h2>
                </div>
                <div className="p-3 lg:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Old Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.oldPassword ? 'text' : 'password'}
                          value={passwordData.oldPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, oldPassword: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter your current password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, oldPassword: !p.oldPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPasswords.oldPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.newPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, newPassword: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter new password (min 6 characters)"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, newPassword: !p.newPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 pr-10 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(p => ({ ...p, confirmPassword: !p.confirmPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                  <button disabled={changingPassword} type="submit" className="w-full lg:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column - Bank Details Section */}
            <div className="lg:col-span-1">
              <form onSubmit={saveBank} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden sticky top-16">
                <div className={`px-6 py-4 ${hasBankDetails ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}>
                  <h2 className="text-md lg:text-xl font-semibold text-white flex items-center gap-2">
                    <span>🏦</span> Bank Details
                  </h2>
                  {hasBankDetails && (
                    <p className="text-sm text-white/90 mt-1">Your bank details are saved</p>
                  )}
                </div>
                <div className="p-3 lg:p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Holder Name</label>
                      <input value={bank.accountHolderName} onChange={(e) => setBank(b => ({ ...b, accountHolderName: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter account holder name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Account Number</label>
                      <input value={bank.accountNumber} onChange={(e) => setBank(b => ({ ...b, accountNumber: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter account number" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bank Name</label>
                      <input value={bank.bankName} onChange={(e) => setBank(b => ({ ...b, bankName: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter bank name" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IFSC Code</label>
                      <input value={bank.ifscCode} onChange={(e) => setBank(b => ({ ...b, ifscCode: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter IFSC code" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Branch Name</label>
                      <input value={bank.branchName} onChange={(e) => setBank(b => ({ ...b, branchName: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all" placeholder="Enter branch name" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <button disabled={savingBank} type="submit" className={`w-full w-full lg:w-auto px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${hasBankDetails
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                    }`}>
                    {savingBank ? (hasBankDetails ? 'Updating...' : 'Adding...') : (hasBankDetails ? 'Update Bank Details' : 'Add Bank Details')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default SettingsPage;


