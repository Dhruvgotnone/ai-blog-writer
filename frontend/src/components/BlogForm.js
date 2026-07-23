// src/components/BlogForm.js
// Advanced SaaS input form for generating AI blog posts

import React, { useState } from 'react';
import { Wand2, X, Plus, ChevronDown, Cpu, Globe, Image as ImageIcon, ListChecks } from 'lucide-react';
import useBlog from '../hooks/useBlog';
import toast from 'react-hot-toast';

const TONES = [
  { value: 'professional', label: '👔 Professional', desc: 'Authoritative & business-ready' },
  { value: 'casual', label: '😊 Casual', desc: 'Friendly & conversational' },
  { value: 'academic', label: '🎓 Academic', desc: 'Scholarly & research-driven' },
  { value: 'creative', label: '✨ Creative', desc: 'Imaginative & storytelling' },
  { value: 'persuasive', label: '💡 Persuasive', desc: 'Compelling & action-oriented' },
];

const MODELS = [
  { value: 'grok-beta', name: '🚀 Grok AI (xAI)', badge: 'Grok Ultra' },
  { value: 'grok-2-latest', name: '⚡ Grok 2 (xAI)', badge: 'Grok 2' },
  { value: 'Qwen/Qwen2.5-72B-Instruct', name: 'Qwen 2.5 72B', badge: 'Ultra Intelligent' },
  { value: 'meta-llama/Llama-3.2-3B-Instruct', name: 'Llama 3.2 3B', badge: 'Fast & Creative' },
  { value: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B v0.3', badge: 'High Precision' },
];

const LANGUAGES = [
  { code: 'English', label: '🇺🇸 English' },
  { code: 'Spanish', label: '🇪🇸 Spanish' },
  { code: 'French', label: '🇫🇷 French' },
  { code: 'German', label: '🇩🇪 German' },
  { code: 'Hindi', label: '🇮🇳 Hindi' },
];

const WORD_COUNTS = [200, 300, 500, 700, 1000, 1500];

const BlogForm = ({ onGenerate, generating }) => {
  const { generateOutline, loadingOutline } = useBlog();
  const [form, setForm] = useState({
    topic: '',
    wordCount: 500,
    tone: 'professional',
    seoKeywords: [],
    selectedModel: 'grok-beta',
    language: 'English',
    generateImage: true,
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [toneDropdown, setToneDropdown] = useState(false);
  const [outlineItems, setOutlineItems] = useState([]);
  const [showOutline, setShowOutline] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  const handleCreateOutline = async () => {
    if (!form.topic.trim()) {
      toast.error('Please enter a blog topic first!');
      return;
    }

    try {
      const outline = await generateOutline(form.topic, form.tone, form.language);
      setOutlineItems(outline);
      setShowOutline(true);
      toast.success('Generated blog outline!');
    } catch (err) {
      toast.error('Failed to generate outline.');
    }
  };

  const handleUpdateOutlineItem = (index, value) => {
    const updated = [...outlineItems];
    updated[index] = value;
    setOutlineItems(updated);
  };

  const handleRemoveOutlineItem = (index) => {
    setOutlineItems(outlineItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.topic.trim()) return;
    onGenerate({
      ...form,
      outline: showOutline ? outlineItems : [],
    });
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
          placeholder="e.g. 'The Future of Remote Work in 2026' or 'How to Build High-Performance Microservices'"
          rows={3}
          required
          disabled={generating}
          className="w-full px-4 py-3 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent transition-all resize-none disabled:opacity-60 text-sm"
        />
        <p className="text-xs text-ink-400 dark:text-ink-500 mt-1">
          Be specific for better results. {form.topic.length}/200 characters
        </p>
      </div>

      {/* AI Model & Language Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Model Selector */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-amber-500" /> AI Model
          </label>
          <select
            name="selectedModel"
            value={form.selectedModel}
            onChange={handleChange}
            disabled={generating}
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector */}
        <div>
          <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-amber-500" /> Language
          </label>
          <select
            name="language"
            value={form.language}
            onChange={handleChange}
            disabled={generating}
            className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
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
              <span className="text-sm font-medium flex items-center gap-2">
                {selectedTone?.label}
              </span>
              <ChevronDown size={16} className={`transition-transform ${toneDropdown ? 'rotate-180' : ''}`} />
            </button>

            {toneDropdown && (
              <div className="absolute left-0 right-0 mt-2 z-20 bg-white dark:bg-ink-800 rounded-xl border border-ink-200 dark:border-ink-700 shadow-paper-lg overflow-hidden py-1">
                {TONES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, tone: t.value }));
                      setToneDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors flex items-center justify-between ${
                      form.tone === t.value ? 'bg-amber-50 dark:bg-amber-950/30' : ''
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-ink-900 dark:text-ink-100">{t.label}</p>
                      <p className="text-xs text-ink-400 dark:text-ink-500">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Keywords Input */}
      <div>
        <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-2">
          SEO Keywords <span className="text-xs font-normal text-ink-400">(optional, up to 5)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addKeyword(e)}
            placeholder="Type keyword and press Enter"
            disabled={generating || form.seoKeywords.length >= 5}
            className="flex-1 px-4 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm disabled:opacity-60"
          />
          <button
            type="button"
            onClick={addKeyword}
            disabled={generating || !keywordInput.trim() || form.seoKeywords.length >= 5}
            className="px-4 py-2.5 bg-ink-100 dark:bg-ink-700 hover:bg-ink-200 dark:hover:bg-ink-600 text-ink-800 dark:text-ink-200 rounded-xl text-sm font-medium transition-all disabled:opacity-60 flex items-center gap-1"
          >
            <Plus size={16} /> Add
          </button>
        </div>

        {/* Keyword Badges */}
        {form.seoKeywords.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {form.seoKeywords.map((keyword) => (
              <span
                key={keyword}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-medium border border-amber-200 dark:border-amber-800"
              >
                #{keyword}
                <button
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="hover:text-red-600 dark:hover:text-red-400 p-0.5 rounded-full"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* AI Cover Image & Outline Builder Toggles */}
      <div className="p-4 rounded-xl border border-ink-200 dark:border-ink-800 bg-ink-50/50 dark:bg-ink-900/50 space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-medium text-ink-800 dark:text-ink-200 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-500" /> Generate AI Cover Photo
          </span>
          <input
            type="checkbox"
            name="generateImage"
            checked={form.generateImage}
            onChange={handleChange}
            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
          />
        </label>

        <div className="flex items-center justify-between pt-2 border-t border-ink-200 dark:border-ink-800">
          <span className="text-sm font-medium text-ink-800 dark:text-ink-200 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-amber-500" /> Step-by-Step Outline Builder
          </span>
          <button
            type="button"
            onClick={handleCreateOutline}
            disabled={loadingOutline || !form.topic.trim()}
            className="px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500 text-ink-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
          >
            {loadingOutline ? 'Building Outline...' : 'Generate Outline First'}
          </button>
        </div>

        {/* Outline Section */}
        {showOutline && outlineItems.length > 0 && (
          <div className="pt-3 space-y-2">
            <p className="text-xs font-bold text-ink-600 dark:text-ink-400 uppercase tracking-wider">
              Outline Sections (Editable)
            </p>
            {outlineItems.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 w-4">{idx + 1}.</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateOutlineItem(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-900 dark:text-ink-100 text-xs focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveOutlineItem(idx)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={generating || !form.topic.trim()}
        className="w-full py-3.5 px-6 bg-amber-500 hover:bg-amber-400 text-ink-950 font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wand2 className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
        {generating ? 'AI Writing Your Blog...' : 'Generate Blog Post'}
      </button>

    </form>
  );
};

export default BlogForm;
