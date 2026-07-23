// src/pages/History.js
// Shows all saved blog posts

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  PenLine,
  Heart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import BlogCard from '../components/BlogCard';
import useBlog from '../hooks/useBlog';
import { useAuth } from '../context/AuthContext';

const TONE_FILTERS = ['all', 'professional', 'casual', 'academic', 'creative', 'persuasive'];

const History = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toneFilter, setToneFilter] = useState('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const { fetchBlogs, deleteBlog, toggleFavorite } = useBlog();
  const { user } = useAuth();

  const loadBlogs = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await fetchBlogs(pageNum, 12);
      setBlogs(data.data || []);
      setPagination(data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      toast.error(err.message || 'Failed to load blogs.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadBlogs(page);
  }, [page, loadBlogs]);

  const handleDelete = async (blogId) => {
    await deleteBlog(blogId);
    setBlogs((prev) => prev.filter((b) => b._id !== blogId));
    setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
  };

  const handleToggleFavorite = async (blogId) => {
    const result = await toggleFavorite(blogId);
    setBlogs((prev) =>
      prev.map((b) =>
        b._id === blogId ? { ...b, isFavorite: result.data.isFavorite } : b
      )
    );
    toast.success(result.message);
  };

  // Client-side filtering (search + tone + favorites)
  const filteredBlogs = blogs.filter((blog) => {
    const matchSearch =
      !searchQuery ||
      blog.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchTone = toneFilter === 'all' || blog.tone === toneFilter;
    const matchFav = !favoritesOnly || blog.isFavorite;

    return matchSearch && matchTone && matchFav;
  });

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-1">
              Blog History
            </h1>
            <p className="text-ink-500 dark:text-ink-400 text-sm">
              {pagination.total} blog{pagination.total !== 1 ? 's' : ''} saved
              {user ? ` in your library` : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => loadBlogs(page)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-ink-200 dark:border-ink-700 rounded-lg text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <Link
              to="/generate"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 rounded-lg hover:bg-ink-800 dark:hover:bg-amber-400 transition-colors"
            >
              <PenLine size={14} />
              New Blog
            </Link>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 dark:text-ink-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic or content..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Tone Filter */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <Filter size={14} className="text-ink-400 dark:text-ink-500 flex-shrink-0" />
            {TONE_FILTERS.map((tone) => (
              <button
                key={tone}
                onClick={() => setToneFilter(tone)}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${
                  toneFilter === tone
                    ? 'bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900'
                    : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-400 border border-ink-200 dark:border-ink-700 hover:bg-ink-50 dark:hover:bg-ink-700'
                }`}
              >
                {tone}
              </button>
            ))}
          </div>

          {/* Favorites Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
              favoritesOnly
                ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
                : 'bg-white dark:bg-ink-800 border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-400'
            }`}
          >
            <Heart size={13} fill={favoritesOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          /* Loading skeleton */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 p-5 animate-pulse"
              >
                <div className="h-4 bg-ink-100 dark:bg-ink-800 rounded w-3/4 mb-3" />
                <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded" />
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-5/6" />
                  <div className="h-3 bg-ink-100 dark:bg-ink-800 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center py-24">
            <div className="w-20 h-20 bg-ink-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={32} className="text-ink-400 dark:text-ink-500" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink-700 dark:text-ink-300 mb-2">
              {searchQuery || toneFilter !== 'all' || favoritesOnly
                ? 'No blogs match your filters'
                : 'No saved blogs yet'}
            </h3>
            <p className="text-ink-500 dark:text-ink-500 text-sm mb-6 max-w-xs">
              {searchQuery || toneFilter !== 'all' || favoritesOnly
                ? 'Try adjusting your search or filter criteria.'
                : 'Generate your first blog post and save it to start building your library.'}
            </p>
            {!searchQuery && toneFilter === 'all' && !favoritesOnly && (
              <Link
                to="/generate"
                className="flex items-center gap-2 px-5 py-2.5 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-semibold rounded-xl hover:bg-ink-800 dark:hover:bg-amber-400 transition-all"
              >
                <PenLine size={15} />
                Write Your First Blog
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Blog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBlogs.map((blog) => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && !searchQuery && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-ink-200 dark:border-ink-700 rounded-lg text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={15} />
                  Previous
                </button>

                <span className="text-sm text-ink-500 dark:text-ink-400">
                  Page {page} of {pagination.pages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium border border-ink-200 dark:border-ink-700 rounded-lg text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
