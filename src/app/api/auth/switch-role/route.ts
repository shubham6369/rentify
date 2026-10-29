import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    if (!role || !['customer', 'property_owner', 'admin'].includes(role)) {
      return NextResponse.json({ success: false, message: 'Invalid role' }, { status: 400 });
    }

    let targetUser = await db.getUserById(`demo_${role}_user`);

    if (!targetUser) {
      // Fallback: create role user
      targetUser = {
        uid: `demo_${role}_user`,
        fullName: role === 'admin' ? 'System Administrator' : role === 'property_owner' ? 'Suresh Properties' : 'Aarav Sharma',
        email: `${role}@findyourstay.in`,
        phone: '+91 98765 00000',
        phoneVerified: true,
        emailVerified: true,
        role: role as UserRole,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${role}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveUser(targetUser);
    }

    return NextResponse.json({
      success: true,
      message: `Switched active role to ${role}`,
      user: targetUser
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
