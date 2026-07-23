// src/pages/Admin.js
// Admin Dashboard for managing SaaS users, credits, and system metrics

import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Zap,
  Crown,
  ShieldCheck,
  Plus,
  Trash2,
  RefreshCw,
  Search,
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingUser, setUpdatingUser] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch {
      toast.error('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddCredits = async (userId, currentCredits) => {
    setUpdatingUser(userId);
    try {
      const newCredits = currentCredits + 50;
      const res = await api.patch(`/admin/users/${userId}/credits`, {
        credits: newCredits,
        tier: 'pro',
      });
      if (res.data.success) {
        toast.success('+50 Credits added!');
        fetchAdminData();
      }
    } catch {
      toast.error('Failed to update credits.');
    } finally {
      setUpdatingUser(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        toast.success('User deleted.');
        fetchAdminData();
      }
    } catch {
      toast.error('Failed to delete user.');
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-2">
              <ShieldCheck size={14} /> SaaS Admin Panel
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-ink-900 dark:text-ink-100">
              Admin & User Management
            </h1>
          </div>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-800 dark:text-ink-200 font-semibold text-xs flex items-center gap-1.5 hover:border-amber-500 shadow-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Stats
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-paper">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Total Users</span>
              <Users className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">
              {stats?.totalUsers ?? '...'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-paper">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Blogs Generated</span>
              <BookOpen className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">
              {stats?.totalBlogs ?? '...'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-paper">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Pro Subscribers</span>
              <Crown className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">
              {stats?.proUsers ?? '...'}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 shadow-paper">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-500">Total Active Credits</span>
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-extrabold font-serif text-ink-900 dark:text-ink-100">
              {stats?.totalCredits ?? '...'}
            </p>
          </div>
        </div>

        {/* Users Table Card */}
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-ink-200 dark:border-ink-800 shadow-paper-lg overflow-hidden">
          
          <div className="p-6 border-b border-ink-100 dark:border-ink-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-ink-900 dark:text-ink-100 text-lg">
                Registered Platform Users
              </h2>
              <p className="text-xs text-ink-500">
                View user profiles, credit allocations, and subscription tiers.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-ink-400" />
              <input
                type="text"
                placeholder="Search name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-ink-200 dark:border-ink-700 bg-ink-50/50 dark:bg-ink-800 text-ink-900 dark:text-ink-100 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ink-50/70 dark:bg-ink-950/50 border-b border-ink-100 dark:border-ink-800 text-xs font-bold text-ink-600 dark:text-ink-400 uppercase tracking-wider">
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Plan Tier</th>
                  <th className="py-3 px-6">Credits</th>
                  <th className="py-3 px-6">Blogs Built</th>
                  <th className="py-3 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-ink-800 text-xs text-ink-800 dark:text-ink-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-ink-50/50 dark:hover:bg-ink-800/40 transition-colors">
                      <td className="py-4 px-6 font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-ink-950 font-bold flex items-center justify-center">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-ink-900 dark:text-ink-100">{u.name}</p>
                            <p className="text-[11px] text-ink-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          u.tier === 'pro'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300'
                            : u.tier === 'agency'
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300'
                            : 'bg-ink-100 dark:bg-ink-800 text-ink-600 dark:text-ink-400'
                        }`}>
                          {u.tier || 'free'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-amber-600 dark:text-amber-400">
                        ⚡ {u.credits ?? 5}
                      </td>

                      <td className="py-4 px-6 font-semibold">
                        {u.blogsGenerated || 0} blogs
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddCredits(u._id, u.credits ?? 5)}
                            disabled={updatingUser === u._id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
                          >
                            <Plus size={12} /> Add 50 Credits
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-ink-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Admin;
