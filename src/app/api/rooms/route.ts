import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId');

    if (!hotelId) {
      return NextResponse.json({ success: false, message: 'hotelId parameter is required' }, { status: 400 });
    }

    const rooms = await db.getRooms(hotelId);
    return NextResponse.json(
      { success: true, count: rooms.length, rooms },
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hotelId, roomType, description, capacity, bedType, basePrice, monthlyPrice, amenities, images, totalInventory } = body;

    if (!hotelId || !roomType || !basePrice) {
      return NextResponse.json(
        { success: false, message: 'hotelId, roomType, and basePrice are required' },
        { status: 400 }
      );
    }

    const newRoom = await db.createRoom({
      hotelId,
      roomType,
      description: description || '',
      capacity: capacity || { adults: 2, children: 1, maxGuests: 3 },
      totalInventory: totalInventory || 5,
      bedType: bedType || 'Queen Bed',
      basePrice: Number(basePrice),
      monthlyPrice: monthlyPrice ? Number(monthlyPrice) : undefined,
      amenities: amenities || ['Air Conditioning', 'Free High-Speed Wi-Fi', 'Ensuite Bathroom'],
      images: images || ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
      enabled: true
    });

    return NextResponse.json({
      success: true,
      message: 'Room created successfully',
      room: newRoom
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error creating room' }, { status: 500 });
  }
}
