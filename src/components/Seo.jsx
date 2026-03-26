import Head from 'next/head';
import { useRouter } from 'next/router';

import config from '../lib/config/appConfig';

const Seo = ({
  title = config.APP_NAME,
  description = config.APP_DESCRIPTION,
  image = '/logo.png',
  type = 'website',
  noIndex = false
}) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://subgquiz.com';
  const url = `${siteUrl}${router.asPath || ''}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@subgquiz" />
      <meta name="twitter:creator" content="@subgquiz" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default Seo;


