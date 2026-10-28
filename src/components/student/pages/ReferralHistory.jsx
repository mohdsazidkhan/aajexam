'use client';

import React, { useEffect, useState, useCallback } from "react";
import {
   Users,
   Wallet,
   Trophy,
   UserPlus,
   History,
   Copy,
   CircleCheck,
   Clock,
   TrendingUp,
   Zap,
   ShieldCheck,
   ChevronRight,
   ArrowRight,
   Gift,
   Coins
} from 'lucide-react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

import API from '../../../lib/api';
import { ListSkeleton } from "../../common/skeletons/PrivateSkeletons";
import { useSSR } from '../../../hooks/useSSR';
import Card from '../../common/ui/Card';
import Button from '../../common/ui/Button';
import PageHero from '../../common/ui/PageHero';
import TicketCard from '../TicketCard';
import useTranslate from '../../../hooks/useTranslate';

const PAGE_LIMIT = 20;

export default function ReferralHistory() {
  const { translate, rich } = useTranslate();
   const { isMounted, router } = useSSR();

   const [user, setUser] = useState(null);
   const [transactions, setTransactions] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [page, setPage] = useState(1);
   const [pagination, setPagination] = useState({});
   const [bankDetail, setBankDetail] = useState(null);
   const [bankDetailLoaded, setBankDetailLoaded] = useState(false);
   const [showBankForm, setShowBankForm] = useState(false);
   const [bankForm, setBankForm] = useState({ accountHolderName: '', accountNumber: '', bankName: '', ifscCode: '', branchName: '', upiId: '' });
   const [savingBank, setSavingBank] = useState(false);
   const [showPayoutForm, setShowPayoutForm] = useState(false);
   const [payoutAmount, setPayoutAmount] = useState('');
   const [submittingPayout, setSubmittingPayout] = useState(false);

   const fetchReferralHistory = useCallback(async (pageNum = 1) => {
      try {
         setLoading(true);
         const params = { page: pageNum, limit: PAGE_LIMIT };
         const response = await API.getReferralHistory(params);

         if (response?.success) {
            setUser(response.data?.user || null);
            setTransactions(response.data?.transactions || []);
            setPagination(response.data?.pagination || {});
         } else {
            setError(response?.message || translate('Failed to load referral data'));
         }
      } catch (err) {
         setError(err.message || translate('Connection lost. Please try again.'));
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (isMounted) fetchReferralHistory(page);
   }, [isMounted, page, fetchReferralHistory]);

   const fetchBankDetail = useCallback(async () => {
      try {
         const res = await API.getBankDetails();
         const detail = res?.bankDetail || null;
         setBankDetail(detail);
         if (detail) {
            setBankForm({
               accountHolderName: detail.accountHolderName || '',
               accountNumber: detail.accountNumber || '',
               bankName: detail.bankName || '',
               ifscCode: detail.ifscCode || '',
               branchName: detail.branchName || '',
               upiId: detail.upiId || ''
            });
         }
      } catch (err) {
         // No saved bank details yet — treat as none rather than an error.
      } finally {
         setBankDetailLoaded(true);
      }
   }, []);

   useEffect(() => {
      if (isMounted) fetchBankDetail();
   }, [isMounted, fetchBankDetail]);

   const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toast.success(translate('Referral link copied!'));
   };

   const MIN_PAYOUT = parseInt(process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000', 10);

   const handleSaveBankDetail = async () => {
      const { accountHolderName, accountNumber, bankName, ifscCode, branchName } = bankForm;
      if (!accountHolderName.trim() || !accountNumber.trim() || !bankName.trim() || !ifscCode.trim() || !branchName.trim()) {
         toast.error(translate('Fill in all required bank detail fields'));
         return;
      }
      try {
         setSavingBank(true);
         const res = await API.saveBankDetails(bankForm);
         if (res?.success) {
            toast.success(translate('Bank details saved!'));
            setBankDetail(res.bankDetail);
            setShowBankForm(false);
         } else {
            toast.error(res?.message || translate('Failed to save bank details'));
         }
      } catch (err) {
         toast.error(err?.response?.data?.message || err?.message || translate('Failed to save bank details'));
      } finally {
         setSavingBank(false);
      }
   };

   const handleRequestPayout = async () => {
      const amount = Number(payoutAmount);
      if (!amount || amount < MIN_PAYOUT) {
         toast.error(translate('Minimum withdrawal amount is ₹{amount}', { amount: MIN_PAYOUT }));
         return;
      }
      if (amount > (user?.walletBalance || 0)) {
         toast.error(translate('Amount exceeds your available balance'));
         return;
      }
      if (!bankDetail) {
         toast.error(translate('Add your bank details first'));
         return;
      }
      try {
         setSubmittingPayout(true);
         const res = await API.createReferralWithdrawRequest({
            amount,
            bankDetails: {
               accountHolderName: bankDetail.accountHolderName,
               accountNumber: bankDetail.accountNumber,
               bankName: bankDetail.bankName,
               ifscCode: bankDetail.ifscCode
            }
         });
         if (res?.success) {
            toast.success(translate('Withdrawal request submitted! Admin will review and mark it paid.'));
            setShowPayoutForm(false);
            setPayoutAmount('');
            fetchReferralHistory(page);
         } else {
            toast.error(res?.message || translate('Failed to submit request'));
         }
      } catch (err) {
         toast.error(err?.response?.data?.message || err?.message || translate('Failed to submit request'));
      } finally {
         setSubmittingPayout(false);
      }
   };

   if (!isMounted) return null;

   const rewardLabels = {
      'plan99': 'PRO PLAN ACTIVATED',
   };

   const rewardColors = {
      'plan99': 'emerald',
   };

   return (
      <div className="min-h-screen animate-fade-in selection:bg-primary-600 selection:text-white">

         <div className="container mx-auto pt-3 xl:pt-4 pb-6 xl:pb-10 space-y-2 xl:space-y-3">

            {/* --- Header Section --- */}
            <PageHero
               icon={Users}
               title={rich('Referral <0>History</0>', [(c) => <span className="text-primary-600">{c}</span>])}
               actions={user && (
                  <div className="w-full xl:w-auto xl:min-w-[300px] px-3 py-2 ring-1 ring-slate-200 dark:ring-white/20 text-left" style={{ borderRadius: 'var(--radius)' }}>
                     <p className="text-[9px] xl:text-xs font-bold text-content-secondary dark:text-white/75 uppercase tracking-[0.08em] leading-none mb-1">{translate('Your Referral Code')}</p>
                     <div className="flex items-center gap-2 xl:gap-3">
                        <p className="flex-1 text-sm xl:text-lg font-bold font-mono tracking-[0.08em] truncate text-primary-600">{user.referralCode}</p>
                        <button type="button" className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase text-on-primary hover:brightness-105 transition-all bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }} onClick={() => copyToClipboard(`https://aajexam.com/register?ref=${user.referralCode}`)}>
                           <Copy className="w-3.5 h-3.5 xl:w-4 xl:h-4" /> COPY LINK
                        </button>
                     </div>
                  </div>
               )}
            />

            {/* --- Stats Grid --- */}
            {user && (
               <section className="grid grid-cols-2 xl:grid-cols-5 gap-2 xl:gap-3">
                  {[
                     { label: 'Referral Rewards', val: `₹${(user.walletBalance || 0).toLocaleString()}`, icon: Coins, color: 'primary' },
                     { label: 'Money You Earned', val: `₹${(user.referralRewards?.reduce((s, r) => s + (r.amount || 0), 0) || 0).toLocaleString()}`, icon: Wallet, color: 'primary' },
                     { label: 'Friends Referred', val: user.referralCount || 0, icon: UserPlus, color: 'primary' },
                     { label: 'Times Rewarded', val: user.referralRewards?.length || 0, icon: Gift, color: 'primary' },
                     { label: 'Who Referred You', val: user.referredBy || 'Direct', icon: ShieldCheck, color: 'primary' }
                  ].map((s, i) => (
                     <div key={i} className="group relative overflow-hidden p-3 bg-background-surface border border-border-primary hover:-translate-y-1 transition-all" style={{ borderRadius: 'var(--radius)' }}>
                        <div className="flex justify-between items-start mb-1.5">
                           <div className="w-8 h-8 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                              <s.icon className="w-4 h-4" />
                           </div>
                        </div>
                        <p className="text-[8px] xl:text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] mb-0.5 xl:mb-1">{translate(s.label)}</p>
                        <p className="text-sm xl:text-xl font-bold font-outfit tracking-tight text-primary-600 truncate">{s.val}</p>
                     </div>
                  ))}
               </section>
            )}

            {/* --- Payout Section --- */}
            {user && bankDetailLoaded && (
               <section>
                  <TicketCard icon={Zap} title="Referral Payouts">
                     <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                        <div className="space-y-2">
                           {(user.walletBalance || 0) >= MIN_PAYOUT ? (
                              <div className="flex items-start gap-2">
                                 <CircleCheck className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                                 <p className="text-sm font-bold text-content-secondary">
                                    {bankDetail
                                       ? `You're eligible to withdraw to your ${bankDetail.bankName} account`
                                       : `You're eligible to withdraw — add your bank details to request it`}
                                 </p>
                              </div>
                           ) : (
                              <div className="space-y-2 xl:space-y-0 xl:flex xl:items-center xl:gap-4">
                                 <div className="flex items-start gap-2">
                                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                                    <p className="text-sm font-bold text-content-secondary xl:whitespace-nowrap">
                                       {rich('Minimum withdrawal is <0></0> — earn <1></1> more to unlock it', [() => <span className="font-bold text-primary-600">₹{MIN_PAYOUT.toLocaleString()}</span>, () => <span className="font-bold text-primary-600">₹{(MIN_PAYOUT - (user.walletBalance || 0)).toLocaleString()}</span>])}
                                    </p>
                                 </div>
                                 <div className="w-full xl:w-56 xl:shrink-0 h-2 bg-background-surface-secondary rounded-full overflow-hidden">
                                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${Math.min(100, ((user.walletBalance || 0) / MIN_PAYOUT) * 100)}%` }} />
                                 </div>
                              </div>
                           )}
                        </div>

                        {(user.walletBalance || 0) >= MIN_PAYOUT && !showPayoutForm && !showBankForm && (
                           bankDetail ? (
                              <Button variant="primary" className="rounded-full px-5 py-2 text-xs font-bold shrink-0" onClick={() => { setPayoutAmount(String(user.walletBalance)); setShowPayoutForm(true); }}>
                                 {translate('Request Withdrawal')} <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                           ) : (
                              <Button variant="primary" className="rounded-full px-5 py-2 text-xs font-bold shrink-0" onClick={() => setShowBankForm(true)}>
                                 {translate('Add Bank Details')} <ArrowRight className="w-4 h-4 ml-1" />
                              </Button>
                           )
                        )}
                     </div>

                     {/* Saved bank details + edit link */}
                     {bankDetail && !showBankForm && (user.walletBalance || 0) >= MIN_PAYOUT && (
                        <div className="mt-3 pt-3 border-t border-border-primary flex flex-wrap items-center justify-between gap-3">
                           <p className="text-xs font-bold text-content-secondary">
                              {bankDetail.bankName} •••• {bankDetail.accountNumber?.slice(-4)} ({bankDetail.accountHolderName})
                           </p>
                           <button onClick={() => setShowBankForm(true)} className="text-xs font-bold text-primary-600 uppercase tracking-[0.08em] hover:underline">
                              {translate('Edit Bank Details')}
                           </button>
                        </div>
                     )}

                     {/* Bank details form */}
                     {showBankForm && (
                        <div className="mt-3 pt-3 border-t border-border-primary space-y-4">
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {[
                                 { key: 'accountHolderName', label: 'Account Holder Name' },
                                 { key: 'accountNumber', label: 'Account Number' },
                                 { key: 'bankName', label: 'Bank Name' },
                                 { key: 'ifscCode', label: 'IFSC Code' },
                                 { key: 'branchName', label: 'Branch Name' },
                                 { key: 'upiId', label: 'UPI ID (optional)' }
                              ].map((f) => (
                                 <div key={f.key}>
                                    <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">{translate(f.label)}</label>
                                    <input
                                       type="text"
                                       value={bankForm[f.key]}
                                       onChange={(e) => setBankForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                                       className="w-full mt-1 px-4 py-3 border border-border-primary bg-background-surface font-bold text-sm focus:border-primary-600 outline-none"
                                    />
                                 </div>
                              ))}
                           </div>
                           <div className="flex gap-3">
                              <Button variant="primary" disabled={savingBank} className="rounded-full px-5 py-2 text-xs font-bold" onClick={handleSaveBankDetail}>
                                 {savingBank ? translate('Saving...') : translate('Save Bank Details')}
                              </Button>
                              <Button variant="secondary" className="rounded-full px-5 py-2 text-xs font-bold" onClick={() => setShowBankForm(false)}>
                                 {translate('Cancel')}
                              </Button>
                           </div>
                        </div>
                     )}

                     {/* Withdrawal amount form */}
                     {showPayoutForm && (
                        <div className="mt-3 pt-3 border-t border-border-primary space-y-4">
                           <div className="max-w-xs">
                              <label className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">{translate('Amount (min ₹{min}, max ₹{max})', { min: MIN_PAYOUT, max: (user.walletBalance || 0).toLocaleString() })}</label>
                              <input
                                 type="number"
                                 min={MIN_PAYOUT}
                                 max={user.walletBalance}
                                 value={payoutAmount}
                                 onChange={(e) => setPayoutAmount(e.target.value)}
                                 className="w-full mt-1 px-4 py-3 border border-border-primary bg-background-surface font-bold text-sm focus:border-primary-600 outline-none"
                              />
                           </div>
                           <p className="text-[11px] font-bold text-content-secondary uppercase tracking-[0.08em]">
                              {translate('Paid to: {bank}', { bank: bankDetail?.bankName })} •••• {bankDetail?.accountNumber?.slice(-4)}
                           </p>
                           <div className="flex gap-3">
                              <Button variant="primary" disabled={submittingPayout} className="rounded-full px-5 py-2 text-xs font-bold" onClick={handleRequestPayout}>
                                 {submittingPayout ? translate('Submitting...') : translate('Submit Request')}
                              </Button>
                              <Button variant="secondary" className="rounded-full px-5 py-2 text-xs font-bold" onClick={() => setShowPayoutForm(false)}>
                                 {translate('Cancel')}
                              </Button>
                           </div>
                           <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em]">
                              {translate('After you submit, admin reviews the request and marks it paid.')}
                           </p>
                        </div>
                     )}
                  </TicketCard>
               </section>
            )}

            {/* --- Main Content Area --- */}
            <div className="flex flex-col gap-4">

               {/* Left Sidebar: Breakdown */}
               <div className="space-y-3">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 xl:gap-8">
                     <section className="space-y-2">
                        <h2 className="flex items-center gap-2.5 text-xl font-bold font-outfit tracking-tight"><span className="w-9 h-9 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><TrendingUp className="w-4 h-4" /></span>{rich('How You <0>Earned</0>', [(c) => <span className="text-primary-600">{c}</span>])}</h2>
                     </section>

                     <div className="w-full xl:w-auto xl:min-w-[320px] space-y-2 xl:space-y-4">
                        {[
                           { label: 'Friend Buys PRO Plan', type: 'plan99', color: 'primary' }
                        ].map((b, i) => {
                           const amount = user?.referralRewards?.filter(r => r.type === b.type).reduce((s, r) => s + (r.amount || 0), 0) || 0;
                           const count = user?.referralRewards?.filter(r => r.type === b.type).length || 0;
                           return (
                              <Card key={i} className="relative overflow-hidden group">
                                 <div className="flex justify-between items-center relative z-10">
                                    <div className="space-y-1">
                                       <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-none">{translate(b.label)}</p>
                                       <p className="text-xl font-bold font-outfit text-content-primary">₹{amount.toLocaleString()}</p>
                                    </div>
                                    <div className="text-[10px] font-bold px-3 py-1 text-on-primary bg-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}>
                                       {translate('{count} FRIENDS', { count })}
                                    </div>
                                 </div>
                                 <div className="absolute top-0 right-0 w-1.5 h-full bg-primary-600" />
                              </Card>
                           );
                        })}
                     </div>
                  </div>
               </div>

               {/* Right Area: Friend List */}
               <div className="space-y-2 xl:space-y-3">
                  <div className="flex items-center justify-between">
                     <section className="space-y-1 xl:space-y-2">
                        <h2 className="flex items-center gap-2.5 text-sm xl:text-xl font-bold font-outfit tracking-tight"><span className="w-9 h-9 flex items-center justify-center text-primary-600 border border-primary-600" style={{ borderRadius: 'var(--radius-sm)' }}><History className="w-4 h-4" /></span>{rich('Referral <0>Logs</0>', [(c) => <span className="text-primary-600">{c}</span>])}</h2>
                     </section>
                  </div>

                  <AnimatePresence mode="wait">
                     {loading ? (
                        <ListSkeleton rows={6} />
                     ) : transactions.length === 0 ? (
                        <Card as="section" className="py-4 text-center space-y-2 xl:space-y-3 border-dashed border border-border-primary bg-transparent rounded-2xl">
                           <Users className="w-8 h-8 xl:w-10 xl:h-10 text-slate-200 mx-auto" />
                           <div className="space-y-1 xl:space-y-2">
                              <h3 className="text-sm xl:text-xl font-bold font-outfit tracking-tight">{translate('No Referrals Yet')}</h3>
                              <p className="text-[10px] xl:text-xs font-bold text-content-secondary uppercase tracking-[0.08em]">{translate('You have not referred anyone yet. Share your link and start earning.')}</p>
                           </div>
                           <Button variant="primary" size="sm" className="xl:px-8 xl:py-3 mx-auto xl:rounded-full" onClick={() => copyToClipboard(`https://aajexam.com/register?ref=${user.referralCode}`)}>
                              {translate('COPY LINK')}
                           </Button>
                        </Card>
                     ) : (
                        <div className="space-y-2 xl:space-y-4">
                           <Card className="overflow-hidden" padded={false}>
                              <div className="overflow-x-auto">
                                 <table className="w-full text-left border-collapse">
                                    <thead className="text-primary-900 dark:text-white bg-background-surface border-b border-border-primary">
                                       <tr>
                                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] border-b border-border-primary dark:border-transparent">{translate('Student')}</th>
                                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] border-b border-border-primary dark:border-transparent">{translate('Reward Type')}</th>
                                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] border-b border-border-primary dark:border-transparent">{translate('Reward')}</th>
                                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] border-b border-border-primary dark:border-transparent text-right">{translate('Status')}</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-primary">
                                       {transactions.map((tx, idx) => (
                                          <motion.tr key={tx._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                                             <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                   <div className="w-8 h-8 flex items-center justify-center font-bold text-sm text-on-primary bg-primary-600" style={{ borderRadius: 'var(--radius)' }}>
                                                      {(tx.invitee?.name || 'S').charAt(0).toUpperCase()}
                                                   </div>
                                                   <div>
                                                      <p className="text-sm font-bold font-outfit uppercase truncate max-w-[150px]">{tx.invitee?.name || translate('Student')}</p>
                                                      <p className="text-[10px] font-bold text-content-secondary uppercase tracking-tight">{new Date(tx.date).toLocaleDateString()}</p>
                                                   </div>
                                                </div>
                                             </td>
                                             <td className="px-4 py-3">
                                                <span className="px-3 py-1 text-[10px] font-bold tracking-[0.08em] uppercase text-primary-600 border border-border-primary" style={{ borderRadius: 'var(--radius-sm)' }}>
                                                   {translate(rewardLabels[tx.rewardType] || '')}
                                                </span>
                                             </td>
                                             <td className="px-4 py-3">
                                                <p className="text-sm font-bold text-primary-600 uppercase">+₹{tx.amount}</p>
                                             </td>
                                             <td className="px-4 py-3 text-right">
                                                <p className="text-[10px] font-bold text-content-secondary uppercase tracking-[0.08em] leading-none mb-1">{translate('Balance')}</p>
                                                <p className="text-sm font-bold font-outfit uppercase tracking-tight text-content-secondary">₹{tx.balance?.toLocaleString()}</p>
                                             </td>
                                          </motion.tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </Card>

                           {/* Pagination Controls */}
                           {pagination.totalPages > 1 && (
                              <div className="flex justify-center gap-2 pt-2">
                                 {[...Array(pagination.totalPages)].map((_, i) => (
                                    <button
                                       key={i}
                                       onClick={() => setPage(i + 1)}
                                       style={{ borderRadius: 'var(--radius)' }} className={`w-10 h-10 text-xs font-bold transition-all ${page === i + 1 ? 'text-on-primary bg-primary-600' : 'bg-background-surface text-content-secondary border border-border-primary hover:border-primary-500'}`}
                                    >
                                       {i + 1}
                                    </button>
                                 ))}
                              </div>
                           )}
                        </div>
                     )}
                  </AnimatePresence>
               </div>
            </div>

         </div>

      </div>
   );
}

