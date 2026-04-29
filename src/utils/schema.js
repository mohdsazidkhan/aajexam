/**
 * SEO Schema Utilities
 * Generates JSON-LD structured data for better search engine understanding
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://aajexam.com';
const SITE_NAME = 'AajExam';

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
            "https://facebook.com/aajexam",
            "https://twitter.com/aajexam",
            "https://instagram.com/aajexam",
            "https://youtube.com/aajexam",
            "https://linkedin.com/company/aajexam"
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
            "name": article.authorName || "AajExam Team"
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
 * Exam Course Schema - government exam landing pages (SSC CHSL, etc.)
 */
export const generateExamCourseSchema = ({ name, code, description, url, category, testCount = 0, pyqCount = 0, quizCount = 0 }) => {
    return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": name,
        "description": description,
        "url": url,
        "courseCode": code,
        "educationalLevel": "Government Competitive Exam",
        "educationalCredentialAwarded": code || name,
        "about": category ? { "@type": "Thing", "name": category } : undefined,
        "provider": {
            "@type": "EducationalOrganization",
            "name": SITE_NAME,
            "url": SITE_URL,
            "logo": `${SITE_URL}/logo.png`
        },
        "hasCourseInstance": {
            "@type": "CourseInstance",
            "courseMode": "Online",
            "courseWorkload": "PT1H",
            "instructor": { "@type": "Organization", "name": SITE_NAME }
        },
        "offers": {
            "@type": "Offer",
            "category": "Free",
            "price": "0",
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock",
            "url": url
        },
        "teaches": [`${name} syllabus`, `${name} previous year questions`, `${name} mock tests`],
        "totalHistoricalEnrollment": testCount + pyqCount + quizCount
    };
};

/**
 * ItemList Schema - listing pages (exam hub, blog index, etc.)
 */
export const generateItemListSchema = ({ name, items = [] }) => {
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": name,
        "numberOfItems": items.length,
        "itemListElement": items.map((item, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "url": item.url?.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
            "name": item.name
        }))
    };
};

/**
 * Practice Test (LearningResource) Schema
 */
export const generatePracticeTestSchema = (test) => {
    return {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": test.title,
        "description": test.description || `${test.title} – ${test.questionCount || 0} questions, ${test.totalMarks || 0} marks practice test on AajExam.`,
        "learningResourceType": test.isPYQ ? "Previous Year Question Paper" : "Practice Test",
        "educationalLevel": test.examName || "Government Competitive Exam",
        "educationalUse": "assessment",
        "interactivityType": "active",
        "timeRequired": test.duration ? `PT${test.duration}M` : undefined,
        "isAccessibleForFree": (test.accessLevel || 'FREE') === 'FREE',
        "inLanguage": ["en", "hi"],
        "provider": {
            "@type": "Organization",
            "name": SITE_NAME,
            "url": SITE_URL
        }
    };
};

/**
 * Blog/News Posting schema (richer than Article)
 */
export const generateBlogPostingSchema = (article) => {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.description || article.excerpt,
        "image": [article.image || `${SITE_URL}/default_banner.png`],
        "datePublished": article.publishedAt || article.createdAt,
        "dateModified": article.updatedAt || article.publishedAt || article.createdAt,
        "author": {
            "@type": "Person",
            "name": article.authorName || "AajExam Team",
            "url": article.authorUrl
        },
        "publisher": {
            "@type": "Organization",
            "name": SITE_NAME,
            "logo": { "@type": "ImageObject", "url": `${SITE_URL}/logo.png` }
        },
        "mainEntityOfPage": { "@type": "WebPage", "@id": article.url },
        "keywords": Array.isArray(article.keywords) ? article.keywords.join(', ') : article.keywords,
        "articleSection": article.category,
        "wordCount": article.wordCount,
        "inLanguage": "en-IN"
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
