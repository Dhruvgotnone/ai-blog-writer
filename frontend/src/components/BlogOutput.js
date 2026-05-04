// src/components/BlogOutput.js
// Displays the generated blog with action buttons

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Parse markdown-style text into formatted HTML
const formatBlogContent = (text) => {
  if (!text) return '';

  return text
    // ## Heading 2
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    // ### Heading 3
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // **bold**
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // *italic*
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // - bullet list items
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>\n?)+/gs, (match) => `<ul>${match}</ul>`)
    // Double newline = paragraph
    .replace(/\n\n(?!<[uh])/g, '</p><p>')
    // Wrap in opening <p> if not already a block element
    .replace(/^(?!<[hup])(.+)/gm, (match) => {
      if (match.trim() && !match.startsWith('<')) return `<p>${match}</p>`;
      return match;
    });
};

const BlogOutput = ({
  blog,
  onHumanize,
  onSave,
  onRegenerate,
  humanizing,
  saving,
}) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const wordCount = blog.content.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(blog.content);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = blog.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-slide-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-semibold text-ink-700 dark:text-ink-300">
            Generated Blog
          </span>
          {blog.isHumanized && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-medium border border-purple-200 dark:border-purple-800">
              ✨ Humanized
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
        >
          {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {/* Stats Row */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-ink-500 dark:text-ink-400">
        <span className="flex items-center gap-1">
          <Tag size={12} />
          <span className="capitalize font-medium text-ink-700 dark:text-ink-300">
            {blog.tone}
          </span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {readingTime} min read
        </span>
        <span>•</span>
        <span>{wordCount} words</span>
        {blog.seoKeywords?.length > 0 && (
          <>
            <span>•</span>
            <span className="flex flex-wrap gap-1">
              {blog.seoKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded text-xs"
                >
                  {kw}
                </span>
              ))}
            </span>
          </>
        )}
      </div>

      {/* Blog Content */}
      {!collapsed && (
        <div className="bg-white dark:bg-ink-900 rounded-xl border border-ink-100 dark:border-ink-800 p-6 mb-4 shadow-paper max-h-[500px] overflow-y-auto">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: formatBlogContent(blog.content) }}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Copy */}
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-all"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-500" />
              <span className="text-green-600 dark:text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              Copy Text
            </>
          )}
        </button>

        {/* Humanize */}
        <button
          onClick={onHumanize}
          disabled={humanizing}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 disabled:opacity-60 transition-all"
        >
          {humanizing ? (
            <>
              <div className="flex gap-0.5">
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
                <span className="loading-dot w-1.5 h-1.5 rounded-full bg-purple-500 inline-block" />
              </div>
              Humanizing...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Humanize
            </>
          )}
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg bg-green-600 hover:bg-green-700 text-white disabled:opacity-60 transition-all shadow-sm"
        >
          {saving ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={14} />
              Save Blog
            </>
          )}
        </button>

        {/* Regenerate */}
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 transition-all ml-auto"
        >
          <RefreshCw size={14} />
          Regenerate
        </button>
      </div>
    </div>
  );
};

export default BlogOutput;
