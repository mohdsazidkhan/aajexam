// Merged into the Payouts page (Referral rewards tab); old links and bookmarks keep working.
export default function ReferralHistoryRedirect() {
  return null;
}

export async function getServerSideProps() {
  return { redirect: { destination: '/admin/withdraw-requests?tab=rewards', permanent: false } };
}
