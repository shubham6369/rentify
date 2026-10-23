import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const metrics = db.getMetrics();
    const hotels = db.getHotels({ includeAll: true });
    const pendingApprovals = hotels.filter((h) => h.approvalStatus === 'pending');
    const bookings = db.getBookings({});

    return NextResponse.json({
      success: true,
      metrics: {
        ...metrics,
        pendingApprovalsCount: pendingApprovals.length,
        totalHotelsCount: hotels.length,
        confirmedBookingsCount: bookings.filter((b) => b.bookingStatus === 'confirmed').length,
        pendingBookingsCount: bookings.filter((b) => b.bookingStatus === 'pending').length,
        cancelledBookingsCount: bookings.filter((b) => b.bookingStatus === 'cancelled').length
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
