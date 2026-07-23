// src/context/AuthContext.js
// Global auth state using React Context

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');

      if (token && storedUser) {
        try {
          const { data } = await api.get('/auth/me');
          if (data.success) {
            setUser(data.user);
            localStorage.setItem('authUser', JSON.stringify(data.user));
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });

    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setUser(data.user);
    }

    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });

    if (data.success) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      setUser(data.user);
    }

    return data;
  };

  const updateUser = (newUserData) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUserData };
      localStorage.setItem('authUser', JSON.stringify(updated));
      return updated;
    });
  };

  const addCredits = async (amount = 25, planTier = 'pro') => {
    try {
      const { data } = await api.post('/auth/add-credits', { amount, planTier });
      if (data.success) {
        updateUser(data.user);
      }
      return data;
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to add credits.' };
    }
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, addCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
