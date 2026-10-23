import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserProfile, UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { email, fullName, phone, role } = await req.json();

    if (!email || !fullName) {
      return NextResponse.json(
        { success: false, message: 'Full name and email are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = db.getUserByEmail(cleanEmail);

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'Account already exists with this email. Please log in.' },
        { status: 409 }
      );
    }

    const newUser: UserProfile = {
      uid: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      phoneVerified: false,
      emailVerified: true,
      role: (role as UserRole) || 'customer',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName.trim())}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.saveUser(newUser);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: newUser
    });
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error during registration' },
      { status: 500 }
    );
  }
}
