// src/App.js
// Root application component with routing

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Generator from './pages/Generator';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Toast notification container */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--color-primary, #1e1612)',
                color: '#faf8f3',
                borderRadius: '12px',
                fontSize: '14px',
                fontFamily: '"DM Sans", sans-serif',
                boxShadow: '0 8px 32px rgba(30, 22, 18, 0.2)',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#faf8f3' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#faf8f3' },
              },
            }}
          />

          {/* App Shell */}
          <div className="min-h-screen bg-parchment dark:bg-ink-950 transition-colors duration-300 font-body">
            <Navbar />

            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/generate" element={<Generator />} />
                <Route path="/history" element={<History />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* 404 fallback */}
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                      <h1 className="font-display text-6xl font-bold text-ink-200 dark:text-ink-800 mb-4">
                        404
                      </h1>
                      <p className="text-ink-600 dark:text-ink-400 mb-6">
                        Page not found.
                      </p>
                      <a
                        href="/"
                        className="px-5 py-2.5 bg-ink-900 dark:bg-amber-500 text-parchment dark:text-ink-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                      >
                        Go Home
                      </a>
                    </div>
                  }
                />
              </Routes>
            </main>

            {/* Footer */}
            <footer className="border-t border-ink-100 dark:border-ink-800 py-8 px-4 text-center mt-16">
              <p className="text-xs text-ink-400 dark:text-ink-600">
                © {new Date().getFullYear()} Inkwell AI. Built with React, Node.js, MongoDB &
                Hugging Face.
              </p>
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
