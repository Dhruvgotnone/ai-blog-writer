// src/pages/Generator.js
// The main AI blog generation page

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, AlertCircle, X, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import BlogForm from '../components/BlogForm';
import BlogOutput from '../components/BlogOutput';
import useBlog from '../hooks/useBlog';
import { useAuth } from '../context/AuthContext';
import PricingModal from '../components/PricingModal';

const Generator = () => {
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [lastFormData, setLastFormData] = useState(null);
  const [savedBlogId, setSavedBlogId] = useState(null);
  const [pricingOpen, setPricingOpen] = useState(false);

  const { updateUser } = useAuth();

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
        coverImage: result.coverImage,
        language: result.language,
        modelUsed: result.modelUsed,
        isHumanized: false,
      });

      if (typeof result.remainingCredits === 'number') {
        updateUser({ credits: result.remainingCredits });
      }

      toast.success('Blog generated successfully!');
    } catch (err) {
      if (err.message.includes('out of AI generation credits')) {
        setPricingOpen(true);
      }
      toast.error(err.message || 'Generation failed. Please try again.');
    }
  };

  // Humanize current blog
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
  const handleSave = async (updatedBlogData) => {
    const blogToSave = updatedBlogData || generatedBlog;
    if (!blogToSave) return;

    try {
      const saved = await saveBlog({
        topic: blogToSave.topic,
        content: blogToSave.content,
        tone: blogToSave.tone,
        wordCount: blogToSave.wordCount,
        seoKeywords: blogToSave.seoKeywords || [],
        coverImage: blogToSave.coverImage || null,
        language: blogToSave.language || 'English',
        modelUsed: blogToSave.modelUsed || 'mistralai/Mistral-7B-Instruct-v0.2',
        isHumanized: blogToSave.isHumanized || false,
        originalContent: blogToSave.originalContent || null,
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
      <div className="max-w-6xl mx-auto">

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900 dark:text-ink-100 mb-2">
            AI Blog Writer SaaS Platform
          </h1>
          <p className="text-ink-600 dark:text-ink-400 max-w-xl mx-auto text-sm">
            Generate long-form articles, AI cover photos, SEO readability audits, and social media repurposed posts in seconds.
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Form Panel (left) */}
          <div className="lg:col-span-5">
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 shadow-paper p-6 sticky top-24">
              <h2 className="font-display font-semibold text-ink-900 dark:text-ink-100 text-lg mb-4">
                Blog Generator Settings
              </h2>
              <BlogForm onGenerate={handleGenerate} generating={generating} />
            </div>
          </div>

          {/* Output Panel (right) */}
          <div className="lg:col-span-7">
            {generatedBlog ? (
              <BlogOutput
                blog={generatedBlog}
                onHumanize={handleHumanize}
                onSave={handleSave}
                onRegenerate={handleRegenerate}
                humanizing={humanizing}
                saving={saving}
              />
            ) : (
              /* Empty state */
              <div className="h-full min-h-[450px] flex flex-col items-center justify-center text-center p-10 bg-white dark:bg-ink-900 rounded-2xl border-2 border-dashed border-ink-200 dark:border-ink-700">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 rounded-2xl flex items-center justify-center mb-5">
                  <BookOpen size={28} className="text-amber-500" />
                </div>
                <h3 className="font-display font-semibold text-ink-800 dark:text-ink-200 text-lg mb-2">
                  Your AI Generated Blog Will Appear Here
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400 max-w-xs mb-4">
                  Select your model, topic, tone, and language on the left to start writing.
                </p>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-ink-100 dark:bg-ink-800 text-xs font-semibold text-ink-700 dark:text-ink-300">
                  <Zap size={13} className="text-amber-500 fill-current" />
                  Every generation includes an AI cover image & SEO audit
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <PricingModal isOpen={pricingOpen} onClose={() => setPricingOpen(false)} />
    </div>
  );
};

export default Generator;
