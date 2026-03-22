'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CVDownloadButton({ className = '' }) {
  const [cv, setCV] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch CV info on mount
  useEffect(() => {
    fetchCVInfo();
  }, []);

  const fetchCVInfo = async () => {
    try {
      const response = await fetch('/api/cv');
      const data = await response.json();

      if (response.ok && data.success) {
        setCV(data.data);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch CV:', data.error);
        }
        setError(data.error);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('CV fetch error:', error);
      }
      setError('Failed to load CV information');
    }
  };

  const handleDownload = async () => {
    if (!cv) {
      alert('CV not available at the moment. Please try again later.');
      return;
    }

    setLoading(true);

    try {
      // Await tracking before opening file
      await fetch('/api/cv?track=true').catch((error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to track CV download:', error);
        }
      });

      // Open CV in new tab or trigger download
      window.open(cv.fileUrl, '_blank');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Download error:', error);
      }
      alert('Failed to download CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // If there's an error or no CV, show minimal button
  if (error || !cv) {
    return (
      <button
        onClick={fetchCVInfo}
        className={`bg-gradient-to-r from-primary to-secondary text-on-primary px-5 py-2 rounded-md font-headline text-sm font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-primary/20 opacity-50 cursor-not-allowed ${className}`}
        disabled
      >
        CV Unavailable
      </button>
    );
  }

  return (
    <motion.button
      onClick={handleDownload}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`bg-gradient-to-r from-primary to-secondary text-on-primary px-5 py-2 rounded-md font-headline text-sm font-bold uppercase tracking-wider transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${className}`}
    >
      {loading ? (
        <>
          <motion.div
            className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          Loading...
        </>
      ) : (
        <>
          Download CV
          <span className="material-symbols-outlined text-sm">download</span>
        </>
      )}
    </motion.button>
  );
}
