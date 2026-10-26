'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, Room, StayCategory, PriceQuote } from '@/types';
import { useAuth } from '@/context/AuthContext';
import {
  GraduationCap,
  Users,
  Compass,
  CreditCard,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  AlertCircle,
  Lock,
  ChevronLeft,
  MapPin,
  Building,
  CheckCircle2
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
  const [guestName, setGuestName] = useState(user?.fullName || 'User 2826');
  const [guestEmail, setGuestEmail] = useState(user?.email || '0708032826@phone.findyourstay.in');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '+910708032826');
  const [specialRequests, setSpecialRequests] = useState('');

  // 1. Student Stay Details
  const [durationMonths, setDurationMonths] = useState(6); // 1, 3, 6, 12 months
  const [moveInDate, setMoveInDate] = useState('2026-10-29');
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Christ University');
  const [studentIdNumber, setStudentIdNumber] = useState(user?.studentIdNumber || 'CU2026-ENG-492');
  const [course, setCourse] = useState('B. Tech Computer Science');
  const [guardianPhone, setGuardianPhone] = useState(user?.emergencyContact || '+91 98111 22334');
  const [mealPlanOpted, setMealPlanOpted] = useState(true);

  // 2. Family Stay Details
  const [checkInDate, setCheckInDate] = useState('2026-10-29');
  const [checkOutDate, setCheckOutDate] = useState('2026-11-02');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(1);
  const [childrenAges, setChildrenAges] = useState('6 years');
  const [cribRequired, setCribRequired] = useState(false);

  // 3. Trip / Regular Stay Details
  const [tripCheckIn, setTripCheckIn] = useState('2026-10-29');
  const [tripCheckOut, setTripCheckOut] = useState('2026-11-01');
  const [roomQuantity, setRoomQuantity] = useState(1);
  const [travelPurpose, setTravelPurpose] = useState('Leisure & Vacation');

  // Dynamic Quote State
  const [quote, setQuote] = useState<PriceQuote | null>(null);

  // Sync user profile data if changed
  useEffect(() => {
    if (user) {
      if (user.fullName) setGuestName(user.fullName);
      if (user.email) setGuestEmail(user.email);
      if (user.phone) setGuestPhone(user.phone);
      if (user.collegeName) setCollegeName(user.collegeName);
      if (user.studentIdNumber) setStudentIdNumber(user.studentIdNumber);
      if (user.emergencyContact) setGuardianPhone(user.emergencyContact);
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

  // Calculate Nights
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
      } else if (stayCategory === 'trip' || stayCategory === 'regular' || stayCategory === 'hourly') {
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
          : stayCategory === 'trip' || stayCategory === 'regular'
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
              guardianName: 'Rajesh Sharma',
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
        stayCategory === 'trip' || stayCategory === 'regular'
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
          totalAmount: quote?.totalAmount || 88830,
          advanceAmount: quote?.advanceAmount || 15000,
          remainingBalance: quote?.remainingBalance || 73830,
          payFull
        })
      });

      const reserveData = await reserveRes.json();
      if (!reserveData.success || !reserveData.booking) {
        throw new Error(reserveData.message || 'Failed to initialize booking');
      }

      const booking = reserveData.booking;
      const razorpayOrder = reserveData.razorpayOrder;

      // 2. Simulated payment verification
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
      <div className="min-h-screen bg-[#0c0836] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#0d111d] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Select an Accommodation First</h2>
          <p className="text-xs text-slate-500">Please choose a student hostel, family villa, or hotel to book.</p>
          <button
            onClick={() => router.push('/hotels')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] text-white font-bold text-xs"
          >
            Browse Accommodations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d111d] flex justify-center sm:py-6 sm:px-4">
      {/* Mobile Device Frame Shell matching Image 4 */}
      <div className="w-full max-w-[430px] sm:max-w-2xl min-h-screen bg-[#f8faff] sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all">
        
        {/* Top Midnight Indigo/Purple Curved Header matching Image 4 */}
        <div className="bg-gradient-to-br from-[#0c0836] via-[#1c0f64] to-[#3a1396] text-white pt-8 pb-7 px-5 rounded-b-[2.5rem] shadow-xl relative select-none space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              type="button"
              className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white font-semibold transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Accommodation</span>
            </button>

            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#221054]/90 border border-white/20 text-white px-3.5 py-1 rounded-full backdrop-blur-md shadow-xs">
              {stayCategory} stay
            </span>
          </div>

          {/* Selected Hotel Inset Card matching Image 4 */}
          <div className="bg-white p-3.5 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-3.5 text-slate-900">
            <img
              src={hotel.coverImage}
              alt={hotel.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="space-y-1 overflow-hidden">
              <span className="text-[9px] font-black uppercase tracking-wider text-[#3b49df] bg-indigo-50 px-2 py-0.5 rounded-md inline-block">
                {hotel.propertyType}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 truncate leading-snug">
                {hotel.name}
              </h3>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium truncate">
                <MapPin className="w-3 h-3 text-[#3b49df] shrink-0" />
                <span className="truncate">{hotel.address}, {hotel.city}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body matching Image 4 */}
        <form onSubmit={handleProceedToPayment} className="flex-1 px-5 py-4 overflow-y-auto space-y-4">
          
          {/* SECTION 1: CATEGORY SPECIFIC FIELDS */}
          {stayCategory === 'student' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-[#3b49df] font-bold text-xs pb-1 border-b border-slate-100">
                <GraduationCap className="w-4 h-4" />
                <span>Student & Academic Stay Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Stay Duration (Months)
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value={1}>1 Month (Trial Stay)</option>
                    <option value={3}>3 Months (Trimester)</option>
                    <option value={6}>6 Months (1 Academic Semester)</option>
                    <option value={11}>11 Months (Full Academic Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Move-in Date
                  </label>
                  <div className="relative flex items-center">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder="Christ University"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Student ID / Roll Number
                  </label>
                  <input
                    type="text"
                    value={studentIdNumber}
                    onChange={(e) => setStudentIdNumber(e.target.value)}
                    placeholder="CU2026-ENG-492"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Course / Department
                  </label>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    placeholder="B. Tech Computer Science"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">
                    Parent / Guardian Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98111 22334"
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                    required
                  />
                </div>
              </div>

              {/* Meal Plan Opted Checkbox */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mealPlan"
                  checked={mealPlanOpted}
                  onChange={(e) => setMealPlanOpted(e.target.checked)}
                  className="w-4 h-4 text-[#3b49df] rounded accent-[#3b49df] cursor-pointer"
                />
                <label htmlFor="mealPlan" className="text-[11px] font-semibold text-slate-700 cursor-pointer">
                  Include 4-time mess meal plan (Breakfast, Lunch, Snacks, Dinner)
                </label>
              </div>
            </div>
          )}

          {/* FAMILY STAY DETAILS */}
          {stayCategory === 'family' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
              <div className="flex items-center gap-2 text-[#3b49df] font-bold text-xs pb-1 border-b border-slate-100">
                <Users className="w-4 h-4" />
                <span>Family Stay Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Check-In Date</label>
                  <input
                    type="date"
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Check-Out Date</label>
                  <input
                    type="date"
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Number of Adults</label>
                  <input
                    type="number"
                    min={1}
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 mb-1">Children Count</label>
                  <input
                    type="number"
                    min={0}
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: LEAD GUEST & CONTACT INFORMATION */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-[#3b49df] font-bold text-xs pb-1 border-b border-slate-100">
              <GraduationCap className="w-4 h-4" />
              <span>Lead Guest & Contact Information</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Full Name (As on Government ID)
                </label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="User 2826"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="0708032826@phone.findyourstay.in"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Mobile Number (For Booking Confirmation)
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+910708032826"
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  Special Requests (Optional)
                </label>
                <input
                  type="text"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Dietary requests, late check-in, quiet study floor..."
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BOOKING PRICE BREAKDOWN matching Image 4 */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 text-[#3b49df] font-bold text-xs pb-1 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4" />
              <span>Booking Price Breakdown</span>
            </div>

            {/* Toggle: Pay Advance Only vs Pay Full Amount */}
            <div className="p-1 bg-slate-100 rounded-xl flex items-center text-xs font-bold">
              <button
                type="button"
                onClick={() => setPayFull(false)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !payFull ? 'bg-white text-[#3b49df] shadow-xs' : 'text-slate-600'
                }`}
              >
                Pay Advance Only
              </button>
              <button
                type="button"
                onClick={() => setPayFull(true)}
                className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                  payFull ? 'bg-white text-[#3b49df] shadow-xs' : 'text-slate-600'
                }`}
              >
                Pay Full Amount
              </button>
            </div>

            {/* Price Line Items matching Image 4 */}
            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex justify-between items-center">
                <span>Base Charges ({stayCategory === 'student' ? `${durationMonths} Months` : 'Stay'})</span>
                <span className="font-semibold text-slate-900">{formatINR(quote?.baseAmount || 69000)}</span>
              </div>

              {stayCategory === 'student' && (
                <div className="flex justify-between items-center text-[#3b49df] font-bold">
                  <span>Refundable Security Deposit</span>
                  <span>{formatINR(quote?.securityDeposit || 15000)}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>GST Taxes</span>
                <span className="font-semibold text-slate-900">{formatINR(quote?.taxes || 3450)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Platform & Service Fee</span>
                <span className="font-semibold text-slate-900">{formatINR(quote?.fees || 1380)}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Booking Cost</span>
                <span>{formatINR(quote?.totalAmount || 88830)}</span>
              </div>
            </div>

            {/* Callout Box matching Image 4 */}
            <div className="p-3.5 rounded-2xl bg-[#f5f8ff] border border-indigo-100/90 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-[#3b49df]">Advance Required Today</span>
                <span className="text-base font-black text-[#3b49df]">
                  {formatINR(quote?.advanceAmount || 15000)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1 border-t border-indigo-100/60">
                <span className="font-bold text-slate-700">Remaining Balance</span>
                <span className="font-black text-slate-900">
                  {formatINR(quote?.remainingBalance || 73830)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Payable upon arrival & reception / desk counter.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Bottom Button matching Image 4 */}
          <div className="pt-2 pb-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-indigo-950/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Processing...' : 'PROCEED TO PAYMENT'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0836] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BookingFlowContent />
    </Suspense>
  );
}
