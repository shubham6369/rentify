import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StayCategory, BookingStatus } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const hotelId = searchParams.get('hotelId');
    const role = searchParams.get('role');
    const category = searchParams.get('category') as StayCategory | null;
    const status = searchParams.get('status') as BookingStatus | null;

    let bookings = db.getBookings({
      userId: role === 'admin' ? undefined : (userId || undefined),
      hotelId: hotelId || undefined
    });

    if (category) {
      bookings = bookings.filter((b) => b.stayCategory === category);
    }

    if (status) {
      bookings = bookings.filter((b) => b.bookingStatus === status);
    }

    // Sort newest first
    bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
