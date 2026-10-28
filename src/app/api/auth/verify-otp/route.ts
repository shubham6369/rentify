import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { UserProfile, UserRole } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = (body.phone || body.email || '').trim();
    const cleanOtp = (body.otp || '').trim();
    const fullName = body.fullName;
    const role = body.role;

    if (!target || !cleanOtp) {
      return NextResponse.json(
        { success: false, message: 'Contact detail (phone/email) and OTP are required' },
        { status: 400 }
      );
    }

    // Bypass authentication whenever OTP is 5556, 123456, or DB matched
    const isBypass = cleanOtp === '5556' || cleanOtp === '123456';
    const isValid = isBypass || db.verifyOtp(target, cleanOtp);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired OTP. Please use default OTP: 5556' },
        { status: 401 }
      );
    }

    const isEmail = target.includes('@');
    // Check if user already exists
    let user = isEmail ? await db.getUserByEmail(target) : await db.getUserByPhone(target);

    if (!user) {
      // Create new user profile
      const newUid = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      user = {
        uid: newUid,
        fullName: fullName || (isEmail ? target.split('@')[0] : `User ${target.slice(-4)}`),
        email: isEmail ? target : `${target.replace(/[^0-9]/g, '')}@phone.findyourstay.in`,
        phone: isEmail ? '+91 98765 43210' : target,
        phoneVerified: true,
        emailVerified: true,
        role: (role as UserRole) || 'customer',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await db.saveUser(user);
    } else {
      user.phoneVerified = true;
      user.emailVerified = true;
      user.updatedAt = new Date().toISOString();
      await db.saveUser(user);
    }

    return NextResponse.json({
      success: true,
      message: 'Mobile number verified successfully',
      user
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error while verifying OTP' },
      { status: 500 }
    );
  }
}
