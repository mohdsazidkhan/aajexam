/**
 * SEO Schema Utilities
 * Generates JSON-LD structured data for better search engine understanding
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://subgquiz.com';
const SITE_NAME = 'SUBG QUIZ';

/**
 * Organization Schema - Use on homepage
 */
export const generateOrganizationSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": `${SITE_URL}/logo.png`,
        "description": "India's premier government exam preparation platform with comprehensive practice tests for SSC, UPSC, Banking, and Railway exams.",
        "brand": {
            "@type": "Brand",
            "name": SITE_NAME,
            "logo": `${SITE_URL}/logo.png`
        },
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Delhi",
            "addressCountry": "IN"
        },
        "sameAs": [
            "https://facebook.com/subgquiz",
            "https://twitter.com/subgquiz",
            "https://instagram.com/subgquiz",
            "https://youtube.com/subgquiz",
            "https://linkedin.com/company/subgquiz"
        ],
        "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "Customer Support",
            "email": "support@mohdsazidkhan.com",
            "availableLanguage": ["English", "Hindi"]
        }
    };
};

/**
 * Website Schema with SearchAction - Use on homepage
 */
export const generateWebsiteSchema = () => {
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "url": SITE_URL,
        "potentialAction": {
            "@type": "SearchAction",
            "target": `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string"
        }
    };
};

/**
 * Breadcrumb Schema - Use on all pages except homepage
 * @param {Array} items - Array of breadcrumb items [{ name, url }]
 */
export const generateBreadcrumbSchema = (items) => {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            ...(item.url && { "item": `${SITE_URL}${item.url}` })
        }))
    };
};

/**
 * Quiz Schema - Use on quiz pages
 */
export const generateQuizSchema = (quiz) => {
    return {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": quiz.title,
        "description": quiz.educationalDescription || quiz.description,
        "educationalLevel": quiz.levelRange ? `Level ${quiz.levelRange.min}-${quiz.levelRange.max}` : 'All Levels',
        "learningResourceType": "Practice Test",
        "about": {
            "@type": "Thing",
            "name": quiz.categoryName || "General Knowledge"
        },
        "timeRequired": quiz.timeLimit ? `PT${quiz.timeLimit}M` : undefined,
        "educationalUse": "Practice",
        "interactivityType": "active"
    };
};

/**
 * Article Schema - Use on blog/article pages
 */
export const generateArticleSchema = (article) => {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description || article.excerpt,
        "image": article.image || `${SITE_URL}/default_banner.png`,
        "datePublished": article.publishedAt || article.createdAt,
        "dateModified": article.updatedAt || article.publishedAt || article.createdAt,
        "author": {
            "@type": "Person",
            "name": article.authorName || "SUBG Quiz Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo.png`
            }
        }
    };
};

/**
 * FAQ Schema - Use on FAQ pages or pages with Q&A
 */
export const generateFAQSchema = (faqs) => {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
};

/**
 * Course Schema - Use on level pages
 */
export const generateCourseSchema = (level) => {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": `Level ${level.number}: ${level.name}`,
        "description": level.description,
        "provider": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL
        },
        "educationalLevel": `Level ${level.number}`,
        "numberOfQuizzes": level.quizzesRequired,
        "coursePrerequisites": level.number > 0 ? `Level ${level.number - 1}` : "None"
    };
};

/**
 * Helper function to inject schema into page
 * Usage in pages: <Head>{renderSchema(schema)}</Head>
 */
export const renderSchema = (schema) => {
    if (!schema) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};

/**
 * Helper to render multiple schemas
 */
export const renderSchemas = (schemas) => {
    if (!schemas || !Array.isArray(schemas)) return null;

    return schemas.map((schema, index) => (
        <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    ));
};
