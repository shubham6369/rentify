import fs from 'fs';
import path from 'path';
import { Hotel, Room, Booking, Review, UserProfile, StayCategory, ApprovalStatus } from '@/types';

interface DatabaseSchema {
  hotels: Hotel[];
  rooms: Room[];
  bookings: Booking[];
  reviews: Review[];
  users: UserProfile[];
  otps: { phone: string; otp: string; expiresAt: number }[];
}

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const INITIAL_HOTELS: Hotel[] = [
  // 1. Student Stays
  {
    hotelId: 'stu_hostel_blr_1',
    name: 'Oxford Scholars Luxury Hostel & Co-Living',
    slug: 'oxford-scholars-hostel-bangalore',
    description: 'Premier student residence tailored for university scholars and interns. Features ergonomic study pods, 300 Mbps symmetrical Wi-Fi, 4 wholesome home-style meals daily, library, and 24/7 biometric security.',
    category: 'student',
    propertyType: 'hostel',
    address: 'Near Christ University Main Gate, SG Palya, Koramangala',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    postalCode: '560029',
    monthlyRent: 11500,
    securityDeposit: 15000,
    startingPrice: 11500,
    advancePaymentType: 'fixed',
    advancePaymentValue: 15000,
    gstPercentage: 5,
    serviceFeePercentage: 2,
    freeCancellationHours: 72,
    cancellationFeePercentage: 10,
    cancellationDescription: 'Full security deposit refund up to 72 hours prior to semester move-in date.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      '300 Mbps Dedicated Wi-Fi',
      '4-Time Nutritious Mess Meals',
      'Quiet Study Library',
      'Biometric Access & CCTV',
      'Laundry & Housekeeping',
      'RO Drinking Water',
      'Power Backup 24/7'
    ],
    rules: [
      'Student ID & College Verification Required',
      'Curfew: 10:30 PM (Exceptions with Parent Approval)',
      'Visitors permitted in lounge area until 7:00 PM',
      'Non-smoking & Alcohol-free academic premises'
    ],
    nearbyLandmarks: ['Christ University (300m)', 'Forum Mall (1.2km)', 'Koramangala Metro (1.5km)'],
    rating: 4.8,
    reviewCount: 42,
    featured: true,
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-02-01T00:00:00.000Z'
  },
  {
    hotelId: 'stu_pg_delhi_2',
    name: 'Apex North Campus Premium PG',
    slug: 'apex-north-campus-delhi',
    description: 'Modern student accommodations across Delhi University North Campus. Fully air-conditioned twin and single rooms with attached bathrooms, study desks, and healthy hygienic meals.',
    category: 'student',
    propertyType: 'pg',
    address: 'Hudson Lane, GTB Nagar, North Campus',
    city: 'Delhi',
    state: 'Delhi',
    country: 'India',
    postalCode: '110009',
    monthlyRent: 9800,
    securityDeposit: 12000,
    startingPrice: 9800,
    advancePaymentType: 'fixed',
    advancePaymentValue: 12000,
    gstPercentage: 5,
    serviceFeePercentage: 2,
    freeCancellationHours: 48,
    cancellationFeePercentage: 15,
    cancellationDescription: 'Refundable security deposit with 48h prior notice.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'High-Speed Wi-Fi',
      'All-Inclusive Meals (Veg/Non-Veg)',
      'Split Air Conditioners',
      'Attached Bathrooms with Geysers',
      'Daily Room Cleaning',
      'Washing Machines'
    ],
    rules: [
      'Valid University ID card mandatory',
      'Silent study hours from 11:00 PM to 6:00 AM'
    ],
    nearbyLandmarks: ['GTB Nagar Metro (400m)', 'SRCC (800m)', 'Hindu College (1km)'],
    rating: 4.7,
    reviewCount: 38,
    featured: true,
    createdAt: '2026-01-20T00:00:00.000Z',
    updatedAt: '2026-02-05T00:00:00.000Z'
  },
  {
    hotelId: 'stu_coliving_pune_3',
    name: 'Horizon Campus Suites & Co-Living',
    slug: 'horizon-campus-suites-pune',
    description: 'Youth co-living community in Viman Nagar near Symbiosis. Includes gaming arena, shared kitchen, fitness studio, co-working workstations, and vibrant weekend social events.',
    category: 'student',
    propertyType: 'hostel',
    address: 'Near Symbiosis International School, Viman Nagar',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    postalCode: '411014',
    monthlyRent: 12500,
    securityDeposit: 15000,
    startingPrice: 12500,
    advancePaymentType: 'fixed',
    advancePaymentValue: 15000,
    gstPercentage: 5,
    serviceFeePercentage: 2,
    freeCancellationHours: 72,
    cancellationFeePercentage: 10,
    cancellationDescription: 'Advance deposit returned if canceled before move-in date.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Gaming Zone & PS5 Lounge',
      'High-Speed Wi-Fi',
      'Fitness Gym',
      'Communal Chef Kitchen',
      'Bi-weekly Housekeeping'
    ],
    rules: ['Quiet hours post midnight', 'No unauthorized overnight guests'],
    nearbyLandmarks: ['Symbiosis Campus (600m)', 'Phoenix Marketcity (1.5km)', 'Pune Airport (2km)'],
    rating: 4.9,
    reviewCount: 56,
    featured: true,
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z'
  },

  // 2. Family Stays
  {
    hotelId: 'fam_villa_goa_1',
    name: 'Sea Breeze Infinity Pool Villa',
    slug: 'sea-breeze-infinity-villa-goa',
    description: 'Lavish 4-bedroom beachfront private villa nestled amidst swaying coconut groves. Features private azure swimming pool, modular kitchen with child feeding seats, toddler safety gates, and private chef on request.',
    category: 'family',
    propertyType: 'villa',
    address: 'Candolim Beach Road, North Goa',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    postalCode: '403515',
    startingPrice: 18500,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 3,
    freeCancellationHours: 48,
    cancellationFeePercentage: 20,
    cancellationDescription: 'Free cancellation up to 48 hours prior to check-in. 30% advance required online, remaining 70% payable at check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Private Swimming Pool',
      'Fully Equipped Modular Kitchen',
      'Child Safety Gates & Baby Cot',
      'Spacious Lawns & BBQ Gazebo',
      'High-Speed Wi-Fi & Smart TVs',
      'Dedicated Caretaker & Housekeeping',
      'Washing Machine & Dryer'
    ],
    rules: [
      'Perfect for families with children and grandparents',
      'No loud outdoor music after 10:00 PM (Local Noise Regulations)',
      'Pet friendly with prior notice'
    ],
    nearbyLandmarks: ['Candolim Beach (300m)', 'Fort Aguada (2km)', 'Calangute Market (3km)'],
    rating: 4.95,
    reviewCount: 78,
    featured: true,
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z'
  },
  {
    hotelId: 'fam_estate_shimla_2',
    name: 'Himalayan Cedar Pine Estate',
    slug: 'himalayan-cedar-estate-shimla',
    description: 'Charming 3-bedroom mountain chalet surrounded by deodar forests. Features floor-to-ceiling panoramic glass windows, cozy wooden fireplace, heated floors, and indoor board games for families.',
    category: 'family',
    propertyType: 'villa',
    address: 'Mashobra Forest Valley, Upper Shimla',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    postalCode: '171007',
    startingPrice: 14200,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 3,
    freeCancellationHours: 72,
    cancellationFeePercentage: 25,
    cancellationDescription: 'Free cancellation up to 72 hours prior to arrival. Pay 30% advance now, balance at check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Stone Fireplace & Radiators',
      'Family Dining Table (Seats 10)',
      'Board Games & Kid Book Corner',
      'Herbal Tea Garden',
      'Mountain Trekking Guide on Request'
    ],
    rules: ['Family-friendly environment', 'Smoking only in designated outdoor verandas'],
    nearbyLandmarks: ['Mashobra Ridge (1km)', 'Craignano Nature Park (2.5km)', 'Shimla Mall Road (10km)'],
    rating: 4.88,
    reviewCount: 52,
    featured: true,
    createdAt: '2026-01-25T00:00:00.000Z',
    updatedAt: '2026-02-18T00:00:00.000Z'
  },
  {
    hotelId: 'fam_haveli_udaipur_3',
    name: 'Lakefront Royal Heritage Haveli',
    slug: 'lakefront-royal-haveli-udaipur',
    description: 'Historic Mewari family residence fronting Lake Pichola. Restored with courtyards, fountain verandas, 5 large family bedrooms, and rooftop dining with royal palace views.',
    category: 'family',
    propertyType: 'villa',
    address: 'Hanuman Ghat, Outside Chandpole',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    postalCode: '313001',
    startingPrice: 22000,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 3,
    freeCancellationHours: 48,
    cancellationFeePercentage: 20,
    cancellationDescription: 'Free cancellation up to 48 hours prior to check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Lake Pichola Views',
      'Traditional Courtyard Lounge',
      'Royal Rajasthani Meals Available',
      'Family Suite Rooms with Extra Cots',
      'Doctor on Call 24/7'
    ],
    rules: ['Peaceful residential heritage enclave', 'No outdoor parties'],
    nearbyLandmarks: ['City Palace (800m)', 'Jagdish Temple (700m)', 'Bagore Ki Haveli (500m)'],
    rating: 4.92,
    reviewCount: 64,
    featured: true,
    createdAt: '2026-02-05T00:00:00.000Z',
    updatedAt: '2026-02-20T00:00:00.000Z'
  },

  // 3. Trip Stays
  {
    hotelId: 'trip_resort_goa_1',
    name: 'The Grand Azure Beachfront Resort & Spa',
    slug: 'grand-azure-beach-resort-goa',
    description: 'Five-star coastal sanctuary on Calangute Beach with direct beach access, infinity pool, Ayurvedic wellness spa, beachfront cocktail bar, and water sports excursions.',
    category: 'trip',
    propertyType: 'resort',
    address: 'Beachfront Boulevard, Calangute',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    postalCode: '403516',
    startingPrice: 7500,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 2,
    freeCancellationHours: 48,
    cancellationFeePercentage: 20,
    cancellationDescription: 'Free cancellation up to 48 hours prior to check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Direct Private Beach Access',
      'Infinity Pool with Ocean View',
      'Ayurvedic Luxury Spa',
      '24/7 Butler Service & Concierge',
      'Multi-cuisine Gourmet Restaurant'
    ],
    rules: ['Government photo ID required at check-in', 'Pool timing: 7:00 AM - 9:00 PM'],
    nearbyLandmarks: ['Calangute Beach (Direct)', 'Tito Lane Baga (1.5km)', 'Saturday Night Market (4km)'],
    rating: 4.9,
    reviewCount: 112,
    featured: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-02-15T00:00:00.000Z'
  },
  {
    hotelId: 'trip_hotel_shimla_2',
    name: 'Himalayan Peaks Luxury Alpine Hotel',
    slug: 'himalayan-peaks-hotel-shimla',
    description: 'Panoramic mountain sanctuary perched on the Jakhoo slopes. Enjoy snow-capped Himalayan vistas, glass tea lounges, and cedarwood interiors.',
    category: 'trip',
    propertyType: 'hotel',
    address: 'Near Jakhoo Temple Road',
    city: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    postalCode: '171001',
    startingPrice: 6200,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 2,
    freeCancellationHours: 48,
    cancellationFeePercentage: 20,
    cancellationDescription: 'Free cancellation up to 48 hours prior to check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Heated Alpine Jacuzzi',
      'Mountain View Private Balconies',
      'Bonfire & Barbecue Nights',
      'High-Speed Wi-Fi'
    ],
    rules: ['Check-in: 2:00 PM', 'Check-out: 11:00 AM'],
    nearbyLandmarks: ['Mall Road (1km)', 'Jakhoo Ropeway (400m)', 'Christ Church (1.2km)'],
    rating: 4.85,
    reviewCount: 84,
    featured: true,
    createdAt: '2026-01-12T00:00:00.000Z',
    updatedAt: '2026-02-10T00:00:00.000Z'
  },
  {
    hotelId: 'trip_palace_udaipur_3',
    name: 'Royal Lakefront Palace & Luxury Suites',
    slug: 'royal-lakefront-palace-udaipur',
    description: 'Exquisite regal hotel overlooking Lake Pichola. Features hand-painted frescoes, sunset boat cruises, royal dining, and luxury courtyards.',
    category: 'trip',
    propertyType: 'hotel',
    address: 'Lake Palace Road, Pichola',
    city: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    postalCode: '313001',
    startingPrice: 8900,
    advancePaymentType: 'percentage',
    advancePaymentValue: 30,
    gstPercentage: 12,
    serviceFeePercentage: 2,
    freeCancellationHours: 48,
    cancellationFeePercentage: 20,
    cancellationDescription: 'Free cancellation up to 48 hours prior to check-in.',
    status: 'published',
    approvalStatus: 'approved',
    ownerId: 'owner_demo_1',
    coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
    ],
    amenities: [
      'Sunset Lake Boat Cruises',
      'Marble Bathrooms & Bathtubs',
      'Rooftop Candlelight Dining',
      'Rajasthani Cultural Shows'
    ],
    rules: ['Valet parking provided', 'Smart casual attire in dining rooms'],
    nearbyLandmarks: ['City Palace (600m)', 'Lake Pichola Ghats (200m)'],
    rating: 4.94,
    reviewCount: 96,
    featured: true,
    createdAt: '2026-01-08T00:00:00.000Z',
    updatedAt: '2026-02-12T00:00:00.000Z'
  }
];

