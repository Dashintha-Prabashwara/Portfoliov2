import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Contact from '@/models/Contact';
import { validateContactForm } from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rateLimiter';
import { sendContactNotification } from '@/lib/email';

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const clientIp = getClientIp(request);

    // Apply rate limiting
    const rateLimitResult = checkRateLimit(clientIp);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX_REQUESTS || '5',
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    // Parse request body
    const body = await request.json();

    // Validate input
    const validation = validateContactForm(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Create contact record (excluding honeypot field)
    const contact = await Contact.create({
      name: validation.data.name,
      email: validation.data.email,
      message: validation.data.message,
      ipAddress: clientIp,
    });

    if (process.env.NODE_ENV === 'development') {
      console.log('New contact submission:', {
        id: contact._id,
        email: contact.email,
        timestamp: contact.createdAt,
      });
    }

    // Send email notification to admin
    const emailResult = await sendContactNotification({
      name: validation.data.name,
      email: validation.data.email,
      message: validation.data.message,
    });

    if (!emailResult.success && !emailResult.skipped) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Email notification failed:', emailResult.error);
      }
    }

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully! I will get back to you soon.',
        data: {
          id: contact._id,
          timestamp: contact.createdAt,
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': process.env.RATE_LIMIT_MAX_REQUESTS || '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Contact API Error:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          errors: Object.keys(error.errors).reduce((acc, key) => {
            acc[key] = error.errors[key].message;
            return acc;
          }, {}),
        },
        { status: 400 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred while processing your request. Please try again later.',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/contact
 * Optionally retrieve contact submissions (admin only - add auth in production)
 */
export async function GET(request) {
  try {
    // NOTE: In production, add authentication here
    // For now, this endpoint is disabled for security

    return NextResponse.json(
      {
        success: false,
        error: 'Endpoint not available',
      },
      { status: 403 }
    );

    // Example implementation (uncomment with auth):
    // await connectToDatabase();
    // const contacts = await Contact.find().sort({ createdAt: -1 }).limit(50);
    // return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Contact GET Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
