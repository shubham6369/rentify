import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const users = await db.getAllUsers();
    return NextResponse.json(
      {
        success: true,
        count: users.length,
        users
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error loading users' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, role, ...otherUpdates } = body;

    if (!uid) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const updates: any = { ...otherUpdates };
    if (role) {
      updates.role = role as UserRole;
    }

    const updated = await db.updateUser(uid, updates);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating user' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json({ success: false, message: 'User ID is required' }, { status: 400 });
    }

    const deleted = await db.deleteUser(uid);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error deleting user' },
      { status: 500 }
    );
  }
}

