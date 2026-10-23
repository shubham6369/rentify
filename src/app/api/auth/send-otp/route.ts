import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const target = (body.phone || body.email || '').trim();

    if (!target) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid mobile number or email' },
        { status: 400 }
      );
    }

    // Always use default bypass OTP 5556
    const defaultOtp = '5556';

    // Store in DB with 60-minute TTL
    db.saveOtp(target, defaultOtp, 60);

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to ${target}`,
      otpPreview: defaultOtp
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error while sending OTP' },
      { status: 500 }
    );
  }
}
