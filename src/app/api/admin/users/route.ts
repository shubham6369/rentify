import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const users = db.getAllUsers();
    return NextResponse.json({
      success: true,
      count: users.length,
      users
    });
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
    const { uid, role } = body;

    if (!uid || !role) {
      return NextResponse.json(
        { success: false, message: 'User ID and Role are required' },
        { status: 400 }
      );
    }

    const user = db.getUserById(uid);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    user.role = role as UserRole;
    user.updatedAt = new Date().toISOString();
    db.saveUser(user);

    return NextResponse.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      user
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating user' },
      { status: 500 }
    );
  }
}
