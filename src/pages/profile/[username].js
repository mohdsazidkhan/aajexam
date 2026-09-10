import dynamic from 'next/dynamic';
import Seo from '../../components/Seo';
import dbConnect from '../../lib/db';
import User from '../../models/User';
import { ProfileSkeleton } from '../../components/skeletons/PrivateSkeletons';

const PublicProfile = dynamic(() => import('../../components/PublicProfile'), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4"><ProfileSkeleton /></div>
});

export default function PublicProfilePage({ username, profile, seo }) {
  const personSchema = profile ? {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.name || username,
    "alternateName": profile.username || username,
    "description": profile.bio,
    "image": seo?.image,
    "url": seo?.url
  } : null;

  return (
    <>
      <Seo
        title={seo?.title || `${username} – AajExam Profile`}
        description={seo?.description || `${username}'s public profile on AajExam.`}
        image={seo?.image}
        canonical={seo?.url || `/profile/${encodeURIComponent(username)}`}
        type="profile"
        keywords={seo?.keywords}
        noIndex={profile && profile.isPublicProfile === false}
        schemas={personSchema}
      />
      <PublicProfile />
    </>
  );
}

export async function getStaticPaths() {
	// Profiles may be large; use fallback
	return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
	const { username } = params || {};
	let profile = null;
	try {
        await dbConnect();
        const user = await User.findOne({ username: username.toLowerCase() })
            .select('name username bio profilePicture followersCount followingCount profileViews level badges isPublicProfile')
            .lean();
        
		if (user) {
            profile = JSON.parse(JSON.stringify(user));
            profile.id = user._id.toString();
        }
	} catch (e) {
		console.error('Error in profile getStaticProps:', e);
	}
	if (!profile) {
		// Public route, but not found
		return { notFound: true, revalidate: 60 };
	}
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
	const titleBase = 'AajExam Platform';
	const name = profile?.name || username;
	const title = `${name} (@${profile?.username || username}) - ${titleBase}`;
	const description = profile?.bio || `${name}'s profile on AajExam.`;
	const image = profile?.profilePicture || '/logo.png';
	const keywords = `${name}, profile, exams`;
	const url = `${baseUrl}/profile/${encodeURIComponent(username || '')}`;

	const safeProps = JSON.parse(
		JSON.stringify(
			{ username: username || '', profile, seo: { title, description, keywords, image, url } },
			(_, v) => (v === undefined ? null : v)
		)
	);

	return {
		props: safeProps,
		revalidate: 60
	};
}

