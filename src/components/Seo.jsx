import Head from 'next/head';
import { useRouter } from 'next/router';

import config from '../lib/config/appConfig';

const Seo = ({
  title = config.APP_NAME,
  description = config.APP_DESCRIPTION,
  image,
  type = 'website',
  noIndex = false
}) => {
  const router = useRouter();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
  const cleanPath = (router.asPath || '').split('?')[0].split('#')[0];
  const url = `${siteUrl}${cleanPath}`;
  const dynamicOgImage = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description || '')}&type=${type === 'article' ? 'blog' : 'page'}`;
  const absoluteImage = image
    ? (image.startsWith('http') ? image : `${siteUrl}${image.startsWith('/') ? image : `/${image}`}`)
    : dynamicOgImage;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={config.APP_NAME} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={config.APP_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AajExam" />
      <meta name="twitter:creator" content="@AajExam" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />

      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={url} />
    </Head>
  );
};

export default Seo;




