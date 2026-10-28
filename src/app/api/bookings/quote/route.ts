import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StayCategory } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const {
      hotelId,
      roomId,
      stayCategory,
      durationMonths = 1,
      numberOfNights = 1,
      roomQuantity = 1,
      payFull = false
    } = await req.json();

    const hotel = await db.getHotelById(hotelId);
    if (!hotel) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const rooms = await db.getRoomsByHotel(hotelId);
    const room = rooms.find((r) => r.roomId === roomId) || rooms[0];

    let baseAmount = 0;
    let securityDeposit = 0;

    if (stayCategory === 'student' || hotel.category === 'student') {
      const monthlyRate = room?.monthlyPrice || hotel.monthlyRent || hotel.startingPrice || 10000;
      const months = Math.max(1, Number(durationMonths) || 1);
      baseAmount = monthlyRate * months;
      securityDeposit = hotel.securityDeposit || 10000;
    } else {
      const nightlyRate = room?.basePrice || hotel.startingPrice || 2500;
      const nights = Math.max(1, Number(numberOfNights) || 1);
      const qty = Math.max(1, Number(roomQuantity) || 1);
      baseAmount = nightlyRate * nights * qty;
    }

    const gstPercentage = hotel.gstPercentage || (hotel.category === 'student' ? 5 : 12);
    const serviceFeePercentage = hotel.serviceFeePercentage || 2;

    const taxes = Math.round(baseAmount * (gstPercentage / 100));
    const fees = Math.round(baseAmount * (serviceFeePercentage / 100));
    const totalAmount = baseAmount + taxes + fees + securityDeposit;

    let advanceAmount = 0;
    if (payFull) {
      advanceAmount = totalAmount;
    } else if (stayCategory === 'student' || hotel.category === 'student') {
      // In student stay, the required advance is typically the security deposit + 1st month or the fixed advance
      advanceAmount = hotel.advancePaymentType === 'fixed'
        ? Math.min(hotel.advancePaymentValue || securityDeposit, totalAmount)
        : Math.round(totalAmount * ((hotel.advancePaymentValue || 30) / 100));
    } else {
      // Family or Trip Stay: configurable advance %
      const pct = hotel.advancePaymentValue || 30;
      advanceAmount = Math.round(totalAmount * (pct / 100));
    }

    // Ensure advanceAmount does not exceed totalAmount
    advanceAmount = Math.min(advanceAmount, totalAmount);
    const remainingBalance = Math.max(0, totalAmount - advanceAmount);

    return NextResponse.json({
      success: true,
      quote: {
        baseAmount,
        taxes,
        fees,
        securityDeposit,
        totalAmount,
        advanceAmount,
        remainingBalance,
        numberOfNights,
        durationMonths,
        roomQuantity
      }
    });
  } catch (error: any) {
    console.error('Quote error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error calculating quote' },
      { status: 500 }
    );
  }
}
