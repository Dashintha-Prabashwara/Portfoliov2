'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Common email domain typos
const COMMON_EMAIL_TYPOS = {
  'gail.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmil.com': 'gmail.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'yahho.com': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'hotmial.com': 'hotmail.com',
  'protonmial.com': 'protonmail.com',
};

// Function to detect email typos
function detectEmailTypo(email) {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  const suggestion = COMMON_EMAIL_TYPOS[domain];
  return suggestion ? { typo: domain, suggestion } : null;
}

export default function ContactForm({ formData, status, onFormChange, onFormSubmit }) {
  const [showEmailWarning, setShowEmailWarning] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  const handleChange = (e) => {
    onFormChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for email typos
    const typoDetails = detectEmailTypo(formData.email);
    if (typoDetails) {
      setShowEmailWarning(true);
      setPendingFormData(formData);
      return;
    }

    // No typo detected, proceed with submission
    onFormSubmit(formData);
  };

  const handleConfirmTypo = () => {
    // User confirmed they want to send with the typo email
    setShowEmailWarning(false);
    onFormSubmit(pendingFormData);
  };

  const handleCorrectEmail = () => {
    // User wants to correct the email
    const typoDetails = detectEmailTypo(formData.email);
    const correctEmail = formData.email.replace(
      typoDetails.typo,
      typoDetails.suggestion
    );

    // Simulate change event
    onFormChange({
      target: {
        name: 'email',
        value: correctEmail
      }
    });

    setShowEmailWarning(false);
    setPendingFormData(null);
  };

  return (
    <div className="bg-surface-container-low p-6 sm:p-8 md:p-12 rounded-2xl relative">
      <form onSubmit={handleSubmit} className="relative z-10 space-y-6 sm:space-y-8">
        {/* Name Field */}
        <div className="relative">
          <label
            htmlFor="name"
            className="block text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-2"
          >
            Identifier / Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={status.loading}
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-3 sm:py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body disabled:opacity-50 text-sm sm:text-base"
            placeholder="Commander Shepherd"
          />
          {status.fieldErrors?.name && (
            <p className="text-xs text-error mt-1">{status.fieldErrors.name}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="relative">
          <label
            htmlFor="email"
            className="block text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-2"
          >
            Endpoint / Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={status.loading}
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-3 sm:py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body disabled:opacity-50 text-sm sm:text-base"
            placeholder="shepherd@normandy.com"
          />
          {status.fieldErrors?.email && (
            <p className="text-xs text-error mt-1">{status.fieldErrors.email}</p>
          )}
        </div>

        {/* Message Field */}
        <div className="relative">
          <label
            htmlFor="message"
            className="block text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-2"
          >
            Payload / Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            disabled={status.loading}
            rows="4"
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-3 sm:py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body resize-none disabled:opacity-50 text-sm sm:text-base"
            placeholder="Brief about your system requirements..."
          />
          {status.fieldErrors?.message && (
            <p className="text-xs text-error mt-1">{status.fieldErrors.message}</p>
          )}
        </div>

        {/* Honeypot Field (hidden from users) */}
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          tabIndex={-1}
          autoComplete="off"
          className="absolute opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* Submit Button */}
        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-4 sm:py-5 rounded-md active:opacity-90 transition-opacity flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            {status.loading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Transmitting...
              </>
            ) : (
              <>
                Transmit Signal
                <span
                  className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-2"
                  data-icon="send"
                >
                  send
                </span>
              </>
            )}
          </button>
        </div>

        {/* Success/Error Messages */}
        <AnimatePresence>
          {status.success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-3 sm:p-4 bg-tertiary/10 rounded-lg border border-tertiary/20"
            >
              <span className="material-symbols-outlined text-tertiary flex-shrink-0">
                check_circle
              </span>
              <p className="text-xs font-label font-bold text-tertiary uppercase">
                Packet delivered successfully! I&apos;ll respond soon.
              </p>
            </motion.div>
          )}

          {status.error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-2 p-3 sm:p-4 bg-error/10 rounded-lg border border-error/20"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-error flex-shrink-0">error</span>
                <p className="text-xs font-label text-error font-bold">{status.error}</p>
              </div>
              {Object.keys(status.fieldErrors || {}).length > 0 && (
                <div className="ml-7 space-y-1">
                  {Object.entries(status.fieldErrors).map(([field, message]) => (
                    <p key={field} className="text-xs text-error/80">
                      • {message}
                    </p>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Typo Warning Modal */}
        <AnimatePresence>
          {showEmailWarning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmailWarning(false)}
              role="dialog"
              aria-modal="true"
              aria-labelledby="email-warning-title"
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-container-low rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-outline-variant/20"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-warning text-2xl flex-shrink-0">
                      warning
                    </span>
                    <h3 id="email-warning-title" className="font-headline text-base sm:text-lg font-bold">Possible Email Typo</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmailWarning(false)}
                    className="text-on-surface-variant hover:text-on-surface transition-colors flex-shrink-0"
                    aria-label="Close"
                  >
                    <span className="material-symbols-outlined text-2xl">close</span>
                  </button>
                </div>

                <p className="text-on-surface-variant text-xs sm:text-sm mb-4">
                  Did you mean <span className="font-bold text-primary">{detectEmailTypo(formData.email)?.suggestion}</span> instead of <span className="font-bold text-error">{formData.email.split('@')[1]}</span>?
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={handleCorrectEmail}
                    className="flex-1 bg-primary text-surface font-label font-bold py-2 rounded-lg hover:bg-primary/80 transition-colors text-xs sm:text-sm"
                  >
                    Correct Email
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmTypo}
                    className="flex-1 bg-surface-container-high text-on-surface font-label font-bold py-2 rounded-lg border border-outline-variant/20 hover:bg-surface-container-highest transition-colors text-xs sm:text-sm"
                  >
                    Send Anyway
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
