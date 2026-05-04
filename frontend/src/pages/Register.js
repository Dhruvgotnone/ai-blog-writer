// src/pages/Register.js
// New user registration page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, PenLine, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to Inkwell AI!');
      navigate('/generate');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: 'text-red-500', pct: 25 };
    if (p.length < 8) return { label: 'Weak', color: 'text-orange-500', pct: 50 };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: 'Fair', color: 'text-yellow-500', pct: 75 };
    return { label: 'Strong', color: 'text-green-500', pct: 100 };
  };
  const strength = passwordStrength();

  const PERKS = [
    'Save unlimited blog posts',
    'Access generation history',
    'Mark favorites',
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-ink-900 dark:bg-amber-500 rounded-xl items-center justify-center mb-4">
            <PenLine size={22} className="text-parchment dark:text-ink-900" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">
            Create your account
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1 text-sm">
            Start writing AI-powered blogs for free
          </p>
        </div>

        {/* Perks */}
        <div className="flex flex-col gap-1.5 mb-6">
          {PERKS.map((perk) => (
            <div key={perk} className="flex items-center gap-2 text-sm text-ink-600 dark:text-ink-400">
              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
              {perk}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-100 dark:border-ink-800 shadow-paper p-8">

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 mb-5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Jane Smith"
                required
                autoComplete="name"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-ink-200 dark:border-ink-700 bg-parchment dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-ink-200 dark:border-ink-700 bg-parchment dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl border border-ink-200 dark:border-ink-700 bg-parchment dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 dark:hover:text-ink-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Strength indicator */}
              {strength && (
                <div className="mt-2">
                  <div className="h-1 bg-ink-100 dark:bg-ink-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${strength.pct}%`,
                        backgroundColor:
                          strength.pct === 100
                            ? '#22c55e'
                            : strength.pct === 75
                            ? '#eab308'
                            : strength.pct === 50
                            ? '#f97316'
                            : '#ef4444',
                      }}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${strength.color}`}>{strength.label}</p>
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-semibold rounded-xl hover:bg-ink-800 dark:hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-xs text-ink-400 dark:text-ink-500 text-center mt-4">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-4 pt-4 border-t border-ink-100 dark:border-ink-800">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-ink-800 dark:text-ink-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-ink-400 dark:text-ink-500 mt-6">
          <Link to="/" className="hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
            ← Back to Inkwell AI
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
