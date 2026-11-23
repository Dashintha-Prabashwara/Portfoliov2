'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { getProjectCoverImage } from '@/lib/projectImage';

const COLOR_CYCLE = ['primary', 'secondary', 'tertiary'];
const BAR_COLOR_CYCLE = [
  'from-primary to-primary',
  'from-secondary to-secondary',
  'from-tertiary to-tertiary',
];

const CERTIFICATION_ICONS = [
  { id: 'verified', label: 'Verified Badge' },
  { id: 'workspace_premium', label: 'Premium Award' },
  { id: 'military_tech', label: 'Achievement Medal' },
  { id: 'badge', label: 'ID Badge' },
  { id: 'school', label: 'Academic / Degree' },
  { id: 'card_membership', label: 'Membership Card' },
  { id: 'shield_person', label: 'Security & Compliance' },
  { id: 'cloud_done', label: 'Cloud Certified' },
  { id: 'developer_board', label: 'Hardware & IoT' },
  { id: 'terminal', label: 'DevOps & Systems' },
  { id: 'code', label: 'Software & Code' },
  { id: 'database', label: 'Database & Data' },
  { id: 'psychology', label: 'AI & Intelligence' },
  { id: 'network_check', label: 'Networking & Infra' },
  { id: 'hub', label: 'Architecture & Hub' },
];