const INITIAL_ROOMS: Room[] = [
  // Rooms for Oxford Scholars (Student)
  {
    roomId: 'room_stu_oxf_1',
    hotelId: 'stu_hostel_blr_1',
    roomType: 'Single Private Scholar Room',
    description: 'Private single room with study desk, ergonomic chair, wardrobe, and high-speed Wi-Fi.',
    capacity: { adults: 1, children: 0, maxGuests: 1 },
    totalInventory: 15,
    bedType: 'Single Bed with Orthopedic Mattress',
    basePrice: 11500,
    monthlyPrice: 11500,
    amenities: ['Study Desk & Lamp', '300 Mbps Wi-Fi', 'Wardrobe & Lockers', 'Attached Washroom', 'Air Conditioning'],
    images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80'],
    enabled: true
  },
  {
    roomId: 'room_stu_oxf_2',
    hotelId: 'stu_hostel_blr_1',
    roomType: 'Twin Sharing Academic Suite',
    description: 'Shared room for two students with individual study desks and personal wardrobes.',
    capacity: { adults: 2, children: 0, maxGuests: 2 },
    totalInventory: 25,
    bedType: '2 Separate Single Beds',
    basePrice: 8500,
    monthlyPrice: 8500,
    amenities: ['Dual Study Desks', '300 Mbps Wi-Fi', 'Individual Wardrobes', 'Attached Washroom'],
    images: ['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80'],
    enabled: true
  },

  // Rooms for Sea Breeze Villa (Family)
  {
    roomId: 'room_fam_villa_1',
    hotelId: 'fam_villa_goa_1',
    roomType: 'Entire 4-Bedroom Luxury Villa (Private Pool)',
    description: 'Full private access to the entire 4-bedroom villa, private pool, modular kitchen, and private garden.',
    capacity: { adults: 8, children: 4, maxGuests: 12 },
    totalInventory: 1,
    bedType: '4 King Beds + Extra Cots Available',
    basePrice: 18500,
    amenities: ['Private Pool', 'Modular Kitchen', 'Child Safety Gates', 'Baby Cot', 'Private Lawn', 'BBQ Set'],
    images: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80'],
    enabled: true
  },

  // Rooms for Grand Azure Beach Resort (Trip)
  {
    roomId: 'room_trip_azure_1',
    hotelId: 'trip_resort_goa_1',
    roomType: 'Azure Ocean Deluxe Room',
    description: 'Spacious ocean-facing room with private sun deck, marble bathroom, and plush king bed.',
    capacity: { adults: 2, children: 1, maxGuests: 3 },
    totalInventory: 20,
    bedType: '1 King Bed',
    basePrice: 7500,
    amenities: ['Ocean Balcony', 'Rain Shower & Bathtub', 'High-Speed Wi-Fi', 'Complimentary Breakfast Buffet'],
    images: ['https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80'],
    enabled: true
  },
  {
    roomId: 'room_trip_azure_2',
    hotelId: 'trip_resort_goa_1',
    roomType: 'Royal Azure Beach Villa Suite',
    description: 'Premier standalone suite with direct sand access, private jacuzzi, and butler service.',
    capacity: { adults: 3, children: 2, maxGuests: 5 },
    totalInventory: 6,
    bedType: '1 King Bed + 1 Daybed',
    basePrice: 14500,
    amenities: ['Private Jacuzzi', 'Direct Beachfront Access', '24/7 Butler Service', 'Espresso Machine'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    enabled: true
  }
];

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin_default_1',
    fullName: 'System Administrator',
    email: 'admin@findyourstay.com',
    phone: '+919999900001',
    phoneVerified: true,
    emailVerified: true,
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'owner_demo_1',
    fullName: 'Rajesh Sharma (Property Owner)',
    email: 'owner@findyourstay.com',
    phone: '+919999900002',
    phoneVerified: true,
    emailVerified: true,
    role: 'property_owner',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    uid: 'student_demo_1',
    fullName: 'Aarav Mehta',
    email: 'aarav.student@gmail.com',
    phone: '+919876543210',
    phoneVerified: true,
    emailVerified: true,
    role: 'customer',
    collegeName: 'Christ University Bangalore',
    studentIdNumber: 'CU-2025-CS-104',
    emergencyContact: 'Suresh Mehta (Father): +91 98765 00112',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    createdAt: '2026-01-05T00:00:00.000Z',
    updatedAt: '2026-01-05T00:00:00.000Z'
  }
];

