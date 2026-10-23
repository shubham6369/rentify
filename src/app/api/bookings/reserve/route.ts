import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hotelId,
      roomId,
      userId,
      stayCategory,
      checkIn,
      checkOut,
      numberOfNights = 1,
      stayDurationMonths = 1,
      numberOfGuests = { adults: 1, children: 0 },
      roomQuantity = 1,
      guestDetails,
      studentDetails,
      familyDetails,
      tripDetails,
      totalAmount,
      advanceAmount,
      remainingBalance,
      payFull = false
    } = body;

    const hotel = db.getHotelById(hotelId);
    if (!hotel) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const rooms = db.getRoomsByHotel(hotelId);
    const room = rooms.find((r) => r.roomId === roomId) || rooms[0];

    // Generate unique booking reference like FYS-2026-STU-4921
    const categoryCode = (stayCategory || 'trip').substring(0, 3).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `FYS-${categoryCode}-${randomSuffix}`;

    // Calculate balance due date (e.g. checkIn date)
    const balanceDueDate = checkIn || new Date(Date.now() + 86400000).toISOString().split('T')[0];

    // Hold expires in 15 minutes if payment isn't completed
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const booking = db.createBooking({
      bookingReference,
      userId: userId || 'demo_user_student',
      hotelId,
      hotelName: hotel.name,
      roomId: room?.roomId || 'room_default',
      roomTypeName: room?.roomType || 'Standard Accommodation',
      stayCategory: stayCategory || hotel.category,
      checkIn: checkIn || new Date().toISOString().split('T')[0],
      checkOut: checkOut || undefined,
      numberOfNights: Number(numberOfNights) || 1,
      stayDurationMonths: stayCategory === 'student' ? Number(stayDurationMonths) || 1 : undefined,
      numberOfGuests,
      roomQuantity: Number(roomQuantity) || 1,
      guestDetails: guestDetails || {
        fullName: 'Valued Guest',
        email: 'guest@findyourstay.in',
        phone: '+91 98765 43210'
      },
      studentDetails: stayCategory === 'student' ? studentDetails : undefined,
      familyDetails: stayCategory === 'family' ? familyDetails : undefined,
      tripDetails: stayCategory === 'trip' ? tripDetails : undefined,
      totalAmount: Number(totalAmount),
      advanceAmount: Number(advanceAmount),
      paidAmount: 0,
      remainingBalance: Number(remainingBalance),
      bookingStatus: 'pending',
      paymentStatus: 'pending',
      balanceDueDate,
      holdExpiresAt,
      internalNotes: [`Reserved at ${new Date().toLocaleString()}`]
    });

    // Create Razorpay Order
    let razorpayOrderId = `order_sim_${Date.now()}`;
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder';
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret && keyId !== 'rzp_test_placeholder') {
      try {
        const razorpay = new Razorpay({
          key_id: keyId,
          key_secret: keySecret
        });

        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(advanceAmount * 100), // amount in paise
          currency: 'INR',
          receipt: bookingReference,
          notes: {
            bookingId: booking.bookingId,
            stayCategory: booking.stayCategory,
            hotelName: hotel.name
          }
        });

        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('Razorpay live order creation failed, falling back to simulated order:', rzpErr);
      }
    }

    // Attach order ID to booking
    db.updateBooking(booking.bookingId, {
      paymentDetails: {
        razorpayOrderId
      }
    });

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        paymentDetails: { razorpayOrderId }
      },
      razorpayOrder: {
        id: razorpayOrderId,
        amount: Math.round(advanceAmount * 100),
        currency: 'INR',
        key: keyId
      }
    });
  } catch (error: any) {
    console.error('Reservation error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error creating reservation' },
      { status: 500 }
    );
  }
}
