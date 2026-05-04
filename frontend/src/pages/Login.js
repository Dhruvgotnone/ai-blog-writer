// src/pages/Login.js
// User login page

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, PenLine, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/generate');
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 bg-ink-900 dark:bg-amber-500 rounded-xl items-center justify-center mb-4">
            <PenLine size={22} className="text-parchment dark:text-ink-900" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900 dark:text-ink-100">
            Welcome back
          </h1>
          <p className="text-ink-500 dark:text-ink-400 mt-1 text-sm">
            Sign in to access your blog library
          </p>
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
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-ink-200 dark:border-ink-700 bg-parchment dark:bg-ink-800 text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-ink-700 dark:text-ink-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
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
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 font-semibold rounded-xl hover:bg-ink-800 dark:hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed transition-all mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 dark:text-ink-400 mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-ink-800 dark:text-ink-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center text-xs text-ink-400 dark:text-ink-500 mt-6">
          <Link to="/" className="hover:text-ink-600 dark:hover:text-ink-300 transition-colors">
            ← Back to Inkwell AI
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
