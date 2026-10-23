'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Booking, Hotel } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  Compass,
  Printer,
  Download,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  QrCode
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
            { width: 160, margin: 1 }
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
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading booking voucher...
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
          className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const isStudent = booking.stayCategory === 'student';
  const isFamily = booking.stayCategory === 'family';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Notification Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center space-y-3 shadow-xs">
        <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md shadow-emerald-200">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-emerald-950">
          Booking Confirmed & Verified!
        </h1>
        <p className="text-xs sm:text-sm text-emerald-800 max-w-lg mx-auto">
          Your advance transaction of <strong>{formatINR(booking.paidAmount)}</strong> was verified securely via Razorpay. Your room is locked and confirmed.
        </p>
        <div className="pt-2 flex items-center justify-center gap-2">
          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
            Reference: {booking.bookingReference}
          </span>
        </div>
      </div>

      {/* Official Voucher Card (Printable) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Voucher Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CategoryBadge category={booking.stayCategory} />
              <span className="text-[11px] font-mono tracking-wider text-slate-400">
                REF: {booking.bookingReference}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isStudent
                ? 'Official Student Move-in Pass'
                : isFamily
                ? 'Family Villa & Stay Voucher'
                : 'Instant Trip Accommodation Voucher'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {hotel?.name} • {hotel?.city}, {hotel?.state}
            </p>
          </div>

          {/* QR Code */}
          {qrDataUrl && (
            <div className="bg-white p-2 rounded-2xl shrink-0 self-start sm:self-auto shadow-sm">
              <img src={qrDataUrl} alt="Booking QR Code" className="w-24 h-24" />
              <p className="text-[9px] text-center text-slate-500 font-bold uppercase mt-1">
                Scan at Desk
              </p>
            </div>
          )}
        </div>

        {/* Voucher Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Guest & Schedule Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Lead Guest
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{booking.guestDetails.fullName}</p>
              <p className="text-xs text-slate-500">{booking.guestDetails.phone}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {isStudent ? 'Move-In Date' : 'Check-In'}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{booking.checkIn}</p>
              <p className="text-xs text-slate-500">{isStudent ? 'Curfew: 10:30 PM' : 'From 2:00 PM'}</p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {isStudent ? 'Stay Period' : 'Check-Out'}
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {isStudent
                  ? `${booking.stayDurationMonths || 1} Academic Months`
                  : booking.checkOut || 'Open'}
              </p>
              <p className="text-xs text-slate-500">
                {isStudent ? 'Renewable' : 'Until 11:00 AM'}
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Unit / Room
              </span>
              <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{booking.roomTypeName}</p>
              <p className="text-xs text-slate-500">Qty: {booking.roomQuantity} Unit(s)</p>
            </div>
          </div>

          {/* Section 2: Category Details */}
          {isStudent && booking.studentDetails && (
            <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Student Academic Dossier</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-indigo-900">
                <div>
                  <span className="text-indigo-600 font-medium">College: </span>
                  <span className="font-bold">{booking.studentDetails.collegeOrUniversity}</span>
                </div>
                <div>
                  <span className="text-indigo-600 font-medium">Roll / ID: </span>
                  <span className="font-bold">{booking.studentDetails.studentIdNumber}</span>
                </div>
                <div>
                  <span className="text-indigo-600 font-medium">Parent/Guardian: </span>
                  <span className="font-bold">{booking.studentDetails.guardianName} ({booking.studentDetails.guardianPhone})</span>
                </div>
              </div>
            </div>
          )}

          {isFamily && booking.familyDetails && (
            <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Family Party Breakdown</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-amber-900">
                <div>
                  <span className="text-amber-700 font-medium">Adults: </span>
                  <span className="font-bold">{booking.familyDetails.adults} Guests</span>
                </div>
                <div>
                  <span className="text-amber-700 font-medium">Children: </span>
                  <span className="font-bold">{booking.familyDetails.children} ({booking.familyDetails.childrenAges || 'N/A'})</span>
                </div>
                <div>
                  <span className="text-amber-700 font-medium">Crib / Cot: </span>
                  <span className="font-bold">{booking.familyDetails.cribRequired ? 'Requested (Confirmed)' : 'Not needed'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Financial Settlement Ledger */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Financial Ledger & Transaction Status</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 block">Total Booking Value</span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatINR(booking.totalAmount)}
                </span>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900">
                <span className="text-emerald-700 block font-medium">Advance Paid Online</span>
                <span className="text-base font-extrabold text-emerald-800">
                  {formatINR(booking.paidAmount)}
                </span>
                <span className="block text-[10px] text-emerald-600 font-bold mt-0.5">
                  ✓ Razorpay Verified
                </span>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-900">
                <span className="text-amber-700 block font-medium">Remaining Balance</span>
                <span className="text-base font-extrabold text-amber-800">
                  {formatINR(booking.remainingBalance)}
                </span>
                <span className="block text-[10px] text-amber-600 font-medium mt-0.5">
                  Due upon check-in ({booking.balanceDueDate})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Download Voucher</span>
            </button>
          </div>

          <Link
            href="/account"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-200 transition-all"
          >
            <span>View All My Bookings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
