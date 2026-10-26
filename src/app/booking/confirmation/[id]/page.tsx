'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking, Hotel } from '@/types';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  Compass,
  Printer,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Clock,
  BedDouble,
  ChevronDown
} from 'lucide-react';
import QRCode from 'qrcode';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return;
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
          setHotel(data.hotel);

          // Generate check-in QR Code
          const qr = await QRCode.toDataURL(
            JSON.stringify({
              ref: data.booking.bookingReference,
              guest: data.booking.guestDetails.fullName,
              category: data.booking.stayCategory,
              paid: data.booking.paidAmount,
              status: data.booking.bookingStatus
            }),
            { width: 140, margin: 1 }
          );
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingId]);

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0836] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Booking Not Found</h2>
        <p className="text-slate-500 text-sm">We could not retrieve this reservation record.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] text-white font-bold text-xs"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isStudent = booking.stayCategory === 'student';
  const isFamily = booking.stayCategory === 'family';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8faff] via-[#f1f4fc] to-[#e9eefa] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Navbar Header matching Image 5 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 px-5 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] text-white flex items-center justify-center shadow-md shadow-indigo-950/20">
              <BedDouble className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-slate-900 select-none">
                  Rent<span className="text-[#3b49df]">ify</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold bg-indigo-50 text-[#3b49df] border border-indigo-200 rounded-md select-none">
                  Find Your Stay
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Student • Family • Trip Accommodations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-slate-800 text-xs font-bold border border-indigo-100">
              <span className="w-5 h-5 rounded-full bg-[#3b49df] text-white text-[10px] flex items-center justify-center">
                US
              </span>
              <span>{booking.guestDetails.fullName || 'User 2826'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Top Purple Success Banner matching Image 5 */}
        <div className="rounded-3xl bg-gradient-to-r from-[#170a4a] via-[#2f1188] to-[#5815b8] text-white p-6 sm:p-8 relative overflow-hidden shadow-xl shadow-indigo-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4 z-10">
            {/* Glowing Mint Green Checkmark Badge */}
            <div className="w-14 h-14 rounded-full bg-[#82f0c2] text-[#065f46] flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Booking Confirmed &amp; <span className="text-[#cbb8ff]">Verified!</span>
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl">
                Your advance transaction of <strong className="text-white">{formatINR(booking.paidAmount)}</strong> was verified securely via Razorpay. Your room is locked and confirmed.
              </p>
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1 bg-white/15 text-[#86efac] border border-white/20 rounded-full backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#86efac]" />
                  <span>Reference {booking.bookingReference}</span>
                </span>
              </div>
            </div>
          </div>

          {/* 3D Hotel Building Illustration Vector */}
          <div className="shrink-0 hidden md:flex items-center justify-center relative pr-4">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#4f46e5]/40 to-[#7916e2]/40 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-2xl relative">
              <Building className="w-12 h-12 text-white/90" />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-[#82f0c2] text-[#065f46] flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Official Pass Card matching Image 5 */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden print:border-none print:shadow-none">
          
          {/* Card Midnight Banner Header */}
          <div className="bg-gradient-to-r from-[#110c3b] via-[#1a1158] to-[#2c1075] text-white p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/15 border border-white/20 text-white px-3 py-0.5 rounded-full backdrop-blur-xs">
                  {booking.stayCategory} stay
                </span>
                <span className="text-[11px] font-mono tracking-wider text-indigo-200 font-semibold">
                  REF: {booking.bookingReference}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {isStudent
                  ? 'Official Student Move-in Pass'
                  : isFamily
                  ? 'Family Villa & Stay Voucher'
                  : 'Instant Trip Accommodation Voucher'}
              </h2>
              <p className="text-xs text-indigo-200/90 font-medium">
                {hotel?.name} - {hotel?.city}, {hotel?.state}
              </p>
            </div>

            {/* QR Code with SCAN AT DESK label */}
            {qrDataUrl && (
              <div className="bg-white p-2 rounded-2xl shrink-0 self-start sm:self-auto shadow-md text-center">
                <img src={qrDataUrl} alt="Booking QR Code" className="w-20 h-20 mx-auto" />
                <span className="text-[8px] text-slate-800 font-black uppercase tracking-wider block mt-1">
                  SCAN AT DESK
                </span>
              </div>
            )}
          </div>

          {/* Pass Details Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* 4-Column Stat Row matching Image 5 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3b49df] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Lead Guest
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {booking.guestDetails.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">{booking.guestDetails.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3b49df] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    {isStudent ? 'Move-In Date' : 'Check-In'}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {booking.checkIn}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isStudent ? 'Curfew: 10:30 PM' : 'From 2:00 PM'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3b49df] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Stay Period
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5">
                    {isStudent
                      ? `${booking.stayDurationMonths || 6} Academic Months`
                      : `${booking.numberOfNights || 1} Nights`}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isStudent ? 'Renewable' : 'Until 11:00 AM'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3b49df] flex items-center justify-center shrink-0">
                  <BedDouble className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Unit / Room
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 mt-0.5 truncate">
                    {booking.roomTypeName || 'Single Private Scholar Room'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">Qty: {booking.roomQuantity || 1} Unit(s)</p>
                </div>
              </div>
            </div>

            {/* Student Academic Dossier matching Image 5 */}
            {isStudent && (
              <div className="p-4 bg-[#f8faff] border border-indigo-100 rounded-2xl space-y-2">
                <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#3b49df]" />
                  <span>Student Academic Dossier</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div>
                    <span className="text-slate-500">College: </span>
                    <span className="font-bold text-slate-900">
                      {booking.studentDetails?.collegeOrUniversity || 'Christ University'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Roll / ID: </span>
                    <span className="font-bold text-slate-900">
                      {booking.studentDetails?.studentIdNumber || 'CU2026-ENG-492'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Parent / Guardian: </span>
                    <span className="font-bold text-slate-900">
                      {booking.studentDetails?.guardianName || 'Rajesh Sharma'} ({booking.studentDetails?.guardianPhone || '+91 9811122334'})
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Financial Ledger & Transaction Status matching Image 5 */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#3b49df]" />
                <span>Financial Ledger &amp; Transaction Status</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                {/* Total Booking Value */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                  <span className="text-slate-500 font-semibold block text-[11px]">Total Booking Value</span>
                  <span className="text-xl font-black text-slate-900 block">
                    {formatINR(booking.totalAmount)}
                  </span>
                </div>

                {/* Advance Paid Online in Soft Mint Green */}
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/70 text-emerald-950 shadow-2xs space-y-1">
                  <span className="text-emerald-700 block font-semibold text-[11px]">Advance Paid Online</span>
                  <span className="text-xl font-black text-emerald-800 block">
                    {formatINR(booking.paidAmount)}
                  </span>
                  <span className="block text-[10px] text-emerald-600 font-bold">
                    ✓ Razorpay Verified
                  </span>
                </div>

                {/* Remaining Balance in Soft Warm Amber */}
                <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/70 text-amber-950 shadow-2xs space-y-1">
                  <span className="text-amber-700 block font-semibold text-[11px]">Remaining Balance</span>
                  <span className="text-xl font-black text-amber-800 block">
                    {formatINR(booking.remainingBalance)}
                  </span>
                  <span className="block text-[10px] text-amber-600 font-medium">
                    Due upon check-in ({booking.checkIn})
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons Bar matching Image 5 */}
          <div className="p-6 bg-[#f8faff] border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Download Voucher</span>
            </button>

            <Link
              href="/account"
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] hover:opacity-95 text-white text-xs font-bold shadow-xl shadow-indigo-950/20 transition-all"
            >
              <span>View All My Bookings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
