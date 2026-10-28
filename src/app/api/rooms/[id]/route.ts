import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateRoom(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Room updated successfully',
      room: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteRoom(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
