import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const settings = db.getSettings();
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error loading settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = db.updateSettings(body);
    return NextResponse.json({
      success: true,
      message: 'Platform settings saved successfully',
      settings: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error updating settings' },
      { status: 500 }
    );
  }
}
