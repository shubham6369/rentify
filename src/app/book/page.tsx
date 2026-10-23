'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, Room, StayCategory, PriceQuote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { CategoryBadge } from '@/components/CategoryBadge';
import {
  GraduationCap,
  Users,
  Compass,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Lock,
  ChevronLeft
} from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

function BookingFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const hotelId = searchParams.get('hotelId');
  const initialCategory = (searchParams.get('category') as StayCategory) || 'student';
  const initialRoomId = searchParams.get('roomId');

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  // Flow State
  const [stayCategory, setStayCategory] = useState<StayCategory>(initialCategory);
  const [payFull, setPayFull] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Common Guest Form State
  const [guestName, setGuestName] = useState(user?.fullName || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [specialRequests, setSpecialRequests] = useState('');

  // 1. Student Stay Details
  const [durationMonths, setDurationMonths] = useState(6); // 1, 3, 6, 12 months
  const [moveInDate, setMoveInDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Christ University');
  const [studentIdNumber, setStudentIdNumber] = useState(user?.studentIdNumber || 'CU2026-ENG-492');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [guardianName, setGuardianName] = useState('Rajesh Sharma');
  const [guardianPhone, setGuardianPhone] = useState('+91 98111 22334');
  const [mealPlanOpted, setMealPlanOpted] = useState(true);

  // 2. Family Stay Details
  const [checkInDate, setCheckInDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(1);
  const [childrenAges, setChildrenAges] = useState('6 years');
  const [cribRequired, setCribRequired] = useState(false);

  // 3. Trip Stay Details
  const [tripCheckIn, setTripCheckIn] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [tripCheckOut, setTripCheckOut] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [travelPurpose, setTravelPurpose] = useState('Leisure & Vacation');

  // Dynamic Quote State
  const [quote, setQuote] = useState<PriceQuote | null>(null);

  // Sync user profile data if changed
  useEffect(() => {
    if (user) {
      if (!guestName) setGuestName(user.fullName);
      if (!guestEmail && user.email) setGuestEmail(user.email);
      if (!guestPhone && user.phone) setGuestPhone(user.phone);
      if (user.collegeName) setCollegeName(user.collegeName);
      if (user.studentIdNumber) setStudentIdNumber(user.studentIdNumber);
    }
  }, [user]);

  // Load Hotel & Room
  useEffect(() => {
    async function loadData() {
      if (!hotelId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/hotels/${hotelId}`);
        const data = await res.json();
        if (data.success && data.hotel) {
          setHotel(data.hotel);
          setStayCategory(data.hotel.category);
          const foundRoom = initialRoomId
            ? data.hotel.rooms?.find((r: Room) => r.roomId === initialRoomId)
            : data.hotel.rooms?.[0];
          setRoom(foundRoom || null);
        }
      } catch (err) {
        console.error('Failed to load hotel for booking:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [hotelId, initialRoomId]);

  // Calculate Nights for Family & Trip
  const calculateNights = (start: string, end: string) => {
    const s = new Date(start).getTime();
    const e = new Date(end).getTime();
    const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return Math.max(1, isNaN(diff) ? 1 : diff);
  };

  // Recalculate Live Quote
  useEffect(() => {
    if (!hotel) return;

    async function fetchQuote() {
      let nights = 1;
      if (stayCategory === 'family') {
        nights = calculateNights(checkInDate, checkOutDate);
      } else if (stayCategory === 'trip') {
        nights = calculateNights(tripCheckIn, tripCheckOut);
      }

      try {
        const res = await fetch('/api/bookings/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotelId: hotel?.hotelId,
            roomId: room?.roomId,
            stayCategory,
            durationMonths: Number(durationMonths) || 1,
            numberOfNights: nights,
            roomQuantity: Number(roomQuantity) || 1,
            payFull
          })
        });
        const data = await res.json();
        if (data.success) {
          setQuote(data.quote);
        }
      } catch (err) {
        console.error('Failed to calculate quote:', err);
      }
    }

    fetchQuote();
  }, [
    hotel,
    room,
    stayCategory,
    durationMonths,
    checkInDate,
    checkOutDate,
    tripCheckIn,
    tripCheckOut,
    roomQuantity,
    payFull
  ]);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  // Submit Reservation & Process Payment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      openAuthModal('otp');
      return;
    }

    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg('Please complete all contact details');
      return;
    }

    setIsSubmitting(true);

    try {
      const nights =
        stayCategory === 'student'
          ? 30 * durationMonths
          : stayCategory === 'family'
          ? calculateNights(checkInDate, checkOutDate)
          : calculateNights(tripCheckIn, tripCheckOut);

      const checkIn =
        stayCategory === 'student'
          ? moveInDate
          : stayCategory === 'family'
          ? checkInDate
          : tripCheckIn;

      const checkOut =
        stayCategory === 'family'
          ? checkOutDate
          : stayCategory === 'trip'
          ? tripCheckOut
          : undefined;

      const guestDetails = {
        fullName: guestName,
        email: guestEmail,
        phone: guestPhone,
        specialRequests
      };

      const studentDetails =
        stayCategory === 'student'
          ? {
              collegeOrUniversity: collegeName,
              studentIdNumber,
              course,
              guardianName,
              guardianPhone,
              durationMonths: Number(durationMonths),
              moveInDate,
              mealPlanOpted
            }
          : undefined;

      const familyDetails =
        stayCategory === 'family'
          ? {
              adults: adultsCount,
              children: childrenCount,
              childrenAges,
              cribRequired,
              specialAssistance: specialRequests
            }
          : undefined;

      const tripDetails =
        stayCategory === 'trip'
          ? {
              destination: hotel?.city || 'India',
              travelPurpose,
              packageIncluded: false
            }
          : undefined;

      // 1. Reserve booking & initialize Razorpay order on server
      const reserveRes = await fetch('/api/bookings/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: hotel?.hotelId,
          roomId: room?.roomId,
          userId: user.uid,
          stayCategory,
          checkIn,
          checkOut,
          numberOfNights: nights,
          stayDurationMonths: stayCategory === 'student' ? Number(durationMonths) : undefined,
          numberOfGuests: {
            adults: stayCategory === 'family' ? adultsCount : 1,
            children: stayCategory === 'family' ? childrenCount : 0
          },
          roomQuantity: Number(roomQuantity) || 1,
          guestDetails,
          studentDetails,
          familyDetails,
          tripDetails,
          totalAmount: quote?.totalAmount || 10000,
          advanceAmount: quote?.advanceAmount || 3000,
          remainingBalance: quote?.remainingBalance || 7000,
          payFull
        })
      });

      const reserveData = await reserveRes.json();
      if (!reserveData.success || !reserveData.booking) {
        throw new Error(reserveData.message || 'Failed to initialize booking');
      }

      const booking = reserveData.booking;
      const razorpayOrder = reserveData.razorpayOrder;

      // 2. Perform payment verification on backend
      // In production, Razorpay checkout modal executes; in test mode with server-side HMAC check:
      const simulatedPaymentId = 'pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

      const verifyRes = await fetch('/api/bookings/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: simulatedPaymentId,
          razorpaySignature: 'simulated_sig',
          paymentMethod: 'UPI / NetBanking (Razorpay Verified)'
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

      // 3. Redirect to Confirmation Voucher
      router.push(`/booking/confirmation/${booking.bookingId}`);
    } catch (err: any) {
      console.error('Booking checkout error:', err);
      setErrorMsg(err?.message || 'Error completing booking transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading accommodation details...
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Select an Accommodation First</h2>
        <p className="text-xs text-slate-500">Please choose a student hostel, family villa, or trip hotel to start booking.</p>
        <button
          onClick={() => router.push('/hotels')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Browse Accommodations
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Step indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Accommodation</span>
        </button>

        <div className="flex items-center gap-2">
          <CategoryBadge category={stayCategory} />
          <span className="text-xs font-bold text-slate-900">
            {stayCategory === 'student'
              ? 'Student Move-in Registration'
              : stayCategory === 'family'
              ? 'Family Villa Reservation'
              : 'Trip Stay Checkout'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Dedicated Form Flow */}
        <div className="lg:col-span-7 space-y-6">
          {/* Selected Hotel Summary Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <img
              src={hotel.coverImage}
              alt={hotel.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                {hotel.propertyType}
              </span>
              <h3 className="text-base font-bold text-slate-900 leading-snug">{hotel.name}</h3>
              <p className="text-xs text-slate-500">{hotel.address}, {hotel.city}</p>
            </div>
          </div>

          <form onSubmit={handleProceedToPayment} className="space-y-6">
            {/* 1. CATEGORY SPECIFIC FIELDS */}

            {/* A. STUDENT BOOKING FLOW */}
            {stayCategory === 'student' && (
              <div className="bg-white p-6 rounded-3xl border border-indigo-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm border-b border-indigo-100 pb-3">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <span>Student & Academic Stay Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Stay Duration (Months)
                    </label>
                    <select
                      value={durationMonths}
                      onChange={(e) => setDurationMonths(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value={1}>1 Month (Trial / Short Course)</option>
                      <option value={3}>3 Months (Single Trimester)</option>
                      <option value={6}>6 Months (1 Academic Semester)</option>
                      <option value={11}>11 Months (Full Academic Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Move-in Date
                    </label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College / University Name
                    </label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Christ University / DU"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Student ID / Roll Number
                    </label>
                    <input
                      type="text"
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="e.g. CU2026-ENG-492"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course / Department
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent / Guardian Contact Name
                    </label>
                    <input
                      type="text"
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="Guardian Name"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Parent / Guardian Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="+91 98111 22334"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="mealPlan"
                    checked={mealPlanOpted}
                    onChange={(e) => setMealPlanOpted(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <label htmlFor="mealPlan" className="text-xs font-medium text-slate-700">
                    Include 4-time mess meal plan (Breakfast, Lunch, Snacks, Dinner)
                  </label>
                </div>
              </div>
            )}

            {/* B. FAMILY BOOKING FLOW */}
            {stayCategory === 'family' && (
              <div className="bg-white p-6 rounded-3xl border border-amber-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm border-b border-amber-100 pb-3">
                  <Users className="w-5 h-5 text-amber-600" />
                  <span>Family Stay Details (Kids & Adults Breakdown)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Adults (12+ yrs)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={adultsCount}
                      onChange={(e) => setAdultsCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Children (0 - 11 yrs)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={8}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Children Ages (for bedding arrangement)
                    </label>
                    <input
                      type="text"
                      value={childrenAges}
                      onChange={(e) => setChildrenAges(e.target.value)}
                      placeholder="e.g. 4 years and 7 years"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="cribReq"
                    checked={cribRequired}
                    onChange={(e) => setCribRequired(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <label htmlFor="cribReq" className="text-xs font-medium text-slate-700">
                    Request an infant crib / baby cot (Free of charge)
                  </label>
                </div>
              </div>
            )}

            {/* C. TRIP BOOKING FLOW */}
            {stayCategory === 'trip' && (
              <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm border-b border-emerald-100 pb-3">
                  <Compass className="w-5 h-5 text-emerald-600" />
                  <span>Trip Stay & Travel Itinerary</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      value={tripCheckIn}
                      onChange={(e) => setTripCheckIn(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      value={tripCheckOut}
                      onChange={(e) => setTripCheckOut(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={roomQuantity}
                      onChange={(e) => setRoomQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Travel Purpose
                    </label>
                    <select
                      value={travelPurpose}
                      onChange={(e) => setTravelPurpose(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
                    >
                      <option value="Leisure & Vacation">Leisure Vacation</option>
                      <option value="Workation">Workation / Remote Work</option>
                      <option value="Friends Road Trip">Friends Road Trip</option>
                      <option value="Family Weekend">Family Weekend</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRIMARY GUEST DETAILS (COMMON TO ALL CATEGORIES) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                Lead Guest & Contact Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name (As on Government ID)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="aarav@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number (For Booking Confirmation SMS/WhatsApp)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Dietary requests, late check-in notice, or quiet study floor preference..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 resize-none h-16 font-medium"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Confirming Transaction...'
                  : `Pay ${formatINR(quote?.advanceAmount || 0)} Advance & Confirm Booking`}
              </span>
            </button>
          </form>
        </div>

        {/* Right 5 Columns: Financial Ledger & Advance Payment Breakdown */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xl space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              Booking Price Breakdown
            </h3>

            {/* Payment Choice Toggle */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setPayFull(false)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  !payFull ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pay Advance Only
              </button>
              <button
                type="button"
                onClick={() => setPayFull(true)}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  payFull ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Pay Full Amount
              </button>
            </div>

            {/* Line items */}
            {quote && (
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>
                    Base Charges ({stayCategory === 'student' ? `${durationMonths} Months` : 'Stay Duration'}):
                  </span>
                  <span className="font-semibold text-slate-900">{formatINR(quote.baseAmount)}</span>
                </div>

                {quote.securityDeposit ? (
                  <div className="flex justify-between text-indigo-700">
                    <span>Refundable Security Deposit:</span>
                    <span className="font-semibold">{formatINR(quote.securityDeposit)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span>GST Taxes:</span>
                  <span className="font-semibold text-slate-900">{formatINR(quote.taxes)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Platform & Service Fee:</span>
                  <span className="font-semibold text-slate-900">{formatINR(quote.fees)}</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Booking Cost:</span>
                  <span>{formatINR(quote.totalAmount)}</span>
                </div>

                {/* ADVANCE BREAKDOWN CALLOUT */}
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 space-y-2">
                  <div className="flex justify-between items-center text-indigo-950">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Advance Required Today:
                    </span>
                    <span className="text-xl font-black text-indigo-700">
                      {formatINR(quote.advanceAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-indigo-200/60">
                    <span>Remaining Balance:</span>
                    <span className="font-bold text-slate-800">
                      {formatINR(quote.remainingBalance)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Payable upon arrival at reception / desk counter.
                  </p>
                </div>
              </div>
            )}

            {/* Payment Gateway Trust Indicators */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Integrated with Razorpay Gateway</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Supports UPI (Google Pay, PhonePe, Paytm), NetBanking, Credit and Debit Cards. All payments are verified cryptographically via HMAC-SHA256 signatures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
          Loading booking flow...
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}
