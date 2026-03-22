'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function ContactForm({ formData, status, onFormChange, onFormSubmit }) {
  const handleChange = (e) => {
    onFormChange(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onFormSubmit(formData);
  };

  return (
    <div className="bg-surface-container-low p-8 md:p-12 rounded-2xl relative">
      {/* Abstract Glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 blur-[100px] rounded-full"></div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
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
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body disabled:opacity-50"
            placeholder="Commander Shepherd"
          />
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
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body disabled:opacity-50"
            placeholder="shepherd@normandy.com"
          />
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
            className="w-full bg-surface-container-lowest border-0 border-b border-outline-variant/20 focus:ring-0 focus:border-primary py-4 text-on-surface placeholder:text-on-surface-variant/30 transition-all font-body resize-none disabled:opacity-50"
            placeholder="Brief about your system requirements..."
          />
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
        <div className="pt-4">
          <button
            type="submit"
            disabled={status.loading}
            className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-bold uppercase tracking-[0.2em] py-5 rounded-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="flex items-center gap-3 p-4 bg-tertiary/10 rounded-lg border border-tertiary/20"
            >
              <span className="material-symbols-outlined text-tertiary">
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
              className="flex items-center gap-3 p-4 bg-error/10 rounded-lg border border-error/20"
            >
              <span className="material-symbols-outlined text-error">error</span>
              <p className="text-xs font-label text-error">{status.error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
