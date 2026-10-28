import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const [metrics, hotels, bookings] = await Promise.all([
      db.getMetrics(),
      db.getHotels({ includeAll: true }),
      db.getBookings({})
    ]);

    const pendingApprovals = hotels.filter((h) => h.approvalStatus === 'pending');

    return NextResponse.json(
      {
        success: true,
        metrics: {
          ...metrics,
          pendingApprovalsCount: pendingApprovals.length,
          totalHotelsCount: hotels.length,
          confirmedBookingsCount: bookings.filter((b) => b.bookingStatus === 'confirmed').length,
          pendingBookingsCount: bookings.filter((b) => b.bookingStatus === 'pending').length,
          cancelledBookingsCount: bookings.filter((b) => b.bookingStatus === 'cancelled').length
        }
      },
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
