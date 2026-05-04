// src/components/BlogForm.js
// The main input form for generating blog posts

import React, { useState } from 'react';
import { Wand2, X, Plus, ChevronDown } from 'lucide-react';

const TONES = [
  { value: 'professional', label: '👔 Professional', desc: 'Authoritative & business-ready' },
  { value: 'casual', label: '😊 Casual', desc: 'Friendly & conversational' },
  { value: 'academic', label: '🎓 Academic', desc: 'Scholarly & research-driven' },
  { value: 'creative', label: '✨ Creative', desc: 'Imaginative & storytelling' },
  { value: 'persuasive', label: '💡 Persuasive', desc: 'Compelling & action-oriented' },
];

const WORD_COUNTS = [200, 300, 500, 700, 1000, 1500];

const BlogForm = ({ onGenerate, generating }) => {
  const [form, setForm] = useState({
    topic: '',
    wordCount: 500,
    tone: 'professional',
    seoKeywords: [],
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [toneDropdown, setToneDropdown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addKeyword = (e) => {
    e.preventDefault();
    const trimmed = keywordInput.trim().toLowerCase();
    if (trimmed && !form.seoKeywords.includes(trimmed) && form.seoKeywords.length < 5) {
      setForm((prev) => ({ ...prev, seoKeywords: [...prev.seoKeywords, trimmed] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keyword) => {
    setForm((prev) => ({
      ...prev,
      seoKeywords: prev.seoKeywords.filter((k) => k !== keyword),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    onGenerate(form);
  };

  const selectedTone = TONES.find((t) => t.value === form.tone);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Topic Input */}
      <div>
        <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
          Blog Topic <span className="text-red-500">*</span>
        </label>
        <textarea
          name="topic"
          value={form.topic}
          onChange={handleChange}
          placeholder="e.g. 'The Future of Remote Work in 2025' or 'How to Build Better Habits'"
          rows={3}
          required
          disabled={generating}
          className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all resize-none disabled:opacity-60 text-sm"
        />
        <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
          Be specific for better results. {form.topic.length}/200 characters
        </p>
      </div>

      {/* Word Count + Tone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Word Count */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
            Word Count
          </label>
          <div className="flex flex-wrap gap-2">
            {WORD_COUNTS.map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, wordCount: count }))}
                disabled={generating}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                  form.wordCount === count
                    ? 'bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 border-ink-900 dark:border-amber-500'
                    : 'bg-white dark:bg-ink-800 text-ink-600 dark:text-ink-400 border-ink-200 dark:border-ink-700 hover:border-ink-400 dark:hover:border-ink-500'
                } disabled:opacity-60`}
              >
                {count}w
              </button>
            ))}
          </div>
          <p className="text-xs text-ink-400 dark:text-ink-500 mt-1.5">
            Target: ~{form.wordCount} words
          </p>
        </div>

        {/* Tone Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
            Writing Tone
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setToneDropdown(!toneDropdown)}
              disabled={generating}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 hover:border-ink-400 dark:hover:border-ink-500 transition-all disabled:opacity-60"
            >
              <span className="text-sm">{selectedTone?.label}</span>
              <ChevronDown
                size={16}
                className={`text-ink-400 transition-transform ${toneDropdown ? 'rotate-180' : ''}`}
              />
            </button>

            {toneDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 rounded-xl shadow-paper-lg z-20 overflow-hidden animate-fade-in">
                {TONES.map((tone) => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, tone: tone.value }));
                      setToneDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors border-b border-ink-50 dark:border-ink-700 last:border-0 ${
                      form.tone === tone.value ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                    }`}
                  >
                    <div className="text-sm font-medium text-ink-900 dark:text-ink-100">
                      {tone.label}
                    </div>
                    <div className="text-xs text-ink-500 dark:text-ink-400">{tone.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Keywords (Bonus Feature) */}
      <div>
        <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
          SEO Keywords{' '}
          <span className="font-normal text-ink-400 dark:text-ink-500 text-xs">
            (optional, up to 5)
          </span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addKeyword(e)}
            placeholder="Type keyword and press Enter or +"
            disabled={generating || form.seoKeywords.length >= 5}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addKeyword}
            disabled={!keywordInput.trim() || form.seoKeywords.length >= 5 || generating}
            className="p-2 rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-300 disabled:opacity-50 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Keyword Tags */}
        {form.seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {form.seoKeywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800"
              >
                {kw}
                <button
                  type="button"
                  onClick={() => removeKeyword(kw)}
                  className="hover:text-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={generating || !form.topic.trim()}
        className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-semibold rounded-xl hover:bg-ink-800 dark:hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-paper hover:shadow-paper-lg"
      >
        {generating ? (
          <>
            {/* Loading dots animation */}
            <div className="flex gap-1">
              <span className="loading-dot w-2 h-2 rounded-full bg-parchment dark:bg-ink-900 inline-block" />
              <span className="loading-dot w-2 h-2 rounded-full bg-parchment dark:bg-ink-900 inline-block" />
              <span className="loading-dot w-2 h-2 rounded-full bg-parchment dark:bg-ink-900 inline-block" />
            </div>
            <span>Generating your blog...</span>
          </>
        ) : (
          <>
            <Wand2 size={18} />
            <span>Generate Blog Post</span>
          </>
        )}
      </button>

      {generating && (
        <p className="text-center text-xs text-ink-500 dark:text-ink-400 animate-pulse-slow">
          ✨ AI is crafting your blog... This may take 15–30 seconds.
        </p>
      )}
    </form>
  );
};

export default BlogForm;
