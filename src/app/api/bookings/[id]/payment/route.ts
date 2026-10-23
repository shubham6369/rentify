import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { amount, method = 'Cash / Desk POS', recordedBy } = await req.json();

    const booking = db.getBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const payNum = Number(amount);
    if (isNaN(payNum) || payNum <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid payment amount' }, { status: 400 });
    }

    const newPaidAmount = booking.paidAmount + payNum;
    const newRemainingBalance = Math.max(0, booking.totalAmount - newPaidAmount);
    const newPaymentStatus = newRemainingBalance === 0 ? 'fully_paid' : 'advance_paid';

    const updated = db.updateBooking(id, {
      paidAmount: newPaidAmount,
      remainingBalance: newRemainingBalance,
      paymentStatus: newPaymentStatus,
      internalNotes: [
        ...(booking.internalNotes || []),
        `Counter payment of ₹${payNum} recorded by ${recordedBy || 'Front Desk'} via ${method} on ${new Date().toLocaleString()}`
      ]
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${payNum} recorded successfully!`,
      booking: updated
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}
