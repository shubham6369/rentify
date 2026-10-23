'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Hotel, Booking, Room, UserProfile, UserRole, StayCategory, PropertyType, ApprovalStatus } from '@/types';
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
  Receipt,
  Edit3,
  DoorOpen,
  BedDouble,
  Search,
  Check,
  X,
  Phone,
  Mail,
  UserCheck,
  RefreshCw
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, openAuthModal, switchRole } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'accommodations' | 'rooms' | 'bookings' | 'users' | 'add_property'>('overview');
  const [metrics, setMetrics] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [hotelSearch, setHotelSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');

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

  // Edit Hotel / Price Modal State
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editPriceStarting, setEditPriceStarting] = useState(0);
  const [editPriceMonthly, setEditPriceMonthly] = useState(0);
  const [editPriceDeposit, setEditPriceDeposit] = useState(0);
  const [editAdvanceVal, setEditAdvanceVal] = useState(30);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editCover, setEditCover] = useState('');
  const [editStatus, setEditStatus] = useState<string>('published');
  const [editLoading, setEditLoading] = useState(false);

  // Manage Rooms Modal State
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<Hotel | null>(null);
  const [hotelRooms, setHotelRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [newRoomType, setNewRoomType] = useState('');
  const [newRoomBed, setNewRoomBed] = useState('Queen Bed');
  const [newRoomBasePrice, setNewRoomBasePrice] = useState(2500);
  const [newRoomMonthlyPrice, setNewRoomMonthlyPrice] = useState(10000);
  const [newRoomAdults, setNewRoomAdults] = useState(2);
  const [newRoomInventory, setNewRoomInventory] = useState(5);
  const [addingRoom, setAddingRoom] = useState(false);

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

      // 4. Load Users (Admin only)
      if (isAdmin) {
        const uRes = await fetch('/api/admin/users');
        const uData = await uRes.json();
        if (uData.success) setUsersList(uData.users);
      }
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

  // HOTEL ACTIONS
  const handleApproval = async (hotelId: string, approvalStatus: ApprovalStatus) => {
    try {
      const res = await fetch(`/api/hotels/${hotelId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus, adminRole: user?.role })
      });
      const data = await res.json();
      if (data.success) {
        setHotels((prev) =>
          prev.map((h) => (h.hotelId === hotelId ? { ...h, approvalStatus } : h))
        );
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleDeleteProperty = async (hotelId: string) => {
    if (!window.confirm('Are you sure you want to delete this accommodation property?')) return;
    try {
      const res = await fetch(`/api/hotels/${hotelId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHotels((prev) => prev.filter((h) => h.hotelId !== hotelId));
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setEditName(hotel.name);
    setEditCity(hotel.city);
    setEditCover(hotel.coverImage);
    setEditPriceStarting(hotel.startingPrice || 0);
    setEditPriceMonthly(hotel.monthlyRent || 0);
    setEditPriceDeposit(hotel.securityDeposit || 0);
    setEditAdvanceVal(hotel.advancePaymentValue || 30);
    setEditStatus(hotel.status || 'published');
  };

  const handleSaveHotelEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHotel) return;
    setEditLoading(true);
    try {
      const res = await fetch(`/api/hotels/${editingHotel.hotelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          city: editCity,
          coverImage: editCover,
          startingPrice: Number(editPriceStarting),
          monthlyRent: Number(editPriceMonthly),
          securityDeposit: Number(editPriceDeposit),
          advancePaymentValue: Number(editAdvanceVal),
          status: editStatus
        })
      });
      const data = await res.json();
      if (data.success && data.hotel) {
        setHotels((prev) =>
          prev.map((h) => (h.hotelId === editingHotel.hotelId ? { ...h, ...data.hotel } : h))
        );
        setEditingHotel(null);
      } else {
        alert(data.message || 'Failed to update property');
      }
    } catch (err) {
      alert('Error updating property');
    } finally {
      setEditLoading(false);
    }
  };

  // ROOMS MANAGEMENT
  const openRoomsModal = async (hotel: Hotel) => {
    setSelectedHotelForRooms(hotel);
    setRoomsLoading(true);
    try {
      const res = await fetch(`/api/rooms?hotelId=${hotel.hotelId}`);
      const data = await res.json();
      if (data.success) {
        setHotelRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setRoomsLoading(false);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotelForRooms || !newRoomType) return;
    setAddingRoom(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotelId: selectedHotelForRooms.hotelId,
          roomType: newRoomType,
          bedType: newRoomBed,
          basePrice: Number(newRoomBasePrice),
          monthlyPrice: Number(newRoomMonthlyPrice),
          capacity: { adults: Number(newRoomAdults), children: 1, maxGuests: Number(newRoomAdults) + 1 },
          totalInventory: Number(newRoomInventory)
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setHotelRooms((prev) => [...prev, data.room]);
        setNewRoomType('');
      } else {
        alert(data.message || 'Failed to create room');
      }
    } catch (err) {
      alert('Error creating room');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleUpdateRoomPrice = async (roomId: string, newBasePrice: number) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ basePrice: newBasePrice })
      });
      const data = await res.json();
      if (data.success) {
        setHotelRooms((prev) =>
          prev.map((r) => (r.roomId === roomId ? { ...r, basePrice: newBasePrice } : r))
        );
      }
    } catch (err) {
      alert('Failed to update room price');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Delete this room type?')) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHotelRooms((prev) => prev.filter((r) => r.roomId !== roomId));
      }
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  // USER MANAGEMENT
  const handleUpdateUserRole = async (uid: string, newRole: UserRole) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: newRole })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
        );
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch (err) {
      alert('Error updating user role');
    }
  };

  // ADD PROPERTY
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
          monthlyRent: Number(monthlyRent),
          securityDeposit: Number(securityDeposit),
          advancePaymentType: category === 'student' ? 'fixed' : 'percentage',
          advancePaymentValue: category === 'student' ? Number(securityDeposit) : Number(advancePaymentValue),
          coverImage,
          description,
          ownerId: user?.uid,
          rules: ['Valid ID mandatory', 'No loud noise after 10 PM'],
          amenities: ['Wi-Fi', '24/7 Power Backup', 'Housekeeping', 'CCTV Security']
        })
      });
      const data = await res.json();
      if (data.success && data.hotel) {
        setHotels((prev) => [data.hotel, ...prev]);
        setFormMsg('Accommodation published successfully!');
        setName('');
        setAddress('');
        setDescription('');
        setTimeout(() => {
          setActiveTab('accommodations');
          setFormMsg(null);
        }, 1200);
      } else {
        setFormMsg(data.message || 'Failed to add property');
      }
    } catch (err: any) {
      setFormMsg(err?.message || 'Server error creating listing');
    } finally {
      setFormSubmitting(false);
    }
  };

  // COUNTER PAYMENT
  const handleRecordCounterPayment = async () => {
    if (!counterPaymentBooking) return;
    setCounterLoading(true);
    try {
      const res = await fetch(`/api/bookings/${counterPaymentBooking.bookingId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(counterAmount),
          paymentMethod: counterMethod,
          collectedBy: user?.fullName || 'Reception Desk'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === counterPaymentBooking.bookingId ? data.booking : b))
        );
        setCounterPaymentBooking(null);
        loadData();
      } else {
        alert(data.message || 'Failed to record desk payment');
      }
    } catch (err) {
      alert('Network error recording payment');
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

  const filteredHotels = hotels.filter((h) =>
    h.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    h.city.toLowerCase().includes(hotelSearch.toLowerCase()) ||
    h.category.toLowerCase().includes(hotelSearch.toLowerCase())
  );

  const filteredUsers = usersList.filter((u) =>
    u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone && u.phone.includes(userSearch))
  );

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.paymentStatus === bookingFilter || b.stayCategory === bookingFilter;
  });

  if (!user || (!isAdmin && !isOwner)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <Shield className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-900">Host & Admin Operations Center</h2>
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
          {isAdmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Users & Members ({usersList.length})
            </button>
          )}
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
                Gross Booking Volume
              </span>
              <h3 className="text-2xl font-black text-slate-900">{formatINR(metrics.grossBookingValue)}</h3>
              <p className="text-[11px] text-slate-400">Total contractual reservation value</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Advance Paid (Escrow)
              </span>
              <h3 className="text-2xl font-black text-emerald-600">
                {formatINR(metrics.advancePaymentsReceived)}
              </h3>
              <p className="text-[11px] text-slate-400">Paid online via Razorpay HMAC</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pending Balance Due
              </span>
              <h3 className="text-2xl font-black text-amber-600">
                {formatINR(metrics.outstandingBalances)}
              </h3>
              <p className="text-[11px] text-slate-400">Due at desk during check-in</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Active Listings
              </span>
              <h3 className="text-2xl font-black text-indigo-600">{metrics.totalHotels} Stays</h3>
              <p className="text-[11px] text-slate-400">Across Student, Family & Trip categories</p>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                  Student Category
                </span>
                <GraduationCap className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{metrics.studentStays} Hostels & PGs</h3>
              <p className="text-xs text-slate-500">
                Equipped with study pods, 300 Mbps Wi-Fi, 4 meals, and biometric curfew gates.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  Family Category
                </span>
                <Users className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">{metrics.familyStays} Villas & Chalets</h3>
              <p className="text-xs text-slate-500">
                Villas with baby cots, modular kitchens, multi-bedroom suites, and lawns.
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
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

      {/* TAB 2: ACCOMMODATIONS MANAGEMENT & PRICE EDITING */}
      {activeTab === 'accommodations' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search properties by name or city..."
                value={hotelSearch}
                onChange={(e) => setHotelSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setActiveTab('add_property')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-xs self-start sm:self-auto"
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
                    <th className="px-4 py-4 font-bold">Current Pricing</th>
                    <th className="px-4 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredHotels.map((h) => {
                    const isApproved = h.approvalStatus === 'approved';
                    const isPending = h.approvalStatus === 'pending';
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
                              Adv: {h.advancePaymentValue}{h.advancePaymentType === 'percentage' ? '%' : ' INR'} | Dep: {formatINR(h.securityDeposit || 0)}
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
                            {/* Edit Price & Info Button */}
                            <button
                              onClick={() => openEditModal(h)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                              title="Update Price & Info"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Edit Price</span>
                            </button>

                            {/* Rooms Button */}
                            <button
                              onClick={() => openRoomsModal(h)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                              title="Manage Room Inventory"
                            >
                              <DoorOpen className="w-3.5 h-3.5" />
                              <span>Rooms</span>
                            </button>

                            {isAdmin && isPending && (
                              <button
                                onClick={() => handleApproval(h.hotelId, 'approved')}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                              >
                                Approve
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteProperty(h.hotelId)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete Property"
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

      {/* TAB 3: BOOKINGS & PAYMENT LEDGER */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Master Bookings & Payment Ledger</h2>
              <p className="text-xs text-slate-500">
                Track payments and record guest check-in counter settlements for remaining balances.
              </p>
            </div>
            <select
              value={bookingFilter}
              onChange={(e) => setBookingFilter(e.target.value)}
              className="text-xs px-3 py-2 border border-slate-200 rounded-xl bg-white font-medium"
            >
              <option value="all">All Bookings</option>
              <option value="advance_paid">Advance Paid</option>
              <option value="fully_paid">Fully Paid</option>
              <option value="pending">Pending</option>
              <option value="student">Student Stays</option>
              <option value="family">Family Stays</option>
              <option value="trip">Trip Stays</option>
            </select>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">Booking Ref</th>
                    <th className="px-4 py-4 font-bold">Guest & Stay</th>
                    <th className="px-4 py-4 font-bold">Category</th>
                    <th className="px-4 py-4 font-bold">Financial Summary</th>
                    <th className="px-4 py-4 font-bold">Payment Status</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredBookings.map((b) => {
                    const isFullyPaid = b.paymentStatus === 'fully_paid';
                    const hasRemaining = (b.remainingBalance || 0) > 0;
                    return (
                      <tr key={b.bookingId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                          {b.bookingReference}
                          <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {b.guestDetails.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {b.guestDetails.phone}
                            </span>
                            <span className="text-[11px] text-indigo-900 font-semibold mt-1 block">
                              {b.hotelName} ({b.roomTypeName || 'Standard Room'})
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <CategoryBadge category={b.stayCategory} />
                        </td>

                        <td className="px-4 py-4">
                          <div className="space-y-0.5">
                            <span className="font-bold text-slate-900 block">
                              Total: {formatINR(b.totalAmount)}
                            </span>
                            <span className="text-[11px] text-emerald-600 block">
                              Paid: {formatINR(b.paidAmount || 0)}
                            </span>
                            {hasRemaining && (
                              <span className="text-[11px] text-amber-600 font-bold block">
                                Due: {formatINR(b.remainingBalance || 0)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isFullyPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : b.paymentStatus === 'advance_paid'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {b.paymentStatus.replace('_', ' ')}
                          </span>
                          {b.paymentDetails?.razorpayPaymentId && (
                            <span className="block font-mono text-[9px] text-slate-400 mt-1">
                              ID: {b.paymentDetails.razorpayPaymentId.slice(-8)}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {hasRemaining && (
                              <button
                                onClick={() => {
                                  setCounterPaymentBooking(b);
                                  setCounterAmount(String(b.remainingBalance || 0));
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                              >
                                Record Payment
                              </button>
                            )}
                            <Link
                              href={`/booking/confirmation/${b.bookingId}`}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px]"
                            >
                              Pass
                            </Link>
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

      {/* TAB 4: USERS & MEMBERS DIRECTORY */}
      {activeTab === 'users' && isAdmin && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Registered Users & Membership Directory</h2>
              <p className="text-xs text-slate-500">
                View all user profiles, contact information, role assignments, and verification status.
              </p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search users by name, email, phone..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-4 py-4 font-bold">Contact Details</th>
                    <th className="px-4 py-4 font-bold">Role</th>
                    <th className="px-4 py-4 font-bold">Student / Aadhaar Info</th>
                    <th className="px-4 py-4 font-bold">Joined</th>
                    <th className="px-6 py-4 font-bold text-right">Assign Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredUsers.map((u) => {
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs">
                              {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{u.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">UID: {u.uid.slice(-6)}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{u.email}</span>
                          </div>
                          {u.phone && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : u.role === 'property_owner'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          {u.collegeName ? (
                            <div>
                              <span className="font-bold text-slate-800 block">{u.collegeName}</span>
                              <span className="text-[10px] text-slate-500">ID: {u.studentIdNumber || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">General Guest</span>
                          )}
                        </td>

                        <td className="px-4 py-4 text-slate-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) => handleUpdateUserRole(u.uid, e.target.value as UserRole)}
                            className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none focus:border-indigo-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="property_owner">Property Owner</option>
                            <option value="admin">Administrator</option>
                          </select>
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

      {/* TAB 5: ADD NEW PROPERTY */}
      {activeTab === 'add_property' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-xl font-black text-slate-900">List New Stay Accommodation</h2>
            <p className="text-xs text-slate-500">
              Submit your property listing. Admins can verify and publish it to the live platform.
            </p>
          </div>

          {formMsg && (
            <div
              className={`p-4 rounded-xl text-xs font-bold ${
                formMsg.includes('success')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {formMsg}
            </div>
          )}

          <form onSubmit={handleCreateProperty} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Property Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Oxford Scholars Luxury Hostel & Co-Living"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Stay Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as StayCategory)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="student">Student Stay (Monthly Rent & Deposit)</option>
                  <option value="family">Family Stay (30% Advance + Check-in Remainder)</option>
                  <option value="trip">Trip Stay (Daily / Package & Full / Advance Option)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="hostel">Hostel</option>
                  <option value="pg">PG</option>
                  <option value="villa">Villa</option>
                  <option value="apartment">Apartment</option>
                  <option value="hotel">Hotel</option>
                  <option value="resort">Resort</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Near Christ University, Koramangala"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
            </div>

            {/* Dynamic Pricing Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {category === 'student' ? 'Monthly Rent (INR)' : 'Nightly Price (INR)'}
                </label>
                <input
                  type="number"
                  required
                  value={category === 'student' ? monthlyRent : startingPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (category === 'student') setMonthlyRent(v);
                    else setStartingPrice(v);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  {category === 'student' ? 'Refundable Deposit (INR)' : 'Advance Payment (%)'}
                </label>
                <input
                  type="number"
                  required
                  value={category === 'student' ? securityDeposit : advancePaymentValue}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (category === 'student') setSecurityDeposit(v);
                    else setAdvancePaymentValue(v);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Cover Photo URL</label>
                <input
                  type="url"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Highlight Wi-Fi speeds, mess food quality, study rooms, or private pool amenities..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
            >
              {formSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Submit Property Listing</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* EDIT HOTEL / PRICE MODAL */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Update Property Details & Pricing</h3>
                <p className="text-xs text-slate-500">Live syncs across all mobile apps & web</p>
              </div>
              <button
                onClick={() => setEditingHotel(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHotelEdit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Title</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Prices */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingHotel.category === 'student' ? 'Monthly Rent (₹)' : 'Starting Price / Nt (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingHotel.category === 'student' ? editPriceMonthly : editPriceStarting}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingHotel.category === 'student') setEditPriceMonthly(v);
                      else setEditPriceStarting(v);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold bg-white text-indigo-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editingHotel.category === 'student' ? 'Security Deposit (₹)' : 'Advance Booking (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editingHotel.category === 'student' ? editPriceDeposit : editAdvanceVal}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editingHotel.category === 'student') setEditPriceDeposit(v);
                      else setEditAdvanceVal(v);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold bg-white text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cover Image URL</label>
                <input
                  type="url"
                  value={editCover}
                  onChange={(e) => setEditCover(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingHotel(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MANAGE ROOMS MODAL */}
      {selectedHotelForRooms && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Rooms & Inventory — {selectedHotelForRooms.name}
                </h3>
                <p className="text-xs text-slate-500">Configure room types, bed setups, and room prices</p>
              </div>
              <button
                onClick={() => setSelectedHotelForRooms(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Existing Rooms List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Configured Room Types</h4>
              {roomsLoading ? (
                <div className="py-8 text-center text-slate-400">Loading rooms...</div>
              ) : hotelRooms.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500">
                  No separate room types configured yet. Add your first room below!
                </div>
              ) : (
                <div className="space-y-2">
                  {hotelRooms.map((r) => (
                    <div
                      key={r.roomId}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block text-sm">{r.roomType}</span>
                        <span className="text-[11px] text-slate-500 block">
                          Bed: {r.bedType} | Capacity: {r.capacity.adults} Adults | Stock: {r.totalInventory}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="font-mono font-bold text-indigo-700 block text-sm">
                            {formatINR(r.basePrice)}/nt
                          </span>
                          {r.monthlyPrice && (
                            <span className="font-mono text-[10px] text-slate-500 block">
                              {formatINR(r.monthlyPrice)}/mo
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            const p = window.prompt('Enter new nightly rate for ' + r.roomType, String(r.basePrice));
                            if (p && !isNaN(Number(p))) handleUpdateRoomPrice(r.roomId, Number(p));
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-200"
                          title="Quick Edit Price"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRoom(r.roomId)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Room"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add New Room Form */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New Room Type</h4>
              <form onSubmit={handleAddRoom} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Room Type Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deluxe Single AC Pod"
                    value={newRoomType}
                    onChange={(e) => setNewRoomType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bed Configuration</label>
                  <select
                    value={newRoomBed}
                    onChange={(e) => setNewRoomBed(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Single Study Pod Bed">Single Study Pod Bed</option>
                    <option value="Queen Bed">Queen Bed</option>
                    <option value="King Suite Bed">King Suite Bed</option>
                    <option value="Twin Single Beds">Twin Single Beds</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price / Night (₹)</label>
                  <input
                    type="number"
                    required
                    value={newRoomBasePrice}
                    onChange={(e) => setNewRoomBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Monthly Rent (₹)</label>
                  <input
                    type="number"
                    value={newRoomMonthlyPrice}
                    onChange={(e) => setNewRoomMonthlyPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <button
                  type="submit"
                  disabled={addingRoom}
                  className="sm:col-span-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  {addingRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Room to Property</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* COUNTER SETTLEMENT MODAL */}
      {counterPaymentBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Check-in Counter Payment</h3>
                <p className="text-xs text-slate-500">Record front-desk collection</p>
              </div>
              <button
                onClick={() => setCounterPaymentBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-xs">
              <span className="text-slate-500 block">Booking Reference:</span>
              <span className="font-mono font-bold text-slate-900 block text-sm">
                {counterPaymentBooking.bookingReference}
              </span>
              <span className="text-slate-500 block pt-1">Guest Name:</span>
              <span className="font-bold text-slate-900 block">
                {counterPaymentBooking.guestDetails.fullName}
              </span>
              <div className="pt-2 flex justify-between font-bold">
                <span className="text-slate-600">Remaining Balance:</span>
                <span className="text-amber-600 text-sm">
                  {formatINR(counterPaymentBooking.remainingBalance || 0)}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Amount Collected (INR)</label>
                <input
                  type="number"
                  value={counterAmount}
                  onChange={(e) => setCounterAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                <select
                  value={counterMethod}
                  onChange={(e) => setCounterMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Cash">Cash at Desk</option>
                  <option value="UPI / QR Code">UPI / QR Code (GPay, PhonePe, Paytm)</option>
                  <option value="Card Machine / POS">Debit / Credit Card Machine</option>
                  <option value="Bank Transfer (NEFT/IMPS)">Bank Transfer (NEFT/IMPS)</option>
                </select>
              </div>

              <button
                onClick={handleRecordCounterPayment}
                disabled={counterLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition-all text-xs"
              >
                {counterLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                <span>Confirm & Settle Payment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
