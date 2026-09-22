import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/rateLimiter";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be no more than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message must be no more than 2000 characters"),
  honeypot: z.string().optional().default(""),
});

// Helper function to format validation errors
function formatValidationErrors(fieldErrors) {
  const errors = {};

  if (!fieldErrors || typeof fieldErrors !== 'object') {
    return { general: "Validation failed" };
  }

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (Array.isArray(messages) && messages.length > 0) {
      // Handle both string messages and error objects
      const firstError = messages[0];
      if (typeof firstError === 'string') {
        errors[field] = firstError;
      } else if (firstError && typeof firstError === 'object' && firstError.message) {
        errors[field] = firstError.message;
      } else {
        errors[field] = "Invalid input";
      }
    }
  }

  return Object.keys(errors).length > 0 ? errors : { general: "Validation failed" };
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Failed to parse request JSON:", parseError.message);
      }
      return NextResponse.json(
        { success: false, error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const rateLimitResult = checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { status: 429 }
      );
    }

    if (body.honeypot && body.honeypot.trim() !== "") {
      return NextResponse.json(
        { success: false, error: "Spam detected" },
        { status: 400 }
      );
    }

    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      const formattedErrors = formatValidationErrors(fieldErrors);

      return NextResponse.json(
        {
          success: false,
          error: "Please fix the following issues:",
          errors: formattedErrors,
        },
        { status: 400 }
      );
    }

    const { name, email, message } = validation.data;

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      try {
        const formattedDate = new Date().toLocaleString('en-US', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        // Helper function to escape HTML and prevent XSS
        const escapeHtml = (text) => {
          const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;',
          };
          return text.replace(/[&<>"']/g, (m) => map[m]);
        };

        const { data, error } = await resend.emails.send({
          from: `Contact Form <${senderEmail}>`,
          to: process.env.ADMIN_EMAIL,
          replyTo: email,
          subject: `New Message: ${escapeHtml(name)}`,
          html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
              <p><strong>Name:</strong> ${escapeHtml(name)}</p>
              <p><strong>Email:</strong> ${escapeHtml(email)}</p>
              <p><strong>Date:</strong> ${escapeHtml(formattedDate)}</p>
              <p><strong>Message:</strong></p>
              <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
            </div>
          `,
        });
        if (error || !data?.id) {
          if (process.env.NODE_ENV === 'development') {
            console.error('Resend rejected contact email:', error);
          }
          return NextResponse.json(
            { success: false, error: 'Your message could not be delivered. Please try again later.' },
            { status: 502 }
          );
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Contact email delivery failed:', error);
        }
        return NextResponse.json(
          { success: false, error: 'Your message could not be delivered. Please try again later.' },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Email service is not configured.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Message sent successfully! I will get back to you soon.",
        data: { timestamp: new Date().toISOString() }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while processing your request. Please try again later."
      },
      { status: 500 }
    );
  }
}
