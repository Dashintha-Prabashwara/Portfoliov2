import { cookies } from 'next/headers';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 'dashijay_cms_secret_token_2026';

function generateToken() {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(ADMIN_PASSWORD)
    .digest('hex');
}

export function verifyAdminPassword(inputPassword) {
  if (!inputPassword) return false;
  return inputPassword === ADMIN_PASSWORD;
}

export async function createAdminSession() {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set('cms_auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  return token;
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('cms_auth_token');
}

export async function checkAdminAuth(request = null) {
  try {
    let token = null;

    if (request) {
      // Check Bearer header if passed
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get('cms_auth_token');
      token = cookie?.value;
    }

    if (!token) return false;

    const expectedToken = generateToken();
    return token === expectedToken;
  } catch (err) {
    console.error('Error verifying admin auth:', err);
    return false;
  }
}
