import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Head from 'next/head';
import dbConnect from '../../lib/db';
import User from '../../models/User';

const PublicProfile = dynamic(() => import('../../components/PublicProfile'), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function PublicProfilePage({ username, profile, seo }) {
  return (
    <>
			<Head>
				<title>{seo?.title || 'User Profile - SUBG QUIZ Platform'}</title>
				{seo?.description && <meta name="description" content={seo.description} />}
				{seo?.keywords && <meta name="keywords" content={seo.keywords} />}
				<meta property="og:type" content="profile" />
				{seo?.title && <meta property="og:title" content={seo.title} />} 
				{seo?.description && <meta property="og:description" content={seo.description} />}
				{seo?.image && <meta property="og:image" content={seo.image} />}
				{seo?.url && <meta property="og:url" content={seo.url} />}
				<meta name="twitter:card" content="summary_large_image" />
				{seo?.title && <meta name="twitter:title" content={seo.title} />}
				{seo?.description && <meta name="twitter:description" content={seo.description} />}
				{seo?.image && <meta name="twitter:image" content={seo.image} />}
				{seo?.url && <link rel="canonical" href={seo.url} />}
			</Head>
      <Suspense fallback={<div>Loading...</div>}>
				<PublicProfile />
      </Suspense>
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
	const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
	const titleBase = 'SUBG QUIZ Platform';
	const name = profile?.name || username;
	const title = `${name} (@${profile?.username || username}) - ${titleBase}`;
	const description = profile?.bio || `${name}'s profile on SUBG QUIZ.`;
	const image = profile?.profilePicture || '/logo.png';
	const keywords = `${name}, profile, quizzes`;
	const url = baseUrl ? `${baseUrl}/profile/${encodeURIComponent(username)}` : undefined;

	return {
		props: { username, profile, seo: { title, description, keywords, image, url } },
		revalidate: 60
	};
}

