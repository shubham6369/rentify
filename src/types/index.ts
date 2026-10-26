export type StayCategory = 'student' | 'family' | 'trip' | 'hourly' | 'regular';
export type PropertyType = 'hostel' | 'pg' | 'villa' | 'apartment' | 'hotel' | 'resort';
export type UserRole = 'customer' | 'property_owner' | 'admin';
export type HotelStatus = 'published' | 'draft' | 'archived';
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type PaymentStatus = 'advance_paid' | 'fully_paid' | 'pending' | 'refunded' | 'failed';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  avatarUrl?: string;
  role: UserRole;
  aadhaarNumber?: string;
  collegeName?: string;
  studentIdNumber?: string;
  emergencyContact?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  roomId: string;
  hotelId: string;
  roomType: string;
  description: string;
  capacity: {
    adults: number;
    children: number;
    maxGuests: number;
  };
  totalInventory: number;
  bedType: string;
  basePrice: number;
  monthlyPrice?: number;
  amenities: string[];
  images: string[];
  enabled: boolean;
}

export interface Hotel {
  hotelId: string;
  name: string;
  slug: string;
  description: string;
  category: StayCategory;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  amenities: string[];
  rules: string[];
  nearbyLandmarks?: string[];
  monthlyRent?: number;
  securityDeposit?: number;
  startingPrice: number;
  advancePaymentType: 'percentage' | 'fixed';
  advancePaymentValue: number;
  gstPercentage: number;
  serviceFeePercentage: number;
  freeCancellationHours: number;
  cancellationFeePercentage: number;
  cancellationDescription: string;
  status: HotelStatus;
  approvalStatus: ApprovalStatus;
  ownerId?: string;
  coverImage: string;
  images: string[];
  rating: number;
  reviewCount: number;
  featured?: boolean;
  rooms?: Room[];
  reviews?: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentBookingDetails {
  collegeOrUniversity: string;
  studentIdNumber: string;
  course?: string;
  guardianName: string;
  guardianPhone: string;
  durationMonths: number;
  moveInDate: string;
  mealPlanOpted?: boolean;
}

export interface FamilyBookingDetails {
  adults: number;
  children: number;
  childrenAges?: string;
  cribRequired?: boolean;
  specialAssistance?: string;
}

export interface TripBookingDetails {
  destination: string;
  travelPurpose?: string;
  packageIncluded?: boolean;
}

export interface GuestDetails {
  fullName: string;
  email: string;
  phone: string;
  specialRequests?: string;
}

export interface Booking {
  bookingId: string;
  bookingReference: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomTypeName: string;
  stayCategory: StayCategory;
  checkIn: string;
  checkOut?: string;
  numberOfNights: number;
  stayDurationMonths?: number;
  numberOfGuests: {
    adults: number;
    children: number;
  };
  roomQuantity: number;
  guestDetails: GuestDetails;
  studentDetails?: StudentBookingDetails;
  familyDetails?: FamilyBookingDetails;
  tripDetails?: TripBookingDetails;
  totalAmount: number;
  advanceAmount: number;
  paidAmount: number;
  remainingBalance: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  balanceDueDate: string;
  holdExpiresAt?: string;
  internalNotes?: string[];
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    method?: string;
  };
  cancellationDetails?: {
    cancelledAt: string;
    refundAmount: number;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  reviewId: string;
  hotelId: string;
  bookingId?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  stayCategory: StayCategory;
  createdAt: string;
}

export interface PriceQuote {
  totalAmount: number;
  advanceAmount: number;
  remainingBalance: number;
  taxes: number;
  fees: number;
  baseAmount: number;
  securityDeposit?: number;
  numberOfNights?: number;
  durationMonths?: number;
}
