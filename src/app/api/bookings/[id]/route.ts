import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = db.getBookingById(id);

    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const hotel = db.getHotelById(booking.hotelId);

    return NextResponse.json({
      success: true,
      booking,
      hotel
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, reason, cancelNotes } = body;

    const booking = db.getBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      const hotel = db.getHotelById(booking.hotelId);
      const freeHours = hotel?.freeCancellationHours || 48;
      const feePct = hotel?.cancellationFeePercentage || 10;

      // Calculate if eligible for refund
      const checkInTime = new Date(booking.checkIn).getTime();
      const hoursUntilCheckIn = (checkInTime - Date.now()) / (1000 * 60 * 60);

      let refundAmount = 0;
      if (hoursUntilCheckIn >= freeHours) {
        // Full refund of paid advance
        refundAmount = booking.paidAmount;
      } else {
        // Partial refund minus cancellation fee
        const fee = Math.round(booking.paidAmount * (feePct / 100));
        refundAmount = Math.max(0, booking.paidAmount - fee);
      }

      const updated = db.updateBooking(booking.bookingId, {
        bookingStatus: 'cancelled',
        paymentStatus: refundAmount > 0 ? 'refunded' : booking.paymentStatus,
        cancellationDetails: {
          cancelledAt: new Date().toISOString(),
          refundAmount,
          reason: reason || 'Cancelled by guest'
        },
        internalNotes: [
          ...(booking.internalNotes || []),
          `Cancelled on ${new Date().toLocaleString()}. Refund calculated: ₹${refundAmount}`
        ]
      });

      return NextResponse.json({
        success: true,
        message: 'Booking cancelled successfully',
        booking: updated,
        refundAmount
      });
    }

    // Generic updates
    const updated = db.updateBooking(id, body);
    return NextResponse.json({
      success: true,
      booking: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
