'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import WithdrawRequests from './WithdrawRequests';
import ReferralHistory from './ReferralHistory';

const TABS = [
  { id: 'requests', label: 'Withdraw requests', href: '/admin/withdraw-requests' },
  { id: 'rewards', label: 'Referral rewards', href: '/admin/withdraw-requests?tab=rewards' },
];

// One "Payouts" page: the withdrawal requests students make and the referral rewards log that feeds their wallet.
export default function PayoutsPage() {
  const router = useRouter();
  const active = router.query?.tab === 'rewards' ? 'rewards' : 'requests';

  const tabs = (
    <div className="shrink-0 mb-3">
      <div className="inline-flex p-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            replace
            scroll={false}
            className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all ${active === t.id ? 'bg-gradient-to-r from-primary-300 to-primary-400 dark:from-primary-200 dark:to-primary-300 text-primary-950 shadow' : 'text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-white/10'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return active === 'rewards' ? <ReferralHistory tabs={tabs} /> : <WithdrawRequests tabs={tabs} />;
}
