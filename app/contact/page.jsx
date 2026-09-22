'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';
import { SOCIAL_LINKS } from '@/lib/constants';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '', website: '' });
  const [formStatus, setFormStatus] = useState({ loading: false, success: false, error: null, fieldErrors: {} });

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setFormStatus((current) => ({
      ...current,
      error: null,
      fieldErrors: { ...current.fieldErrors, [name]: null },
    }));
  };

  const handleFormSubmit = async (submittedData) => {
    setFormStatus({ loading: true, success: false, error: null, fieldErrors: {} });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedData),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw { message: data.error || 'Submission failed. Please try again.', fieldErrors: data.errors || {} };
      }

      setFormStatus({ loading: false, success: true, error: null, fieldErrors: {} });
      setFormData({ name: '', email: '', message: '', website: '' });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Contact form submission error:', error);
      }
      setFormStatus({
        loading: false,
        success: false,
        error: error?.message || 'Network error. Please try again.',
        fieldErrors: error?.fieldErrors || {},
      });
    }
  };

  return (
    <>
      <Navigation />
      <main className="pt-20 sm:pt-24 md:pt-32 pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
        <ContactHero />
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 md:gap-20 items-start">
          <ContactInfo />
          <ContactForm formData={formData} status={formStatus} onFormChange={handleFormChange} onFormSubmit={handleFormSubmit} />
        </section>
      </main>
      <Footer className="mt-24 sm:mt-32" />
    </>
  );
}

function ContactInfo() {
  return (
    <section>
      <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">Get In Touch.</h2>
      <p className="text-on-surface-variant text-sm sm:text-base md:text-lg max-w-md mb-8 sm:mb-12">
        Looking to work together or just want to chat about tech? I&apos;m always interested in hearing about what people are building and learning.
      </p>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">Email</p>
          <a href={`mailto:${SOCIAL_LINKS.email}`} className="font-headline font-bold text-sm sm:text-base md:text-lg hover:text-primary transition-colors">
            {SOCIAL_LINKS.email}
          </a>
        </div>
        <div>
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-2">Profiles</p>
          <div className="flex gap-4 flex-wrap">
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-headline font-bold text-sm sm:text-base md:text-lg" href={SOCIAL_LINKS.github} rel="noopener noreferrer" target="_blank">GitHub</a>
            <a className="text-on-surface-variant hover:text-on-surface transition-colors font-headline font-bold text-sm sm:text-base md:text-lg" href={SOCIAL_LINKS.linkedin} rel="noopener noreferrer" target="_blank">LinkedIn</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactHero() {
  return (
    <header className="mb-16 sm:mb-20 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-20 items-end">
      <div>
        <h1 className="font-headline text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-none mb-4 sm:mb-6">
          <span className="block">Let&apos;s</span>
          <span className="block text-gradient ml-6 sm:ml-12 md:ml-24">Build</span>
          <span className="block">Something.</span>
        </h1>
        <p className="font-body text-on-surface-variant max-w-xl text-sm sm:text-base md:text-lg mt-6 sm:mt-8">
          I&apos;m looking for opportunities to grow, learn, and contribute to interesting projects. Let&apos;s talk about what you&apos;re working on.
        </p>
      </div>

      <div className="border-l border-primary/40 pl-5 sm:pl-6 pb-1">
        <p className="font-label text-primary text-[10px] uppercase tracking-[0.25em] mb-5">Open to conversation</p>
        <div className="space-y-4 text-sm sm:text-base">
          <div className="flex justify-between gap-6 border-b border-outline-variant/20 pb-3">
            <span className="text-on-surface-variant">Focus</span>
            <span className="font-headline font-bold text-right">Cloud &amp; DevOps</span>
          </div>
          <div className="flex justify-between gap-6 border-b border-outline-variant/20 pb-3">
            <span className="text-on-surface-variant">Response</span>
            <span className="font-headline font-bold text-right">Within 1–2 days</span>
          </div>
          <div className="flex justify-between gap-6">
            <span className="text-on-surface-variant">Direct line</span>
            <a href={`mailto:${SOCIAL_LINKS.email}`} className="font-headline font-bold text-primary hover:text-on-surface transition-colors text-right">
              {SOCIAL_LINKS.email}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
