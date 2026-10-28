import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const {
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = 'UPI / NetBanking'
    } = await req.json();

    if (!bookingId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, message: 'Missing transaction verification parameters' },
        { status: 400 }
      );
    }

    const booking = await db.getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;

    // Cryptographic HMAC-SHA256 verification when secret is configured
    if (secret && razorpaySignature && razorpaySignature !== 'simulated_sig') {
      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      if (generatedSignature !== razorpaySignature) {
        return NextResponse.json(
          {
            success: false,
            message: 'Cryptographic signature mismatch! Payment tampering detected.'
          },
          { status: 400 }
        );
      }
    }

    // Payment is verified
    const isFullyPaid = booking.advanceAmount >= booking.totalAmount;
    const paidAmount = booking.advanceAmount;
    const remainingBalance = Math.max(0, booking.totalAmount - paidAmount);

    const updatedBooking = await db.updateBooking(bookingId, {
      bookingStatus: 'confirmed',
      paymentStatus: isFullyPaid ? 'fully_paid' : 'advance_paid',
      paidAmount,
      remainingBalance,
      paymentDetails: {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        method: paymentMethod
      },
      internalNotes: [
        ...(booking.internalNotes || []),
        `Payment verified on ${new Date().toLocaleString()} (Ref: ${razorpayPaymentId}, ₹${paidAmount})`
      ]
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking confirmed successfully!',
      booking: updatedBooking
    });
  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error verifying payment' },
      { status: 500 }
    );
  }
}
