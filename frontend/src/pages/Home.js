// src/pages/Home.js
// Landing page with app features overview

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wand2,
  BookOpen,
  Sparkles,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Wand2 className="w-5 h-5" />,
    title: 'AI-Powered Generation',
    desc: 'Generate full blog posts in seconds using state-of-the-art language models from Hugging Face.',
    color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Humanize & Rewrite',
    desc: 'Make AI text sound more natural and engaging with our one-click humanization feature.',
    color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Save & Organize',
    desc: 'Save your blogs, mark favorites, and access your complete writing history anytime.',
    color: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: 'SEO Optimized',
    desc: 'Add target keywords and get SEO-friendly content that ranks on search engines.',
    color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Multiple Tones',
    desc: 'Choose from Professional, Casual, Academic, Creative, or Persuasive writing styles.',
    color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Secure & Private',
    desc: 'Your blogs are saved securely with JWT authentication and MongoDB encryption.',
    color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  },
];

const STEPS = [
  { step: '01', title: 'Enter your topic', desc: 'Type what you want to write about' },
  { step: '02', title: 'Choose your settings', desc: 'Set tone, word count, and SEO keywords' },
  { step: '03', title: 'Generate & refine', desc: 'Get AI-written content, then humanize if needed' },
  { step: '04', title: 'Save & publish', desc: 'Copy to clipboard or save to your library' },
];

const Home = () => {
  return (
    <div className="min-h-screen">

      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-16 pb-24 px-4">
        {/* Decorative background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-amber-200/30 dark:bg-amber-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-48 h-48 bg-ink-200/30 dark:bg-ink-800/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-6 border border-amber-200 dark:border-amber-800">
            <Sparkles size={12} />
            Powered by Hugging Face AI
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-ink-900 dark:text-ink-100 mb-6 leading-tight">
            Write brilliant blogs
            <br />
            <span className="italic text-amber-600 dark:text-amber-400">in seconds.</span>
          </h1>

          <p className="text-lg text-ink-600 dark:text-ink-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Inkwell AI transforms your ideas into polished, SEO-optimized blog posts.
            Just enter a topic and let the AI do the writing.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/generate"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-semibold rounded-xl hover:bg-ink-800 dark:hover:bg-amber-400 transition-all shadow-paper-lg hover:shadow-xl group"
            >
              Start Writing Free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/history"
              className="flex items-center justify-center gap-2 px-6 py-3.5 border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 font-semibold rounded-xl hover:bg-ink-50 dark:hover:bg-ink-800 transition-all"
            >
              <BookOpen size={16} />
              View Examples
            </Link>
          </div>

          {/* Social Proof Snippets */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 text-sm text-ink-500 dark:text-ink-400">
            {['No credit card required', '5 tones available', 'MongoDB-backed history'].map(
              (item) => (
                <span key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-green-500" />
                  {item}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-white dark:bg-ink-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
              Everything you need to write great blogs
            </h2>
            <p className="text-ink-600 dark:text-ink-400">
              A complete toolkit for AI-assisted content creation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl border border-ink-100 dark:border-ink-800 bg-parchment dark:bg-ink-900 hover:shadow-paper transition-all duration-200 group"
              >
                <div className={`inline-flex p-2.5 rounded-lg ${feature.color} mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="font-semibold text-ink-900 dark:text-ink-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100 mb-3">
              How it works
            </h2>
            <p className="text-ink-600 dark:text-ink-400">
              From idea to published blog in four simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, idx) => (
              <div key={step.step} className="relative text-center">
                {/* Connector line */}
                {idx < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-2/3 w-1/3 h-px bg-ink-200 dark:bg-ink-700 -z-10" />
                )}

                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-display font-bold text-lg mb-4">
                  {step.step}
                </div>
                <h3 className="font-semibold text-ink-900 dark:text-ink-100 mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-ink-500 dark:text-ink-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center bg-ink-900 dark:bg-ink-800 rounded-2xl p-12 shadow-paper-lg">
          <h2 className="font-display text-3xl font-bold text-parchment mb-4">
            Ready to write your first AI blog?
          </h2>
          <p className="text-ink-300 mb-8 text-sm">
            Join thousands of creators using Inkwell AI to save time and create better content.
          </p>
          <Link
            to="/generate"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-ink-900 font-bold rounded-xl transition-all shadow-lg"
          >
            <Wand2 size={18} />
            Generate Your First Blog
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
