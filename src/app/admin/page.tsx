'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Hotel, Booking, StayCategory, PropertyType, ApprovalStatus } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import {
  Building,
  Shield,
  CreditCard,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Calendar,
  Users,
  Compass,
  GraduationCap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Receipt
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, openAuthModal, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'accommodations' | 'bookings' | 'add_property'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New Property Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StayCategory>('student');
  const [propertyType, setPropertyType] = useState<PropertyType>('hostel');
  const [city, setCity] = useState('Bangalore');
  const [address, setAddress] = useState('');
  const [startingPrice, setStartingPrice] = useState(12000);
  const [monthlyRent, setMonthlyRent] = useState(12000);
  const [securityDeposit, setSecurityDeposit] = useState(15000);
  const [advancePaymentValue, setAdvancePaymentValue] = useState(30);
  const [coverImage, setCoverImage] = useState('https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80');
  const [description, setDescription] = useState('');
  const [formMsg, setFormMsg] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Counter Payment Modal State
  const [counterPaymentBooking, setCounterPaymentBooking] = useState<Booking | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMethod, setCounterMethod] = useState('Cash');
  const [counterLoading, setCounterLoading] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'property_owner';

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Metrics
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.metrics);

      // 2. Load Hotels
      const hRes = await fetch(`/api/hotels?includeAll=true${isOwner && !isAdmin ? `&ownerId=${user?.uid}` : ''}`);
      const hData = await hRes.json();
      if (hData.success) setHotels(hData.hotels);

      // 3. Load Bookings
      const bRes = await fetch(`/api/bookings?role=${user?.role}`);
      const bData = await bRes.json();
      if (bData.success) setBookings(bData.bookings);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (isAdmin || isOwner)) {
      loadData();
    }
  }, [user]);

  const handleApproval = async (hotelId: string, approvalStatus: ApprovalStatus) => {
    try {
      const res = await fetch(`/api/hotels/${hotelId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalStatus,
          adminRole: user?.role
        })
      });
      const data = await res.json();
      if (data.success) {
        await loadData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Approval failed:', err);
    }
  };

  const handleDeleteProperty = async (hotelId: string) => {
    if (!confirm('Are you sure you want to remove this property listing?')) return;
    try {
      const res = await fetch(`/api/hotels/${hotelId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        await loadData();
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormMsg(null);
    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          propertyType,
          city,
          address,
          startingPrice: Number(startingPrice),
          monthlyRent: category === 'student' ? Number(monthlyRent) : undefined,
          securityDeposit: category === 'student' ? Number(securityDeposit) : undefined,
          advancePaymentType: category === 'student' ? 'fixed' : 'percentage',
          advancePaymentValue: category === 'student' ? Number(securityDeposit) : Number(advancePaymentValue),
          coverImage,
          description,
          ownerId: user?.uid,
          ownerRole: user?.role
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg(data.message);
        setName('');
        setDescription('');
        await loadData();
        setActiveTab('accommodations');
      } else {
        setFormMsg(data.message || 'Failed to create listing');
      }
    } catch (err: any) {
      setFormMsg(err?.message || 'Server error creating listing');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleRecordCounterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counterPaymentBooking || !counterAmount) return;

    setCounterLoading(true);
    try {
      const res = await fetch(`/api/bookings/${counterPaymentBooking.bookingId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(counterAmount),
          method: counterMethod,
          recordedBy: user?.fullName || 'Reception Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        setCounterPaymentBooking(null);
        setCounterAmount('');
        await loadData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Counter payment error:', err);
    } finally {
      setCounterLoading(false);
    }
  };

  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  if (!user || (!isAdmin && !isOwner)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Host & Admin Center</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          This management section is reserved for verified property owners and platform administrators.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => switchRole('admin')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200"
          >
            Switch to Admin Demo
          </button>
          <button
            onClick={() => switchRole('property_owner')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200"
          >
            Switch to Host Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Bar */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              {isAdmin ? 'System Administrator Portal' : 'Property Host Dashboard'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {isAdmin ? 'Find Your Stay Operations Center' : 'Your Property Management Desk'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong>{user.fullName}</strong> ({user.email})
          </p>
        </div>

        {/* Action Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('accommodations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'accommodations'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Accommodations ({hotels.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'bookings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Bookings Ledger ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('add_property')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'add_property'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & FINANCIAL METRICS */}
      {activeTab === 'overview' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Gross Booking Value
              </span>
              <span className="text-2xl font-black text-slate-900 block">
                {formatINR(metrics.grossBookingValue)}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Across verified reservations
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-1 bg-emerald-50/20">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                Advance Payments Collected
              </span>
              <span className="text-2xl font-black text-emerald-700 block">
                {formatINR(metrics.advancePaymentsReceived)}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium">
                Verified via Razorpay Gateway
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs space-y-1 bg-amber-50/20">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Outstanding Balance Receivables
              </span>
              <span className="text-2xl font-black text-amber-700 block">
                {formatINR(metrics.outstandingBalances)}
              </span>
              <span className="text-[11px] text-amber-700 font-medium">
                Due upon physical check-in
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pending Approvals
              </span>
              <span className="text-2xl font-black text-indigo-600 block">
                {metrics.pendingApprovalsCount} Listings
              </span>
              <span className="text-[11px] text-slate-500">
                Awaiting admin review
              </span>
            </div>
          </div>

          {/* Breakdown by Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  Student Category
                </span>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{metrics.studentStays} Hostels & PGs</h3>
              <p className="text-xs text-slate-500">
                Active university residences with monthly rent schedules and security deposits.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  Family Category
                </span>
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{metrics.familyStays} Villas & Chalets</h3>
              <p className="text-xs text-slate-500">
                Accommodations with multi-bedroom units, child cots, and 30% advance policies.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Trip Category
                </span>
                <Compass className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{metrics.tripStays} Hotels & Resorts</h3>
              <p className="text-xs text-slate-500">
                Vacation & leisure properties with daily rates and flexible cancellation terms.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOMMODATIONS MANAGEMENT & APPROVAL WORKFLOW */}
      {activeTab === 'accommodations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {isAdmin ? 'All Platform Listings & Verification Desk' : 'Your Managed Listings'}
            </h2>
            <button
              onClick={() => setActiveTab('add_property')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Listing</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Property & Location</th>
                    <th className="px-4 py-4 font-bold">Category & Type</th>
                    <th className="px-4 py-4 font-bold">Pricing & Advance</th>
                    <th className="px-4 py-4 font-bold">Approval Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {hotels.map((h) => {
                    const isPending = h.approvalStatus === 'pending';
                    const isApproved = h.approvalStatus === 'approved';
                    return (
                      <tr key={h.hotelId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={h.coverImage}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <Link
                                href={`/hotels/${h.hotelId}`}
                                className="font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1"
                              >
                                {h.name}
                              </Link>
                              <span className="text-[11px] text-slate-500">
                                {h.city}, {h.state}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-1">
                            <CategoryBadge category={h.category} />
                            <span className="text-[10px] text-slate-500 uppercase block font-bold">
                              {h.propertyType}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <span className="font-bold text-slate-900">
                              {h.category === 'student'
                                ? `${formatINR(h.monthlyRent || h.startingPrice)}/mo`
                                : `${formatINR(h.startingPrice)}/nt`}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              Adv: {h.advancePaymentValue}{h.advancePaymentType === 'percentage' ? '%' : ' INR'}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isPending
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}
                          >
                            {h.approvalStatus}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {isAdmin && isPending && (
                              <>
                                <button
                                  onClick={() => handleApproval(h.hotelId, 'approved')}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                                  title="Approve Listing"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproval(h.hotelId, 'rejected')}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px] transition-colors"
                                  title="Reject Listing"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            <Link
                              href={`/hotels/${h.hotelId}`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px]"
                            >
                              View
                            </Link>

                            <button
                              onClick={() => handleDeleteProperty(h.hotelId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete property"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS LEDGER & DESK COUNTER PAYMENT SETTLEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Master Bookings & Payment Ledger</h2>
              <p className="text-xs text-slate-500">
                Track payments and record guest check-in counter settlements for remaining balances.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Booking Ref</th>
                    <th className="px-4 py-4 font-bold">Guest & Stay</th>
                    <th className="px-4 py-4 font-bold">Category</th>
                    <th className="px-4 py-4 font-bold">Financial Settlement</th>
                    <th className="px-6 py-4 font-bold text-right">Desk Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {bookings.map((b) => (
                    <tr key={b.bookingId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">
                        {b.bookingReference}
                        <span className="block font-sans text-[10px] text-slate-400">
                          {new Date(b.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 block">{b.guestDetails.fullName}</span>
                          <span className="text-[11px] text-slate-500 block">{b.hotelName}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {b.checkIn} {b.checkOut ? `to ${b.checkOut}` : ''}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <CategoryBadge category={b.stayCategory} />
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="text-slate-900 font-bold block">
                            Total: {formatINR(b.totalAmount)}
                          </span>
                          <span className="text-emerald-700 font-medium block">
                            Paid: {formatINR(b.paidAmount)}
                          </span>
                          {b.remainingBalance > 0 ? (
                            <span className="text-amber-700 font-bold block">
                              Balance: {formatINR(b.remainingBalance)}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-bold block text-[10px]">
                              ✓ Fully Settled
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {b.remainingBalance > 0 && b.bookingStatus === 'confirmed' ? (
                            <button
                              onClick={() => {
                                setCounterPaymentBooking(b);
                                setCounterAmount(b.remainingBalance.toString());
                              }}
                              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors"
                            >
                              Record Payment
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Complete</span>
                          )}

                          <Link
                            href={`/booking/confirmation/${b.bookingId}`}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ADD ACCOMMODATION FORM */}
      {activeTab === 'add_property' && (
        <form onSubmit={handleCreateProperty} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">List a New Accommodation</h2>
            <p className="text-xs text-slate-500">
              Publish student hostels, family villas, or trip resorts. Property owners listings require administrator approval.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Greenwood Student Hostel & Co-Living"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Stay Category
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as StayCategory;
                  setCategory(cat);
                  setPropertyType(cat === 'student' ? 'hostel' : cat === 'family' ? 'villa' : 'hotel');
                }}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="student">🎓 Student Stay</option>
                <option value="family">👨‍👩‍👧‍👦 Family Stay</option>
                <option value="trip">✈️ Trip Stay</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property Sub-Type
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                {category === 'student' && (
                  <>
                    <option value="hostel">Student Hostel</option>
                    <option value="pg">Paying Guest (PG)</option>
                  </>
                )}
                {category === 'family' && (
                  <>
                    <option value="villa">Private Villa</option>
                    <option value="apartment">Family Apartment</option>
                  </>
                )}
                {category === 'trip' && (
                  <>
                    <option value="hotel">Boutique Hotel</option>
                    <option value="resort">Leisure Resort</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Location
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="Bangalore">Bangalore</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Shimla">Shimla</option>
                <option value="Udaipur">Udaipur</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Christ University Gate, Koramangala"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                required
              />
            </div>

            {category === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Rent (INR)
                  </label>
                  <input
                    type="number"
                    value={monthlyRent}
                    onChange={(e) => setMonthlyRent(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Deposit Advance (INR)
                  </label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Starting Nightly Rate (INR)
                  </label>
                  <input
                    type="number"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Required Advance (%)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={advancePaymentValue}
                    onChange={(e) => setAdvancePaymentValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                    required
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Photo URL
              </label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-medium"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description & Amenities
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention study amenities, Wi-Fi speed, mess meal items, or family pool..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 h-24 resize-none font-medium"
                required
              />
            </div>
          </div>

          {formMsg && (
            <p className="text-xs font-bold text-emerald-600">{formMsg}</p>
          )}

          <button
            type="submit"
            disabled={formSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
          >
            {formSubmitting
              ? 'Submitting...'
              : isAdmin
              ? 'Publish Listing Immediately'
              : 'Submit Listing for Admin Approval'}
          </button>
        </form>
      )}

      {/* COUNTER PAYMENT RECORDING MODAL */}
      {counterPaymentBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleRecordCounterPayment}
            className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900">
              Record Desk Payment ({counterPaymentBooking.bookingReference})
            </h3>
            <p className="text-xs text-slate-500">
              Guest: <strong>{counterPaymentBooking.guestDetails.fullName}</strong> • Remaining Balance:{' '}
              <strong className="text-amber-700">{formatINR(counterPaymentBooking.remainingBalance)}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Settlement Amount (INR)
              </label>
              <input
                type="number"
                max={counterPaymentBooking.remainingBalance}
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel
              </label>
              <select
                value={counterMethod}
                onChange={(e) => setCounterMethod(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="Cash at Front Desk">Cash at Front Desk</option>
                <option value="Desk POS Card Swipe">Desk POS Card Swipe</option>
                <option value="Direct UPI at Desk">Direct UPI at Desk</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCounterPaymentBooking(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={counterLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
              >
                {counterLoading ? 'Recording...' : 'Confirm & Update Ledger'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
