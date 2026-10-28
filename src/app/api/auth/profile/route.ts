import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const user = await db.getUserById(uid);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, user },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, ...updates } = body;

    if (!uid) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await db.getUserById(uid);
    if (!existingUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const updatedUser = {
      ...existingUser,
      ...updates,
      uid, // preserve uid
      updatedAt: new Date().toISOString()
    };

    await db.saveUser(updatedUser);

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
