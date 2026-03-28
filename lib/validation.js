import { z } from 'zod';

/**
 * Validation schema for contact form submissions
 */
export const contactSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be less than 2000 characters')
    .trim(),
  // Honeypot field - should always be empty
  website: z.string().max(0).optional().default(''),
});

/**
 * Sanitizes user input to prevent XSS and injection attacks
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  // Properly escape HTML entities
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return input.replace(/[&<>"']/g, (m) => map[m]).trim();
}

/**
 * Validates contact form data
 * @param {Object} data - Form data to validate
 * @returns {Object} - { success: boolean, data?: object, errors?: object }
 */
export function validateContactForm(data) {
  try {
    const validated = contactSchema.parse(data);

    // Check honeypot field
    if (validated.website && validated.website.length > 0) {
      return {
        success: false,
        errors: { message: 'Invalid submission detected' },
      };
    }

    return {
      success: true,
      data: {
        name: sanitizeInput(validated.name),
        email: sanitizeInput(validated.email),
        message: sanitizeInput(validated.message),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    return {
      success: false,
      errors: { message: 'Validation failed' },
    };
  }
}
