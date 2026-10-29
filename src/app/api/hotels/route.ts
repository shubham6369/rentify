import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { StayCategory, PropertyType, ApprovalStatus, Hotel } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as StayCategory | null;
    const city = searchParams.get('city');
    const propertyType = searchParams.get('propertyType') as PropertyType | null;
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const ownerId = searchParams.get('ownerId');
    const approvalStatus = searchParams.get('approvalStatus') as ApprovalStatus | null;
    const includeAll = searchParams.get('includeAll') === 'true';
    const lat = searchParams.get('lat') ? Number(searchParams.get('lat')) : undefined;
    const lng = searchParams.get('lng') ? Number(searchParams.get('lng')) : undefined;

    const filterOptions: any = {};
    if (category) filterOptions.category = category;
    if (city) filterOptions.city = city;
    if (propertyType) filterOptions.propertyType = propertyType;
    if (search) filterOptions.search = search;
    if (minPrice !== undefined) filterOptions.minPrice = minPrice;
    if (maxPrice !== undefined) filterOptions.maxPrice = maxPrice;
    if (ownerId) filterOptions.ownerId = ownerId;
    if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
      filterOptions.lat = lat;
      filterOptions.lng = lng;
    }

    if (!includeAll && !approvalStatus) {
      filterOptions.approvalStatus = 'approved';
    } else if (approvalStatus) {
      filterOptions.approvalStatus = approvalStatus;
    }

    const hotels = await db.getHotels(filterOptions);

    return NextResponse.json(
      {
        success: true,
        count: hotels.length,
        hotels
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error: any) {
    console.error('Fetch hotels error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error fetching accommodations' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      category,
      propertyType,
      address,
      city,
      state,
      country = 'India',
      postalCode,
      description,
      monthlyRent,
      securityDeposit,
      startingPrice,
      advancePaymentType = 'percentage',
      advancePaymentValue = 30,
      amenities = [],
      rules = [],
      coverImage,
      images = [],
      ownerId,
      ownerRole
    } = body;

    if (!name || !category || !city || !address) {
      return NextResponse.json(
        { success: false, message: 'Name, category, city, and address are required' },
        { status: 400 }
      );
    }

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const isDirectAdmin = ownerRole === 'admin';

    const newHotel: Omit<Hotel, 'hotelId' | 'createdAt' | 'updatedAt'> = {
      name,
      slug,
      category,
      propertyType: propertyType || (category === 'student' ? 'hostel' : category === 'family' ? 'villa' : 'hotel'),
      description: description || `${name} located in ${city}.`,
      address,
      city,
      state: state || city,
      country,
      postalCode: postalCode || '560001',
      monthlyRent: category === 'student' ? Number(monthlyRent || startingPrice || 10000) : undefined,
      securityDeposit: category === 'student' ? Number(securityDeposit || 12000) : undefined,
      startingPrice: Number(startingPrice || monthlyRent || 2500),
      advancePaymentType,
      advancePaymentValue: Number(advancePaymentValue || 30),
      gstPercentage: 12,
      serviceFeePercentage: 3,
      freeCancellationHours: 48,
      cancellationFeePercentage: 10,
      cancellationDescription: 'Full advance refund if cancelled 48 hours prior to check-in/move-in.',
      status: 'published',
      approvalStatus: isDirectAdmin ? 'approved' : 'pending',
      ownerId: ownerId || 'admin_user',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      images: images.length > 0 ? images : [coverImage || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'],
      amenities: amenities.length > 0 ? amenities : ['Wi-Fi', 'Air Conditioning', 'Power Backup'],
      rules: rules.length > 0 ? rules : ['Valid Government ID required at check-in', 'No smoking in common areas'],
      rating: 5.0,
      reviewCount: 1,
      featured: false
    };

    const created = await db.createHotel(newHotel);

    // Create a default room for this hotel
    await db.createRoom({
      hotelId: created.hotelId,
      roomType: category === 'student' ? 'Single Student Bed with Study Pod' : category === 'family' ? 'Full Family Villa Suite' : 'Deluxe King Suite',
      description: 'Fully furnished with air conditioning, premium linen, and fast Wi-Fi.',
      capacity: {
        adults: category === 'student' ? 1 : category === 'family' ? 4 : 2,
        children: category === 'family' ? 2 : 0,
        maxGuests: category === 'student' ? 1 : category === 'family' ? 6 : 3
      },
      totalInventory: 5,
      bedType: category === 'student' ? 'Single Bed' : 'King Bed',
      basePrice: created.startingPrice,
      monthlyPrice: created.monthlyRent,
      amenities: created.amenities,
      images: created.images,
      enabled: true
    });

    return NextResponse.json({
      success: true,
      message: isDirectAdmin
        ? 'Property published successfully!'
        : 'Property submitted! It is now pending administrator review.',
      hotel: created
    });
  } catch (error: any) {
    console.error('Create hotel error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Server error creating property' },
      { status: 500 }
    );
  }
}
