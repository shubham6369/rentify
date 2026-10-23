import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email address is required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUserByEmail(cleanEmail);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'No account found with this email. Please register.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error during login' },
      { status: 500 }
    );
  }
}
