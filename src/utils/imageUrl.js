/**
 * Image URL helpers.
 *
 * Blog / news banners are uploaded to Cloudinary at full resolution (often
 * 1-2 MB PNGs). Serving those raw hurts LCP and Core Web Vitals, which are
 * ranking inputs. Cloudinary can transcode on the fly, so we inject
 * `f_auto,q_auto` (modern format + auto quality) plus a width cap.
 */

const CLOUDINARY_UPLOAD_MARKER = '/image/upload/';

/**
 * Add Cloudinary delivery transformations to an image URL.
 * Non-Cloudinary URLs (and URLs that already carry transformations) are
 * returned untouched so local `/public` assets keep working.
 *
 * @param {string} url   original image URL
 * @param {number} width max delivered width in px
 * @returns {string}
 */
export const optimizedImage = (url, width = 1200) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD_MARKER)) return url;

  const [prefix, rest] = url.split(CLOUDINARY_UPLOAD_MARKER);
  // Already transformed (e.g. ".../upload/f_auto,q_auto/v123/...") — leave as is.
  if (/^[a-z]{1,3}_[^/]+\//.test(rest)) return url;

  return `${prefix}${CLOUDINARY_UPLOAD_MARKER}f_auto,q_auto,w_${width},c_limit/${rest}`;
};

export default optimizedImage;
