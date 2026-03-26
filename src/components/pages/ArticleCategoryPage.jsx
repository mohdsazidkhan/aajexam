'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router'; // Pages Router
import Link from 'next/link';
import UnifiedFooter from '../UnifiedFooter';
import API from '../../lib/api';
import Head from 'next/head';
import Loading from '../Loading';

const PAGE_LIMIT = 12;

const ArticleCategoryPage = () => {
  const router = useRouter();
  const { categoryId } = router.query;
  const [category, setCategory] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [categoryId]);

  useEffect(() => {
    fetchCategoryMeta();
  }, [categoryId]);

  useEffect(() => {
    fetchArticles(page);
  }, [categoryId, page]);

  const fetchCategoryMeta = async () => {
    try {
      const response = await API.getPublicCategories();
      const found = (response?.data || response || []).find(c => c._id === categoryId);
      console.log(response, categoryId, 'categoryIdcategoryId')
      setCategory(found || null);
    } catch (e) {
      setCategory(null);
    }
  };

  const fetchArticles = async (pageNum) => {
    try {
      setLoading(true);
      setError('');
      const res = await API.getArticlesByCategory(categoryId, { page: pageNum, limit: PAGE_LIMIT });
      const payload = res.data || res;
      setArticles(payload.articles || payload.items || payload || []);
      if (payload.pagination) {
        setTotalPages(payload.pagination.totalPages || 1);
      } else if (payload.totalPages) {
        setTotalPages(payload.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (e) {
      console.error('Error loading category articles', e);
      setError('Failed to load articles');
      setArticles([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const title = useMemo(() => category?.name ? `${category.name} Articles` : 'Category Articles', [category]);

  const seoTitle = category?.name ? `${category.name} Articles` : 'Category Articles';
  const seoDescription = category?.description || `${category?.name || 'Category'} articles on AajExam.`;

  return (
    <>
      <Head>
        <title>{seoTitle} - AajExam Platform</title>
        <meta name="description" content={seoDescription} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={seoTitle} />
        <meta name="twitter:description" content={seoDescription} />
      </Head>
      <div className="mainContent bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white">
        <div className="container mx-auto px-4 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold">{title}</h1>
              {category?.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">{category.description}</p>
              )}
            </div>
            <button onClick={() => router.back()} className=" bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg">
              ← Back
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <Loading size="md" color="yellow" message="" />
            </div>
          ) : error ? (
            <div className="text-center text-primary-600">{error}</div>
          ) : articles.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-300">No articles found.</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((a) => (
                <Link key={a._id} href={`/articles/${a.slug}`} className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition">
                  <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <img
                      src={a.featuredImage || '/default_banner.png'}
                      alt={a.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default_banner.png';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg group-hover:text-primary-600 dark:group-hover:text-primary-400">{a.title}</h3>
                    {a.excerpt && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">{a.excerpt}</p>}
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                      <span>👁️ {a.views || 0}</span>
                      <span>❤️ {a.likes || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Prev</button>
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{i + 1}</button>
              ))}
              <button disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
        <UnifiedFooter />
      </div>
    </>
  );
};

export default ArticleCategoryPage;








