import { Resend } from 'resend';
import { getValidatedEnv } from './env.js';

const env = getValidatedEnv();
const resend = new Resend(env.RESEND_API_KEY);

/**
 * Send email notification to admin when contact form is submitted
 */
export async function sendContactNotification(contactData) {
  if (!env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ RESEND_API_KEY not configured. Email notifications disabled.');
    }
    return { success: true, skipped: true };
  }

  if (!env.ADMIN_EMAIL) {
    if (process.env.NODE_ENV === 'development') {
      console.error('⚠️ ADMIN_EMAIL not configured. Email notifications disabled.');
    }
    return { success: false, error: 'Email service not configured' };
  }

  const adminEmail = env.ADMIN_EMAIL;

  try {
    const result = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: adminEmail,
      replyTo: contactData.email,
      subject: `New Message: ${contactData.name}`,
      html: `
        <p>Name: ${escapeHtml(contactData.name)}</p>
        <p>Email: ${escapeHtml(contactData.email)}</p>
        <p>Date: ${new Date().toLocaleString()}</p>

        <p>Message:</p>
        <p>
          ${escapeHtml(contactData.message)}
        </p>

      `,
    });

    if (result.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Email send error:', result.error);
      }
      return { success: false, error: result.error.message };
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Email sent to ${adminEmail}:`, result.id);
    }
    return { success: true, emailId: result.id };
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to send email:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Escape HTML to prevent injection
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
