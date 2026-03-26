// Route file for /profile. Delegates to the canonical component to avoid duplication.
import dynamic from 'next/dynamic';

const ProfilePage = dynamic(() => import('../components/pages/ProfilePage.jsx'), {
  ssr: false,
});

export default ProfilePage;


