import { z } from 'zod';

/**
 * Environment variable validation schema
 * All required variables must be present and valid
 */
const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().url('Invalid MongoDB URI'),

  // Email Service
  RESEND_API_KEY: z.string().optional().default(''),
  ADMIN_EMAIL: z.string().email('Invalid admin email').optional().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('5'),

  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

let validatedEnv = null;

/**
 * Get validated environment variables
 * Validates on first call and caches the result
 */
export function getValidatedEnv() {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    const parsed = envSchema.parse(process.env);
    validatedEnv = parsed;
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Environment validation failed:\n', issues);
      }

      // In production, throw error. In development, log warning
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Invalid environment configuration');
      }

      return envSchema.parse(process.env);
    }

    throw error;
  }
}

/**
 * Validate required email configuration
 */
export function validateEmailConfig() {
  const env = getValidatedEnv();

  if (!env.RESEND_API_KEY || !env.ADMIN_EMAIL) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Email service not fully configured. Contact notifications disabled.');
    }
    return false;
  }

  return true;
}

export default getValidatedEnv();
