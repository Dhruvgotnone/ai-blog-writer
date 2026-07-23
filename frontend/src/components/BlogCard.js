// src/components/BlogCard.js
// Card component for displaying saved blogs in history with Cover Photos & SaaS badges

import React, { useState } from 'react';
import {
  Clock,
  Tag,
  Trash2,
  Heart,
  Eye,
  Copy,
  Check,
  ChevronUp,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';

const TONE_COLORS = {
  professional: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  casual: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
  academic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  creative: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  persuasive: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
};

const BlogCard = ({ blog, onDelete, onToggleFavorite }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const wordCount = blog.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);
  const previewText = blog.content.substring(0, 180).replace(/[#*]/g, '') + '...';

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const copyContent = async () => {
    try {
      await navigator.clipboard.writeText(blog.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this blog permanently?')) return;
    setDeleting(true);
    try {
      await onDelete(blog._id);
      toast.success('Blog deleted.');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  const handleFavorite = async () => {
    try {
      await onToggleFavorite(blog._id);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    }
  };

  return (
    <div
      className={`bg-white dark:bg-ink-900 rounded-xl border ${
        blog.isFavorite
          ? 'border-amber-400 dark:border-amber-600 shadow-md'
          : 'border-ink-100 dark:border-ink-800'
      } shadow-paper hover:shadow-paper-lg transition-all duration-200 animate-fade-in overflow-hidden`}
    >
      {/* Cover Image Thumbnail if available */}
      {blog.coverImage && (
        <div className="relative w-full h-40 overflow-hidden bg-ink-900">
          <img
            src={blog.coverImage}
            alt={blog.topic}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display font-bold text-ink-900 dark:text-ink-100 text-base leading-snug flex-1">
            {blog.topic}
          </h3>
          <button
            onClick={handleFavorite}
            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
              blog.isFavorite
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-ink-300 dark:text-ink-600 hover:text-amber-500'
            }`}
            title={blog.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={16} fill={blog.isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Meta Tags Row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full border capitalize ${
              TONE_COLORS[blog.tone] || TONE_COLORS.professional
            }`}
          >
            {blog.tone}
          </span>

          {blog.language && blog.language !== 'English' && (
            <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold">
              <Globe size={11} /> {blog.language}
            </span>
          )}

          {blog.isHumanized && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full border border-purple-200 dark:border-purple-800">
              ✨ Humanized
            </span>
          )}

          <span className="flex items-center gap-1 text-xs text-ink-500 dark:text-ink-400">
            <Clock size={11} />
            {readingTime} min
          </span>

          <span className="text-xs text-ink-400 dark:text-ink-500">
            {wordCount} words
          </span>

          <span className="text-xs text-ink-400 dark:text-ink-500 ml-auto">
            {formatDate(blog.createdAt)}
          </span>
        </div>

        {/* SEO Keywords */}
        {blog.seoKeywords?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {blog.seoKeywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-0.5 px-1.5 py-0.5 text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded"
              >
                <Tag size={9} />
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Preview / Expanded Content */}
        <div className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed mb-4">
          {expanded ? (
            <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-ink-700 dark:text-ink-300 pr-1">
              {blog.content}
            </div>
          ) : (
            <p>{previewText}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-ink-50 dark:border-ink-800">
          <div className="flex gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp size={13} /> Collapse
                </>
              ) : (
                <>
                  <Eye size={13} /> Read Full
                </>
              )}
            </button>

            <button
              onClick={copyContent}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-800 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} /> Copy
                </>
              )}
            </button>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={13} />
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
