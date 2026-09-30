import { NextResponse } from 'next/server';
import {
  verifyAdminPassword,
  createAdminSession,
  destroyAdminSession,
  checkAdminAuth,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const isAuth = await checkAdminAuth(request);
  return NextResponse.json({ authenticated: isAuth });
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const token = await createAdminSession();

    return NextResponse.json({
      success: true,
      message: 'Authenticated successfully',
      token,
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  await destroyAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out successfully' });
}
