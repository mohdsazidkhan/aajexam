/**
 * SEO Utilities
 * Helper functions for canonical URLs and meta tags
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';

/**
 * Generate canonical URL for current page
 * @param {string} path - Current page path (from router.asPath)
 * @returns {string} Full canonical URL
 */
export const getCanonicalUrl = (path) => {
    // Remove query parameters and hash
    const cleanPath = path.split('?')[0].split('#')[0];
    // Remove trailing slash (except for homepage)
    const normalizedPath = cleanPath === '/' ? cleanPath : cleanPath.replace(/\/$/, '');
    return `${SITE_URL}${normalizedPath}`;
};

/**
 * Generate absolute URL for images (OpenGraph, Twitter Cards)
 * @param {string} imagePath - Relative or absolute image path
 * @returns {string} Absolute image URL
 */
export const getAbsoluteImageUrl = (imagePath) => {
    if (!imagePath) return `${SITE_URL}/logo.png`;
    if (imagePath.startsWith('http')) return imagePath;
    return `${SITE_URL}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 160) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
};

/**
 * Generate optimized meta description
 * @param {string} description - Raw description
 * @returns {string} Optimized description (150-160 chars)
 */
export const optimizeMetaDescription = (description) => {
    if (!description) return 'Practice government exam preparation with AajExam - SSC, UPSC, Banking, Railway exams with 2000+ quizzes and performance analytics.';
    return truncateText(description, 160);
};

/**
 * Generate dynamic meta description from article content
 * @param {Object} article - Article object with excerpt/content
 * @returns {string} Optimized meta description (150-160 chars)
 */
export const generateArticleMetaDescription = (article) => {
    if (!article) return optimizeMetaDescription('');

    // Priority: excerpt > content > fallback
    const source = article.excerpt || article.content || '';

    // Strip HTML tags
    const plainText = source.replace(/<[^>]*>/g, '');

    // Truncate to 150-160 chars
    return truncateText(plainText, 155);
};

/**
 * Get robots meta tag for pagination
 * @param {number} currentPage - Current page number
 * @returns {string} Robots meta content
 */
export const getPaginationRobotsMeta = (currentPage) => {
    return currentPage > 1 ? 'noindex, follow' : 'index, follow';
};

/**
 * Generate pagination URLs for prev/next links
 * @param {string} basePath - Base path without query params
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @returns {Object} Object with prevUrl and nextUrl
 */
export const getPaginationUrls = (basePath, currentPage, totalPages) => {
    const prevUrl = currentPage > 1
        ? `${SITE_URL}${basePath}${currentPage === 2 ? '' : `?page=${currentPage - 1}`}`
        : null;

    const nextUrl = currentPage < totalPages
        ? `${SITE_URL}${basePath}?page=${currentPage + 1}`
        : null;

    return { prevUrl, nextUrl };
};
