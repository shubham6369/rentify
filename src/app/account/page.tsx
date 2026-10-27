'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Booking } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
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
  FileText,
  ChevronLeft,
  ChevronDown,
  LogOut,
  Home,
  Users,
  Search,
  Heart,
  BedDouble,
  Shield,
  Phone,
  Bell,
  Wifi,
  Compass
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

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
      const res = await fetch(`/api/bookings?userId=${user.uid}`);
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
    if (!name) return 'RO';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'RO').toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#070a29] flex justify-center sm:py-6 sm:px-4 select-none">
      {/* Mobile Device Frame matching Target Mockup */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[890px] bg-[#f8faff] sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        
        {/* ========================================================================= */}
        {/* 1. TOP CURVED MIDNIGHT HEADER BAR WITH NOTCH & STATUS BAR                 */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-br from-[#0c0836] via-[#1a0c5b] to-[#34118a] text-white pt-2 pb-7 px-4 rounded-b-[2.2rem] shadow-xl relative select-none shrink-0">
          
          {/* iOS Style Status Bar */}
          <div className="flex items-center justify-between text-white text-xs px-2 pt-1 pb-2">
            <span className="font-bold tracking-tight text-[11px]">9:41</span>
            <div className="flex items-center gap-1.5 text-white">
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-1.5 bg-white rounded-full"></span>
                <span className="w-0.5 h-2 bg-white rounded-full"></span>
                <span className="w-0.5 h-2.5 bg-white rounded-full"></span>
                <span className="w-0.5 h-3 bg-white rounded-full"></span>
              </div>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5 border border-white/70 rounded-md px-1 py-0.2 text-[8.5px] font-bold">
                <span>100</span>
              </div>
            </div>
          </div>

          {/* Header Identity Row */}
          <div className="flex items-center justify-between mt-1">
            {/* Left: Rentify Rounded Blue/Purple Home App Icon */}
            <button
              onClick={() => router.push('/hotels')}
              type="button"
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white shadow-md shadow-indigo-950/60 active:scale-95 transition-transform cursor-pointer"
              aria-label="Rentify Home"
            >
              <BedDouble className="w-5 h-5 text-white" strokeWidth={2.2} />
            </button>

            {/* Center: Rentify Brand & Category Subtitle */}
            <div className="text-left flex-1 ml-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white leading-none">
                  Rent<span className="text-[#38bdf8]">ify</span>
                </span>
                <span className="bg-[#3b49df] text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Find Your Stay
                </span>
              </div>
              <p className="text-[9.5px] font-semibold text-indigo-200/70 tracking-tight leading-none mt-1">
                Student &middot; Family &middot; Trip Accommodations
              </p>
            </div>

            {/* Right: Bell Notification & Red User Avatar with Dropdown */}
            <div className="flex items-center gap-2 relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                type="button"
                className="relative w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4 text-white" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0c0836]" />
              </button>

              {/* Red Circular Avatar RO with Chevron Down */}
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                type="button"
                className="flex items-center gap-1 active:scale-95 transition-transform cursor-pointer pl-0.5"
                aria-label="User Account Menu"
              >
                <div className="w-9 h-9 rounded-full bg-[#ef4444] text-white font-extrabold text-xs flex items-center justify-center shadow-md shadow-rose-950/30">
                  {getUserInitials(user?.fullName || 'Rajesh Sharma')}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white stroke-[2.5]" />
              </button>

              {/* User Dropdown Menu matching screenshot */}
              {userMenuOpen && (
                <div className="absolute right-0 top-12 z-50 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 text-slate-800 animate-fade-in space-y-1">
                  <div className="p-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {user?.fullName || 'Rajesh Sharma (Property Owner)'}
                    </p>
                    <p className="text-[10.5px] text-slate-500 truncate mt-0.5">
                      {user?.email || '9999900002@phone.findyourstay.in'}
                    </p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                      {user?.role?.toUpperCase() || 'CUSTOMER'}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('bookings');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#3b49df]" />
                    <span>My Bookings &amp; Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      openAuthModal('roles');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Switch Role / Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      router.push('/hotels');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CATEGORY BAR CARDS (Student Stay, Family Stay, Hourly, Regular)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-4 gap-2 px-3.5 -mt-4.5 z-20 relative">
          {/* 1. Student Stay (Active state in image) */}
          <button
            onClick={() => router.push('/hotels?category=student')}
            type="button"
            className="bg-indigo-50/95 border border-indigo-200 shadow-xs rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
          >
            <GraduationCap className="w-5 h-5 text-[#3b49df]" />
            <span className="text-[10px] font-bold text-[#3b49df] leading-tight">Student Stay</span>
          </button>

          {/* 2. Family Stay */}
          <button
            onClick={() => router.push('/hotels?category=family')}
            type="button"
            className="bg-white border border-slate-100 shadow-xs rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-1 hover:border-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <Users className="w-5 h-5 text-slate-700" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Family Stay</span>
          </button>

          {/* 3. Hourly Booking */}
          <button
            onClick={() => router.push('/hotels?category=hourly')}
            type="button"
            className="bg-white border border-slate-100 shadow-xs rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-1 hover:border-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <Clock className="w-5 h-5 text-slate-700" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Hourly Booking</span>
          </button>

          {/* 4. Regular Stay */}
          <button
            onClick={() => router.push('/hotels?category=regular')}
            type="button"
            className="bg-white border border-slate-100 shadow-xs rounded-2xl py-2 px-1 flex flex-col items-center justify-center gap-1 hover:border-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <Calendar className="w-5 h-5 text-slate-700" />
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Regular Stay</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* 3. SCROLLABLE BODY                                                        */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto pb-24 no-scrollbar px-3.5 pt-3 space-y-3.5">
          
          {/* USER PROFILE CARD MATCHING IMAGE EXACTLY */}
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100/90 space-y-3.5">
            <div className="flex items-start gap-3.5">
              {/* Red Circular Avatar with initials "RO" */}
              <div className="w-14 h-14 rounded-full bg-[#ef4444] text-white flex items-center justify-center font-black text-xl shadow-md shadow-rose-500/20 shrink-0">
                {getUserInitials(user?.fullName || 'Rajesh Sharma')}
              </div>

              {/* Profile Details */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 leading-tight truncate">
                    {user?.fullName || 'Rajesh Sharma'}
                  </h2>
                  <span className="text-[9.5px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                    {user?.role?.toUpperCase() || 'CUSTOMER'}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-700">
                  (Property Owner)
                </p>

                <div className="pt-0.5 space-y-1">
                  <p className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{user?.email || '9999900002@phone.findyourstay.in'}</span>
                  </p>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-[11px] font-mono text-slate-700 font-semibold flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{user?.phone || '+91 9999980002'}</span>
                    </p>
                    <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      <span>Verified</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Two Pill Tabs inside the profile card */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setActiveTab('bookings')}
                type="button"
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'bookings'
                    ? 'bg-indigo-50/80 border border-indigo-200/80 text-[#3b49df] font-extrabold shadow-2xs'
                    : 'bg-slate-50/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#3b49df]" />
                <span>My Bookings ({bookings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                type="button"
                className={`flex-1 py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-indigo-50/80 border border-indigo-200/80 text-[#3b49df] font-extrabold shadow-2xs'
                    : 'bg-slate-50/80 border border-slate-200/60 text-slate-600 hover:text-slate-900 font-semibold'
                }`}
              >
                <User className="w-4 h-4 text-slate-500" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* TAB 1: RESERVATIONS / BOOKINGS VIEW                                     */}
          {/* ======================================================================= */}
          {activeTab === 'bookings' ? (
            <div className="space-y-3">
              {/* Section Header */}
              <div className="flex items-center justify-between pt-1 px-1">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  Your Accommodation Reservations
                </h3>
                <Link
                  href="/hotels"
                  className="text-[11px] font-bold text-[#3b49df] hover:underline flex items-center gap-0.5"
                >
                  <span>Book Another Stay</span>
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
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isConfirmed
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
                /* EMPTY STATE CARD MATCHING IMAGE EXACTLY */
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
                  {/* Visual Illustration */}
                  <div className="relative w-44 h-28 flex items-center justify-center">
                    {/* Soft purple cloud shapes */}
                    <div className="absolute left-2 top-7 w-20 h-14 bg-indigo-100/50 rounded-full blur-xs" />
                    <div className="absolute right-2 top-7 w-20 h-14 bg-indigo-100/50 rounded-full blur-xs" />
                    <div className="absolute top-2 w-32 h-20 bg-indigo-50/70 rounded-full blur-xs" />

                    {/* Sparkle stars ✦ */}
                    <span className="absolute top-2 left-6 text-indigo-300 text-sm font-black select-none">✦</span>
                    <span className="absolute top-5 right-8 text-indigo-300 text-xs font-black select-none">✦</span>

                    {/* 3D-styled Calendar Icon */}
                    <div className="relative w-18 h-18 bg-gradient-to-b from-[#9ba8ff] to-[#6372ec] rounded-2xl p-1.5 shadow-md shadow-indigo-500/20 flex flex-col justify-between">
                      {/* Top binder rings */}
                      <div className="absolute -top-1.5 left-3.5 w-1.5 h-3 bg-indigo-200 rounded-full border border-indigo-400" />
                      <div className="absolute -top-1.5 right-3.5 w-1.5 h-3 bg-indigo-200 rounded-full border border-indigo-400" />

                      {/* Inner white calendar sheet */}
                      <div className="w-full h-full bg-white rounded-xl p-2 flex flex-col justify-between">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-200" />
                        <div className="w-7 h-1.5 bg-indigo-100 rounded-full ml-auto" />
                      </div>

                      {/* Purple circular badge with white ✕ */}
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#5b3df5] text-white flex items-center justify-center shadow-md ring-2 ring-white font-bold text-xs select-none">
                        ✕
                      </div>
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h4 className="text-base font-extrabold text-slate-900 mt-1">
                    No bookings found
                  </h4>
                  <p className="text-xs text-slate-500 max-w-[230px] leading-relaxed mt-1">
                    You haven&apos;t booked any student, family, or trip stays yet.
                  </p>

                  {/* Gradient Pill CTA Button */}
                  <button
                    onClick={() => router.push('/hotels')}
                    type="button"
                    className="mt-4 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#170a4a] via-[#331288] to-[#601bd3] hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-950/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Find Your Stay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ======================================================================= */
            /* TAB 2: EDIT PROFILE FORM                                                */
            /* ======================================================================= */
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm space-y-3"
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
                    placeholder="+91 9999980002"
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
                  className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                    profileMsg.isError
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
            </form>
          )}

          {/* ======================================================================= */}
          {/* 4. FOOTER CREDITS (Find Your Stay India | Privacy Policy & Terms)        */}
          {/* ======================================================================= */}
          <div className="pt-2 pb-2 px-1 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-md bg-[#3b49df] text-white flex items-center justify-center shadow-xs">
                <Compass className="w-3 h-3" />
              </div>
              <span className="font-extrabold text-slate-900 text-[10.5px]">Find Your Stay</span>
              <span className="text-slate-300">|</span>
              <span className="text-[9px] text-slate-400">
                &copy; 2026 Find Your Stay India. All rights reserved.
              </span>
            </div>

            <div className="flex items-center gap-3 text-[9.5px] font-semibold text-slate-600">
              <Link href="/privacy" className="hover:text-indigo-600">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-indigo-600">Terms of Service</Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. CANCELLATION CONFIRMATION MODAL                                        */}
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
        {/* 6. FIXED BOTTOM NAVIGATION BAR MATCHING TARGET IMAGE                      */}
        {/*    (Home, Student Stay, Family Stay, Hourly Booking, Regular Stay)        */}
        {/* ========================================================================= */}
        <nav className="absolute bottom-0 left-0 right-0 z-30 bg-white/98 backdrop-blur-md border-t border-slate-100 rounded-t-[1.75rem] shadow-[0_-4px_25px_rgba(0,0,0,0.06)] px-2 py-2 flex items-center justify-around select-none">
          {/* 1. Home (Active state with indicator in target image) */}
          <button
            onClick={() => router.push('/hotels')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-[#3b49df]"
          >
            <Home className="w-5 h-5 fill-[#3b49df]" strokeWidth={0} />
            <span className="text-[10px] font-bold">Home</span>
            <span className="w-8 h-1 bg-[#3b49df] rounded-full mt-0.5" />
          </button>

          {/* 2. Student Stay */}
          <button
            onClick={() => router.push('/hotels?category=student')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <GraduationCap className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Student Stay</span>
          </button>

          {/* 3. Family Stay */}
          <button
            onClick={() => router.push('/hotels?category=family')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Users className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Family Stay</span>
          </button>

          {/* 4. Hourly Booking */}
          <button
            onClick={() => router.push('/hotels?category=hourly')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Clock className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Hourly Booking</span>
          </button>

          {/* 5. Regular Stay */}
          <button
            onClick={() => router.push('/hotels?category=regular')}
            type="button"
            className="flex flex-col items-center gap-0.5 transition-colors cursor-pointer text-slate-400 hover:text-slate-700"
          >
            <Calendar className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px] font-medium">Regular Stay</span>
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
