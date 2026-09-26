// Legacy URL — the public profile now lives at /u/[username]. Kept as a
// permanent redirect so old bookmarks/backlinks to /profile/[username] still resolve.
export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { username } = params || {};
  return {
    redirect: {
      destination: `/u/${encodeURIComponent(username || '')}`,
      permanent: true
    }
  };
}

export default function ProfileRedirect() {
  return null;
}
