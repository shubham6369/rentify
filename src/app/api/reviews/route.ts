import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StayCategory } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const hotelId = searchParams.get('hotelId') || undefined;
    const reviews = await db.getReviews(hotelId);
    return NextResponse.json(
      { success: true, count: reviews.length, reviews },
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
    const { hotelId, bookingId, userId, userName, rating, comment, stayCategory } = body;

    if (!hotelId || !rating || !comment) {
      return NextResponse.json({ success: false, message: 'Hotel, rating, and comment are required' }, { status: 400 });
    }

    const review = await db.createReview({
      hotelId,
      bookingId,
      userId: userId || 'demo_user',
      userName: userName || 'Verified Guest',
      rating: Math.min(5, Math.max(1, Number(rating))),
      comment,
      stayCategory: (stayCategory as StayCategory) || 'trip'
    });

    return NextResponse.json({
      success: true,
      message: 'Review posted successfully!',
      review
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId') || searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ success: false, message: 'Review ID is required' }, { status: 400 });
    }

    const deleted = await db.deleteReview(reviewId);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

