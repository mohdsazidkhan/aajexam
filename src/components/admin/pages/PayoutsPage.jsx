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

// One "Withdraw Requests" page: the withdrawal requests students make and the referral rewards log that feeds their wallet.
export default function PayoutsPage() {
  const router = useRouter();
  const active = router.query?.tab === 'rewards' ? 'rewards' : 'requests';

  const tabs = (
    <div className="shrink-0 mb-3">
      <div className="inline-flex p-1 rounded-full bg-background-surface border border-border-primary">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            replace
            scroll={false}
            className={`px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] transition-all ${active === t.id ? 'text-on-primary bg-primary-600' : 'text-content-secondary dark:hover:bg-white/10'}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );

  return active === 'rewards' ? <ReferralHistory tabs={tabs} /> : <WithdrawRequests tabs={tabs} />;
}