class DatabaseService {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.hotels && parsed.hotels.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Initializing fresh persistent database...');
    }

    const initial: DatabaseSchema = {
      hotels: INITIAL_HOTELS,
      rooms: INITIAL_ROOMS,
      bookings: [],
      reviews: [],
      users: INITIAL_USERS,
      otps: []
    };
    this.saveDatabase(initial);
    return initial;
  }

  private saveDatabase(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      const dir = path.dirname(DB_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  // HOTELS
  getHotels(filter?: {
    category?: string;
    city?: string;
    propertyType?: string;
    status?: string;
    ownerId?: string;
    approvalStatus?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    includeAll?: boolean;
  }) {
    let result = [...this.data.hotels];
    if (filter?.category && filter.category !== 'all') {
      result = result.filter((h) => h.category === filter.category);
    }
    if (filter?.city) {
      result = result.filter((h) => h.city.toLowerCase().includes(filter.city!.toLowerCase()));
    }
    if (filter?.propertyType && filter.propertyType !== 'all') {
      result = result.filter((h) => h.propertyType === filter.propertyType);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.description.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q) ||
          h.amenities.some((a) => a.toLowerCase().includes(q))
      );
    }
    if (filter?.minPrice !== undefined) {
      result = result.filter((h) => (h.monthlyRent || h.startingPrice) >= filter.minPrice!);
    }
    if (filter?.maxPrice !== undefined) {
      result = result.filter((h) => (h.monthlyRent || h.startingPrice) <= filter.maxPrice!);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((h) => h.status === filter.status);
    }
    if (filter?.ownerId) {
      result = result.filter((h) => h.ownerId === filter.ownerId);
    }
    if (filter?.approvalStatus) {
      result = result.filter((h) => h.approvalStatus === filter.approvalStatus);
    }
    return result;
  }

  getHotelById(id: string): Hotel | null {
    const hotel = this.data.hotels.find((h) => h.hotelId === id || h.slug === id);
    if (!hotel) return null;
    const rooms = this.data.rooms.filter((r) => r.hotelId === hotel.hotelId);
    return { ...hotel, rooms };
  }

  createHotel(hotel: Omit<Hotel, 'hotelId' | 'slug' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Hotel {
    const hotelId = 'hotel_' + Date.now();
    const slug = hotel.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
    const newHotel: Hotel = {
      ...hotel,
      hotelId,
      slug,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.hotels.push(newHotel);
    this.saveDatabase();
    return newHotel;
  }

  updateHotel(id: string, updates: Partial<Hotel>): Hotel | null {
    const index = this.data.hotels.findIndex((h) => h.hotelId === id);
    if (index === -1) return null;
    this.data.hotels[index] = {
      ...this.data.hotels[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.hotels[index];
  }

  deleteHotel(id: string): boolean {
    const initialLen = this.data.hotels.length;
    this.data.hotels = this.data.hotels.filter((h) => h.hotelId !== id);
    if (this.data.hotels.length !== initialLen) {
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // ROOMS
  getRooms(hotelId: string): Room[] {
    return this.data.rooms.filter((r) => r.hotelId === hotelId);
  }

  getRoomsByHotel(hotelId: string): Room[] {
    return this.getRooms(hotelId);
  }

  getRoomById(roomId: string): Room | null {
    return this.data.rooms.find((r) => r.roomId === roomId) || null;
  }

  createRoom(room: Omit<Room, 'roomId'>): Room {
    const roomId = 'room_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newRoom: Room = {
      ...room,
      roomId
    };
    this.data.rooms.push(newRoom);
    this.saveDatabase();
    return newRoom;
  }

  // BOOKINGS
  getBookings(filter?: { userId?: string; hotelId?: string; status?: string; paymentStatus?: string; category?: string; search?: string }) {
    let result = [...this.data.bookings];
    if (filter?.userId) {
      result = result.filter((b) => b.userId === filter.userId);
    }
    if (filter?.hotelId) {
      result = result.filter((b) => b.hotelId === filter.hotelId);
    }
    if (filter?.status && filter.status !== 'all') {
      result = result.filter((b) => b.bookingStatus === filter.status);
    }
    if (filter?.paymentStatus && filter.paymentStatus !== 'all') {
      result = result.filter((b) => b.paymentStatus === filter.paymentStatus);
    }
    if (filter?.category && filter.category !== 'all') {
      result = result.filter((b) => b.stayCategory === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.bookingReference.toLowerCase().includes(q) ||
          b.hotelName.toLowerCase().includes(q) ||
          b.guestDetails.fullName.toLowerCase().includes(q) ||
          b.guestDetails.phone.includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getBookingById(id: string): Booking | null {
    return this.data.bookings.find((b) => b.bookingId === id || b.bookingReference === id) || null;
  }

  createBooking(bookingData: Omit<Booking, 'bookingId' | 'createdAt' | 'updatedAt'>): Booking {
    const bookingId = 'bk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newBooking: Booking = {
      ...bookingData,
      bookingId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.bookings.push(newBooking);
    this.saveDatabase();
    return newBooking;
  }

  updateBooking(id: string, updates: Partial<Booking>): Booking | null {
    const index = this.data.bookings.findIndex((b) => b.bookingId === id);
    if (index === -1) return null;
    this.data.bookings[index] = {
      ...this.data.bookings[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveDatabase();
    return this.data.bookings[index];
  }

  // REVIEWS
  getReviews(hotelId?: string) {
    if (hotelId) return this.data.reviews.filter((r) => r.hotelId === hotelId);
    return this.data.reviews;
  }

  createReview(review: Omit<Review, 'reviewId' | 'createdAt'>): Review {
    const reviewId = 'rev_' + Date.now();
    const newReview: Review = {
      ...review,
      reviewId,
      createdAt: new Date().toISOString()
    };
    this.data.reviews.push(newReview);

    // Update hotel average rating
    const hotelReviews = this.data.reviews.filter((r) => r.hotelId === review.hotelId);
    const avg = hotelReviews.reduce((sum, r) => sum + r.rating, 0) / hotelReviews.length;
    this.updateHotel(review.hotelId, {
      rating: Number(avg.toFixed(1)),
      reviewCount: hotelReviews.length
    });

    this.saveDatabase();
    return newReview;
  }

  // USERS
  getUserByEmail(email: string): UserProfile | null {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  getUserByPhone(phone: string): UserProfile | null {
    const clean = phone.replace(/[^0-9]/g, '');
    return this.data.users.find((u) => u.phone?.replace(/[^0-9]/g, '') === clean) || null;
  }

  getUserById(uid: string): UserProfile | null {
    return this.data.users.find((u) => u.uid === uid) || null;
  }

  saveUser(user: UserProfile): UserProfile {
    const index = this.data.users.findIndex((u) => u.uid === user.uid);
    if (index >= 0) {
      this.data.users[index] = { ...this.data.users[index], ...user, updatedAt: new Date().toISOString() };
    } else {
      this.data.users.push(user);
    }
    this.saveDatabase();
    return user;
  }

  // OTP MANAGEMENT
  saveOtp(phone: string, otp: string, ttlMinutes = 10) {
    const expiresAt = Date.now() + ttlMinutes * 60 * 1000;
    this.data.otps = this.data.otps.filter((o) => o.phone !== phone);
    this.data.otps.push({ phone, otp, expiresAt });
    this.saveDatabase();
  }

  verifyOtp(phone: string, otp: string): boolean {
    const record = this.data.otps.find((o) => o.phone === phone);
    if (!record) return false;
    if (Date.now() > record.expiresAt) return false;
    if (record.otp === otp) {
      this.data.otps = this.data.otps.filter((o) => o.phone !== phone);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // METRICS
  getMetrics() {
    const confirmed = this.data.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const grossBookingValue = confirmed.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const advancePaymentsReceived = confirmed.reduce((acc, b) => acc + (b.paidAmount || 0), 0);
    const outstandingBalances = confirmed.reduce((acc, b) => acc + (b.remainingBalance || 0), 0);
    const totalBookings = this.data.bookings.length;
    const totalHotels = this.data.hotels.length;
    const studentStays = this.data.hotels.filter((h) => h.category === 'student').length;
    const familyStays = this.data.hotels.filter((h) => h.category === 'family').length;
    const tripStays = this.data.hotels.filter((h) => h.category === 'trip').length;

    return {
      grossBookingValue,
      advancePaymentsReceived,
      outstandingBalances,
      totalBookings,
      totalHotels,
      studentStays,
      familyStays,
      tripStays
    };
  }
}

// Singleton database instance
export const db = new DatabaseService();
