'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import { subscribeToDataChanges } from '@/lib/sync';
import {
  User,
  Calendar,
  Smartphone,
  Mail,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  XCircle,
  FileText,
  ChevronLeft,
  LogOut,
  Home,
  ShoppingBag,
  Search,
  Heart,
  Sparkles,
  RefreshCw,
  BedDouble,
  Shield,
  Phone
} from 'lucide-react';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal, updateProfile, logout } = useAuth();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>(
    tabParam === 'profile' ? 'profile' : 'bookings'
  );

  useEffect(() => {
    if (tabParam === 'profile') {
      setActiveTab('profile');
    } else if (tabParam === 'bookings') {
      setActiveTab('bookings');
    }
  }, [tabParam]);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);

  // Cancel Booking Modal State
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of plans');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setAadhaarNumber(user.aadhaarNumber || '');
      setCollegeName(user.collegeName || '');
      setStudentIdNumber(user.studentIdNumber || '');
      setEmergencyContact(user.emergencyContact || '');
    }
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user.uid}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();

    const unsubscribe = subscribeToDataChanges((event) => {
      if (event.type.startsWith('booking_') || event.type === 'payment_recorded') {
        loadBookings();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const formatAadhaar = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await updateProfile({
      fullName,
      phone,
      aadhaarNumber,
      collegeName,
      studentIdNumber,
      emergencyContact
    });
    setProfileSaving(false);
    if (res.success) {
      setProfileMsg({ text: 'Profile updated successfully!', isError: false });
    } else {
      setProfileMsg({ text: res.message || 'Failed to update profile', isError: true });
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${cancellingBookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          reason: cancelReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setCancellingBookingId(null);
        await loadBookings();
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    } finally {
      setCancelLoading(false);
    }
  };

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#070a29] flex justify-center sm:py-6 sm:px-4 select-none">
      {/* Mobile Device Frame Shell */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[890px] bg-slate-50 sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">

        {/* ========================================================================= */}
        {/* 1. TOP STICKY MIDNIGHT HEADER BAR (#070a29)                                */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-30 bg-[#070a29] border-b border-white/5 px-4 pt-3.5 pb-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => router.push('/hotels')}
            type="button"
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer"
            aria-label="Back to stays"
          >
            <ChevronLeft className="w-5 h-5 text-white" strokeWidth={2.2} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white shadow-md shadow-indigo-950/60">
              <User className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <div className="text-base font-black tracking-tight text-white leading-none">
                Rent<span className="text-[#38bdf8]">ify</span> Profile
              </div>
              <p className="text-[9px] font-semibold text-indigo-200/70 tracking-tight leading-none mt-1">
                Account &amp; Stays
              </p>
            </div>
          </div>

          {user ? (
            <button
              onClick={() => {
                logout();
                router.push('/hotels');
              }}
              type="button"
              title="Sign Out"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-rose-500/20 active:scale-95 flex items-center justify-center text-white hover:text-rose-400 border border-white/10 hover:border-rose-500/30 transition-all cursor-pointer"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" strokeWidth={2.2} />
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('otp')}
              type="button"
              className="text-xs font-bold text-indigo-300 hover:text-white px-2 py-1 rounded-lg"
            >
              Sign In
            </button>
          )}
        </header>

        {/* ========================================================================= */}
        {/* 2. SCROLLABLE CONTENT BODY                                                */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar p-3.5 sm:p-4 space-y-3.5">
          {!user ? (
            /* Unauthenticated State */
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs text-center space-y-3 mt-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#3b49df] flex items-center justify-center mx-auto shadow-inner">
                <User className="w-7 h-7" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Sign in using your mobile number and OTP to view your active bookings, vouchers, and profile details.
              </p>
              <button
                onClick={() => openAuthModal('otp')}
                type="button"
                className="w-full py-2.5 rounded-xl bg-[#3b49df] hover:bg-[#313ec9] active:scale-98 text-white font-bold text-xs shadow-md shadow-indigo-950/20 transition-all cursor-pointer"
              >
                Sign In / Register
              </button>
            </div>
          ) : (
            <>
              {/* Profile Card Summary Banner */}
              <div className="bg-gradient-to-br from-[#0c0836] via-[#1c0f64] to-[#3a1396] text-white p-4 rounded-3xl shadow-md relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-2xl bg-white text-[#3b49df] flex items-center justify-center font-black text-base shadow-md shrink-0 ring-2 ring-white/20 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{getUserInitials(user.fullName)}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h2 className="text-sm font-extrabold text-white truncate max-w-[190px]">
                        {user.fullName || 'User'}
                      </h2>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-indigo-200/80 truncate mt-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3 shrink-0 text-indigo-300" />
                      <span className="truncate">{user.email}</span>
                    </p>
                    {user.phone && (
                      <p className="text-[10px] font-mono text-emerald-300 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3 shrink-0 text-emerald-400" />
                        <span>{user.phone}</span>
                        {user.phoneVerified && (
                          <span className="text-[8.5px] bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-1.5 py-0.2 rounded font-sans font-bold">
                            Verified
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Tab Segmented Switcher */}
              <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl text-xs font-bold gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab('bookings')}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'bookings'
                      ? 'bg-white text-[#3b49df] shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>My Bookings ({bookings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'profile'
                      ? 'bg-white text-[#3b49df] shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* TAB 1: BOOKINGS LIST                                                      */}
              {/* ========================================================================= */}
              {activeTab === 'bookings' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                      Your Reservations
                    </h3>
                    <Link
                      href="/hotels"
                      className="text-[11px] font-bold text-[#3b49df] hover:underline flex items-center gap-0.5"
                    >
                      <span>Book Another</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {loading ? (
                    <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#3b49df] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs text-slate-500 font-medium">Loading reservations...</p>
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((b) => {
                        const isConfirmed = b.bookingStatus === 'confirmed';
                        const isCancelled = b.bookingStatus === 'cancelled';

                        return (
                          <div
                            key={b.bookingId}
                            className="bg-white rounded-3xl p-3.5 border border-slate-100 shadow-xs space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <CategoryBadge category={b.stayCategory} />
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${isConfirmed
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : isCancelled
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                              >
                                {b.bookingStatus}
                              </span>
                            </div>

                            <div>
                              <div className="flex items-baseline justify-between gap-1">
                                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                                  {b.hotelName}
                                </h4>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {b.bookingReference}
                                </span>
                              </div>
                              <p className="text-[10.5px] text-slate-500 mt-0.5">
                                {b.roomTypeName} &middot; Check-In: <strong className="text-slate-700">{b.checkIn}</strong>
                                {b.stayDurationMonths ? ` (${b.stayDurationMonths} Mo)` : ''}
                              </p>
                            </div>

                            {/* Financial breakdown */}
                            <div className="bg-slate-50 rounded-2xl p-2.5 text-[10.5px] space-y-1">
                              <div className="flex items-center justify-between text-slate-600">
                                <span>Total Price:</span>
                                <strong className="text-slate-900 font-bold">{formatINR(b.totalAmount)}</strong>
                              </div>
                              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                                <span>Advance Paid:</span>
                                <span>{formatINR(b.paidAmount)}</span>
                              </div>
                              {b.remainingBalance > 0 && !isCancelled && (
                                <div className="flex items-center justify-between text-amber-700 font-semibold">
                                  <span>Due at check-in:</span>
                                  <span>{formatINR(b.remainingBalance)}</span>
                                </div>
                              )}
                              {b.cancellationDetails && (
                                <div className="flex items-center justify-between text-red-700 font-medium">
                                  <span>Refund processed:</span>
                                  <span>{formatINR(b.cancellationDetails.refundAmount)}</span>
                                </div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                              <Link
                                href={`/booking/confirmation/${b.bookingId}`}
                                className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold text-center flex items-center justify-center gap-1 transition-colors"
                              >
                                <FileText className="w-3.5 h-3.5 text-[#3b49df]" />
                                <span>View Voucher</span>
                              </Link>

                              {isConfirmed && (
                                <button
                                  type="button"
                                  onClick={() => setCancellingBookingId(b.bookingId)}
                                  className="py-1.5 px-3 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-[11px] font-bold transition-colors cursor-pointer"
                                >
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Empty State matching image text */
                    <div className="text-center py-12 px-4 bg-white rounded-3xl border border-slate-100 shadow-xs space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3b49df] flex items-center justify-center mx-auto shadow-inner">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">No bookings found</h3>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        You haven&apos;t booked any student, family, or trip stays yet.
                      </p>
                      <button
                        onClick={() => router.push('/hotels')}
                        type="button"
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#3b49df] hover:bg-[#313ec9] active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span>Find Your Stay</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: EDIT PROFILE                                                       */}
              {/* ========================================================================= */}
              {activeTab === 'profile' && (
                <form
                  onSubmit={handleSaveProfile}
                  className="bg-white rounded-3xl p-4 border border-slate-100 shadow-xs space-y-3"
                >
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
                    Customer Profile &amp; Verification
                  </h3>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Full Name (as on ID) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Rajesh Sharma"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contact Mobile Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 9999900002"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Aadhaar Number */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Aadhaar Card Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={aadhaarNumber}
                        onChange={(e) => setAadhaarNumber(formatAadhaar(e.target.value))}
                        placeholder="5421 8901 2345"
                        maxLength={14}
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* College Name */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      College / University Name
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <GraduationCap className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="Christ University / BHU"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Student ID */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Student ID / Roll Number
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={studentIdNumber}
                        onChange={(e) => setStudentIdNumber(e.target.value)}
                        placeholder="CU2026-ENG-492"
                        className="w-full pl-9 pr-3 py-2 text-xs font-mono font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Emergency Contact (Parent / Guardian)
                    </label>
                    <div className="relative flex items-center">
                      <div className="absolute left-3 text-[#3b49df]">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={emergencyContact}
                        onChange={(e) => setEmergencyContact(e.target.value)}
                        placeholder="Rajesh Sharma (+91 98111 22334)"
                        className="w-full pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                      />
                    </div>
                  </div>

                  {/* Message Banner */}
                  {profileMsg && (
                    <div
                      className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${profileMsg.isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                    >
                      {profileMsg.isError ? (
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="w-full py-2.5 rounded-xl bg-[#3b49df] hover:bg-[#313ec9] active:scale-98 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {profileSaving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Save Profile Changes</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {/* Sign Out option */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-center text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        router.push('/hotels');
                      }}
                      className="text-rose-600 hover:underline font-bold cursor-pointer flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. CANCELLATION CONFIRMATION MODAL                                        */}
        {/* ========================================================================= */}
        {cancellingBookingId && (
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-slate-100 shadow-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Confirm Booking Cancellation</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Advance refunds will be calculated automatically and credited back per property cancellation policy.
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Emergency">Family emergency</option>
                  <option value="Found alternative stay">Found alternative stay</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBookingId(null)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {cancelLoading ? 'Cancelling...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. FIXED BOTTOM NAVIGATION BAR MATCHING HOTEL LISTING                     */}
        {/* ========================================================================= */}
        <nav className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around select-none">
          <button
            onClick={() => router.push('/hotels')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Home className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'bookings' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={activeTab === 'bookings' ? 2.5 : 2} />
            <span className="text-[10px]">Bookings</span>
          </button>

          <button
            onClick={() => router.push('/hotels')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Search className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Search</span>
          </button>

          <button
            onClick={() => router.push('/hotels')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Heart className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Wishlist</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${activeTab === 'profile' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
              }`}
          >
            <User className="w-5 h-5" strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a29] flex items-center justify-center text-white">
          <div className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
