// src/components/BlogOutput.js
// Advanced SaaS Blog Display with AI Cover Photo, Rich Text Toolbar, SEO Readability Analytics, Export & Social Repurposing

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Save,
  RefreshCw,
  Clock,
  Download,
  Share2,
  BarChart3,
  Globe,
  Image as ImageIcon,
} from 'lucide-react';
import useBlog from '../hooks/useBlog';
import toast from 'react-hot-toast';

// Convert markdown to formatted HTML string
const formatBlogContent = (text) => {
  if (!text) return '';

  return text
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold font-serif text-ink-900 dark:text-ink-100 mt-6 mb-3">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold font-serif text-ink-800 dark:text-ink-200 mt-4 mb-2">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-ink-900 dark:text-ink-100">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic">$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-ink-700 dark:text-ink-300">$1</li>')
    .replace(/(<li.*<\/li>\n?)+/gs, (match) => `<ul class="my-3 space-y-1">${match}</ul>`)
    .replace(/\n\n(?!<[uh])/g, '</p><p class="mb-4 text-ink-700 dark:text-ink-300 leading-relaxed font-serif text-base sm:text-lg">')
    .replace(/^(?!<[hup])(.+)/gm, (match) => {
      if (match.trim() && !match.startsWith('<')) return `<p class="mb-4 text-ink-700 dark:text-ink-300 leading-relaxed font-serif text-base sm:text-lg">${match}</p>`;
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
  const { repurposeContent, repurposing } = useBlog();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('article'); // 'article', 'seo', 'repurpose'
  const [editableContent, setEditableContent] = useState(blog.content || '');
  const [repurposedData, setRepurposedData] = useState(null);

  const wordCount = (editableContent || '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  // Flesch-Kincaid Readability Calculation
  const sentences = (editableContent || '').split(/[.!?]+/).filter(Boolean).length || 1;
  const syllables = ((editableContent || '').match(/[aeiouy]{1,2}/g) || []).length || 1;
  const readabilityScore = Math.max(0, Math.min(100, Math.round(206.835 - 1.015 * (wordCount / sentences) - 84.6 * (syllables / wordCount))));

  const getReadabilityLabel = (score) => {
    if (score >= 80) return { label: 'Very Easy (8th Grade)', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300' };
    if (score >= 60) return { label: 'Plain English (High School)', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-300' };
    if (score >= 40) return { label: 'Fairly Difficult (College)', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300' };
    return { label: 'Technical / Academic', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-300' };
  };

  const readability = getReadabilityLabel(readabilityScore);

  // SEO Keyword Density
  const keywordDensity = (blog.seoKeywords || []).map((kw) => {
    const reg = new RegExp(kw.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    const count = (editableContent.match(reg) || []).length;
    const density = ((count / wordCount) * 100).toFixed(1);
    return { keyword: kw, count, density };
  });

  const copyToClipboard = async (textToCopy = editableContent) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy.');
    }
  };

  const handleDownload = (format) => {
    let text = editableContent;
    let filename = `${blog.topic.toLowerCase().replace(/[^a-z0-0]+/g, '-')}`;
    let mimeType = 'text/plain';

    if (format === 'md') {
      filename += '.md';
      mimeType = 'text/markdown';
    } else if (format === 'html') {
      text = `<!DOCTYPE html><html><head><title>${blog.topic}</title></head><body><h1>${blog.topic}</h1>${formatBlogContent(editableContent)}</body></html>`;
      filename += '.html';
      mimeType = 'text/html';
    } else {
      filename += '.txt';
    }

    const blob = new Blob([text], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as ${format.toUpperCase()}!`);
  };

  const handleRepurpose = async () => {
    try {
      const data = await repurposeContent(editableContent, blog.topic);
      setRepurposedData(data);
      setActiveTab('repurpose');
      toast.success('Generated social media posts!');
    } catch {
      toast.error('Failed to generate social media content.');
    }
  };

  return (
    <div className="animate-slide-up space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-ink-900 rounded-xl border border-ink-200 dark:border-ink-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-base font-bold text-ink-900 dark:text-ink-100 font-serif">
            {blog.topic}
          </span>
          {blog.isHumanized && (
            <span className="px-2 py-0.5 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full font-medium border border-purple-300 dark:border-purple-800">
              ✨ Humanized
            </span>
          )}
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-ink-100 dark:bg-ink-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('article')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'article'
                ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900'
            }`}
          >
            Article
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'seo'
                ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900'
            }`}
          >
            <BarChart3 size={13} /> SEO Audit
          </button>
          <button
            onClick={() => setActiveTab('repurpose')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'repurpose'
                ? 'bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 shadow-sm'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900'
            }`}
          >
            <Share2 size={13} /> Social Repurpose
          </button>
        </div>
      </div>

      {/* Main Tab Views */}
      {activeTab === 'article' && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-paper-lg overflow-hidden">

          {/* AI Cover Photo */}
          {blog.coverImage && (
            <div className="relative w-full h-64 md:h-80 overflow-hidden bg-ink-900">
              <img
                src={blog.coverImage}
                alt={blog.topic}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent flex items-end p-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500 text-ink-950 shadow-md">
                  <ImageIcon size={14} /> AI Cover Photo
                </span>
              </div>
            </div>
          )}

          {/* Article Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-ink-50/70 dark:bg-ink-950/50 border-b border-ink-200 dark:border-ink-800 text-xs">
            <div className="flex items-center gap-4 text-ink-500 dark:text-ink-400">
              <span className="flex items-center gap-1">
                <Clock size={14} /> {readingTime} min read (~{wordCount} words)
              </span>
              <span className="hidden sm:inline-block">•</span>
              <span className="capitalize font-semibold text-amber-600 dark:text-amber-400">
                Tone: {blog.tone}
              </span>
              {blog.language && blog.language !== 'English' && (
                <>
                  <span className="hidden sm:inline-block">•</span>
                  <span className="flex items-center gap-1 text-blue-500 font-semibold">
                    <Globe size={13} /> {blog.language}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownload('md')}
                className="px-2.5 py-1 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-amber-500 flex items-center gap-1 font-semibold"
              >
                <Download size={13} /> .MD
              </button>
              <button
                onClick={() => handleDownload('html')}
                className="px-2.5 py-1 rounded bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-amber-500 flex items-center gap-1 font-semibold"
              >
                <Download size={13} /> .HTML
              </button>
              <button
                onClick={() => copyToClipboard()}
                className="px-3 py-1 rounded bg-amber-500 text-ink-950 font-bold flex items-center gap-1 shadow-sm hover:bg-amber-400"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Formatted Article Output */}
          <div className="p-6 md:p-10">
            <h1 className="text-2xl md:text-4xl font-extrabold font-serif text-ink-900 dark:text-ink-100 mb-6 leading-tight">
              {blog.topic}
            </h1>

            <div
              className="prose dark:prose-invert max-w-none text-ink-800 dark:text-ink-200 font-serif leading-relaxed text-base md:text-lg"
              dangerouslySetInnerHTML={{ __html: formatBlogContent(editableContent) }}
            />
          </div>

          {/* Action Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-6 bg-ink-50/50 dark:bg-ink-950/50 border-t border-ink-200 dark:border-ink-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => onHumanize(editableContent)}
                disabled={humanizing}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                <Sparkles size={14} className={humanizing ? 'animate-spin' : ''} />
                {humanizing ? 'Humanizing...' : 'Humanize Tone'}
              </button>

              <button
                onClick={handleRepurpose}
                disabled={repurposing}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
              >
                <Share2 size={14} className={repurposing ? 'animate-spin' : ''} />
                {repurposing ? 'Generating Posts...' : 'Social Media Pack'}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRegenerate}
                className="px-4 py-2 rounded-xl bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 font-semibold text-xs hover:border-ink-400 flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Regenerate
              </button>

              <button
                onClick={() => onSave({ ...blog, content: editableContent })}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save size={14} />
                {saving ? 'Saving...' : 'Save to History'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* SEO Audit Tab */}
      {activeTab === 'seo' && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-paper-lg p-6 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <BarChart3 className="text-amber-500" /> SEO & Readability Audit
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Real-time readability metrics and keyword optimization scores.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Readability Score */}
            <div className={`p-4 rounded-xl border ${readability.color}`}>
              <p className="text-xs font-bold uppercase tracking-wider mb-1">Flesch Reading Ease</p>
              <p className="text-3xl font-extrabold font-serif">{readabilityScore}/100</p>
              <p className="text-xs font-semibold mt-1">{readability.label}</p>
            </div>

            {/* Total Words */}
            <div className="p-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1">Word Count</p>
              <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">{wordCount}</p>
              <p className="text-xs text-ink-500 mt-1">~{readingTime} minutes read time</p>
            </div>

            {/* Keyword Target */}
            <div className="p-4 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50 dark:bg-ink-800">
              <p className="text-xs font-bold text-ink-500 uppercase tracking-wider mb-1">Target Keywords</p>
              <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">
                {blog.seoKeywords?.length || 0}
              </p>
              <p className="text-xs text-ink-500 mt-1">Injected in prompt</p>
            </div>
          </div>

          {/* Meta Preview */}
          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
              <Globe size={14} /> Google Search Preview
            </p>
            <p className="text-blue-800 dark:text-blue-300 font-bold text-base hover:underline cursor-pointer">
              {blog.topic} | Ultimate Guide 2026
            </p>
            <p className="text-emerald-700 dark:text-emerald-400 text-xs">
              https://yourdomain.com/blog/{blog.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
            </p>
            <p className="text-xs text-ink-600 dark:text-ink-400 line-clamp-2">
              {editableContent.substring(0, 160).replace(/[#*]/g, '')}...
            </p>
          </div>

          {/* Keyword Density Table */}
          {keywordDensity.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-ink-900 dark:text-ink-100 mb-3">
                Keyword Density Analysis
              </h4>
              <div className="space-y-2">
                {keywordDensity.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-800/50">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">#{item.keyword}</span>
                    <span className="text-xs text-ink-600 dark:text-ink-300 font-medium">
                      {item.count} occurrences ({item.density}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Social Repurpose Tab */}
      {activeTab === 'repurpose' && (
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-paper-lg p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-ink-100 dark:border-ink-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-serif text-ink-900 dark:text-ink-100 flex items-center gap-2">
                <Share2 className="text-amber-500" /> Social Media Content Pack
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Repurpose your blog post for Twitter/X, LinkedIn, and newsletters.
              </p>
            </div>

            <button
              onClick={handleRepurpose}
              disabled={repurposing}
              className="px-4 py-2 rounded-xl bg-amber-500 text-ink-950 font-bold text-xs hover:bg-amber-400 flex items-center gap-1 disabled:opacity-60"
            >
              <RefreshCw size={13} className={repurposing ? 'animate-spin' : ''} />
              {repurposing ? 'Generating...' : 'Regenerate Posts'}
            </button>
          </div>

          {repurposedData ? (
            <div className="p-4 rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-950/50 space-y-4 font-sans text-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-ink-900 dark:text-ink-100">Social Snippets</span>
                <button
                  onClick={() => copyToClipboard(repurposedData)}
                  className="px-3 py-1 rounded bg-amber-500 text-ink-950 font-bold text-xs flex items-center gap-1"
                >
                  <Copy size={12} /> Copy All
                </button>
              </div>

              <pre className="whitespace-pre-wrap font-sans text-xs text-ink-700 dark:text-ink-300 leading-relaxed bg-white dark:bg-ink-800 p-4 rounded-xl border border-ink-200 dark:border-ink-700">
                {repurposedData}
              </pre>
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <Share2 className="w-10 h-10 text-amber-500 mx-auto opacity-80" />
              <p className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                Click below to turn this blog into a Twitter thread & LinkedIn post!
              </p>
              <button
                onClick={handleRepurpose}
                disabled={repurposing}
                className="px-6 py-2.5 rounded-xl bg-amber-500 text-ink-950 font-bold text-sm hover:bg-amber-400 shadow-md transition-all"
              >
                {repurposing ? 'Generating...' : 'Generate Social Posts'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BlogOutput;
