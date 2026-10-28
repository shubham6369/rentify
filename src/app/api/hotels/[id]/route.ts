import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const hotel = await db.getHotelById(id);

    if (!hotel) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    const rooms = await db.getRoomsByHotel(hotel.hotelId);
    const reviews = await db.getReviews(hotel.hotelId);

    return NextResponse.json(
      {
        success: true,
        hotel: {
          ...hotel,
          rooms,
          reviews
        }
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db.updateHotel(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Property updated successfully',
      hotel: updated
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.deleteHotel(id);

    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Property removed successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
