"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

import API from "../../lib/api";
import useDebounce from "../../hooks/useDebounce";
// MobileAppWrapper import removed
import UnifiedFooter from "../UnifiedFooter";
import Sidebar from "../Sidebar";
import Loading from "../Loading";
import { useSelector } from "react-redux";
import { safeLocalStorage } from "../../lib/utils/storage";
import { FaSearch } from "react-icons/fa";

const ArticlesPage = () => {
  const router = useRouter();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    featured: false,
  });
  const debouncedSearch = useDebounce(filters.search, 500);
  const [pagination, setPagination] = useState({});

  // Get current page from URL query params
  const currentPage = parseInt(router.query.page || '1', 10);

  const [viewMode, setViewMode] = useState(() => {
    const saved = safeLocalStorage.getItem("articlesViewMode");
    return saved || "grid";
  }); // 'grid' or 'list'

  const user = JSON.parse(safeLocalStorage.getItem("userInfo") || "null");
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: 9,
        search: debouncedSearch,
        category: filters.category,
        featured: filters.featured,
      };

      const response = await API.getPublishedArticles(params);
      if (response.success && response.data) {
        setArticles(response.data.articles || []);
        setPagination(response.data.pagination || {});
      } else {
        setArticles([]);
        setPagination({});
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
      setError("Failed to load articles");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, filters.category, filters.featured]);

  const fetchCategories = async () => {
    try {
      const response = await API.getPublicCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Reset to page 1 when filter changes
    router.push({ pathname: '/articles', query: { ...router.query, page: undefined } }, undefined, { shallow: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to page 1 when searching
    router.push({ pathname: '/articles', query: { ...router.query, page: undefined } }, undefined, { shallow: true });
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    safeLocalStorage.setItem("articlesViewMode", mode);
  };

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, [fetchArticles]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  // Grid View Component
  const GridView = ({ articles }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-6">
      {articles.map((article) => (
        <Link
          key={article._id}
          href={`/articles/${article.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div
            className="
              w-full
              min-h-[240px]
              h-[240px]
              max-h-[240px]
              bg-center bg-cover
              rounded-xl
            "
            style={{
              backgroundImage: `url(${article.featuredImage || "/default_banner.png"
                })`,
            }}
          />

          <div className="p-4">
            <div className="flex items-center mb-2">
              {article.isFeatured && (
                <span className="text-primary-500 text-sm font-medium mr-2">
                  ⭐
                </span>
              )}
              {article.isPinned && (
                <span className="text-secondary-500 text-sm font-medium mr-2">
                  📌
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
            </div>
            <h3 className="text-md lg:text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {article.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {truncateText(article.excerpt || article.content, 120)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>👁️ {article.views || 0}</span>
                <span>❤️ {article.likes || 0}</span>
                <span>⏱️ {article.readingTime || 5} min</span>
              </div>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                Read More →
              </span>
            </div>
            {article.category && (
              <div className="mt-3">
                <span className="inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {article.category.name}
                </span>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );

  // List View Component
  const ListView = ({ articles }) => (
    <div className="space-y-4">
      {articles.map((article) => (
        <Link
          key={article._id}
          href={`/articles/${article.slug}`}
          className="group bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row"
        >
          <div
            className="
    md:w-64
    w-full
    min-h-48
    h-48
    md:h-auto
    flex-shrink-0
    bg-cover
    bg-center
    group-hover:scale-105
    transition-transform
    duration-300
  "
            style={{
              backgroundImage: `url(${article.featuredImage || "/default_banner.png"})`,
            }}
            role="img"
            aria-label={article.featuredImageAlt || article.title}
          />

          <div className="p-6 flex-1">
            <div className="flex items-center mb-2">
              {article.isFeatured && (
                <span className="text-primary-500 text-sm font-medium mr-2">
                  ⭐
                </span>
              )}
              {article.isPinned && (
                <span className="text-secondary-500 text-sm font-medium mr-2">
                  📌
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              {article.category && (
                <span className="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                  {article.category.name}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors mb-2">
              {article.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              {truncateText(article.excerpt || article.content, 200)}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <span>👁️ {article.views || 0}</span>
                <span>❤️ {article.likes || 0}</span>
                <span>⏱️ {article.readingTime || 5} min read</span>
              </div>
              <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                Read More →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (loading) {
    return (
      <>
        <div
          className={`mainContent ${isOpen ? "showPanel" : "hidePanel"
            } bg-gray-50 dark:bg-gray-900 min-h-screen`}
        >
          {user && user.role === "admin" && <Sidebar />}
          <div className="p-4 w-full text-gray-900 dark:text-white">
            <div className="flex items-center justify-center h-64">
              <Loading size="md" color="yellow" message="Loading articles..." />
            </div>
          </div>
        </div>
        <UnifiedFooter />
      </>
    );
  }

  return (
    <>
      <div
        className={`mainContent ${isOpen ? "showPanel" : "hidePanel"
          } bg-gray-50 dark:bg-gray-900 min-h-screen`}
      >
        {user && user.role === "admin" && <Sidebar />}
        <div className="container mx-auto px-4 lg:px-10 py-8 text-gray-900 dark:text-white">
          {/* Header */}
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between mb-4 gap-4">
            <div className="min-w-max">
              <h1 className="text-xl lg:text-xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                📚 Articles ({pagination.total})
              </h1>
            </div>
            {/* Filters */}
            <div className="gap-4 flex flex-col lg:flex-row items-center lg:items-end lg:justify-end bg-white dark:bg-gray-800 rounded-lg p-2 shadow-sm border border-gray-200 dark:border-gray-700">
              <form
                onSubmit={handleSearch}
                className="w-full lg:w-auto lg:ml-auto space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* View Toggle */}
                  <div className="flex flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => handleViewModeChange("grid")}
                      className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "grid"
                        ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white dark:from-primary-600 dark:to-red-700 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      title="Grid View"
                    >
                      <span className="flex items-center space-x-1">
                        <span>⊞</span>
                      </span>
                    </button>
                    <button
                      onClick={() => handleViewModeChange("list")}
                      className={`px-2 sm:px-3 py-1 rounded-md text-sm font-medium transition-colors ${viewMode === "list"
                        ? "bg-gradient-to-r from-primary-500 to-secondary-500 text-white dark:from-primary-600 dark:to-red-700 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        }`}
                      title="List View"
                    >
                      <span className="flex items-center space-x-1">
                        <span>☰</span>
                      </span>
                    </button>
                  </div>
                  <div>
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="featured"
                        checked={filters.featured}
                        onChange={handleFilterChange}
                        className="h-4 w-4 text-primary-600 focus:ring-red-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-200">
                        Featured
                      </span>
                    </label>
                  </div>
                  <div className="flex items-end">
                    <div className="relative">
                      <input
                        type="text"
                        name="search"
                        value={filters.search}
                        onChange={handleFilterChange}
                        placeholder="Search articles..."
                        className="min-w-72 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-gray-100"
                      />
                      <button
                        type="submit"
                        className="absolute right-0 top-0 w-12 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 text-white 
                dark:from-primary-600 dark:to-red-700 mx-auto rounded-md font-medium transition-colors"
                      >
                        <span className="flex items-center justify-center">
                          <FaSearch className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          {/* Articles Section */}
          <div className="mb-4">
            {articles.length > 0 ? (
              viewMode === "grid" ? (
                <GridView articles={articles} />
              ) : (
                <ListView articles={articles} />
              )
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your search criteria or check back later for new
                  content.
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(currentPage - 1, 1);
                    router.push({
                      pathname: '/articles',
                      query: newPage > 1 ? { ...router.query, page: newPage } : { ...router.query, page: undefined }
                    }, undefined, { shallow: true });
                  }}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() => {
                    const newPage = Math.min(currentPage + 1, pagination.totalPages);
                    router.push({
                      pathname: '/articles',
                      query: { ...router.query, page: newPage }
                    }, undefined, { shallow: true });
                  }}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="text-red-800 dark:text-red-200">{error}</div>
            </div>
          )}
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default ArticlesPage;