// Helper: automatically cycles Primary -> Secondary -> Tertiary ONLY across visible items,
// and automatically places visible items at the top and pushes hidden items down to the bottom.
const applyVisibleColorCycle = (items = [], type = 'experience') => {
  const visible = items.filter((item) => item.isVisible !== false);
  const hidden = items.filter((item) => item.isVisible === false);
  const sorted = [...visible, ...hidden];

  let visibleCount = 0;
  return sorted.map((item, idx) => {
    const isVisible = item.isVisible !== false;
    let cycleColor = item.color || 'primary';
    let cycleBarColor = item.barColor || 'from-primary to-primary';

    if (isVisible) {
      cycleColor = COLOR_CYCLE[visibleCount % COLOR_CYCLE.length];
      cycleBarColor = BAR_COLOR_CYCLE[visibleCount % BAR_COLOR_CYCLE.length];
      visibleCount++;
    }

    const updated = {
      ...item,
      order: idx + 1,
      isVisible,
    };

    if (type === 'experience') {
      updated.color = cycleColor;
    } else if (type === 'project') {
      updated.statusColor = cycleColor;
      updated.barColor = cycleBarColor;
    } else if (type === 'certification') {
      updated.statusColor = cycleColor;
    } else if (type === 'education') {
      updated.color = cycleColor;
    } else if (type === 'blog') {
      updated.color = cycleColor;
    }

    return updated;
  });
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Active Tab: 'overview' | 'experiences' | 'projects' | 'certifications' | 'cv'
  const [activeTab, setActiveTab] = useState('overview');

  // Data states
  const [experiences, setExperiences] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [education, setEducation] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [cvData, setCvData] = useState(null);
  const [dbStatus, setDbStatus] = useState({ connected: false, checked: false, error: null });

  // UI / Action states
  const [loadingData, setLoadingData] = useState(false);
  const [toast, setToast] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'experience' | 'project' | 'certification' | 'education' | 'cv'
  const [editingItem, setEditingItem] = useState(null);
  const [modalIsVisible, setModalIsVisible] = useState(true); // Default is visible
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  // Drag and drop states
  const [dragInfo, setDragInfo] = useState({ type: null, index: null });
  const [dragOverInfo, setDragOverInfo] = useState({ type: null, index: null });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all'); // 'all' | 'visible' | 'hidden'

  // Project Live Preview / Cover helper states in modal
  const [modalCoverImage, setModalCoverImage] = useState('');
  const [modalLiveUrl, setModalLiveUrl] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [modalDescription, setModalDescription] = useState('');
  const [modalTechnologies, setModalTechnologies] = useState('');
  const [modalGithubUrl, setModalGithubUrl] = useState('');
  const [autofillingRepo, setAutofillingRepo] = useState(false);
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const bannerFileInputRef = useRef(null);

  // GitHub Engine state
  const [githubConfig, setGithubConfig] = useState(null);
  const [githubSyncing, setGithubSyncing] = useState(false);
  const [savingGithubConfig, setSavingGithubConfig] = useState(false);
  const [hiddenAchievements, setHiddenAchievements] = useState([]);
  const [hiddenOrganizations, setHiddenOrganizations] = useState([]);
  const [hiddenHighlights, setHiddenHighlights] = useState([]);
  const [hiddenLanguages, setHiddenLanguages] = useState([]);
  const [customContributedRepos, setCustomContributedRepos] = useState([]);
  const [excludedContributedRepos, setExcludedContributedRepos] = useState([]);
  const [customRepoInput, setCustomRepoInput] = useState('');

  // Certification icon chooser state
  const [selectedCertIcon, setSelectedCertIcon] = useState('verified');

  // Drag & drop scrolling refs (for wheel scrolling & edge auto-scroll)
  const isDraggingRef = useRef(false);
  const autoScrollSpeedRef = useRef(0);
  const autoScrollRafRef = useRef(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [expRes, projRes, certRes, eduRes, cvRes, ghRes, blogRes] = await Promise.all([
        fetch('/api/admin/experiences'),
        fetch('/api/admin/projects'),
        fetch('/api/admin/certifications'),
        fetch('/api/admin/education'),
        fetch('/api/admin/cv'),
        fetch('/api/admin/github'),
        fetch('/api/admin/blogs'),
      ]);

      if (expRes.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      const [expData, projData, certData, eduData, cvResp, ghResp, blogData] = await Promise.all([
        expRes.json(),
        projRes.json(),
        certRes.json(),
        eduRes.json(),
        cvRes.json(),
        ghRes.json(),
        blogRes.json(),
      ]);

      setExperiences(applyVisibleColorCycle(expData.data || [], 'experience'));
      setProjects(applyVisibleColorCycle(projData.data || [], 'project'));
      setCertifications(applyVisibleColorCycle(certData.data || [], 'certification'));
      setEducation(applyVisibleColorCycle(eduData.data || [], 'education'));
      setBlogs(applyVisibleColorCycle(blogData.data || [], 'blog'));
      setCvData(cvResp.data || null);
      if (ghResp?.data) {
        setGithubConfig(ghResp.data);
      }

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

  // Synchronize GitHub subcomponent visibility from loaded config
  useEffect(() => {
    if (githubConfig) {
      setHiddenAchievements(githubConfig.hiddenAchievements || []);
      setHiddenOrganizations(githubConfig.hiddenOrganizations || []);
      setHiddenHighlights(githubConfig.hiddenHighlights || []);
      setHiddenLanguages(githubConfig.hiddenLanguages || []);
      setCustomContributedRepos(githubConfig.customContributedRepos || []);
      setExcludedContributedRepos(githubConfig.excludedContributedRepos || []);
    }
  }, [githubConfig]);

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

  // Handle Drag & Drop Window Wheel Scrolling & Edge Auto-scrolling
  useEffect(() => {
    const stepAutoScroll = () => {
      if (autoScrollSpeedRef.current !== 0 && isDraggingRef.current) {
        window.scrollBy({ top: autoScrollSpeedRef.current, behavior: 'auto' });
        autoScrollRafRef.current = requestAnimationFrame(stepAutoScroll);
      } else {
        autoScrollRafRef.current = null;
      }
    };

    const handleWindowWheel = (e) => {
      if (isDraggingRef.current) {
        // Native D&D often blocks default wheel scrolling; force scroll
        window.scrollBy({ top: e.deltaY, behavior: 'auto' });
      }
    };

    const handleWindowDragOver = (e) => {
      if (!isDraggingRef.current) return;
      const clientY = e.clientY;
      const threshold = 120; // 120px edge margin
      const windowHeight = window.innerHeight;

      if (clientY < threshold) {
        // Near top -> scroll up smoothly
        const factor = (threshold - clientY) / threshold;
        autoScrollSpeedRef.current = -Math.round(factor * 18 + 5);
        if (!autoScrollRafRef.current) {
          autoScrollRafRef.current = requestAnimationFrame(stepAutoScroll);
        }
      } else if (clientY > windowHeight - threshold) {
        // Near bottom -> scroll down smoothly
        const factor = (clientY - (windowHeight - threshold)) / threshold;
        autoScrollSpeedRef.current = Math.round(factor * 18 + 5);
        if (!autoScrollRafRef.current) {
          autoScrollRafRef.current = requestAnimationFrame(stepAutoScroll);
        }
      } else {
        // Neutral center zone
        autoScrollSpeedRef.current = 0;
      }
    };

    const stopDragging = () => {
      isDraggingRef.current = false;
      autoScrollSpeedRef.current = 0;
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
        autoScrollRafRef.current = null;
      }
    };

    window.addEventListener('wheel', handleWindowWheel, { passive: true });
    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('dragend', stopDragging);
    window.addEventListener('drop', stopDragging);

    return () => {
      window.removeEventListener('wheel', handleWindowWheel);
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('dragend', stopDragging);
      window.removeEventListener('drop', stopDragging);
      if (autoScrollRafRef.current) {
        cancelAnimationFrame(autoScrollRafRef.current);
      }
    };
  }, []);

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
    setModalIsVisible(item ? item.isVisible !== false : true); // Default is visible
    setModalCoverImage(item?.image || '');
    setModalLiveUrl(item?.liveUrl || '');
    setModalTitle(item?.title || '');
    setModalDescription(item?.description || '');
    setModalTechnologies(item?.technologies?.join(', ') || '');
    setModalGithubUrl(item?.githubUrl || '');
    setSelectedCertIcon(item?.icon || 'verified');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    setModalType(null);
    setModalCoverImage('');
    setModalLiveUrl('');
    setModalTitle('');
    setModalDescription('');
    setModalTechnologies('');
    setModalGithubUrl('');
    setSelectedCertIcon('verified');
  };

  const handleAutofillFromGithub = async () => {
    if (!modalGithubUrl || !modalGithubUrl.trim()) {
      showToast('Please enter a GitHub URL first', 'error');
      return;
    }
    setAutofillingRepo(true);
    try {
      const res = await fetch(`/api/admin/github/fetch-repo?url=${encodeURIComponent(modalGithubUrl.trim())}`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const repo = data.data;
        if (!modalTitle || modalTitle.trim() === '') {
          setModalTitle(repo.title || '');
        }
        if (repo.description) {
          setModalDescription(repo.description);
        }
        if (Array.isArray(repo.technologies) && repo.technologies.length > 0) {
          setModalTechnologies(repo.technologies.join(', '));
        }
        if (repo.liveUrl && !modalLiveUrl) {
          setModalLiveUrl(repo.liveUrl);
        }
        showToast('Repository details autofilled from GitHub!');
      } else {
        showToast(data.error || 'Failed to fetch repository details', 'error');
      }
    } catch (err) {
      console.error('Autofill error:', err);
      showToast('Error connecting to GitHub API', 'error');
    } finally {
      setAutofillingRepo(false);
    }
  };

  const handleSyncAllGithub = async () => {
    setGithubSyncing(true);
    try {
      const res = await fetch('/api/admin/github/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'GitHub telemetry & repos synced!');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to sync with GitHub', 'error');
      }
    } catch (err) {
      console.error('GitHub sync error:', err);
      showToast('Error connecting to GitHub sync API', 'error');
    } finally {
      setGithubSyncing(false);
    }
  };

  const handleSaveGithubConfig = async (e) => {
    e.preventDefault();
    setSavingGithubConfig(true);
    const formData = new FormData(e.target);
    const payload = {
      username: formData.get('username'),
      isEnabled: formData.get('isEnabled') === 'on',
      showContributions: formData.get('showContributions') === 'on',
      showAchievements: formData.get('showAchievements') === 'on',
      showHighlights: formData.get('showHighlights') === 'on',
      showOrganizations: formData.get('showOrganizations') === 'on',
      showLanguageStats: formData.get('showLanguageStats') === 'on',
      showProjectBadges: formData.get('showProjectBadges') === 'on',
      hiddenAchievements,
      hiddenOrganizations,
      hiddenHighlights,
      hiddenLanguages,
      customContributedRepos,
      excludedContributedRepos,
    };
    const token = formData.get('token');
    if (token && token.trim()) {
      payload.token = token.trim();
    }

    try {
      const res = await fetch('/api/admin/github', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGithubConfig(data.data);
        showToast('GitHub configuration saved successfully!');
        fetchAllData();
      } else {
        showToast(data.error || 'Failed to save GitHub settings', 'error');
      }
    } catch (err) {
      console.error('Save GitHub config error:', err);
      showToast('Error saving GitHub configuration', 'error');
    } finally {
      setSavingGithubConfig(false);
    }
  };

  const handleAddCustomRepo = () => {
    if (!customRepoInput || !customRepoInput.trim()) return;
    const clean = customRepoInput.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/$/, '');
    if (customContributedRepos.includes(clean)) {
      showToast('Repository already in list', 'error');
      return;
    }
    setCustomContributedRepos([...customContributedRepos, clean]);
    setCustomRepoInput('');
    showToast(`Added ${clean}. Click Save GitHub Configuration to sync metrics.`);
  };

  const handleRemoveCustomRepo = (repoHandle) => {
    setCustomContributedRepos(customContributedRepos.filter((r) => r !== repoHandle));
  };

  const handleFetchLivePreview = async () => {
    if (!modalLiveUrl || !modalLiveUrl.trim()) {
      showToast('Please enter a Live Demo URL first', 'error');
      return;
    }
    setFetchingPreview(true);
    try {
      await fetch(`/api/preview?url=${encodeURIComponent(modalLiveUrl.trim())}`);
      // Clearing the custom banner activates the live website screenshot preview directly
      setModalCoverImage('');
      showToast('Switched to live landing page preview!');
    } catch {
      setModalCoverImage('');
      showToast('Live website preview active via Live Demo URL');
    } finally {
      setFetchingPreview(false);
    }
  };

  const handleClearBanner = () => {
    setModalCoverImage('');
    showToast('Banner cleared. Project will use live website preview or default fallback.');
  };

  const handleProjectBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file (PNG, JPG, WebP, etc.)', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'banner');

    setUploadingBanner(true);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (res.ok && data.success && data.fileUrl) {
        setModalCoverImage(data.fileUrl);
        showToast(data.message || 'Banner uploaded and stored in MongoDB!');
      } else {
        showToast(data.error || 'Failed to upload image', 'error');
      }
    } catch {
      showToast('Network error uploading banner image', 'error');
    } finally {
      setUploadingBanner(false);
      if (e.target) e.target.value = '';
    }
  };

  // Delete handler
  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const endpoint = type === 'education' ? 'education' : `${type}s`;
      const res = await fetch(`/api/admin/${endpoint}?id=${id}`, {
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

  // Reorder elements with cyclical colors (primary -> secondary -> tertiary -> ...)
  const handleReorder = async (type, sourceIndex, targetIndex) => {
    if (
      sourceIndex === targetIndex ||
      sourceIndex === null ||
      targetIndex === null ||
      sourceIndex === undefined ||
      targetIndex === undefined
    ) {
      return;
    }

    let list = [];
    let setList = null;
    let endpoint = '';

    if (type === 'experience') {
      list = [...experiences];
      setList = setExperiences;
      endpoint = '/api/admin/experiences';
    } else if (type === 'project') {
      list = [...projects];
      setList = setProjects;
      endpoint = '/api/admin/projects';
    } else if (type === 'certification') {
      list = [...certifications];
      setList = setCertifications;
      endpoint = '/api/admin/certifications';
    } else if (type === 'education') {
      list = [...education];
      setList = setEducation;
      endpoint = '/api/admin/education';
    } else if (type === 'blog') {
      list = [...blogs];
      setList = setBlogs;
      endpoint = '/api/admin/blogs';
    } else {
      return;
    }

    if (sourceIndex < 0 || sourceIndex >= list.length) return;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const [movedItem] = list.splice(sourceIndex, 1);
    list.splice(targetIndex, 0, movedItem);

    const updatedList = applyVisibleColorCycle(list, type);
    setList(updatedList);

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          `Reordered with colors synced: Primary → Secondary → Tertiary!`
        );
        if (Array.isArray(data.data)) {
          setList(applyVisibleColorCycle(data.data, type));
        }
      } else {
        showToast(data.error || 'Failed to sync reorder with server', 'error');
        fetchAllData();
      }
    } catch (err) {
      console.error('Reorder update error:', err);
      showToast('Failed to sync reorder to server', 'error');
      fetchAllData();
    }
  };

  // Toggle item visibility on/off with instant color cycle re-calculation
  const handleToggleVisibility = async (type, itemToToggle) => {
    let list = [];
    let setList = null;
    let endpoint = '';

    if (type === 'experience') {
      list = [...experiences];
      setList = setExperiences;
      endpoint = '/api/admin/experiences';
    } else if (type === 'project') {
      list = [...projects];
      setList = setProjects;
      endpoint = '/api/admin/projects';
    } else if (type === 'certification') {
      list = [...certifications];
      setList = setCertifications;
      endpoint = '/api/admin/certifications';
    } else if (type === 'education') {
      list = [...education];
      setList = setEducation;
      endpoint = '/api/admin/education';
    } else if (type === 'blog') {
      list = [...blogs];
      setList = setBlogs;
      endpoint = '/api/admin/blogs';
    } else {
      return;
    }

    const itemId = itemToToggle._id || itemToToggle.id;
    const newVisibility = itemToToggle.isVisible === false ? true : false;

    const toggledList = list.map((item) => {
      if ((item._id || item.id) === itemId) {
        return { ...item, isVisible: newVisibility };
      }
      return item;
    });

    const updatedList = applyVisibleColorCycle(toggledList, type);
    setList(updatedList);

    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedList),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          newVisibility
            ? `${type.charAt(0).toUpperCase() + type.slice(1)} is now Visible (colors synced)!`
            : `${type.charAt(0).toUpperCase() + type.slice(1)} is now Hidden.`
        );
        if (Array.isArray(data.data)) {
          setList(applyVisibleColorCycle(data.data, type));
        }
      } else {
        showToast(data.error || 'Failed to update visibility', 'error');
        fetchAllData();
      }
    } catch (err) {
      console.error('Toggle visibility error:', err);
      showToast('Failed to save visibility change', 'error');
      fetchAllData();
    }
  };

  const moveItem = (type, index, direction) => {
    handleReorder(type, index, index + direction);
  };

  const onDragStart = (e, type, index) => {
    isDraggingRef.current = true;
    setDragInfo({ type, index });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', `${type}:${index}`);
  };

  const onDragEnter = (e, type, index) => {
    e.preventDefault();
    if (dragInfo.type === type && dragInfo.index !== index) {
      setDragOverInfo({ type, index });
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const onDragEnd = () => {
    isDraggingRef.current = false;
    autoScrollSpeedRef.current = 0;
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    setDragInfo({ type: null, index: null });
    setDragOverInfo({ type: null, index: null });
  };

  const onDrop = (e, type, index) => {
    e.preventDefault();
    isDraggingRef.current = false;
    autoScrollSpeedRef.current = 0;
    if (autoScrollRafRef.current) {
      cancelAnimationFrame(autoScrollRafRef.current);
      autoScrollRafRef.current = null;
    }
    if (dragInfo.type === type && dragInfo.index !== null) {
      handleReorder(type, dragInfo.index, index);
    }
    setDragInfo({ type: null, index: null });
    setDragOverInfo({ type: null, index: null });
  };

  // Filter items by visibility ('all' | 'visible' | 'hidden') and search query
  const getFilteredItems = (items = [], type = 'experience') => {
    let result = [...items];

    if (visibilityFilter === 'visible') {
      result = result.filter((item) => item.isVisible !== false);
    } else if (visibilityFilter === 'hidden') {
      result = result.filter((item) => item.isVisible === false);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (type === 'experience') {
          return (
            (item.company || '').toLowerCase().includes(q) ||
            (item.role || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.tags || []).some((t) => t.toLowerCase().includes(q))
          );
        }
        if (type === 'project') {
          return (
            (item.title || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.status || '').toLowerCase().includes(q) ||
            (item.technologies || []).some((t) => t.toLowerCase().includes(q))
          );
        }
        if (type === 'certification') {
          return (
            (item.title || '').toLowerCase().includes(q) ||
            (item.organization || '').toLowerCase().includes(q) ||
            (item.credentialId || '').toLowerCase().includes(q) ||
            (item.status || '').toLowerCase().includes(q)
          );
        }
        if (type === 'education') {
          return (
            (item.title || '').toLowerCase().includes(q) ||
            (item.institution || '').toLowerCase().includes(q) ||
            (item.description || '').toLowerCase().includes(q) ||
            (item.tags || []).some((t) => t.toLowerCase().includes(q))
          );
        }
        if (type === 'blog') {
          return (
            (item.title || '').toLowerCase().includes(q) ||
            (item.excerpt || '').toLowerCase().includes(q) ||
            (item.category || '').toLowerCase().includes(q) ||
            (item.author || '').toLowerCase().includes(q) ||
            (item.tags || []).some((t) => t.toLowerCase().includes(q))
          );
        }
        return true;
      });
    }

    return result;
  };

  const renderSearchAndFilterBar = (totalItems = [], typeLabel = 'items') => {
    const totalCount = totalItems.length;
    const visibleCount = totalItems.filter((i) => i.isVisible !== false).length;
    const hiddenCount = totalItems.filter((i) => i.isVisible === false).length;

    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
        {/* Search input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg select-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${typeLabel}...`}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-highest border border-outline-variant/30 rounded-lg text-xs sm:text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-surface-container-highest p-1 rounded-lg border border-outline-variant/20 shrink-0">
          <button
            type="button"
            onClick={() => setVisibilityFilter('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-headline font-bold uppercase tracking-wider transition-all ${visibilityFilter === 'all'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter('visible')}
            className={`px-3 py-1.5 rounded-md text-xs font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${visibilityFilter === 'visible'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Visible ({visibleCount})
          </button>
          <button
            type="button"
            onClick={() => setVisibilityFilter('hidden')}
            className={`px-3 py-1.5 rounded-md text-xs font-headline font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${visibilityFilter === 'hidden'
              ? 'bg-primary text-on-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            Hidden ({hiddenCount})
          </button>
        </div>
      </div>
    );
  };

  const renderVisibilityBadge = (isVisible = true) => {
    const visible = isVisible !== false;
    return (
      <span
        className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full font-bold border flex items-center gap-1 ${visible
          ? 'bg-primary/10 text-primary border-primary/30'
          : 'bg-surface-container-high text-on-surface-variant/60 border-outline-variant/30'
          }`}
      >
        <span className="material-symbols-outlined text-[13px] leading-none">
          {visible ? 'visibility' : 'visibility_off'}
        </span>
        {visible ? 'Visible' : 'Hidden'}
      </span>
    );
  };

  const renderColorBadge = (color = 'primary', isVisible = true) => {
    if (isVisible === false) {
      return (
        <span className="text-[10px] uppercase font-label px-2.5 py-0.5 rounded-full font-medium border bg-surface-container-high text-on-surface-variant/50 border-outline-variant/20 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
          Muted (Hidden)
        </span>
      );
    }

    const norm = (color || 'primary').toLowerCase();
    const isPrimary = norm === 'primary';
    const isSecondary = norm === 'secondary';
    const isTertiary = norm === 'tertiary';

    return (
      <span
        className={`text-[10px] uppercase font-label px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${isPrimary
          ? 'bg-primary/15 text-primary border-primary/30'
          : isSecondary
            ? 'bg-secondary/15 text-secondary border-secondary/30'
            : isTertiary
              ? 'bg-tertiary/15 text-tertiary border-tertiary/30'
              : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30'
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isPrimary ? 'bg-primary' : isSecondary ? 'bg-secondary' : 'bg-tertiary'
            }`}
        />
        {color}
      </span>
    );
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

    if (modalType !== 'cv') {
      payload.isVisible = modalIsVisible;
    }

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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your CMS admin password"
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant/40 rounded-lg pl-4 pr-11 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-1 flex items-center justify-center rounded focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-xl select-none">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
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
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-xl border flex items-center gap-3 transition-all animate-bounce ${toast.type === 'error'
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
              className={`hidden sm:flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border ${dbStatus.connected
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
                className={`w-1.5 h-1.5 rounded-full ${dbStatus.connected ? 'bg-tertiary animate-pulse' : 'bg-warning'
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
            { id: 'blogs', label: `Blog Posts (${blogs.length})`, icon: 'article' },
            { id: 'certifications', label: `Certifications & Edu (${certifications.length + education.length})`, icon: 'verified' },
            { id: 'cv', label: 'CV Manager', icon: 'description' },
            { id: 'github', label: 'GitHub Engine', icon: 'hub' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-headline text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id
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
                      <span className="material-symbols-outlined">article</span>
                    </div>
                    <span className="text-3xl font-bold font-headline text-on-surface">
                      {blogs.length}
                    </span>
                    <p className="text-xs uppercase tracking-widest text-on-surface-variant mt-1">
                      Articles Published
                    </p>
                    <button
                      onClick={() => setActiveTab('blogs')}
                      className="mt-4 text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                    >
                      Manage Articles →
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span>
                      Drag &amp; drop to reorder • Primary → Secondary → Tertiary
                    </span>
                    <button
                      onClick={() => openModal('experience')}
                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Experience
                    </button>
                  </div>
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
                  <>
                    {renderSearchAndFilterBar(experiences, 'experiences')}

                    {(() => {
                      const displayedExperiences = getFilteredItems(experiences, 'experience');
                      if (displayedExperiences.length === 0) {
                        return (
                          <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/40">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">search_off</span>
                            <p className="text-sm font-headline font-bold text-on-surface">No matching experiences found</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              Try adjusting your search query or changing the visibility filter.
                            </p>
                            {(searchQuery || visibilityFilter !== 'all') && (
                              <button
                                onClick={() => { setSearchQuery(''); setVisibilityFilter('all'); }}
                                className="mt-3 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:underline"
                              >
                                Clear search &amp; filter
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {displayedExperiences.map((exp) => {
                            const origIdx = experiences.findIndex((x) => (x._id || x.id) === (exp._id || exp.id));
                            const idx = origIdx >= 0 ? origIdx : 0;
                            const isDragging = dragInfo.type === 'experience' && dragInfo.index === idx;
                            const isDragOver = dragOverInfo.type === 'experience' && dragOverInfo.index === idx;
                            const isVisible = exp.isVisible !== false;

                            return (
                              <div
                                key={exp._id || exp.id || idx}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'experience', idx)}
                                onDragEnter={(e) => onDragEnter(e, 'experience', idx)}
                                onDragOver={onDragOver}
                                onDragEnd={onDragEnd}
                                onDrop={(e) => onDrop(e, 'experience', idx)}
                                className={`border rounded-xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 cursor-move ${isDragging
                                  ? 'opacity-30 border-dashed border-primary scale-[0.99] bg-surface-container-low'
                                  : isDragOver
                                    ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg'
                                    : !isVisible
                                      ? 'opacity-65 border-dashed border-outline-variant/40 bg-surface-container-low/60'
                                      : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50'
                                  }`}
                              >
                          <div className="flex items-start md:items-center gap-3 flex-grow w-full md:w-auto">
                            {/* Drag handle & Move Up/Down buttons */}
                            <div className="flex items-center gap-1 shrink-0 self-start md:self-center">
                              <div
                                className="cursor-grab active:cursor-grabbing p-1.5 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded hover:bg-surface-container-high"
                                title="Drag to reorder"
                              >
                                <span className="material-symbols-outlined text-xl select-none">drag_indicator</span>
                              </div>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => moveItem('experience', idx, -1)}
                                  disabled={idx === 0}
                                  className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                  title="Move up"
                                >
                                  <span className="material-symbols-outlined text-base select-none leading-none">arrow_drop_up</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem('experience', idx, 1)}
                                  disabled={idx === experiences.length - 1}
                                  className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                  title="Move down"
                                >
                                  <span className="material-symbols-outlined text-base select-none leading-none">arrow_drop_down</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 flex-grow">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 font-bold">
                                  #{idx + 1}
                                </span>
                                {renderVisibilityBadge(exp.isVisible)}
                                <span className="font-headline text-base sm:text-lg font-bold text-on-surface">
                                  {exp.role}
                                </span>
                                <span className="text-xs text-on-surface-variant/60">at</span>
                                <span className="text-xs sm:text-sm font-semibold text-primary">
                                  {exp.company}
                                </span>
                                {renderColorBadge(exp.color || COLOR_CYCLE[idx % 3], exp.isVisible)}
                              </div>

                              <p className="text-xs text-on-surface-variant/80 font-mono">
                                {exp.period || `${exp.startDate} - ${exp.endDate}`}
                              </p>

                              {exp.description && (
                                <p className="text-xs text-on-surface-variant leading-relaxed max-w-3xl line-clamp-2">
                                  {exp.description}
                                </p>
                              )}

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

                              {exp.blogUrl && (
                                <div className="pt-1">
                                  <a
                                    href={exp.blogUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                                  >
                                    Blog Article <span className="material-symbols-outlined text-xs">article</span>
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility('experience', exp)}
                              className={`p-2 rounded transition-colors ${isVisible
                                ? 'text-primary hover:bg-primary/10'
                                : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high'
                                }`}
                              title={isVisible ? 'Click to Hide on website' : 'Click to Make Visible on website'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {isVisible ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
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
                      );
                    })}
                  </div>
                );
              })()}
            </>
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
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span>
                      Drag &amp; drop to reorder • Primary → Secondary → Tertiary
                    </span>
                    <button
                      onClick={() => openModal('project')}
                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Project
                    </button>
                  </div>
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
                  <>
                    {renderSearchAndFilterBar(projects, 'projects')}

                    {(() => {
                      const displayedProjects = getFilteredItems(projects, 'project');
                      if (displayedProjects.length === 0) {
                        return (
                          <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/40">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">search_off</span>
                            <p className="text-sm font-headline font-bold text-on-surface">No matching projects found</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              Try adjusting your search query or changing the visibility filter.
                            </p>
                            {(searchQuery || visibilityFilter !== 'all') && (
                              <button
                                onClick={() => { setSearchQuery(''); setVisibilityFilter('all'); }}
                                className="mt-3 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:underline"
                              >
                                Clear search &amp; filter
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {displayedProjects.map((proj) => {
                            const origIdx = projects.findIndex((x) => (x._id || x.id) === (proj._id || proj.id));
                            const idx = origIdx >= 0 ? origIdx : 0;
                            const isDragging = dragInfo.type === 'project' && dragInfo.index === idx;
                            const isDragOver = dragOverInfo.type === 'project' && dragOverInfo.index === idx;
                            const isVisible = proj.isVisible !== false;

                            return (
                              <div
                                key={proj._id || proj.id || idx}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'project', idx)}
                                onDragEnter={(e) => onDragEnter(e, 'project', idx)}
                                onDragOver={onDragOver}
                                onDragEnd={onDragEnd}
                                onDrop={(e) => onDrop(e, 'project', idx)}
                                className={`border rounded-xl overflow-hidden flex flex-col justify-between transition-all duration-200 cursor-move ${isDragging
                                  ? 'opacity-30 border-dashed border-primary scale-[0.99] bg-surface-container-low'
                                  : isDragOver
                                    ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg'
                                    : !isVisible
                                      ? 'opacity-65 border-dashed border-outline-variant/40 bg-surface-container-low/60'
                                      : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50'
                                  }`}
                              >
                          <div className="p-5 sm:p-6 space-y-4">
                            {/* Project Cover / Live Preview Card */}
                            <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container-highest border border-outline-variant/30">
                              <img
                                src={getProjectCoverImage(proj)}
                                alt={proj.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                              <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-white/90 border border-white/10 shadow-sm flex items-center gap-1.5">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    proj.image && !proj.image.includes('photo-1517694712202')
                                      ? 'bg-secondary'
                                      : proj.liveUrl
                                      ? 'bg-primary'
                                      : 'bg-on-surface-variant'
                                  }`}
                                />
                                {proj.image && !proj.image.includes('photo-1517694712202')
                                  ? proj.image.startsWith('/api/media/')
                                    ? 'Custom Banner (MongoDB)'
                                    : 'Custom Banner'
                                  : proj.liveUrl
                                  ? 'Landing Page Preview'
                                  : 'Default Placeholder'}
                              </div>
                            </div>

                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2.5 flex-grow">
                                {/* Drag handle & Move Up/Down buttons */}
                                <div className="flex items-center gap-1 shrink-0 mt-0.5">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded hover:bg-surface-container-high"
                                    title="Drag to reorder"
                                  >
                                    <span className="material-symbols-outlined text-lg select-none">drag_indicator</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <button
                                      type="button"
                                      onClick={() => moveItem('project', idx, -1)}
                                      disabled={idx === 0}
                                      className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                      title="Move up"
                                    >
                                      <span className="material-symbols-outlined text-sm select-none leading-none">arrow_drop_up</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveItem('project', idx, 1)}
                                      disabled={idx === projects.length - 1}
                                      className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                      title="Move down"
                                    >
                                      <span className="material-symbols-outlined text-sm select-none leading-none">arrow_drop_down</span>
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 font-bold">
                                      #{idx + 1}
                                    </span>
                                    {renderVisibilityBadge(proj.isVisible)}
                                    {renderColorBadge(proj.statusColor || COLOR_CYCLE[idx % 3], proj.isVisible)}
                                  </div>
                                  <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface">
                                    {proj.title}
                                  </h3>
                                  {proj.status && (
                                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full mt-1">
                                      {proj.status}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility('project', proj)}
                                  className={`p-2 rounded transition-colors ${isVisible
                                    ? 'text-primary hover:bg-primary/10'
                                    : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high'
                                    }`}
                                  title={isVisible ? 'Click to Hide on website' : 'Click to Make Visible on website'}
                                >
                                  <span className="material-symbols-outlined text-lg">
                                    {isVisible ? 'visibility' : 'visibility_off'}
                                  </span>
                                </button>
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

                            {proj.description && (
                              <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                                {proj.description}
                              </p>
                            )}

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
                              {proj.blogUrl && (
                                <a
                                  href={proj.blogUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-tertiary hover:underline inline-flex items-center gap-1 font-semibold"
                                >
                                  Blog Story <span className="material-symbols-outlined text-xs">article</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
              </div>
            )}

            {/* BLOG POSTS TAB */}
            {activeTab === 'blogs' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-xl sm:text-2xl font-bold">Blog Posts &amp; Articles</h2>
                    <p className="text-xs text-on-surface-variant">
                      Manage technical articles and stories displayed on the /blog page
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span>
                      Drag &amp; drop to reorder • Primary → Secondary → Tertiary
                    </span>
                    <button
                      onClick={() => openModal('blog')}
                      className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      Add Blog Post
                    </button>
                  </div>
                </div>

                {blogs.length === 0 ? (
                  <div className="p-12 text-center border border-dashed border-outline-variant/30 rounded-xl">
                    <p className="text-sm text-on-surface-variant mb-4">No blog posts found in database.</p>
                    <button
                      onClick={() => handleSeedData(false)}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Click here to seed sample technical articles
                    </button>
                  </div>
                ) : (
                  <>
                    {renderSearchAndFilterBar(blogs, 'blogs')}

                    {(() => {
                      const displayedBlogs = getFilteredItems(blogs, 'blog');
                      if (displayedBlogs.length === 0) {
                        return (
                          <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/40">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">search_off</span>
                            <p className="text-sm font-headline font-bold text-on-surface">No matching blog posts found</p>
                            <p className="text-xs text-on-surface-variant mt-1">
                              Try adjusting your search query or changing the visibility filter.
                            </p>
                            {(searchQuery || visibilityFilter !== 'all') && (
                              <button
                                onClick={() => { setSearchQuery(''); setVisibilityFilter('all'); }}
                                className="mt-3 text-xs font-headline font-bold uppercase tracking-wider text-primary hover:underline"
                              >
                                Clear search &amp; filter
                              </button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-4">
                          {displayedBlogs.map((blog) => {
                            const origIdx = blogs.findIndex((x) => (x._id || x.id) === (blog._id || blog.id));
                            const idx = origIdx >= 0 ? origIdx : 0;
                            const isDragging = dragInfo.type === 'blog' && dragInfo.index === idx;
                            const isDragOver = dragOverInfo.type === 'blog' && dragOverInfo.index === idx;
                            const isVisible = blog.isVisible !== false;

                            return (
                              <div
                                key={blog._id || blog.id || idx}
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('text/plain', String(idx));
                                  setDragInfo({ type: 'blog', index: idx });
                                  isDraggingRef.current = true;
                                }}
                                onDragEnd={() => {
                                  setDragInfo({ type: null, index: null });
                                  setDragOverInfo({ type: null, index: null });
                                  isDraggingRef.current = false;
                                  autoScrollSpeedRef.current = 0;
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (dragOverInfo.index !== idx) {
                                    setDragOverInfo({ type: 'blog', index: idx });
                                  }
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  if (dragInfo.type === 'blog' && dragInfo.index !== null) {
                                    handleReorder('blog', dragInfo.index, idx);
                                  }
                                  setDragInfo({ type: null, index: null });
                                  setDragOverInfo({ type: null, index: null });
                                  isDraggingRef.current = false;
                                  autoScrollSpeedRef.current = 0;
                                }}
                                className={`p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
                                  !isVisible
                                    ? 'bg-surface-container-low/40 border-dashed border-outline-variant/30 opacity-70'
                                    : 'bg-surface-container-low border-outline-variant/20 hover:border-primary/40'
                                } ${isDragging ? 'opacity-40 scale-[0.98]' : ''} ${
                                  isDragOver ? 'border-primary ring-2 ring-primary/20 scale-[1.01]' : ''
                                }`}
                              >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                  <div className="flex items-start gap-3">
                                    <span
                                      className="material-symbols-outlined text-on-surface-variant/40 hover:text-primary transition-colors cursor-grab active:cursor-grabbing shrink-0 select-none mt-1"
                                      title="Drag to reorder"
                                    >
                                      drag_indicator
                                    </span>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface">
                                          {blog.title}
                                        </h3>
                                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/25 font-bold">
                                          {blog.category || 'Article'}
                                        </span>
                                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                                          {blog.readTime || '5 min read'}
                                        </span>
                                        {blog.color && (
                                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/20">
                                            {blog.color}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-on-surface-variant line-clamp-2 max-w-3xl mb-2">
                                        {blog.excerpt}
                                      </p>
                                      {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                          {blog.tags.map((t) => (
                                            <span
                                              key={t}
                                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high/60 text-on-surface-variant border border-outline-variant/20"
                                            >
                                              #{t}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                    {/* Toggle Visibility Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleToggleVisibility('blog', blog)}
                                      className={`p-2 rounded-lg transition-colors border ${
                                        isVisible
                                          ? 'text-primary bg-primary/10 border-primary/30 hover:bg-primary/20'
                                          : 'text-on-surface-variant/50 bg-surface-container-high border-outline-variant/20 hover:text-on-surface'
                                      }`}
                                      title={isVisible ? 'Hide from /blog page' : 'Make visible on /blog page'}
                                    >
                                      <span className="material-symbols-outlined text-lg">
                                        {isVisible ? 'visibility' : 'visibility_off'}
                                      </span>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                      type="button"
                                      onClick={() => openModal('blog', blog)}
                                      className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30 transition-colors"
                                      title="Edit blog post"
                                    >
                                      <span className="material-symbols-outlined text-lg">edit</span>
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDelete('blog', blog._id || blog.id)}
                                      className="p-2 rounded-lg bg-error/10 hover:bg-error/20 text-error border border-error/20 transition-colors"
                                      title="Delete blog post"
                                    >
                                      <span className="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </>
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
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span>
                        Drag &amp; drop to reorder • Primary → Secondary → Tertiary
                      </span>
                      <button
                        onClick={() => openModal('certification')}
                        className="py-2.5 px-4 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Certification
                      </button>
                    </div>
                  </div>

                  {certifications.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl">
                      <p className="text-sm text-on-surface-variant">No certifications found in database.</p>
                    </div>
                  ) : (
                    <>
                      {renderSearchAndFilterBar(certifications, 'certifications')}

                      {(() => {
                        const displayedCertifications = getFilteredItems(certifications, 'certification');
                        if (displayedCertifications.length === 0) {
                          return (
                            <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/40">
                              <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">search_off</span>
                              <p className="text-sm font-headline font-bold text-on-surface">No matching certifications found</p>
                              <p className="text-xs text-on-surface-variant mt-1">Try adjusting your search query or changing the visibility filter.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {displayedCertifications.map((cert) => {
                              const origIdx = certifications.findIndex((x) => (x._id || x.id) === (cert._id || cert.id));
                              const idx = origIdx >= 0 ? origIdx : 0;
                              const isDragging = dragInfo.type === 'certification' && dragInfo.index === idx;
                              const isDragOver = dragOverInfo.type === 'certification' && dragOverInfo.index === idx;
                              const isVisible = cert.isVisible !== false;

                              return (
                                <div
                                  key={cert._id || cert.id || idx}
                          draggable
                          onDragStart={(e) => onDragStart(e, 'certification', idx)}
                          onDragEnter={(e) => onDragEnter(e, 'certification', idx)}
                          onDragOver={onDragOver}
                          onDragEnd={onDragEnd}
                          onDrop={(e) => onDrop(e, 'certification', idx)}
                          className={`border rounded-xl p-5 flex flex-col justify-between transition-all duration-200 cursor-move ${isDragging
                            ? 'opacity-30 border-dashed border-primary scale-[0.99] bg-surface-container-low'
                            : isDragOver
                              ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg'
                              : !isVisible
                                ? 'opacity-65 border-dashed border-outline-variant/40 bg-surface-container-low/60'
                                : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50'
                            }`}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2">
                                {/* Drag handle & Move Up/Down buttons */}
                                <div className="flex items-center gap-0.5">
                                  <div
                                    className="cursor-grab active:cursor-grabbing p-1 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded hover:bg-surface-container-high"
                                    title="Drag to reorder"
                                  >
                                    <span className="material-symbols-outlined text-lg select-none">drag_indicator</span>
                                  </div>
                                  <div className="flex flex-col">
                                    <button
                                      type="button"
                                      onClick={() => moveItem('certification', idx, -1)}
                                      disabled={idx === 0}
                                      className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                      title="Move up"
                                    >
                                      <span className="material-symbols-outlined text-xs select-none leading-none">arrow_drop_up</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => moveItem('certification', idx, 1)}
                                      disabled={idx === certifications.length - 1}
                                      className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                      title="Move down"
                                    >
                                      <span className="material-symbols-outlined text-xs select-none leading-none">arrow_drop_down</span>
                                    </button>
                                  </div>
                                </div>

                                <span className="material-symbols-outlined text-primary text-2xl">
                                  {cert.icon || 'verified'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleVisibility('certification', cert)}
                                  className={`p-1.5 rounded transition-colors ${isVisible
                                    ? 'text-primary hover:bg-primary/10'
                                    : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high'
                                    }`}
                                  title={isVisible ? 'Click to Hide on website' : 'Click to Make Visible on website'}
                                >
                                  <span className="material-symbols-outlined text-base">
                                    {isVisible ? 'visibility' : 'visibility_off'}
                                  </span>
                                </button>
                                <button
                                  onClick={() => openModal('certification', cert)}
                                  className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                                  title="Edit Certification"
                                >
                                  <span className="material-symbols-outlined text-base">edit</span>
                                </button>
                                <button
                                  onClick={() => handleDelete('certification', cert._id || cert.id)}
                                  className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                                  title="Delete Certification"
                                >
                                  <span className="material-symbols-outlined text-base">delete</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 font-bold">
                                #{idx + 1}
                              </span>
                              {renderVisibilityBadge(cert.isVisible)}
                              {renderColorBadge(cert.statusColor || COLOR_CYCLE[idx % 3], cert.isVisible)}
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
                                className="text-xs text-primary hover:underline inline-flex items-center gap-1 font-semibold"
                              >
                                Verify Badge <span className="material-symbols-outlined text-xs">open_in_new</span>
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
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
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">drag_indicator</span>
                        Drag &amp; drop to reorder • Primary → Secondary → Tertiary
                      </span>
                      <button
                        onClick={() => openModal('education')}
                        className="py-2.5 px-4 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-primary text-on-surface font-headline text-xs font-bold uppercase tracking-widest shadow-md flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Add Education
                      </button>
                    </div>
                  </div>

                  {education.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl">
                      <p className="text-sm text-on-surface-variant">No education history found in database.</p>
                    </div>
                  ) : (
                    <>
                      {renderSearchAndFilterBar(education, 'education')}

                      {(() => {
                        const displayedEducation = getFilteredItems(education, 'education');
                        if (displayedEducation.length === 0) {
                          return (
                            <div className="p-8 text-center border border-dashed border-outline-variant/30 rounded-xl bg-surface-container-low/40">
                              <span className="material-symbols-outlined text-3xl text-on-surface-variant/40 mb-2">search_off</span>
                              <p className="text-sm font-headline font-bold text-on-surface">No matching education items found</p>
                              <p className="text-xs text-on-surface-variant mt-1">Try adjusting your search query or changing the visibility filter.</p>
                            </div>
                          );
                        }

                        return (
                          <div className="space-y-4">
                            {displayedEducation.map((edu) => {
                              const origIdx = education.findIndex((x) => (x._id || x.id) === (edu._id || edu.id));
                              const idx = origIdx >= 0 ? origIdx : 0;
                              const isDragging = dragInfo.type === 'education' && dragInfo.index === idx;
                              const isDragOver = dragOverInfo.type === 'education' && dragOverInfo.index === idx;
                              const isVisible = edu.isVisible !== false;

                              return (
                                <div
                                  key={edu._id || edu.id || idx}
                          draggable
                          onDragStart={(e) => onDragStart(e, 'education', idx)}
                          onDragEnter={(e) => onDragEnter(e, 'education', idx)}
                          onDragOver={onDragOver}
                          onDragEnd={onDragEnd}
                          onDrop={(e) => onDrop(e, 'education', idx)}
                          className={`border rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 cursor-move ${isDragging
                            ? 'opacity-30 border-dashed border-primary scale-[0.99] bg-surface-container-low'
                            : isDragOver
                              ? 'border-primary ring-2 ring-primary/40 bg-primary/10 shadow-lg'
                              : !isVisible
                                ? 'opacity-65 border-dashed border-outline-variant/40 bg-surface-container-low/60'
                                : 'bg-surface-container-low border-outline-variant/20 hover:border-outline-variant/50'
                            }`}
                        >
                          <div className="flex items-start md:items-center gap-3 flex-grow w-full md:w-auto">
                            {/* Drag handle & Move Up/Down buttons */}
                            <div className="flex items-center gap-1 shrink-0 self-start md:self-center">
                              <div
                                className="cursor-grab active:cursor-grabbing p-1.5 text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center rounded hover:bg-surface-container-high"
                                title="Drag to reorder"
                              >
                                <span className="material-symbols-outlined text-xl select-none">drag_indicator</span>
                              </div>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => moveItem('education', idx, -1)}
                                  disabled={idx === 0}
                                  className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                  title="Move up"
                                >
                                  <span className="material-symbols-outlined text-base select-none leading-none">arrow_drop_up</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveItem('education', idx, 1)}
                                  disabled={idx === education.length - 1}
                                  className="p-0.5 rounded text-on-surface-variant hover:text-primary disabled:opacity-20 disabled:hover:text-on-surface-variant transition-colors"
                                  title="Move down"
                                >
                                  <span className="material-symbols-outlined text-base select-none leading-none">arrow_drop_down</span>
                                </button>
                              </div>
                            </div>

                            <div className="space-y-2 flex-grow">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 font-bold">
                                  #{idx + 1}
                                </span>
                                {renderVisibilityBadge(edu.isVisible)}
                                <h3 className="font-headline text-base font-bold text-on-surface">
                                  {edu.title}
                                </h3>
                                <span className="text-xs font-semibold text-primary">{edu.institution}</span>
                                {renderColorBadge(edu.color || COLOR_CYCLE[idx % 3], edu.isVisible)}
                              </div>
                              <p className="text-xs text-on-surface-variant/80 font-mono">
                                {edu.period || `${edu.startDate} - ${edu.endDate}`}
                              </p>
                              {edu.description && (
                                <p className="text-xs text-on-surface-variant max-w-2xl">{edu.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility('education', edu)}
                              className={`p-2 rounded transition-colors ${isVisible
                                ? 'text-primary hover:bg-primary/10'
                                : 'text-on-surface-variant/50 hover:text-on-surface hover:bg-surface-container-high'
                                }`}
                              title={isVisible ? 'Click to Hide on website' : 'Click to Make Visible on website'}
                            >
                              <span className="material-symbols-outlined text-lg">
                                {isVisible ? 'visibility' : 'visibility_off'}
                              </span>
                            </button>
                            <button
                              onClick={() => openModal('education', edu)}
                              className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"
                              title="Edit Education"
                            >
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => handleDelete('education', edu._id || edu.id)}
                              className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                              title="Delete Education"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </>
          )}
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

            {/* GITHUB ENGINE TAB */}
            {activeTab === 'github' && (
              <div className="max-w-4xl space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-bold uppercase tracking-wider">
                      Developer Program Integration
                    </span>
                    <span className="text-xs font-mono text-on-surface-variant">
                      API Telemetry &amp; Repo Sync
                    </span>
                  </div>
                  <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
                    GitHub Engine &amp; Visibility Controls
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    Manage real-time telemetry, contribution graphs, organization badges, and automatic project synchronization.
                  </p>
                </div>

                {/* Status & Quick Action Card */}
                <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-lg bg-surface-container-high/50 border border-outline-variant/20">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-base">hub</span>
                        <span className="text-xs font-headline font-bold text-on-surface">
                          Target Account: @{githubConfig?.username || 'Dashintha-Prabashwara'}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider ${githubConfig?.hasDbToken || githubConfig?.hasEnvToken ? 'bg-secondary/15 text-secondary border border-secondary/30' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {githubConfig?.hasDbToken || githubConfig?.hasEnvToken ? 'Token Active (5,000/hr)' : 'Public Mode (60/hr)'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-mono">
                        API Rate Limit: {githubConfig?.rateLimit?.remaining ?? 60} / {githubConfig?.rateLimit?.limit ?? 60} remaining
                        {githubConfig?.lastSyncedAt && ` • Last Synced: ${new Date(githubConfig.lastSyncedAt).toLocaleTimeString()}`}
                        <span className="text-primary/80 font-bold ml-1.5">• Auto-syncs every 2 hours</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncAllGithub}
                      disabled={githubSyncing}
                      className="py-2.5 px-4 rounded bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold uppercase tracking-wider hover:opacity-90 flex items-center gap-2 transition-opacity shadow-md disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${githubSyncing ? 'animate-spin' : ''}`}>
                        sync
                      </span>
                      {githubSyncing ? 'Syncing...' : 'Sync All Data & Repos'}
                    </button>
                  </div>

                  {/* Settings & Visibility Form */}
                  <form onSubmit={handleSaveGithubConfig} className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                          GitHub Username *
                        </label>
                        <input
                          type="text"
                          name="username"
                          defaultValue={githubConfig?.username || 'Dashintha-Prabashwara'}
                          required
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1.5">
                          Personal Access Token / App Token (Optional)
                        </label>
                        <input
                          type="password"
                          name="token"
                          placeholder={githubConfig?.tokenPreview ? `Configured: ${githubConfig.tokenPreview}` : 'ghp_... or ghs_...'}
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                        />
                        <p className="text-[10px] text-on-surface-variant/70 mt-1">
                          Grants 5,000 req/hr rate limit. Read-only permissions are 100% safe for your account and organizations.
                        </p>
                      </div>
                    </div>

                    {/* Visibility Toggles Section */}
                    <div className="pt-4 border-t border-outline-variant/20 space-y-6">
                      <div>
                        <h3 className="font-headline text-sm font-bold uppercase tracking-wider text-on-surface mb-1">
                          Main Feature Toggles
                        </h3>
                        <p className="text-xs text-on-surface-variant mb-3">
                          Enable or disable major telemetry components across your portfolio.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <label className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high/70 transition-colors">
                            <div>
                              <span className="block text-xs font-headline font-bold text-on-surface">
                                Telemetry Section
                              </span>
                              <span className="text-[11px] text-on-surface-variant">
                                Master on/off toggle
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              name="isEnabled"
                              defaultChecked={githubConfig?.isEnabled !== false}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high/70 transition-colors">
                            <div>
                              <span className="block text-xs font-headline font-bold text-on-surface">
                                Contribution Graph
                              </span>
                              <span className="text-[11px] text-on-surface-variant">
                                52-week activity matrix
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              name="showContributions"
                              defaultChecked={githubConfig?.showContributions !== false}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </label>

                          <label className="flex items-center justify-between p-3.5 rounded-lg bg-surface-container-high/40 border border-outline-variant/20 cursor-pointer hover:bg-surface-container-high/70 transition-colors">
                            <div>
                              <span className="block text-xs font-headline font-bold text-on-surface">
                                Project Badges
                              </span>
                              <span className="text-[11px] text-on-surface-variant">
                                Stars, forks on project cards
                              </span>
                            </div>
                            <input
                              type="checkbox"
                              name="showProjectBadges"
                              defaultChecked={githubConfig?.showProjectBadges !== false}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>

                      {/* SUBCOMPONENT: PROFILE HIGHLIGHTS */}
                      <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-base">workspace_premium</span>
                            <div>
                              <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                                Profile Highlights
                              </h4>
                              <p className="text-[11px] text-on-surface-variant">
                                Official badges (GitHub Pro, Developer Program Member, etc.)
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                            <span className="text-on-surface-variant">Enable Section:</span>
                            <input
                              type="checkbox"
                              name="showHighlights"
                              defaultChecked={githubConfig?.showHighlights !== false}
                              className="w-4 h-4 accent-secondary rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {githubConfig?.cachedStats?.highlights?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                            {githubConfig.cachedStats.highlights.map((hl) => {
                              const isVisible = !hiddenHighlights.includes(hl.title);
                              return (
                                <label
                                  key={hl.title}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-secondary/40 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <span className="material-symbols-outlined text-secondary text-sm">verified</span>
                                    <span className="text-xs font-headline font-bold text-on-surface truncate">
                                      {hl.title}
                                    </span>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setHiddenHighlights(hiddenHighlights.filter((t) => t !== hl.title));
                                      } else {
                                        setHiddenHighlights([...hiddenHighlights, hl.title]);
                                      }
                                    }}
                                    className="w-4 h-4 accent-secondary rounded cursor-pointer shrink-0 ml-2"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            No highlights detected. Highlights appear when synced from your GitHub profile.
                          </p>
                        )}
                      </div>

                      {/* SUBCOMPONENT: EARNED ACHIEVEMENTS */}
                      <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-tertiary text-base">military_tech</span>
                            <div>
                              <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                                Earned Achievements
                              </h4>
                              <p className="text-[11px] text-on-surface-variant">
                                Verified achievement badges with tiers (Pull Shark, Pair Extraordinaire, etc.)
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                            <span className="text-on-surface-variant">Enable Section:</span>
                            <input
                              type="checkbox"
                              name="showAchievements"
                              defaultChecked={githubConfig?.showAchievements !== false}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {githubConfig?.cachedStats?.achievements?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-2">
                            {githubConfig.cachedStats.achievements.map((ach) => {
                              const isVisible = !hiddenAchievements.includes(ach.title);
                              return (
                                <label
                                  key={ach.title}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-tertiary/40 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <img
                                      src={ach.iconUrl}
                                      alt={ach.title}
                                      className="w-7 h-7 object-contain shrink-0"
                                    />
                                    <div className="overflow-hidden">
                                      <span className="text-xs font-headline font-bold text-on-surface truncate block">
                                        {ach.title}
                                      </span>
                                      {ach.tier && (
                                        <span className="text-[9px] font-mono text-tertiary font-bold">
                                          {ach.tier}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setHiddenAchievements(hiddenAchievements.filter((t) => t !== ach.title));
                                      } else {
                                        setHiddenAchievements([...hiddenAchievements, ach.title]);
                                      }
                                    }}
                                    className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0 ml-2"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            No achievements detected. Click &ldquo;Sync All Data &amp; Repos&rdquo; above to fetch from GitHub.
                          </p>
                        )}
                      </div>

                      {/* SUBCOMPONENT: ORGANIZATIONS */}
                      <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-base">domain</span>
                            <div>
                              <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                                Organizations
                              </h4>
                              <p className="text-[11px] text-on-surface-variant">
                                Public and private organization memberships
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                            <span className="text-on-surface-variant">Enable Section:</span>
                            <input
                              type="checkbox"
                              name="showOrganizations"
                              defaultChecked={githubConfig?.showOrganizations !== false}
                              className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {githubConfig?.cachedStats?.organizations?.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-2">
                            {githubConfig.cachedStats.organizations.map((org) => {
                              const key = org.login || org.name;
                              const isVisible = !hiddenOrganizations.includes(key);
                              return (
                                <label
                                  key={key}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-primary/40 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <img
                                      src={org.avatarUrl}
                                      alt={org.name}
                                      className="w-7 h-7 rounded object-cover border border-outline-variant/20 shrink-0"
                                    />
                                    <span className="text-xs font-headline font-bold text-on-surface truncate">
                                      {org.name}
                                    </span>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setHiddenOrganizations(hiddenOrganizations.filter((t) => t !== key));
                                      } else {
                                        setHiddenOrganizations([...hiddenOrganizations, key]);
                                      }
                                    }}
                                    className="w-4 h-4 accent-primary rounded cursor-pointer shrink-0 ml-2"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            No organizations detected. Token authentication loads both public &amp; private memberships.
                          </p>
                        )}
                      </div>

                      {/* SUBCOMPONENT: TECHNOLOGIES & LANGUAGES */}
                      <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary text-base">code</span>
                            <div>
                              <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                                Technologies &amp; Languages
                              </h4>
                              <p className="text-[11px] text-on-surface-variant">
                                Calculated across all your public and private repositories
                              </p>
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-xs font-mono cursor-pointer">
                            <span className="text-on-surface-variant">Enable Section:</span>
                            <input
                              type="checkbox"
                              name="showLanguageStats"
                              defaultChecked={githubConfig?.showLanguageStats !== false}
                              className="w-4 h-4 accent-secondary rounded cursor-pointer"
                            />
                          </label>
                        </div>

                        {githubConfig?.cachedStats?.languages?.length > 0 ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 pt-2">
                            {githubConfig.cachedStats.languages.map((lang) => {
                              const isVisible = !hiddenLanguages.includes(lang.name);
                              return (
                                <label
                                  key={lang.name}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-secondary/40 cursor-pointer transition-colors"
                                >
                                  <div className="flex items-center gap-1.5 overflow-hidden">
                                    <span className="w-2 h-2 rounded-full bg-secondary shrink-0"></span>
                                    <span className="text-xs font-mono font-medium text-on-surface truncate">
                                      {lang.name}
                                    </span>
                                    <span className="text-[10px] text-on-surface-variant font-mono">
                                      ({lang.percentage}%)
                                    </span>
                                  </div>
                                  <input
                                    type="checkbox"
                                    checked={isVisible}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setHiddenLanguages(hiddenLanguages.filter((t) => t !== lang.name));
                                      } else {
                                        setHiddenLanguages([...hiddenLanguages, lang.name]);
                                      }
                                    }}
                                    className="w-4 h-4 accent-secondary rounded cursor-pointer shrink-0 ml-1.5"
                                  />
                                </label>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            Languages calculated across active repositories when synced.
                          </p>
                        )}
                      </div>

                      {/* SUBCOMPONENT: CONTRIBUTED REPOSITORIES & REPO SCOPE */}
                      <div className="p-4 rounded-xl bg-surface-container-high/30 border border-outline-variant/20 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-base">source_environment</span>
                          <div>
                            <h4 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                              Contributed Projects &amp; Telemetry Scope
                            </h4>
                            <p className="text-[11px] text-on-surface-variant">
                              Total stars, forks, and language analysis strictly include personal repositories plus repositories where you actively committed or submitted pull requests.
                            </p>
                          </div>
                        </div>

                        {/* DISCOVERED CONTRIBUTED REPOSITORIES */}
                        {githubConfig?.cachedStats?.contributedRepos?.length > 0 ? (
                          <div className="space-y-2 pt-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-on-surface-variant block font-bold">
                              Discovered Contributed Repositories (Commits / Pull Requests):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {githubConfig.cachedStats.contributedRepos.map((repo) => {
                                const fullName = repo.fullName || repo.name;
                                const isIncluded = !excludedContributedRepos.includes(fullName);
                                return (
                                  <div
                                    key={fullName}
                                    className={`p-2.5 rounded-lg border transition-all ${
                                      isIncluded
                                        ? 'bg-surface-container-low border-outline-variant/30'
                                        : 'bg-surface-container-lowest/40 border-outline-variant/10 opacity-60'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="overflow-hidden">
                                        <div className="flex items-center gap-1.5">
                                          <span className="material-symbols-outlined text-xs text-primary">folder_open</span>
                                          <a
                                            href={repo.url || `https://github.com/${fullName}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs font-mono font-bold text-on-surface hover:text-primary truncate block"
                                          >
                                            {fullName}
                                          </a>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-on-surface-variant">
                                          {repo.primaryLanguage && (
                                            <span className="px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 font-bold">
                                              {repo.primaryLanguage}
                                            </span>
                                          )}
                                          <span className="flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[11px]">star</span>
                                            {repo.stars || 0}
                                          </span>
                                          <span className="flex items-center gap-0.5">
                                            <span className="material-symbols-outlined text-[11px]">call_split</span>
                                            {repo.forks || 0}
                                          </span>
                                        </div>
                                      </div>
                                      <label className="flex items-center gap-1.5 text-[10px] font-mono cursor-pointer shrink-0">
                                        <input
                                          type="checkbox"
                                          checked={isIncluded}
                                          onChange={(e) => {
                                            if (e.target.checked) {
                                              setExcludedContributedRepos(excludedContributedRepos.filter((r) => r !== fullName));
                                            } else {
                                              setExcludedContributedRepos([...excludedContributedRepos, fullName]);
                                            }
                                          }}
                                          className="w-4 h-4 accent-primary rounded cursor-pointer"
                                        />
                                        <span className={isIncluded ? 'text-primary font-bold' : 'text-on-surface-variant'}>
                                          {isIncluded ? 'Included' : 'Excluded'}
                                        </span>
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-on-surface-variant font-mono">
                            Contributed repositories will populate when you click &ldquo;Sync All Data &amp; Repos&rdquo;.
                          </p>
                        )}

                        {/* CUSTOM CONTRIBUTED REPOSITORIES INPUT */}
                        <div className="pt-2 border-t border-outline-variant/15 space-y-2">
                          <label className="block text-[10px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                            Add Additional Contributed Repository (e.g. outside organizations):
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={customRepoInput}
                              onChange={(e) => setCustomRepoInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddCustomRepo();
                                }
                              }}
                              placeholder="owner/repo (e.g. dilshanmolligoda/SwiftDrop)"
                              className="flex-1 bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleAddCustomRepo}
                              className="px-3.5 py-2 rounded-lg bg-surface-container-highest hover:bg-primary/10 text-on-surface hover:text-primary border border-outline-variant/30 text-xs font-headline font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">add</span>
                              Add Repo
                            </button>
                          </div>

                          {customContributedRepos.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {customContributedRepos.map((handle) => (
                                <span
                                  key={handle}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high border border-outline-variant/30 text-xs font-mono text-on-surface"
                                >
                                  <span className="material-symbols-outlined text-xs text-primary">bookmark</span>
                                  {handle}
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCustomRepo(handle)}
                                    className="text-on-surface-variant hover:text-error transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-xs">close</span>
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savingGithubConfig}
                        className="py-3 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary font-headline text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md disabled:opacity-50"
                      >
                        {savingGithubConfig ? 'Saving Settings...' : 'Save GitHub Configuration'}
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
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="w-full max-w-2xl max-h-[92vh] bg-surface-container-low border border-outline-variant/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* PINNED HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/20 shrink-0 bg-surface-container-low">
              <h3 className="font-headline text-lg sm:text-xl font-bold text-on-surface capitalize">
                {editingItem ? 'Edit' : 'Add New'} {modalType}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* SCROLLABLE BODY & PINNED FOOTER FORM */}
            <form onSubmit={handleSaveItem} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 custom-scrollbar">
                {/* ELEMENT VISIBILITY TOGGLE (Default is visible) */}
                {modalType !== 'cv' && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-highest border border-outline-variant/30">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-headline font-bold text-on-surface uppercase tracking-wider">
                          Element Visibility
                        </span>
                        {modalIsVisible ? (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] leading-none">visibility</span> Visible
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant/60 border border-outline-variant/30 font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px] leading-none">visibility_off</span> Hidden
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant">
                        {modalIsVisible
                          ? 'Published on your public portfolio (rotates in Primary → Secondary → Tertiary cycle)'
                          : 'Hidden from public visitors (saved as draft or archived)'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setModalIsVisible(!modalIsVisible)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${modalIsVisible ? 'bg-primary' : 'bg-outline-variant/40'
                        }`}
                      role="switch"
                      aria-checked={modalIsVisible}
                      title={modalIsVisible ? 'Click to set hidden' : 'Click to set visible'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-primary shadow ring-0 transition duration-200 ease-in-out ${modalIsVisible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>
                )}

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
                        Description (optional)
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={editingItem?.description || ''}
                        placeholder="Role summary, accomplishments, and tech details..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Dedicated Blog Story URL (optional)
                      </label>
                      <input
                        type="url"
                        name="blogUrl"
                        defaultValue={editingItem?.blogUrl || ''}
                        placeholder="https://blog.dashijay.dev/post.php?id=..."
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
                          <option value="primary">Primary (Burnt Orange)</option>
                          <option value="secondary">Secondary (Amber / Rust)</option>
                          <option value="tertiary">Tertiary (Deep Rust)</option>
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
                          value={modalTitle}
                          onChange={(e) => setModalTitle(e.target.value)}
                          required
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Status Badge *
                        </label>
                        <select
                          name="status"
                          defaultValue={
                            ['Active', 'Production', 'Developed'].find(
                              (opt) => opt.toLowerCase() === (editingItem?.status || 'Active').toLowerCase()
                            ) || 'Active'
                          }
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-medium"
                        >
                          <option value="Active">Active</option>
                          <option value="Production">Production</option>
                          <option value="Developed">Developed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Description (optional)
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        value={modalDescription}
                        onChange={(e) => setModalDescription(e.target.value)}
                        placeholder="Role summary, accomplishments, and tech details..."
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
                        value={modalTechnologies}
                        onChange={(e) => setModalTechnologies(e.target.value)}
                        placeholder="Next.js, Node.js, Docker, MongoDB"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            GitHub URL
                          </label>
                          <button
                            type="button"
                            onClick={handleAutofillFromGithub}
                            disabled={autofillingRepo}
                            className="text-[10px] text-primary hover:underline font-mono font-bold flex items-center gap-1"
                          >
                            <span className={`material-symbols-outlined text-xs ${autofillingRepo ? 'animate-spin' : ''}`}>
                              sync
                            </span>
                            {autofillingRepo ? 'Autofilling...' : 'Autofill from GitHub'}
                          </button>
                        </div>
                        <input
                          type="text"
                          name="githubUrl"
                          value={modalGithubUrl}
                          onChange={(e) => setModalGithubUrl(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            Live Demo URL
                          </label>
                          <span className="text-[10px] text-primary font-mono font-bold">Powers Auto-Preview</span>
                        </div>
                        <input
                          type="text"
                          name="liveUrl"
                          value={modalLiveUrl}
                          onChange={(e) => setModalLiveUrl(e.target.value)}
                          placeholder="https://your-site.com"
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                            Dedicated Blog Story URL (optional)
                          </label>
                          <span className="text-[10px] text-tertiary font-mono font-bold">Deep-dive article</span>
                        </div>
                        <input
                          type="url"
                          name="blogUrl"
                          defaultValue={editingItem?.blogUrl || ''}
                          placeholder="https://blog.dashijay.dev/post.php?id=..."
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    {/* COVER BANNER & LIVE PREVIEW SYSTEM */}
                    <div className="p-4 rounded-xl bg-surface-container-highest/60 border border-outline-variant/30 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <label className="block text-xs font-headline font-bold uppercase tracking-wider text-on-surface">
                            Cover Banner &amp; Preview
                          </label>
                          <p className="text-[11px] text-on-surface-variant">
                            Upload a banner from your computer (stored directly in MongoDB) or use the live site preview.
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="file"
                            ref={bannerFileInputRef}
                            onChange={handleProjectBannerUpload}
                            accept="image/*"
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => bannerFileInputRef.current?.click()}
                            disabled={uploadingBanner}
                            className="px-3 py-1.5 rounded-lg bg-primary text-xs font-headline font-bold uppercase tracking-wider text-on-primary hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50 transition-opacity shadow-sm cursor-pointer"
                            title="Upload banner image from local storage into MongoDB"
                          >
                            <span className={`material-symbols-outlined text-sm ${uploadingBanner ? 'animate-spin' : ''}`}>
                              {uploadingBanner ? 'progress_activity' : 'upload_file'}
                            </span>
                            {uploadingBanner ? 'Uploading...' : 'Upload Banner'}
                          </button>
                          {modalCoverImage && (
                            <button
                              type="button"
                              onClick={handleClearBanner}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-on-surface-variant hover:text-error hover:border-error/40 flex items-center gap-1 transition-colors"
                              title="Clear banner and use live landing page preview"
                            >
                              <span className="material-symbols-outlined text-xs">close</span>
                              Clear Banner
                            </button>
                          )}
                          {modalLiveUrl && !modalCoverImage && (
                            <button
                              type="button"
                              onClick={handleFetchLivePreview}
                              disabled={fetchingPreview}
                              className="px-2.5 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-on-surface-variant hover:text-primary flex items-center gap-1 transition-colors"
                              title="Refresh live website preview"
                            >
                              <span className={`material-symbols-outlined text-xs ${fetchingPreview ? 'animate-spin' : ''}`}>
                                {fetchingPreview ? 'progress_activity' : 'refresh'}
                              </span>
                              Refresh
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-label uppercase tracking-wider text-on-surface-variant/80">
                          Banner URL / Database Media ID
                        </label>
                        <input
                          type="text"
                          name="image"
                          value={modalCoverImage}
                          onChange={(e) => setModalCoverImage(e.target.value)}
                          placeholder="Auto-populated when uploading above, or paste an image URL"
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                        />
                      </div>

                      {/* Visual Card Preview */}
                      <div className="relative aspect-[16/9] w-full max-h-48 rounded-lg overflow-hidden border border-outline-variant/40 bg-black/40">
                        <img
                          src={getProjectCoverImage({ image: modalCoverImage, liveUrl: modalLiveUrl })}
                          alt="Project Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&q=80';
                          }}
                        />
                        <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1.5 shadow-md">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              modalCoverImage && !modalCoverImage.includes('photo-1517694712202')
                                ? 'bg-secondary'
                                : modalLiveUrl
                                ? 'bg-primary'
                                : 'bg-on-surface-variant'
                            }`}
                          />
                          {modalCoverImage && !modalCoverImage.includes('photo-1517694712202')
                            ? modalCoverImage.startsWith('/api/media/')
                              ? 'Custom Banner (Stored in MongoDB)'
                              : 'Custom Banner (Image URL)'
                            : modalLiveUrl
                            ? 'Landing Page Preview (Live Site)'
                            : 'Fallback: Default Placeholder'}
                        </div>
                      </div>
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
                          <option value="from-primary to-primary">Primary (Burnt Orange)</option>
                          <option value="from-secondary to-secondary">Secondary (Amber / Rust)</option>
                          <option value="from-tertiary to-tertiary">Tertiary (Deep Rust)</option>
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

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Credential ID
                      </label>
                      <input
                        type="text"
                        name="credentialId"
                        defaultValue={editingItem?.credentialId || ''}
                        placeholder="e.g. UC-88981442-1204"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                      />
                    </div>

                    {/* Material Symbol Icon Chooser */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant">
                          Material Symbol Icon *
                        </label>
                        <span className="text-[11px] font-mono text-primary flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                          <span className="material-symbols-outlined text-base leading-none">{selectedCertIcon || 'verified'}</span>
                          <span className="font-bold">{selectedCertIcon || 'verified'}</span>
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-highest border border-outline-variant/30 space-y-2.5">
                        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                          {CERTIFICATION_ICONS.map((iconItem) => {
                            const isSelected = selectedCertIcon === iconItem.id;
                            return (
                              <button
                                key={iconItem.id}
                                type="button"
                                onClick={() => setSelectedCertIcon(iconItem.id)}
                                title={iconItem.label}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${
                                  isSelected
                                    ? 'bg-primary text-on-primary border-primary shadow-md scale-105 ring-2 ring-primary/40'
                                    : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface hover:bg-surface-container border-outline-variant/20'
                                }`}
                              >
                                <span className="material-symbols-outlined text-xl">{iconItem.id}</span>
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-outline-variant/20">
                          <span className="text-[11px] text-on-surface-variant shrink-0">Custom Icon:</span>
                          <input
                            type="text"
                            name="icon"
                            value={selectedCertIcon}
                            onChange={(e) => setSelectedCertIcon(e.target.value.trim().toLowerCase())}
                            placeholder="verified, workspace_premium, school, terminal..."
                            className="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-2.5 py-1 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
                          />
                        </div>
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
                        type="text"
                        name="verificationUrl"
                        defaultValue={editingItem?.verificationUrl || ''}
                        placeholder="https://www.credly.com/..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          defaultValue={
                            ['Verified', 'Active', 'Completed', 'In Progress', 'Issued'].find(
                              (opt) => opt.toLowerCase() === (editingItem?.status || 'Verified').toLowerCase()
                            ) || 'Verified'
                          }
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary font-medium"
                        >
                          <option value="Verified">Verified</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Issued">Issued</option>
                        </select>
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
                        Description (optional)
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

                {/* BLOG POST FORM */}
                {modalType === 'blog' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Article Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          defaultValue={editingItem?.title || ''}
                          required
                          placeholder="e.g., Scaling Next.js on Kubernetes"
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          name="category"
                          defaultValue={editingItem?.category || 'DevOps & CI/CD'}
                          placeholder="e.g., DevOps & CI/CD, Cloud & Database"
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Read Time
                        </label>
                        <input
                          type="text"
                          name="readTime"
                          defaultValue={editingItem?.readTime || '5 min read'}
                          placeholder="e.g., 6 min read"
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          name="author"
                          defaultValue={editingItem?.author || 'Dashintha Jayawardana'}
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Short Excerpt / Summary *
                      </label>
                      <textarea
                        name="excerpt"
                        rows={2}
                        defaultValue={editingItem?.excerpt || ''}
                        required
                        placeholder="Concise overview displayed on the blog card..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        Article Content (Markdown supported)
                      </label>
                      <textarea
                        name="content"
                        rows={8}
                        defaultValue={editingItem?.content || ''}
                        placeholder="Write the full technical article here with # Headings, - Lists, and paragraphs..."
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface font-mono focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                          Tags (comma separated)
                        </label>
                        <input
                          type="text"
                          name="tags"
                          defaultValue={editingItem?.tags?.join(', ') || ''}
                          placeholder="Docker, Kubernetes, AWS"
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
                          defaultValue={editingItem?.order ?? blogs.length + 1}
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">
                        External URL (optional)
                      </label>
                      <input
                        type="url"
                        name="externalUrl"
                        defaultValue={editingItem?.externalUrl || ''}
                        placeholder="https://medium.com/@... or leave blank for internal reading modal"
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-lg px-3.5 py-2 text-xs sm:text-sm text-on-surface focus:outline-none focus:border-primary"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* PINNED FOOTER */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-outline-variant/20 shrink-0 bg-surface-container-low/95 backdrop-blur-sm">
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
                  className="py-2.5 px-6 rounded-lg bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-headline font-bold uppercase tracking-widest shadow-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>}
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
