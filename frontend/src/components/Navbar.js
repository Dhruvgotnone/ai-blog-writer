// src/components/Navbar.js
// Top navigation bar with dark mode toggle and auth controls

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PenLine,
  Moon,
  Sun,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Sparkles size={15} /> },
    { to: '/generate', label: 'Generate', icon: <PenLine size={15} /> },
    { to: '/history', label: 'History', icon: <BookOpen size={15} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-parchment/90 dark:bg-ink-950/90 border-b border-ink-100 dark:border-ink-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMenuOpen(false)}
          >
            <div className="w-8 h-8 bg-ink-900 dark:bg-amber-500 rounded-lg flex items-center justify-center transition-colors">
              <PenLine size={16} className="text-parchment dark:text-ink-900" />
            </div>
            <span className="font-display font-bold text-ink-900 dark:text-ink-100 text-lg tracking-tight">
              Inkwell<span className="text-amber-500 dark:text-amber-400"> AI</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900'
                    : 'text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 hover:text-ink-900 dark:hover:text-ink-100'
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-all"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Auth Controls */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 transition-all"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-ink-900">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-ink-800 dark:text-ink-200 hidden sm:block">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-ink-800 rounded-xl shadow-paper-lg border border-ink-100 dark:border-ink-700 py-1 animate-fade-in">
                    <div className="px-3 py-2 border-b border-ink-100 dark:border-ink-700">
                      <p className="text-xs text-ink-500 dark:text-ink-400">Signed in as</p>
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/history"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700 transition-colors"
                    >
                      <BookOpen size={14} /> My Blogs
                    </Link>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-ink-700 dark:text-ink-300 hover:text-ink-900 dark:hover:text-ink-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 text-sm font-medium bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 rounded-lg hover:bg-ink-800 dark:hover:bg-amber-400 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-all"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink-100 dark:border-ink-800 bg-parchment dark:bg-ink-950 px-4 py-3 space-y-1 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(link.to)
                  ? 'bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900'
                  : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
          {!user && (
            <div className="pt-2 border-t border-ink-100 dark:border-ink-800 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium border border-ink-200 dark:border-ink-700 rounded-lg text-ink-800 dark:text-ink-200"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
