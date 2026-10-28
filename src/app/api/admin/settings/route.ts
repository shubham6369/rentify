import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const settings = await db.getSettings();
    return NextResponse.json(
      {
        success: true,
        settings
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
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
    const updated = await db.updateSettings(body);
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
