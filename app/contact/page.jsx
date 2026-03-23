'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ContactForm from '@/components/ContactForm';
import { SOCIAL_LINKS } from '@/lib/constants';

// ========== DATA SECTION ==========
const pipelineStages = [
  { id: 1, name: 'Source', icon: 'source', description: 'GitHub Webhook' },
  { id: 2, name: 'Build & Test', icon: 'build', description: 'Unit Tests: 98% Pass' },
  { id: 3, name: 'Deploy', icon: 'deployed_code', description: 'Staging Cluster' },
  { id: 4, name: 'Monitor', icon: 'monitoring', description: 'Awaiting Trigger' },
];

const headerTextMap = {
  idle: { name: 'Contact CI/CD Pipeline', status: 'Awaiting Input' },
  source: { name: 'Initializing Connection Pipeline', status: 'Running Optimization' },
  build: { name: 'Running Build Optimization', status: 'Running Optimization' },
  deploy: { name: 'Deploying to Staging Cluster', status: 'Running Optimization' },
  monitor: { name: 'Pipeline Complete · Monitoring Active', status: 'All Systems Healthy' },
  error: { name: 'Pipeline Failed · Awaiting Fix', status: 'OFFLINE' },
};

const consoleLinesByStage = {
  idle: [
    { type: 'pending', text: 'awaiting signal...' },
    { type: 'pending', text: 'system ready · listening on port 3000' },
  ],
  source: [
    { type: 'command', text: 'git status · 1 file modified' },
    { type: 'command', text: 'git add .' },
    { type: 'command', text: 'git commit -m "feat: new inbound signal detected"' },
    { type: 'success', text: 'Webhook received · origin/main' },
    { type: 'command', text: 'Pulling latest changes...' },
    { type: 'success', text: 'Repository synced · 3 commits ahead' },
  ],
  build: [
    { type: 'command', text: 'npm install · resolving dependencies...' },
    { type: 'success', text: '847 packages installed in 3.2s' },
    { type: 'command', text: 'npm run build --prod' },
    { type: 'success', text: 'Compiled successfully · bundle size 284kb' },
    { type: 'command', text: 'Running test suites...' },
    { type: 'success', text: 'Artifacts stored in S3: build_0422.zip' },
    { type: 'pending', text: 'Connecting to MongoDB Atlas Cluster...' },
    { type: 'success', text: 'Unit Tests: 98% Pass · 142/145 passed' },
  ],
  deploy: [
    { type: 'command', text: 'Pushing to staging cluster...' },
    { type: 'success', text: 'Docker image built · sha256:a3f9c1' },
    { type: 'command', text: 'kubectl apply -f deployment.yaml' },
    { type: 'success', text: 'Pod running · replicas: 3/3' },
    { type: 'success', text: 'Deployed to production · env: staging' },
    { type: 'success', text: 'Connected · MongoDB Atlas · latency 14ms' },
  ],
  monitor: [
    { type: 'success', text: 'Health check passed · uptime 100%' },
    { type: 'success', text: 'API Mesh active · 15 microservices online' },
    { type: 'success', text: 'Response time: 42ms · p99: 98ms' },
    { type: 'success', text: 'Zero error rate · all systems nominal' },
    { type: 'pending', text: 'watching for anomalies...' },
  ],
  error: [
    { type: 'command', text: 'npm run test' },
    { type: 'error', text: 'Unit Tests: 98% Pass · 2 failures detected' },
    { type: 'error', text: 'TypeError: Cannot read properties of undefined' },
    { type: 'error', text: 'AssertionError: expected 200 but got 503' },
    { type: 'error', text: 'Rolling back to last stable build...' },
    { type: 'error', text: 'Pipeline halted · intervention required' },
  ],
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    website: '',
  });
  const [pipelineState, setPipelineState] = useState({ stage: 'idle', status: 'ok' });
  const [consoleOutput, setConsoleOutput] = useState(consoleLinesByStage.idle);
  const [formStatus, setFormStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    const updatedData = { ...formData, [name]: value };
    setFormData(updatedData);

    // Check if all fields are empty
    const isEmpty = !updatedData.name.trim() && !updatedData.email.trim() && !updatedData.message.trim();

    if (isEmpty) {
      // Reset to idle if all fields are cleared
      setPipelineState({ stage: 'idle', status: 'ok' });
      setConsoleOutput(consoleLinesByStage.idle);
    } else if (pipelineState.stage === 'idle') {
      // Transition from idle to source on first input
      setPipelineState({ stage: 'source', status: 'ok' });
      setConsoleOutput(consoleLinesByStage.source);
    }
  };

  // Simulate or call API
  const submitToAPI = async (submittedData) => {
    // Simulate API call with 2000ms delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Check if message contains "error" keyword to simulate failure
        if (submittedData.message.toLowerCase().includes('error')) {
          reject(new Error('Simulated API error: Invalid request'));
        } else {
          // Try real API first, fall back to simulation if it fails
          fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(submittedData),
          })
            .then((response) => {
              if (response.ok) {
                return response.json().then((data) => {
                  if (data.success) {
                    resolve(data);
                  } else {
                    reject(new Error(data.error || 'Submission failed'));
                  }
                });
              } else {
                return response.json().then((data) => {
                  reject(new Error(data.error || 'Server error'));
                });
              }
            })
            .catch(() => {
              // If real API fails, resolve with simulation
              resolve({ id: `sim_${Date.now()}`, success: true });
            });
        }
      }, 2000);
    });
  };

  const handleFormSubmit = async (submittedData) => {
    setPipelineState({ stage: 'build', status: 'ok' });
    setFormStatus({ loading: true, success: false, error: null });
    setConsoleOutput(consoleLinesByStage.build);

    try {
      await submitToAPI(submittedData);

      // Transition to deploy after API succeeds
      setTimeout(() => {
        setPipelineState({ stage: 'deploy', status: 'ok' });
        setConsoleOutput(consoleLinesByStage.deploy);
      }, 800);

      // Transition to monitor
      setTimeout(() => {
        setPipelineState({ stage: 'monitor', status: 'ok' });
        setConsoleOutput(consoleLinesByStage.monitor);
      }, 2300);

      setFormStatus({
        loading: false,
        success: true,
        error: null,
      });

      // Reset form after 5 seconds
      setTimeout(() => {
        setFormData({ name: '', email: '', message: '', website: '' });
        setFormStatus({ loading: false, success: false, error: null });
      }, 5000);

      // Reset pipeline after 8 seconds
      setTimeout(() => {
        setPipelineState({ stage: 'idle', status: 'ok' });
        setConsoleOutput(consoleLinesByStage.idle);
      }, 8000);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Contact form error:', error);
      }
      const errorMsg = error.message || 'Network error. Please check your connection and try again.';
      setPipelineState({ stage: 'build', status: 'error' });
      setFormStatus({
        loading: false,
        success: false,
        error: errorMsg,
      });

      // Show error console lines
      setConsoleOutput(consoleLinesByStage.error);
    }
  };

  const handleRetry = () => {
    // Reset to build stage without going back to source
    setPipelineState({ stage: 'build', status: 'ok' });
    setFormStatus({ loading: true, success: false, error: null });
    setConsoleOutput(consoleLinesByStage.build);
    // Re-submit
    handleFormSubmit(formData);
  };

  return (
    <>
      <Navigation />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden relative">
        <ContactHero />

       
        {/* Live Infrastructure Section Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-px flex-1 bg-outline-variant/30"></div>
          <h2 className="font-headline text-sm uppercase tracking-[0.2em] text-primary">Live Infrastructure</h2>
        </div>

        {/* FRAME 1: Pipeline Viz (LEFT) + Contact Form (RIGHT) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
          {/* LEFT - Pipeline Visualization */}
          <PipelinePanel
            stages={pipelineStages}
            pipelineState={pipelineState}
            consoleOutput={consoleOutput}
            onRetry={handleRetry}
          />

          {/* RIGHT - Contact Form */}
          <ContactForm
            formData={formData}
            status={formStatus}
            onFormChange={handleFormChange}
            onFormSubmit={handleFormSubmit}
          />
        </section>

        {/* FRAME 2: Contact Info (LEFT) + Info Cards (RIGHT) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          {/* LEFT - Contact Info */}
          <ContactInfo />

          {/* RIGHT - Info Cards */}
          <InfoCards />
        </section>
      </main>
      <Footer />
    </>
  );
}

