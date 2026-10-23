'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  XCircle,
  FileText
} from 'lucide-react';

export default function AccountPage() {
  const { user, openAuthModal, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [studentIdNumber, setStudentIdNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
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
      setProfileMsg('Profile updated successfully!');
    } else {
      setProfileMsg(res.message);
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <User className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Sign in using your mobile number and OTP or email to view your booking vouchers and profile details.
        </p>
        <button
          onClick={() => openAuthModal('otp')}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-200"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Profile Bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{user.fullName}</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {user.email}
              </span>
              {user.phone && (
                <span className="flex items-center gap-1 font-mono">
                  <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                  {user.phone}
                  {user.phoneVerified && (
                    <span className="text-emerald-600 font-sans font-bold text-[10px] ml-1">
                      (Verified)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'bookings'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            My Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* TAB 1: BOOKINGS LIST */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Accommodation Reservations</h2>
            <Link
              href="/hotels"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>Book Another Stay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Loading your reservations...
            </div>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((b) => {
                const isConfirmed = b.bookingStatus === 'confirmed';
                const isCancelled = b.bookingStatus === 'cancelled';
                return (
                  <div
                    key={b.bookingId}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={b.stayCategory} />
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {b.bookingReference}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
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

                      <h3 className="text-base font-bold text-slate-900">{b.hotelName}</h3>
                      <p className="text-xs text-slate-500">
                        {b.roomTypeName} • Check-In: <strong>{b.checkIn}</strong>
                        {b.checkOut && ` to ${b.checkOut}`}
                        {b.stayDurationMonths && ` (${b.stayDurationMonths} Months)`}
                      </p>

                      {/* Financial status summary */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                        <span className="text-slate-600">
                          Total: <strong>{formatINR(b.totalAmount)}</strong>
                        </span>
                        <span className="text-emerald-700 font-semibold">
                          Advance Paid: {formatINR(b.paidAmount)}
                        </span>
                        {b.remainingBalance > 0 && !isCancelled && (
                          <span className="text-amber-700 font-semibold">
                            Remaining: {formatINR(b.remainingBalance)} (Due at desk)
                          </span>
                        )}
                        {b.cancellationDetails && (
                          <span className="text-red-700 font-medium">
                            Refund: {formatINR(b.cancellationDetails.refundAmount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <Link
                        href={`/booking/confirmation/${b.bookingId}`}
                        className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>View Voucher</span>
                      </Link>

                      {isConfirmed && (
                        <button
                          onClick={() => setCancellingBookingId(b.bookingId)}
                          className="px-3.5 py-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 text-xs font-bold transition-colors"
                        >
                          Cancel Stay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No bookings found</h3>
              <p className="text-xs text-slate-500">You haven&apos;t booked any student, family, or trip stays yet.</p>
              <Link
                href="/hotels"
                className="inline-block px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Find Your Stay
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE EDITOR */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Customer Profile & Student Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Aadhaar Card Number
              </label>
              <input
                type="text"
                value={aadhaarNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                  const parts = [];
                  for (let i = 0; i < raw.length; i += 4) {
                    parts.push(raw.slice(i, i + 4));
                  }
                  setAadhaarNumber(parts.join(' '));
                }}
                placeholder="xxxx xxxx xxxx"
                maxLength={14}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-mono font-medium"
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
                placeholder="e.g. Christ University"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Enrollment Number
              </label>
              <input
                type="text"
                value={studentIdNumber}
                onChange={(e) => setStudentIdNumber(e.target.value)}
                placeholder="e.g. CU2026-ENG-492"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact (Parent / Guardian Name & Number)
              </label>
              <input
                type="text"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="e.g. Rajesh Sharma (+91 98111 22334)"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
              />
            </div>
          </div>

          {profileMsg && (
            <p className="text-xs font-bold text-emerald-600">{profileMsg}</p>
          )}

          <button
            type="submit"
            disabled={profileSaving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {profileSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      )}

      {/* CANCELLATION MODAL */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Booking Cancellation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Cancellation is processed per the property&apos;s cancellation policy. Advance refunds will be calculated automatically and credited back to the original payment source.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Change of plans">Change of travel or college plans</option>
                <option value="Emergency">Family emergency</option>
                <option value="Found alternative stay">Found alternative accommodation</option>
                <option value="Other">Other reason</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm & Process Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
