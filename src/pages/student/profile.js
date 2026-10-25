// Route file for /profile. Delegates to the canonical component to avoid duplication.
import dynamic from 'next/dynamic';
import { ProfilePageSkeleton } from '../../components/common/skeletons/PageSkeletons';

// The skeleton shows while the page chunk downloads, then ProfilePage shows the same skeleton
// while its data loads, so there is no blank gap in between.
const ProfilePage = dynamic(() => import('../../components/student/pages/ProfilePage.jsx'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-background-page font-outfit">
      <div className="py-2 xl:py-4"><ProfilePageSkeleton /></div>
    </div>
  ),
});

export default ProfilePage;
