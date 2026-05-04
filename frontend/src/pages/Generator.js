// src/pages/Generator.js
// The main blog generation page

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogForm from '../components/BlogForm';
import BlogOutput from '../components/BlogOutput';
import useBlog from '../hooks/useBlog';

const Generator = () => {
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [savedBlogId, setSavedBlogId] = useState(null);

  const { generating, humanizing, saving, error, clearError, generateBlog, humanizeBlog, saveBlog } =
    useBlog();

  // Generate a new blog
  const handleGenerate = async (formData) => {
    clearError();
    setSavedBlogId(null);
    setLastFormData(formData);

    try {
      const result = await generateBlog(formData);
      setGeneratedBlog({
        content: result.content,
        topic: result.topic,
        tone: result.tone,
        wordCount: result.wordCount,
        seoKeywords: result.seoKeywords,
        isHumanized: false,
      });
      toast.success('Blog generated successfully!');
    } catch (err) {
      toast.error(err.message || 'Generation failed. Please try again.');
    }
  };

  // Humanize the current blog
  const handleHumanize = async () => {
    if (!generatedBlog) return;

    try {
      const result = await humanizeBlog(generatedBlog.content);

      setGeneratedBlog((prev) => ({
        ...prev,
        originalContent: prev.isHumanized ? prev.originalContent : prev.content,
        content: result.content,
        isHumanized: true,
      }));
      toast.success('Blog humanized! Sounds more natural now.');
    } catch (err) {
      toast.error(err.message || 'Humanization failed.');
    }
  };

  // Save blog to database
  const handleSave = async () => {
    if (!generatedBlog) return;

    try {
      const saved = await saveBlog({
        topic: generatedBlog.topic,
        content: generatedBlog.content,
        tone: generatedBlog.tone,
        wordCount: generatedBlog.wordCount,
        seoKeywords: generatedBlog.seoKeywords || [],
        isHumanized: generatedBlog.isHumanized,
        originalContent: generatedBlog.originalContent || null,
      });

      setSavedBlogId(saved._id);
      toast.success('Blog saved to your history!');
    } catch (err) {
      toast.error(err.message || 'Failed to save blog.');
    }
  };

  // Regenerate with same settings
  const handleRegenerate = () => {
    if (lastFormData) {
      handleGenerate(lastFormData);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-ink-900 dark:text-ink-100 mb-3">
            Generate Your Blog
          </h1>
          <p className="text-ink-600 dark:text-ink-400 max-w-lg mx-auto">
            Fill in the details below and let our AI create a complete, well-structured blog post for you.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl animate-slide-up">
            <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">
                Generation Error
              </p>
              <p className="text-sm text-red-600 dark:text-red-500 mt-0.5">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Saved Success Banner */}
        {savedBlogId && (
          <div className="flex items-center justify-between p-4 mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-up">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              ✅ Blog saved to your history!
            </p>
            <Link
              to="/history"
              className="flex items-center gap-1.5 text-xs font-semibold text-green-700 dark:text-green-400 hover:underline"
            >
              <BookOpen size={13} />
              View History
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form Panel (left / top) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 shadow-paper p-6 sticky top-24">
              <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-lg mb-5">
                Blog Settings
              </h2>
              <BlogForm onGenerate={handleGenerate} generating={generating} />
            </div>
          </div>

          {/* Output Panel (right / bottom) */}
          <div className="lg:col-span-3">
            {generatedBlog ? (
              <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 shadow-paper p-6">
                <BlogOutput
                  blog={generatedBlog}
                  onHumanize={handleHumanize}
                  onSave={handleSave}
                  onRegenerate={handleRegenerate}
                  humanizing={humanizing}
                  saving={saving}
                />
              </div>
            ) : (
              /* Empty state */
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-ink-900 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-700">
                <div className="w-16 h-16 bg-ink-100 dark:bg-ink-800 rounded-2xl flex items-center justify-center mb-5">
                  <BookOpen size={28} className="text-ink-400 dark:text-ink-500" />
                </div>
                <h3 className="font-display font-semibold text-ink-700 dark:text-ink-300 text-lg mb-2">
                  Your blog will appear here
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-500 max-w-xs">
                  Fill in your topic and settings on the left, then click{' '}
                  <strong className="text-ink-700 dark:text-ink-300">Generate Blog Post</strong> to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
