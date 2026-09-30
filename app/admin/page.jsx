'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab: 'overview' | 'experiences' | 'projects' | 'certifications' | 'cv'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [education, setEducation] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checked: false, error: null });

  // UI / Action states
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'experience' | 'project' | 'certification' | 'education' | 'cv'
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [expRes, projRes, certRes, eduRes, cvRes] = await Promise.all([
        fetch('/api/admin/experiences'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/certifications'),
        fetch('/api/admin/education'),
        fetch('/api/admin/cv'),
      ]);

      if (expRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const [expData, projData, certData, eduData, cvResp] = await Promise.all([
        expRes.json(),
        projRes.json(),
        certRes.json(),
        eduRes.json(),
        cvRes.json(),
      ]);

      setExperiences(expData.data || []);
      setProjects(projData.data || []);
      setCertifications(certData.data || []);
      setEducation(eduData.data || []);
      setCvData(cvResp.data || null);

      setDbStatus({
        connected: !expData.error && !projData.error,
        checked: true,
        error: expData.error || projData.error || null,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Failed to load portfolio data', 'error');
    } finally {
      setLoadingData(false);
    }
  }, [showToast]);

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/admin/auth');
        const data = await res.json();
        setIsAuthenticated(!!data.authenticated);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Fetch all CMS data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated, fetchAllData]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setPassword('');
        showToast('Welcome back, Admin!');
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
      setIsAuthenticated(false);
      showToast('Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSeedData = async (overwrite = false) => {
    if (
      overwrite &&
      !window.confirm(
        'Warning: This will overwrite existing MongoDB collections with the seed dataset. Continue?'
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overwrite }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast(data.message || 'Data seeded successfully!');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to seed data', 'error');
      }
    } catch {
      showToast('Seed request failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal for Create or Edit
  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setModalType(null);
  };

  // Delete handler
  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const res = await fetch(`/api/admin/${type}s?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('Item deleted successfully');
        fetchAllData();
      } else {
        showToast(data.error || 'Delete failed', 'error');
      }
    } catch {
      showToast('Network error during delete', 'error');
    }
  };

  // Save handler (Create / Update)
  const handleSaveItem = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const payload = {};

    formData.forEach((value, key) => {
      if (key === 'tags' || key === 'technologies') {
        payload[key] = value
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      } else if (key === 'order' || key === 'downloadsCount') {
        payload[key] = Number(value) || 0;
      } else if (key === 'featured' || key === 'isActive') {
        payload[key] = value === 'on' || value === 'true';
      } else {
        payload[key] = value;
      }
    });

    const isEdit = !!editingItem?._id;
    const url = `/api/admin/${modalType === 'education' ? 'education' : modalType + 's'}`;
    const method = isEdit ? 'PUT' : 'POST';

    if (isEdit) {
      payload.id = editingItem._id;
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showToast(
          isEdit ? 'Updated successfully!' : 'Created successfully!'
        );
        closeModal();
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to save', 'error');
      }
    } catch {
      showToast('Network error during save', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // CV PDF / File upload
  const handleCvFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cv');

    setUploadingFile(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success) {
        showToast('CV PDF file uploaded successfully!');
        // Update CV document fileUrl if needed
        await fetch('/api/admin/cv', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: data.fileUrl }),
        });
        fetchAllData();
      } else {
        showToast(data.error || 'Upload failed', 'error');
      }
    } catch {
      showToast('Network error while uploading CV', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  // Loading gate
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-on-surface">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-headline text-sm tracking-widest text-on-surface-variant uppercase">
            Initializing CMS...
          </p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center items-center px-4 relative overflow-hidden">
        {/* Glow ambient background elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-surface-container-low border border-outline-variant/30 rounded-2xl p-8 shadow-2xl relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-surface-container-high border border-primary/20 text-primary mb-4 shadow-[0_0_20px_rgba(164,230,255,0.15)]">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-on-surface">
              Portfolio <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">CMS</span>
            </h1>
            <p className="text-on-surface-variant text-xs sm:text-sm mt-2">
              Manage Experiences, Projects, Certifications &amp; CV via MongoDB
            </p>
          </div>

          {authError && (
            <div className="mb-6 p-3 rounded-lg bg-error-container/30 border border-error/30 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your CMS admin password"
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-on-surface-variant/60 mt-1.5">
                Default password configured in <code className="text-primary/80">.env.local</code> (ADMIN_PASSWORD).
              </p>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loginLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  Access CMS
                  <span className="material-symbols-outlined text-sm">login</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/20 text-center">
            <Link
              href="/"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-xs">arrow_back</span>
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Dashboard
  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all animate-bounce ${
            toast.type === 'error'
              ? 'bg-error-container text-on-error-container border-error/40'
              : 'bg-surface-container-highest text-primary border-primary/40'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">dataset</span>
              <span className="font-headline font-bold text-base sm:text-lg tracking-tight">
                Portfolio <span className="text-primary">CMS</span>
              </span>
            </div>

            {/* DB Status Badge */}
            <div
              className={`hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border ${
                dbStatus.connected
                  ? 'border-tertiary/30 text-tertiary bg-tertiary/10'
                  : 'border-warning/30 text-warning bg-warning/10'
              }`}
              title={
                dbStatus.connected
                  ? 'Connected to MongoDB'
                  : 'Operating with MongoDB or Fallback Data. Check MONGODB_URI in .env.local'
              }
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbStatus.connected ? 'bg-tertiary animate-pulse' : 'bg-warning'
                }`}
              ></span>
              {dbStatus.connected ? 'MongoDB Live' : 'Database Ready / Local'}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => handleSeedData(false)}
              disabled={isSubmitting}
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-headline uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors py-1.5 px-3 rounded border border-outline-variant/30 hover:border-primary/40"
              title="Populates MongoDB with original portfolio experience, projects, and certifications if empty"
            >
              <span className="material-symbols-outlined text-sm">cloud_sync</span>
              Sync/Seed DB
            </button>

            <Link
              href="/"
              target="_blank"
              className="text-xs font-headline uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors py-1.5 px-3 rounded border border-outline-variant/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              <span className="hidden sm:inline">View Site</span>
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs font-headline uppercase tracking-wider text-error/90 hover:text-error transition-colors py-1.5 px-3 rounded border border-error/20 hover:border-error/40 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-grow flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/20 pb-4 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: 'dashboard' },
            { id: 'experiences', label: `Experiences (${experiences.length})`, icon: 'work' },
            { id: 'projects', label: `Projects (${projects.length})`, icon: 'terminal' },
            { id: 'certifications', label: `Certifications & Edu (${certifications.length + education.length})`, icon: 'verified' },
            { id: 'cv', label: 'CV Manager', icon: 'description' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                  : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        {loadingData ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs uppercase tracking-widest">Loading content from MongoDB...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">work</span>
                    </div>
                    <span className="text-3xl font-bold font-headline text-on-surface">
                      {experiences.length}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      Experiences Listed
                    </p>
                    <button
                      onClick={() => setActiveTab('experiences')}
                      className="mt-4 text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Manage Experiences →
                    </button>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group hover:border-secondary/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">terminal</span>
                    </div>
                    <span className="text-3xl font-bold font-headline text-on-surface">
                      {projects.length}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      Projects Active
                    </p>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="mt-4 text-xs text-secondary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Manage Projects →
                    </button>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group hover:border-tertiary/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                    <span className="text-3xl font-bold font-headline text-on-surface">
                      {certifications.length}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      Certificates &amp; Badges
                    </p>
                    <button
                      onClick={() => setActiveTab('certifications')}
                      className="mt-4 text-xs text-tertiary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Manage Credentials →
                    </button>
                  </div>

                  <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 relative overflow-hidden group hover:border-primary/40 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <span className="material-symbols-outlined">download</span>
                    </div>
                    <span className="text-3xl font-bold font-headline text-on-surface">
                      {cvData?.downloadsCount || 0}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      CV Downloads Tracked
                    </p>
                    <button
                      onClick={() => setActiveTab('cv')}
                      className="mt-4 text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Manage CV File →
                    </button>
                  </div>
                </div>

                {/* MongoDB Setup & Sync Quick Actions */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface mb-2">
                        MongoDB Status &amp; Database Management
                      </h3>
                      <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
                        Your portfolio reads all dynamic data (experiences, projects, education, certifications, and CV details) straight from your MongoDB database. You can quickly seed your initial portfolio data or make real-time updates anytime.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => handleSeedData(false)}
                        disabled={isSubmitting}
                        className="py-2.5 px-4 rounded-lg bg-surface-container-high border border-outline-variant/40 hover:border-primary text-xs font-headline font-bold uppercase tracking-wider text-on-surface flex items-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">sync</span>
                        Seed Data If Empty
                      </button>

                      <button
                        onClick={() => handleSeedData(true)}
                        disabled={isSubmitting}
                        className="py-2.5 px-4 rounded-lg bg-surface-container-high border border-error/30 hover:border-error text-xs font-headline font-bold uppercase tracking-wider text-error/90 flex items-center gap-2 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">restart_alt</span>
                        Reset &amp; Reseed
                      </button>
                    </div>
                  </div>

                  {/* MongoDB URI helper note */}
                  <div className="mt-6 pt-6 border-t border-outline-variant/10 text-xs text-on-surface-variant">
                    <span className="text-primary font-bold">Config Tip:</span> Ensure your MongoDB connection string is set in <code className="text-primary/90">.env.local</code> as <code className="text-primary/90">MONGODB_URI=mongodb+srv://...</code>. When running on production (Vercel, AWS, etc.), add the same environment variable in your deployment project settings.
                  </div>
                </div>
              </div>
            )}

            {/* EXPERIENCES TAB */}
            {activeTab === 'experiences' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold">Experiences</h2>
                    <p className="text-xs text-on-surface-variant">
                      Manage career timeline items displayed on the /experience page
                    </p>
                  </div>
                  <button
                    onClick={() => openModal('experience')}
                    className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Experience
                  </button>
                </div>

                {experiences.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-outline-variant/30 rounded-xl">
                    <p className="text-sm text-on-surface-variant mb-4">No experiences found in database.</p>
                    <button
                      onClick={() => handleSeedData(false)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Click here to seed sample experiences
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.map((exp, idx) => (
                      <div
                        key={exp._id || exp.id || idx}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-outline-variant/50 transition-colors"
                      >
                        <div className="space-y-2 flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-headline text-base sm:text-lg font-bold text-on-surface">
                              {exp.role}
                            </span>
                            <span className="text-xs text-on-surface-variant/60">at</span>
                            <span className="text-xs sm:text-sm font-semibold text-primary">
                              {exp.company}
                            </span>
                            <span className="text-[10px] uppercase font-label px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                              Order: {exp.order ?? idx + 1}
                            </span>
                            <span className="text-[10px] uppercase font-label px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                              Color: {exp.color || 'primary'}
                            </span>
                          </div>

                          <p className="text-xs text-on-surface-variant/80 font-mono">
                            {exp.period || `${exp.startDate} - ${exp.endDate}`}
                          </p>

                          <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl line-clamp-2">
                            {exp.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {exp.tags?.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                          <button
                            onClick={() => openModal('experience', exp)}
                            className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                            title="Edit Experience"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete('experience', exp._id || exp.id)}
                            className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                            title="Delete Experience"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold">Projects</h2>
                    <p className="text-xs text-on-surface-variant">
                      Manage portfolio projects showcased on /projects
                    </p>
                  </div>
                  <button
                    onClick={() => openModal('project')}
                    className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Add Project
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-outline-variant/30 rounded-xl">
                    <p className="text-sm text-on-surface-variant mb-4">No projects found in database.</p>
                    <button
                      onClick={() => handleSeedData(false)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Click here to seed sample projects
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map((proj, idx) => (
                      <div
                        key={proj._id || proj.id || idx}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden flex flex-col justify-between hover:border-outline-variant/50 transition-colors"
                      >
                        <div className="p-5 sm:p-6 space-y-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                                {proj.title}
                              </h3>
                              {proj.status && (
                                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-tertiary bg-tertiary/10 border border-tertiary/20 px-2 py-0.5 rounded-full mt-1">
                                  {proj.status}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openModal('project', proj)}
                                className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                                title="Edit Project"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete('project', proj._id || proj.id)}
                                className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                                title="Delete Project"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                            {proj.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5">
                            {proj.technologies?.map((tech) => (
                              <span
                                key={tech}
                                className="text-[10px] bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                            {proj.liveUrl && (
                              <a
                                href={proj.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                Live Demo <span className="material-symbols-outlined text-xs">open_in_new</span>
                              </a>
                            )}
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1 font-semibold"
                              >
                                GitHub <span className="material-symbols-outlined text-xs">code</span>
                              </a>
                            )}
                          </div>
                        </div>

                        {proj.image && (
                          <div className="h-32 bg-surface-container-lowest border-t border-outline-variant/10 overflow-hidden">
                            <img
                              src={proj.image}
                              alt={proj.title}
                              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CERTIFICATIONS & EDUCATION TAB */}
            {activeTab === 'certifications' && (
              <div className="space-y-12">
                {/* Certifications Section */}
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-headline text-xl sm:text-2xl font-bold">Certifications &amp; Badges</h2>
                      <p className="text-xs text-on-surface-variant">
                        Certifications showcased on /certifications
                      </p>
                    </div>
                    <button
                      onClick={() => openModal('certification')}
                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Certification
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certifications.map((cert, idx) => (
                      <div
                        key={cert._id || cert.id || idx}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 flex flex-col justify-between hover:border-outline-variant/50 transition-colors"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="material-symbols-outlined text-tertiary text-2xl">
                              {cert.icon || 'verified'}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openModal('certification', cert)}
                                className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>
                              <button
                                onClick={() => handleDelete('certification', cert._id || cert.id)}
                                className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </div>

                          <h3 className="font-headline text-base font-bold text-on-surface">
                            {cert.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant">{cert.organization}</p>

                          {cert.credentialId && (
                            <p className="text-[11px] font-mono text-on-surface-variant/70">
                              ID: {cert.credentialId}
                            </p>
                          )}

                          <div className="flex items-center gap-2 text-[10px] uppercase font-mono text-on-surface-variant">
                            {cert.issueDate && <span>Issued: {cert.issueDate}</span>}
                            {cert.expiryDate && <span>Expires: {cert.expiryDate}</span>}
                          </div>
                        </div>

                        {cert.verificationUrl && (
                          <div className="mt-4 pt-3 border-t border-outline-variant/10">
                            <a
                              href={cert.verificationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-tertiary hover:underline inline-flex items-center gap-1 font-semibold"
                            >
                              Verify Badge <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Section */}
                <div className="space-y-6 pt-6 border-t border-outline-variant/20">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="font-headline text-xl sm:text-2xl font-bold">Academic Education</h2>
                      <p className="text-xs text-on-surface-variant">
                        Education history items shown on /certifications
                      </p>
                    </div>
                    <button
                      onClick={() => openModal('education')}
                      className="py-2.5 px-4 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-primary text-on-surface font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Education
                    </button>
                  </div>

                  <div className="space-y-4">
                    {education.map((edu, idx) => (
                      <div
                        key={edu._id || edu.id || idx}
                        className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-2">
                          <h3 className="font-headline text-base font-bold text-on-surface">
                            {edu.title}
                          </h3>
                          <p className="text-xs font-semibold text-primary">{edu.institution}</p>
                          <p className="text-xs text-on-surface-variant/80 font-mono">
                            {edu.period || `${edu.startDate} - ${edu.endDate}`}
                          </p>
                          {edu.description && (
                            <p className="text-xs text-on-surface-variant max-w-2xl">{edu.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openModal('education', edu)}
                            className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete('education', edu._id || edu.id)}
                            className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* CV TAB */}
            {activeTab === 'cv' && (
              <div className="max-w-3xl space-y-8">
                <div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold">CV &amp; Resume Manager</h2>
                  <p className="text-xs text-on-surface-variant">
                    Your CV PDF is stored directly in MongoDB and streamed dynamically to visitors.
                  </p>
                </div>

                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 sm:p-8 space-y-6">
                  {/* Current file status */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-surface-container-high/50 border border-outline-variant/20">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/30 font-bold uppercase tracking-wider">
                          MongoDB Storage
                        </span>
                        <span className="text-xs font-headline font-bold text-on-surface">
                          {cvData?.fileName || 'cv.pdf'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono">
                        {cvData?.fileSize ? `${(cvData.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'PDF Document'} &bull; {cvData?.downloadsCount || 0} total downloads
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="/api/cv/download"
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3.5 rounded bg-surface-container-highest text-xs font-semibold text-on-surface hover:text-primary flex items-center gap-1.5 transition-colors border border-outline-variant/30"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        Preview PDF
                      </a>

                      <label className="py-2 px-3.5 rounded bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 flex items-center gap-1.5 transition-opacity shadow-md">
                        <span className="material-symbols-outlined text-sm">upload_file</span>
                        {uploadingFile ? 'Saving to MongoDB...' : 'Upload PDF'}
                        <input
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={handleCvFileUpload}
                          disabled={uploadingFile}
                        />
                      </label>
                    </div>
                  </div>

                  {/* CV details form */}
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setIsSubmitting(true);
                      const formData = new FormData(e.target);
                      const payload = {
                        title: formData.get('title'),
                        description: formData.get('description'),
                        downloadsCount: Number(formData.get('downloadsCount')) || 0,
                      };

                      try {
                        const res = await fetch('/api/admin/cv', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(payload),
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          showToast('CV metadata updated successfully');
                          fetchAllData();
                        } else {
                          showToast(data.error || 'Failed to update CV', 'error');
                        }
                      } catch {
                        showToast('Error saving CV details', 'error');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                        CV Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={cvData?.title || 'Dashintha Jayawardana - CV'}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                        Description / Note
                      </label>
                      <input
                        type="text"
                        name="description"
                        defaultValue={cvData?.description || 'Professional CV and Resume'}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                        Downloads Count
                      </label>
                      <input
                        type="number"
                        name="downloadsCount"
                        defaultValue={cvData?.downloadsCount || 0}
                        className="w-full max-w-xs bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                      <p className="text-[11px] text-on-surface-variant/60 mt-1">
                        Automatically tracks every time someone clicks &ldquo;Download CV&rdquo; on your portfolio.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save CV Settings'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface-container-low border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative my-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface capitalize">
                {editingItem ? 'Edit' : 'Add New'} {modalType}
              </h3>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* EXPERIENCE FORM */}
              {modalType === 'experience' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Company *
                      </label>
                      <input
                        type="text"
                        name="company"
                        defaultValue={editingItem?.company || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Role / Title *
                      </label>
                      <input
                        type="text"
                        name="role"
                        defaultValue={editingItem?.role || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Start Date *
                      </label>
                      <input
                        type="text"
                        name="startDate"
                        defaultValue={editingItem?.startDate || ''}
                        placeholder="e.g. Aug 2026"
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        End Date
                      </label>
                      <input
                        type="text"
                        name="endDate"
                        defaultValue={editingItem?.endDate || 'Present'}
                        placeholder="e.g. Present or Sep 2026"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description || ''}
                      required
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        defaultValue={editingItem?.tags?.join(', ') || ''}
                        placeholder="IOT, CLOUD, DEVOPS"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Theme Color
                      </label>
                      <select
                        name="color"
                        defaultValue={editingItem?.color || 'primary'}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="primary">Primary (Cyan)</option>
                        <option value="secondary">Secondary (Purple)</option>
                        <option value="tertiary">Tertiary (Emerald)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingItem?.order ?? experiences.length + 1}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* PROJECT FORM */}
              {modalType === 'project' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingItem?.title || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Status Badge
                      </label>
                      <input
                        type="text"
                        name="status"
                        defaultValue={editingItem?.status || 'Active'}
                        placeholder="Active, Production, etc."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingItem?.description || ''}
                      required
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      name="technologies"
                      defaultValue={editingItem?.technologies?.join(', ') || ''}
                      placeholder="Next.js, Node.js, Docker, MongoDB"
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        defaultValue={editingItem?.githubUrl || ''}
                        placeholder="https://github.com/..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Live Demo URL
                      </label>
                      <input
                        type="url"
                        name="liveUrl"
                        defaultValue={editingItem?.liveUrl || ''}
                        placeholder="https://..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Cover Image URL
                    </label>
                    <input
                      type="text"
                      name="image"
                      defaultValue={editingItem?.image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80'}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-mono text-[11px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Accent Bar Color
                      </label>
                      <select
                        name="barColor"
                        defaultValue={editingItem?.barColor || 'from-primary to-primary'}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      >
                        <option value="from-primary to-primary">Primary (Cyan)</option>
                        <option value="from-secondary to-secondary">Secondary (Purple)</option>
                        <option value="from-tertiary to-tertiary">Tertiary (Emerald)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingItem?.order ?? projects.length + 1}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* CERTIFICATION FORM */}
              {modalType === 'certification' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Certification Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingItem?.title || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Organization *
                      </label>
                      <input
                        type="text"
                        name="organization"
                        defaultValue={editingItem?.organization || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Credential ID
                      </label>
                      <input
                        type="text"
                        name="credentialId"
                        defaultValue={editingItem?.credentialId || ''}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Material Symbol Icon
                      </label>
                      <input
                        type="text"
                        name="icon"
                        defaultValue={editingItem?.icon || 'verified'}
                        placeholder="verified, shield_lock, settings_ethernet"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Issue Date
                      </label>
                      <input
                        type="text"
                        name="issueDate"
                        defaultValue={editingItem?.issueDate || ''}
                        placeholder="Dec 2025"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        defaultValue={editingItem?.expiryDate || ''}
                        placeholder="Dec 2028 or blank"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Verification / Credly URL
                    </label>
                    <input
                      type="url"
                      name="verificationUrl"
                      defaultValue={editingItem?.verificationUrl || ''}
                      placeholder="https://www.credly.com/..."
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Status
                      </label>
                      <input
                        type="text"
                        name="status"
                        defaultValue={editingItem?.status || 'Verified'}
                        placeholder="Verified, In Progress, etc."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingItem?.order ?? certifications.length + 1}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* EDUCATION FORM */}
              {modalType === 'education' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Degree / Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        defaultValue={editingItem?.title || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Institution *
                      </label>
                      <input
                        type="text"
                        name="institution"
                        defaultValue={editingItem?.institution || ''}
                        required
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Start Year
                      </label>
                      <input
                        type="text"
                        name="startDate"
                        defaultValue={editingItem?.startDate || ''}
                        placeholder="2024"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        End Year
                      </label>
                      <input
                        type="text"
                        name="endDate"
                        defaultValue={editingItem?.endDate || 'PRESENT'}
                        placeholder="PRESENT or 2028"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      defaultValue={editingItem?.description || ''}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        defaultValue={editingItem?.tags?.join(', ') || ''}
                        placeholder="Level 2, Engineering"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        name="order"
                        defaultValue={editingItem?.order ?? education.length + 1}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2.5 px-4 rounded-lg bg-surface-container-high text-xs font-headline font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-headline font-bold uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