// ========== CONSOLE LINE COMPONENT ==========
function ConsoleLine({ log }) {
  const getIndicator = () => {
    switch (log.type) {
      case 'command':
        return <span className="text-on-surface">$</span>;
      case 'success':
        return <span className="text-tertiary">✔</span>;
      case 'error':
        return <span className="text-error">✖</span>;
      case 'pending':
        return <span className="text-primary">➜</span>;
      default:
        return <span className="text-on-surface">$</span>;
    }
  };

  const getTextColor = () => {
    switch (log.type) {
      case 'error':
        return 'text-error';
      case 'success':
        return 'text-tertiary';
      case 'pending':
        return 'text-primary';
      default:
        return 'text-on-surface-variant';
    }
  };

  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0">{getIndicator()}</span>
      <span className={`font-mono ${getTextColor()}`}>{log.text}</span>
    </div>
  );
}

// ========== PIPELINE PANEL SECTION ==========
function PipelinePanel({ stages, pipelineState, consoleOutput, onRetry }) {
  const headerText = headerTextMap[pipelineState.stage] || headerTextMap.idle;
  const isError = pipelineState.status === 'error';

  return (
    <div className="bg-surface-container-low rounded-xl p-8 border-l-2 border-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="font-headline text-2xl font-bold">{headerText.name}</h3>
          <p className={`text-sm font-label uppercase tracking-widest mt-1 ${isError ? 'text-error' : 'text-on-surface-variant'}`}>
            {headerText.status}
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${isError ? 'bg-error/10 border-error/20' : 'bg-tertiary/10 border-tertiary/20'}`}>
          <span className={`w-2 h-2 rounded-full ${isError ? 'bg-error' : 'bg-tertiary'} ${pipelineState.stage !== 'idle' ? 'animate-pulse' : ''}`}></span>
          <span className={`text-[10px] font-bold uppercase ${isError ? 'text-error' : 'text-tertiary'}`}>
            {isError ? 'OFFLINE' : pipelineState.stage === 'idle' ? 'Idle' : 'Active'}
          </span>
        </div>
      </div>

      {/* Pipeline Stages */}
      <div className="relative flex flex-row justify-between items-center gap-8 py-4 mb-8">
        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/20 -translate-y-1/2 z-0"></div>
        {stages.map((stage) => {
          const stageKey = ['source', 'build', 'deploy', 'monitor'][stage.id - 1];
          const isActive = pipelineState.stage === stageKey;
          const isFailed = isError && pipelineState.stage === 'build';
          const opacityClass = isActive ? 'stage--active' : 'stage--dimmed';

          return (
            <div
              key={stage.id}
              className={`z-10 p-4 rounded-lg border shadow-xl text-center transition-all w-full md:w-auto ${opacityClass} ${
                isFailed
                  ? 'bg-surface-container-high border-error/40 ring-2 ring-error/10'
                  : isActive
                    ? stage.id === 3
                      ? 'bg-surface-container-high border-secondary/40 ring-2 ring-secondary/10'
                      : 'bg-surface-container-high border-primary/40 ring-2 ring-primary/10'
                    : 'bg-surface-container-high border-outline-variant/10'
              }`}
            >
              <span
                className={`material-symbols-outlined mb-2 block ${
                  isFailed ? 'text-error' : stage.id === 3 && isActive ? 'text-secondary' : 'text-primary'
                }`}
              >
                {stage.icon}
              </span>
              <p className={`text-xs font-label font-bold uppercase mb-1 ${isFailed ? 'text-error' : 'text-on-surface'}`}>
                {stage.name}
              </p>
              <p className="text-[10px] text-on-surface-variant">{stage.description}</p>
            </div>
          );
        })}
      </div>

      {/* Console Output */}
      <div className="p-4 bg-surface-container-lowest rounded-lg font-mono text-xs text-on-surface-variant border border-outline-variant/10 min-h-[120px] max-h-[200px] overflow-y-auto space-y-1">
        {consoleOutput.length === 0 ? (
          <div className="text-on-surface-variant/50">Awaiting input...</div>
        ) : (
          consoleOutput.map((log, index) => (
            <ConsoleLine key={index} log={log} />
          ))
        )}
      </div>

      {/* Retry Button - Only show on error */}
      {isError && (
        <button
          onClick={onRetry}
          className="mt-6 w-full px-6 py-3 bg-primary text-surface rounded-lg font-label font-bold text-sm uppercase tracking-wider hover:bg-primary/80 transition-colors"
        >
          Retry Pipeline
        </button>
      )}
    </div>
  );
}


// ========== CONTACT SECTION ==========
function ContactInfo() {
  return (
    <div>
      <h2 className="font-headline text-5xl font-bold mb-6">Initialize Connection.</h2>
      <p className="text-on-surface-variant text-lg max-w-md mb-12">
        Whether you&rsquo;re looking for an infrastructure overhaul or a technical partner for your next launch, the system is ready for your input.
      </p>
      <div className="space-y-8">
        <div className="flex items-center gap-6 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/10 group-hover:border-primary/50 transition-colors">
            <span className="material-symbols-outlined text-primary">alternate_email</span>
          </div>
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">Email</p>
            <a href={`mailto:${SOCIAL_LINKS.email}`} className="font-headline font-bold text-lg hover:text-primary transition-colors">
              {SOCIAL_LINKS.email}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-6 group">
          <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center border border-outline-variant/10 group-hover:border-secondary/50 transition-colors">
            <span className="material-symbols-outlined text-secondary">share</span>
          </div>
          <div className="flex gap-4">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-headline font-bold text-lg" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
              GitHub
            </a>
            <span className="text-outline-variant/30">/</span>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-headline font-bold text-lg" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== INFO CARDS SECTION ==========
function InfoCards() {
  return (
    <div className="flex flex-col gap-6">
      {/* Persistence Layer Card */}
      <div className="bg-surface-container-high rounded-xl p-6 border-t-2 border-secondary flex-1">
        <span className="material-symbols-outlined text-secondary text-3xl mb-4 block">database</span>
        <h4 className="font-headline text-lg font-bold">Persistence Layer</h4>
        <p className="text-on-surface-variant text-sm mt-2 mb-4 leading-relaxed">
          Currently migrating heavy JSON schemas to MongoDB optimized patterns to reduce latency by 40%.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-surface-container-lowest rounded text-[10px] font-label font-bold text-on-surface border border-outline-variant/20 uppercase">
            MongoDB
          </span>
          <span className="px-2 py-1 bg-surface-container-lowest rounded text-[10px] font-label font-bold text-on-surface border border-outline-variant/20 uppercase">
            Node.js
          </span>
          <span className="px-2 py-1 bg-surface-container-lowest rounded text-[10px] font-label font-bold text-on-surface border border-outline-variant/20 uppercase">
            Redis
          </span>
        </div>
      </div>

      {/* API Mesh Card */}
      <div className="bg-surface-container-high rounded-xl p-6 border-t-2 border-primary flex-1">
        <span className="material-symbols-outlined text-primary text-3xl mb-4 block">hub</span>
        <h4 className="font-headline text-lg font-bold">API Mesh</h4>
        <p className="text-on-surface-variant text-sm mt-2 mb-4">
          Implementing Istio service mesh for enhanced observability across 15+ microservices.
        </p>
        <div className="w-full bg-outline-variant/20 h-1 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[65%]"></div>
        </div>
        <p className="text-[10px] font-label text-primary mt-2 uppercase font-bold">65% Integration Complete</p>
      </div>
    </div>
  );
}

// ========== HERO SECTION ==========
function ContactHero() {
  return (
    <div className="mb-20">
      <h1 className="font-headline text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-4">
        <span className="block">BUILD.</span>
        <span className="block text-gradient ml-12 md:ml-24">DEPLOY.</span>
        <span className="block">OPTIMIZE.</span>
      </h1>
      <p className="font-body text-on-surface-variant max-w-xl text-lg mt-8 ml-auto">
        Bridging the gap between monolithic legacies and cloud-native futures. I architect systems that don&rsquo;t just run&mdash;they evolve.
      </p>
    </div>
  );
}

// ========== FOOTER SECTION ==========
function Footer() {
  return (
    <footer className="bg-zinc-950 w-full py-12 border-t border-zinc-900 mt-32">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-6">
        <div className="text-zinc-500 font-['Inter'] text-xs tracking-widest uppercase">
          © 2026 Dashintha Jayawardana. Built for the Cloud | All Rights Reserved
        </div>
        <div className="flex gap-8">
          <a className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">
            LinkedIn
          </a>
          <a className="text-zinc-500 hover:text-purple-400 transition-colors font-['Inter'] text-xs tracking-widest uppercase opacity-80 hover:opacity-100 duration-200" href={`mailto:${SOCIAL_LINKS.email}`}>
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
