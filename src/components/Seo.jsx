import Head from 'next/head';
import { useRouter } from 'next/router';

import config from '../lib/config/appConfig';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

const toAbsolute = (image) => {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  return `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`;
};

const Seo = ({
  title = config.APP_NAME,
  description = config.APP_DESCRIPTION,
  image,
  type = 'website',
  noIndex = false,
  keywords,
  canonical,
  publishedTime,
  modifiedTime,
  author,
  schemas,
  prev,
  next,
  children
}) => {
  const router = useRouter();
  const cleanPath = (router.asPath || '').split('?')[0].split('#')[0];
  const url = canonical
    ? (canonical.startsWith('http') ? canonical : `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}`)
    : `${SITE_URL}${cleanPath}`;
  const dynamicOgImage = `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&desc=${encodeURIComponent(description || '')}&type=${type === 'article' ? 'blog' : 'page'}`;
  const absoluteImage = toAbsolute(image) || dynamicOgImage;

  const keywordsString = Array.isArray(keywords) ? keywords.filter(Boolean).join(', ') : keywords;

  const schemaList = Array.isArray(schemas) ? schemas.filter(Boolean) : (schemas ? [schemas] : []);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#3b82f6" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={config.APP_NAME} />
      <meta name="application-name" content={config.APP_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="author" content={author || config.APP_AUTHOR} />

      {noIndex
        ? <meta name="robots" content="noindex,nofollow" />
        : <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      }
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow,max-image-preview:large,max-snippet:-1'} />
      <meta name="bingbot" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />

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
      {type === 'article' && publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {type === 'article' && modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {type === 'article' && author && <meta property="article:author" content={author} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@AajExam" />
      <meta name="twitter:creator" content="@AajExam" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImage} />
      <meta name="twitter:image:alt" content={title} />

      <link rel="canonical" href={url} />
      {prev && <link rel="prev" href={toAbsolute(prev)} />}
      {next && <link rel="next" href={toAbsolute(next)} />}
      <link rel="alternate" hrefLang="en-IN" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {schemaList.map((schema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {children}
    </Head>
  );
};

export default Seo;
