// src/hooks/useBlog.js
// Custom hook encapsulating all blog-related API operations

import { useState } from 'react';
import api from '../utils/api';

const useBlog = () => {
  const [generating, setGenerating] = useState(false);
  const [humanizing, setHumanizing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  /**
   * Generate a blog post via AI
   */
  const generateBlog = async ({ topic, wordCount, tone, seoKeywords }) => {
    setGenerating(true);
    setError(null);

    try {
      const { data } = await api.post('/blogs/generate', {
        topic,
        wordCount: parseInt(wordCount),
        tone,
        seoKeywords,
      });

      if (!data.success) throw new Error(data.error || 'Generation failed');

      return data.data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to generate blog. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Humanize/rewrite existing blog content
   */
  const humanizeBlog = async (content) => {
    setHumanizing(true);
    setError(null);

    try {
      const { data } = await api.post('/blogs/humanize', { content });

      if (!data.success) throw new Error(data.error || 'Humanization failed');

      return data.data;
    } catch (err) {
      const message =
        err.response?.data?.error ||
        err.message ||
        'Failed to humanize content.';
      setError(message);
      throw new Error(message);
    } finally {
      setHumanizing(false);
    }
  };

  /**
   * Save blog to database
   */
  const saveBlog = async (blogData) => {
    setSaving(true);
    setError(null);

    try {
      const { data } = await api.post('/blogs/save', blogData);

      if (!data.success) throw new Error(data.error || 'Save failed');

      return data.data;
    } catch (err) {
      const message =
        err.response?.data?.error || err.message || 'Failed to save blog.';
      setError(message);
      throw new Error(message);
    } finally {
      setSaving(false);
    }
  };

  /**
   * Fetch saved blogs with pagination
   */
  const fetchBlogs = async (page = 1, limit = 10) => {
    try {
      const { data } = await api.get(`/blogs?page=${page}&limit=${limit}`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to fetch blogs.');
    }
  };

  /**
   * Delete a blog
   */
  const deleteBlog = async (blogId) => {
    try {
      const { data } = await api.delete(`/blogs/${blogId}`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to delete blog.');
    }
  };

  /**
   * Toggle blog favorite status
   */
  const toggleFavorite = async (blogId) => {
    try {
      const { data } = await api.patch(`/blogs/${blogId}/favorite`);
      return data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Failed to update favorite.');
    }
  };

  return {
    generating,
    humanizing,
    saving,
    error,
    clearError,
    generateBlog,
    humanizeBlog,
    saveBlog,
    fetchBlogs,
    deleteBlog,
    toggleFavorite,
  };
};

export default useBlog;
