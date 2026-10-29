'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Hotel,
  Booking,
  Room,
  UserProfile,
  UserRole,
  StayCategory,
  PropertyType,
  ApprovalStatus,
  BookingStatus,
  PaymentStatus,
  Review
} from '@/types';
import { PlatformSettings } from '@/lib/db';
import { CategoryBadge } from '@/components/CategoryBadge';
import { broadcastDataChange } from '@/lib/sync';
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
  RefreshCw,
  Lock,
  Unlock,
  Settings,
  Star,
  Sliders,
  Eye,
  ArrowUpRight,
  Tag,
  Globe,
  Percent,
  Megaphone,
  HelpCircle,
  CheckSquare,
  Info,
  AlertTriangle,
  Award,
  Layers,
  Filter,
  Upload,
  Image as ImageIcon
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, switchRole, logout } = useAuth();

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'accommodations' | 'rooms' | 'bookings' | 'users' | 'reviews' | 'settings' | 'add_property'
  >('overview');

  // Core Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    platformFeePercentage: 5,
    minAdvanceDepositPercentage: 25,
    announcementBanner: {
      enabled: true,
      message: 'Welcome to Rentify! Verified students get up to ₹2,000 off on semester bookings.',
      type: 'offer'
    },
    maintenanceMode: false,
    supportedCities: ['Bangalore', 'Mumbai', 'Delhi', 'Jaunpur', 'Varanasi', 'Kota', 'Pune', 'Hyderabad', 'Jaipur', 'Dehradun']
  });

  const [loading, setLoading] = useState(true);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter States
  const [hotelSearch, setHotelSearch] = useState('');
  const [hotelCategoryFilter, setHotelCategoryFilter] = useState<string>('all');
  const [hotelCityFilter, setHotelCityFilter] = useState<string>('all');
  const [hotelStatusFilter, setHotelStatusFilter] = useState<string>('all');

  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingCategoryFilter, setBookingCategoryFilter] = useState('all');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');

  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState('all');

  // Dedicated Room Tab State
  const [roomFilterHotelId, setRoomFilterHotelId] = useState<string>('all');

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

  // Edit Hotel Modal State
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCategory, setEditCategory] = useState<StayCategory>('student');
  const [editPropertyType, setEditPropertyType] = useState<PropertyType>('hostel');
  const [editPriceStarting, setEditPriceStarting] = useState(0);
  const [editPriceMonthly, setEditPriceMonthly] = useState(0);
  const [editPriceDeposit, setEditPriceDeposit] = useState(0);
  const [editAdvanceVal, setEditAdvanceVal] = useState(30);
  const [editCover, setEditCover] = useState('');
  const [editStatus, setEditStatus] = useState<string>('published');
  const [editDescription, setEditDescription] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Manage Rooms Modal State
  const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<Hotel | null>(null);
  const [hotelRooms, setHotelRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [newRoomType, setNewRoomType] = useState('');
  const [newRoomBed, setNewRoomBed] = useState('Single Study Pod Bed');
  const [newRoomBasePrice, setNewRoomBasePrice] = useState(2500);
  const [newRoomMonthlyPrice, setNewRoomMonthlyPrice] = useState(9000);
  const [newRoomAdults, setNewRoomAdults] = useState(1);
  const [newRoomInventory, setNewRoomInventory] = useState(5);
  const [newRoomImage, setNewRoomImage] = useState<string>('');
  const [addingRoom, setAddingRoom] = useState(false);

  // Helper to read and compress image files from device to lightweight base64 Data URLs
  const handleImageFileUpload = (
    file: File,
    onSuccess: (dataUrl: string) => void,
    onError?: (err: string) => void
  ) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 960;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          onSuccess(compressedDataUrl);
        } else {
          onSuccess(readerEvent.target?.result as string);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.onerror = () => {
      if (onError) onError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  // Booking Details & Action Modal States
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Booking | null>(null);
  const [counterPaymentBooking, setCounterPaymentBooking] = useState<Booking | null>(null);
  const [counterAmount, setCounterAmount] = useState('');
  const [counterMethod, setCounterMethod] = useState('Cash');
  const [counterLoading, setCounterLoading] = useState(false);

  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Requested by guest');
  const [cancelLoading, setCancelLoading] = useState(false);

  // Platform Settings State
  const [settingsFee, setSettingsFee] = useState(5);
  const [settingsDeposit, setSettingsDeposit] = useState(25);
  const [settingsBannerText, setSettingsBannerText] = useState('');
  const [settingsBannerEnabled, setSettingsBannerEnabled] = useState(true);
  const [settingsBannerType, setSettingsBannerType] = useState<'offer' | 'info' | 'alert'>('offer');
  const [settingsMaintenance, setSettingsMaintenance] = useState(false);
  const [newCityInput, setNewCityInput] = useState('');
  const [settingsSaving, setSettingsSaving] = useState(false);

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'property_owner';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Metrics
      const mRes = await fetch('/api/admin/metrics');
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.metrics);

      // 2. Hotels
      const hRes = await fetch(`/api/hotels?includeAll=true${isOwner && !isAdmin ? `&ownerId=${user?.uid}` : ''}`);
      const hData = await hRes.json();
      if (hData.success) setHotels(hData.hotels);

      // 3. Bookings
      const bRes = await fetch('/api/bookings?role=admin');
      const bData = await bRes.json();
      if (bData.success) setBookings(bData.bookings);

      // 4. Users
      const uRes = await fetch('/api/admin/users');
      const uData = await uRes.json();
      if (uData.success) setUsersList(uData.users);

      // 5. Reviews
      const rRes = await fetch('/api/reviews');
      const rData = await rRes.json();
      if (rData.success) setReviewsList(rData.reviews);

      // 6. Settings
      const sRes = await fetch('/api/admin/settings');
      const sData = await sRes.json();
      if (sData.success && sData.settings) {
        setPlatformSettings(sData.settings);
        setSettingsFee(sData.settings.platformFeePercentage);
        setSettingsDeposit(sData.settings.minAdvanceDepositPercentage);
        setSettingsBannerText(sData.settings.announcementBanner?.message || '');
        setSettingsBannerEnabled(sData.settings.announcementBanner?.enabled ?? true);
        setSettingsBannerType(sData.settings.announcementBanner?.type || 'offer');
        setSettingsMaintenance(sData.settings.maintenanceMode || false);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Rentify Operations Portal | Master Control Desk';
  }, []);

  useEffect(() => {
    if (user && (isAdmin || isOwner)) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user?.role, user?.uid]);

  // Master Access Passkey Handler
  const handlePasskeyUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKey = passkeyInput.trim().toLowerCase();
    // Accept standard master keys or direct access
    if (
      !cleanKey ||
      cleanKey === 'admin' ||
      cleanKey === 'admin123' ||
      cleanKey === 'rentify' ||
      cleanKey === 'rentify@admin' ||
      cleanKey === '0000' ||
      cleanKey === 'superadmin'
    ) {
      switchRole('admin');
      setPasskeyError('');
      showToast('Unlocked Super Admin Access!');
    } else {
      setPasskeyError('Invalid passkey. Use default passkey "admin123" or click Direct Unlock below.');
    }
  };

  // Format Currency
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt || 0);
  };

  // ==========================================
  // HOTEL ACTIONS
  // ==========================================
  const handleApproval = async (hotelId: string, approvalStatus: ApprovalStatus) => {
    try {
      const res = await fetch(`/api/hotels/${hotelId}/approval`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus, adminRole: user?.role || 'admin' })
      });
      const data = await res.json();
      if (data.success) {
        setHotels((prev) =>
          prev.map((h) => (h.hotelId === hotelId ? { ...h, approvalStatus } : h))
        );
        showToast(`Property marked as ${approvalStatus}`);
        broadcastDataChange('hotel_approved', { hotelId, approvalStatus });
      }
    } catch (err) {
      console.error('Approval error:', err);
    }
  };

  const handleToggleFeatured = async (hotel: Hotel) => {
    const nextFeatured = !hotel.featured;
    try {
      const res = await fetch(`/api/hotels/${hotel.hotelId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: nextFeatured })
      });
      const data = await res.json();
      if (data.success) {
        setHotels((prev) =>
          prev.map((h) => (h.hotelId === hotel.hotelId ? { ...h, featured: nextFeatured } : h))
        );
        showToast(nextFeatured ? 'Property featured on showcase!' : 'Property removed from featured');
        broadcastDataChange('hotel_featured', { hotelId: hotel.hotelId, featured: nextFeatured });
      }
    } catch (err) {
      alert('Failed to update featured status');
    }
  };

  const handleDeleteProperty = async (hotelId: string, propertyName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${propertyName}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/hotels/${hotelId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHotels((prev) => prev.filter((h) => h.hotelId !== hotelId));
        showToast('Property permanently deleted');
        broadcastDataChange('hotel_deleted', { hotelId });
      } else {
        alert(data.message || 'Failed to delete property');
      }
    } catch (err) {
      alert('Error deleting property');
    }
  };

  const openEditModal = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setEditName(hotel.name);
    setEditCity(hotel.city);
    setEditAddress(hotel.address);
    setEditCategory(hotel.category);
    setEditPropertyType(hotel.propertyType);
    setEditCover(hotel.coverImage);
    setEditPriceStarting(hotel.startingPrice || 0);
    setEditPriceMonthly(hotel.monthlyRent || 0);
    setEditPriceDeposit(hotel.securityDeposit || 0);
    setEditAdvanceVal(hotel.advancePaymentValue || 30);
    setEditStatus(hotel.status || 'published');
    setEditDescription(hotel.description || '');
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
          address: editAddress,
          category: editCategory,
          propertyType: editPropertyType,
          coverImage: editCover,
          startingPrice: Number(editPriceStarting),
          monthlyRent: Number(editPriceMonthly),
          securityDeposit: Number(editPriceDeposit),
          advancePaymentValue: Number(editAdvanceVal),
          status: editStatus,
          description: editDescription
        })
      });
      const data = await res.json();
      if (data.success && data.hotel) {
        setHotels((prev) =>
          prev.map((h) => (h.hotelId === editingHotel.hotelId ? { ...h, ...data.hotel } : h))
        );
        setEditingHotel(null);
        showToast('Property details & prices updated successfully!');
        broadcastDataChange('hotel_updated', data.hotel);
      } else {
        alert(data.message || 'Failed to update property');
      }
    } catch (err) {
      alert('Error updating property');
    } finally {
      setEditLoading(false);
    }
  };

  // ==========================================
  // ROOMS INVENTORY ACTIONS
  // ==========================================
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
      const roomImgList = newRoomImage
        ? [newRoomImage]
        : (selectedHotelForRooms.images && selectedHotelForRooms.images.length > 0)
        ? [selectedHotelForRooms.images[0]]
        : [selectedHotelForRooms.coverImage];

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
          totalInventory: Number(newRoomInventory),
          images: roomImgList
        })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setHotelRooms((prev) => [...prev, data.room]);
        setNewRoomType('');
        setNewRoomImage('');
        showToast('New room type created and added to inventory!');
        broadcastDataChange('room_added', data.room);
      } else {
        alert(data.message || 'Failed to create room');
      }
    } catch (err) {
      alert('Error creating room');
    } finally {
      setAddingRoom(false);
    }
  };

  const handleUpdateRoomImage = async (roomId: string, newImage: string) => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [newImage] })
      });
      const data = await res.json();
      if (data.success && data.room) {
        setHotelRooms((prev) => prev.map((r) => (r.roomId === roomId ? { ...r, images: [newImage] } : r)));
        showToast('Room photo updated successfully!');
        broadcastDataChange('room_updated', { roomId, images: [newImage] });
      }
    } catch (err) {
      alert('Error updating room photo');
    }
  };

  const handleUpdateRoomPrice = async (roomId: string, newBasePrice: number, newMonthlyPrice?: number) => {
    try {
      const payload: any = { basePrice: newBasePrice };
      if (newMonthlyPrice !== undefined) payload.monthlyPrice = newMonthlyPrice;

      const res = await fetch(`/api/rooms/${roomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setHotelRooms((prev) =>
          prev.map((r) => (r.roomId === roomId ? { ...r, ...payload } : r))
        );
        showToast('Room pricing updated');
        broadcastDataChange('room_updated', { roomId, ...payload });
      }
    } catch (err) {
      alert('Failed to update room price');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Delete this room type from inventory?')) return;
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setHotelRooms((prev) => prev.filter((r) => r.roomId !== roomId));
        showToast('Room removed from inventory');
        broadcastDataChange('room_deleted', { roomId });
      }
    } catch (err) {
      alert('Failed to delete room');
    }
  };

  // ==========================================
  // BOOKINGS & COUNTER SETTLEMENT ACTIONS
  // ==========================================
  const handleUpdateBookingStatus = async (bookingId: string, bookingStatus: BookingStatus) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingStatus })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === bookingId ? { ...b, bookingStatus } : b))
        );
        showToast(`Booking marked as ${bookingStatus}`);
        broadcastDataChange('booking_updated', { bookingId, bookingStatus });
      }
    } catch (err) {
      alert('Error updating booking status');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setCancelLoading(true);
    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'cancel',
          reason: cancelReason
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === cancellingBooking.bookingId ? data.booking : b))
        );
        setCancellingBooking(null);
        showToast(`Booking cancelled. Refund of ₹${data.refundAmount || 0} processed.`);
        broadcastDataChange('booking_cancelled', { bookingId: cancellingBooking.bookingId });
        loadData();
      } else {
        alert(data.message || 'Failed to cancel booking');
      }
    } catch (err) {
      alert('Error cancelling booking');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string, ref: string) => {
    if (!window.confirm(`Permanently delete booking record ${ref}?`)) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
        showToast('Booking record deleted');
        broadcastDataChange('booking_deleted', { bookingId });
      } else {
        alert(data.message || 'Failed to delete booking');
      }
    } catch (err) {
      alert('Error deleting booking');
    }
  };

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
          collectedBy: user?.fullName || 'Reception Desk Admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.bookingId === counterPaymentBooking.bookingId ? data.booking : b))
        );
        setCounterPaymentBooking(null);
        showToast(`Counter payment of ₹${counterAmount} recorded. Balance settled!`);
        broadcastDataChange('payment_recorded', data.booking);
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

  // ==========================================
  // USERS & IDENTITY VERIFICATION ACTIONS
  // ==========================================
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
        showToast(`User role updated to ${newRole}`);
        broadcastDataChange('user_updated', { uid, role: newRole });
      } else {
        alert(data.message || 'Failed to update user role');
      }
    } catch (err) {
      alert('Error updating user role');
    }
  };

  const handleToggleStudentVerification = async (u: UserProfile) => {
    const isCurrentlyVerified = !!u.studentIdNumber && u.studentIdNumber !== 'PENDING';
    const nextStatus = isCurrentlyVerified ? '' : (u.studentIdNumber || 'VERIFIED-STU-' + Math.floor(1000 + Math.random() * 9000));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: u.uid,
          studentIdNumber: nextStatus,
          collegeName: u.collegeName || 'Verified University Scholar'
        })
      });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) =>
          prev.map((user) => (user.uid === u.uid ? { ...user, studentIdNumber: nextStatus } : user))
        );
        showToast(nextStatus ? 'Student verified badge granted!' : 'Student verification removed');
        broadcastDataChange('user_updated', { uid: u.uid, studentIdNumber: nextStatus });
      }
    } catch (err) {
      alert('Error updating verification');
    }
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    if (!window.confirm(`Permanently remove user "${name}" from the database?`)) return;
    try {
      const res = await fetch(`/api/admin/users?uid=${uid}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsersList((prev) => prev.filter((u) => u.uid !== uid));
        showToast('User profile removed');
        broadcastDataChange('user_deleted', { uid });
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (err) {
      alert('Error deleting user');
    }
  };

  // ==========================================
  // REVIEW MODERATION ACTIONS
  // ==========================================
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Delete this guest review? Property rating will be automatically recalculated.')) return;
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setReviewsList((prev) => prev.filter((r) => r.reviewId !== reviewId));
        showToast('Review deleted and hotel rating recalculated');
        broadcastDataChange('review_deleted', { reviewId });
        loadData();
      } else {
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      alert('Error deleting review');
    }
  };

  // ==========================================
  // PLATFORM SETTINGS ACTIONS
  // ==========================================
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platformFeePercentage: Number(settingsFee),
          minAdvanceDepositPercentage: Number(settingsDeposit),
          announcementBanner: {
            enabled: settingsBannerEnabled,
            message: settingsBannerText,
            type: settingsBannerType
          },
          maintenanceMode: settingsMaintenance,
          supportedCities: platformSettings.supportedCities
        })
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setPlatformSettings(data.settings);
        showToast('Platform settings saved and applied globally!');
        broadcastDataChange('settings_updated', data.settings);
      } else {
        alert(data.message || 'Failed to update settings');
      }
    } catch (err) {
      alert('Error saving platform settings');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleAddCity = () => {
    const trimmed = newCityInput.trim();
    if (!trimmed) return;
    if (platformSettings.supportedCities.includes(trimmed)) return;
    const updated = [...platformSettings.supportedCities, trimmed];
    setPlatformSettings((prev) => ({ ...prev, supportedCities: updated }));
    setNewCityInput('');
  };

  const handleRemoveCity = (cityName: string) => {
    const updated = platformSettings.supportedCities.filter((c) => c !== cityName);
    setPlatformSettings((prev) => ({ ...prev, supportedCities: updated }));
  };

  // ==========================================
  // ADD NEW PROPERTY ACTION
  // ==========================================
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
          rules: ['Valid Government ID mandatory at check-in', 'No loud noise after 10 PM', 'Follow house safety guidelines'],
          amenities: ['High-Speed Wi-Fi', '24/7 Power Backup', 'Housekeeping', 'CCTV Security', 'RO Filtered Water']
        })
      });
      const data = await res.json();
      if (data.success && data.hotel) {
        setHotels((prev) => [data.hotel, ...prev]);
        setFormMsg('Accommodation published live successfully!');
        showToast('Accommodation created & published!');
        broadcastDataChange('hotel_created', data.hotel);
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

  // Filtered lists
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        h.address.toLowerCase().includes(hotelSearch.toLowerCase());
      const matchesCat = hotelCategoryFilter === 'all' || h.category === hotelCategoryFilter;
      const matchesCity = hotelCityFilter === 'all' || h.city.toLowerCase() === hotelCityFilter.toLowerCase();
      const matchesStatus =
        hotelStatusFilter === 'all' ||
        (hotelStatusFilter === 'approved' && h.approvalStatus === 'approved') ||
        (hotelStatusFilter === 'pending' && h.approvalStatus === 'pending') ||
        (hotelStatusFilter === 'featured' && h.featured) ||
        (hotelStatusFilter === 'draft' && h.status === 'draft');
      return matchesSearch && matchesCat && matchesCity && matchesStatus;
    });
  }, [hotels, hotelSearch, hotelCategoryFilter, hotelCityFilter, hotelStatusFilter]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesSearch =
        b.bookingReference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.guestDetails.fullName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.guestDetails.phone.includes(bookingSearch) ||
        b.hotelName.toLowerCase().includes(bookingSearch.toLowerCase());
      const matchesStatus =
        bookingFilter === 'all' ||
        b.paymentStatus === bookingFilter ||
        b.bookingStatus === bookingFilter;
      const matchesCat = bookingCategoryFilter === 'all' || b.stayCategory === bookingCategoryFilter;
      return matchesSearch && matchesStatus && matchesCat;
    });
  }, [bookings, bookingSearch, bookingFilter, bookingCategoryFilter]);

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.phone && u.phone.includes(userSearch)) ||
        (u.collegeName && u.collegeName.toLowerCase().includes(userSearch.toLowerCase()));
      const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [usersList, userSearch, userRoleFilter]);

  const filteredReviews = useMemo(() => {
    return reviewsList.filter((r) => {
      const matchesSearch =
        r.userName.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.comment.toLowerCase().includes(reviewSearch.toLowerCase()) ||
        r.hotelId.toLowerCase().includes(reviewSearch.toLowerCase());
      const matchesRating =
        reviewRatingFilter === 'all' || String(r.rating) === reviewRatingFilter;
      return matchesSearch && matchesRating;
    });
  }, [reviewsList, reviewSearch, reviewRatingFilter]);

  // Unique Cities across hotels
  const allCities = useMemo(() => {
    const set = new Set(hotels.map((h) => h.city));
    return Array.from(set).sort();
  }, [hotels]);

  // ==========================================
  // UNATHENTICATED / ROLE GATE (MASTER PIN SCREEN)
  // ==========================================
  if (!user || (!isAdmin && !isOwner)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                Rentify Command Center
              </span>
              <h1 className="text-2xl font-black text-white mt-1">Super Admin Operations</h1>
              <p className="text-xs text-slate-400 mt-1">
                Full governance over accommodations, room inventory, guest bookings, user verifications & platform finances.
              </p>
            </div>
          </div>

          {passkeyError && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passkeyError}</span>
            </div>
          )}

          {/* Passkey Input Form */}
          <form onSubmit={handlePasskeyUnlock} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Master Admin Passkey</span>
                <span className="text-[10px] text-slate-400 font-normal">Default: rentify@admin</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={passkeyInput}
                  onChange={(e) => setPasskeyInput(e.target.value)}
                  placeholder="Enter admin passkey..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate & Enter Console</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
              Instant 1-Click Access
            </span>
          </div>

          {/* 1-Click Bypass Buttons for Instant Testing */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => {
                switchRole('admin');
                showToast('Welcome, Super Admin!');
              }}
              className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-transform hover:scale-[1.02]"
            >
              <Shield className="w-4 h-4" />
              <span>Super Admin (Full Access)</span>
            </button>

            <button
              onClick={() => {
                switchRole('property_owner');
                showToast('Welcome, Host / Manager!');
              }}
              className="p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-transform hover:scale-[1.02]"
            >
              <Building className="w-4 h-4" />
              <span>Property Host Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED ADMIN CONSOLE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-indigo-500/30">
              R
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white">Rentify Admin Desk</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Logged in as <strong>{user.fullName}</strong> ({user.role})
              </p>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Refresh All Database Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            <button
              onClick={() => switchRole(isAdmin ? 'property_owner' : 'admin')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-colors"
            >
              {isAdmin ? 'Switch to Host View' : 'Switch to Super Admin'}
            </button>

            <button
              onClick={logout}
              className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 transition-colors"
              title="Sign Out"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-900 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 py-2 min-w-max">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overview'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('accommodations')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'accommodations'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Accommodations ({hotels.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'rooms'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span>Rooms Inventory</span>
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'bookings'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Bookings Ledger ({bookings.length})</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Users & KYC ({usersList.length})</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reviews'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>Reviews ({reviewsList.length})</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Platform Controls</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('add_property')}
              className={`flex items-center gap-1.5 ml-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'add_property'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/60'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>List New Property</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW & FINANCIAL KPI METRICS                                  */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Gross Booking Volume (GMV)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-slate-900">
                  {formatINR(metrics?.grossBookingValue || 0)}
                </h3>
                <p className="text-[11px] text-slate-500">Total contractual reservation value</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Online Advance (Escrow)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CreditCard className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-emerald-600">
                  {formatINR(metrics?.advancePaymentsReceived || 0)}
                </h3>
                <p className="text-[11px] text-slate-500">Razorpay payments verified via HMAC</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Remaining Balances Due
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-amber-600">
                  {formatINR(metrics?.outstandingBalances || 0)}
                </h3>
                <p className="text-[11px] text-slate-500">Collectable at counter during check-in</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Platform Revenue (5%)
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-purple-600">
                  {formatINR(Math.round((metrics?.grossBookingValue || 0) * (platformSettings.platformFeePercentage / 100)))}
                </h3>
                <p className="text-[11px] text-slate-500">Calculated on platform service commission</p>
              </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Student Stays
                  </span>
                  <GraduationCap className="w-6 h-6 text-indigo-300" />
                </div>
                <h4 className="text-3xl font-black">{metrics?.studentStays || 0} Hostels & PGs</h4>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Monthly rent agreements, student discounts, Wi-Fi study zones, 4 meals/day, and biometric curfew gates.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-300">
                  <button
                    onClick={() => {
                      setHotelCategoryFilter('student');
                      setActiveTab('accommodations');
                    }}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>View Student Hostels</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-6 rounded-3xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/30 text-amber-200 border border-amber-400/30">
                    Family Stays
                  </span>
                  <Users className="w-6 h-6 text-amber-300" />
                </div>
                <h4 className="text-3xl font-black">{metrics?.familyStays || 0} Villas & Chalets</h4>
                <p className="text-xs text-amber-200/80 leading-relaxed">
                  Kid-friendly spaces, modular kitchens, multi-bedroom chalets, and 30% advance with desk balance settlement.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-amber-300">
                  <button
                    onClick={() => {
                      setHotelCategoryFilter('family');
                      setActiveTab('accommodations');
                    }}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>View Family Stays</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-6 rounded-3xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                    Trip & Daily Stays
                  </span>
                  <Compass className="w-6 h-6 text-emerald-300" />
                </div>
                <h4 className="text-3xl font-black">{metrics?.tripStays || 0} Hotels & Resorts</h4>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Tourist hotels, resort villas, daily rate checkout, flexible cancellation hours, and instant confirmation passes.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs font-bold text-emerald-300">
                  <button
                    onClick={() => {
                      setHotelCategoryFilter('trip');
                      setActiveTab('accommodations');
                    }}
                    className="hover:underline flex items-center gap-1"
                  >
                    <span>View Trip Stays</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Action Operations */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>Command Actions & Shortcuts</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('add_property')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 text-left transition-all group"
                >
                  <Plus className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-slate-900">Publish New Listing</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Hostels, PGs, villas or vacation suites</p>
                </button>

                <button
                  onClick={() => {
                    setBookingFilter('advance_paid');
                    setActiveTab('bookings');
                  }}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 text-left transition-all group"
                >
                  <Receipt className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-slate-900">Record Counter Payment</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Collect cash or UPI during guest check-in</p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-200/70 hover:border-purple-200 text-left transition-all group"
                >
                  <UserCheck className="w-6 h-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-slate-900">Review Student IDs</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Verify college ID cards for discounts</p>
                </button>

                <button
                  onClick={() => setActiveTab('settings')}
                  className="p-5 rounded-2xl bg-slate-50 hover:bg-amber-50 border border-slate-200/70 hover:border-amber-200 text-left transition-all group"
                >
                  <Megaphone className="w-6 h-6 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="text-sm font-bold text-slate-900">App Banner & Cities</h4>
                  <p className="text-[11px] text-slate-500 mt-1">Broadcast announcements & configure cities</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACCOMMODATIONS (HOTELS / HOSTELS / VILLAS)                        */}
        {/* ========================================================================= */}
        {activeTab === 'accommodations' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Search and Filters Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search properties by name, city, address..."
                    value={hotelSearch}
                    onChange={(e) => setHotelSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={hotelCategoryFilter}
                    onChange={(e) => setHotelCategoryFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Categories</option>
                    <option value="student">Student (Hostel/PG)</option>
                    <option value="family">Family (Villas)</option>
                    <option value="trip">Trip (Hotels/Resorts)</option>
                  </select>

                  <select
                    value={hotelCityFilter}
                    onChange={(e) => setHotelCityFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Cities</option>
                    {allCities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <select
                    value={hotelStatusFilter}
                    onChange={(e) => setHotelStatusFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Statuses</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                    <option value="featured">Featured Stays</option>
                    <option value="draft">Drafts</option>
                  </select>

                  <button
                    onClick={() => setActiveTab('add_property')}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Listing</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Properties Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-6 py-4">Property & Location</th>
                      <th className="px-4 py-4">Category & Type</th>
                      <th className="px-4 py-4">Active Pricing</th>
                      <th className="px-4 py-4">Status & Approval</th>
                      <th className="px-4 py-4">Showcase</th>
                      <th className="px-6 py-4 text-right">Master Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No accommodations match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((h) => {
                        const isApproved = h.approvalStatus === 'approved';
                        const isPending = h.approvalStatus === 'pending';
                        return (
                          <tr key={h.hotelId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={h.coverImage}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                                />
                                <div>
                                  <Link
                                    href={`/hotels/${h.hotelId}`}
                                    className="font-bold text-slate-900 hover:text-indigo-600 block line-clamp-1"
                                  >
                                    {h.name}
                                  </Link>
                                  <span className="text-[11px] text-slate-500 block">
                                    {h.city}, {h.state}
                                  </span>
                                  <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold mt-0.5">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span>{h.rating || 5.0}</span>
                                    <span className="text-slate-400 font-normal">({h.reviewCount || 0} reviews)</span>
                                  </div>
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
                                <span className="font-bold text-slate-900 block">
                                  {h.category === 'student'
                                    ? `${formatINR(h.monthlyRent || h.startingPrice)} / mo`
                                    : `${formatINR(h.startingPrice)} / night`}
                                </span>
                                <span className="text-[11px] text-slate-500 block">
                                  Adv: {h.advancePaymentValue}
                                  {h.advancePaymentType === 'percentage' ? '%' : ' INR'} | Dep: {formatINR(h.securityDeposit || 0)}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="space-y-1">
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
                                <span className="block text-[10px] text-slate-400 uppercase">
                                  {h.status || 'published'}
                                </span>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <button
                                onClick={() => handleToggleFeatured(h)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors ${
                                  h.featured
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                }`}
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>{h.featured ? 'Featured' : 'Standard'}</span>
                              </button>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Edit Details Button */}
                                <button
                                  onClick={() => openEditModal(h)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                                  title="Edit Pricing & Information"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                {/* Manage Rooms Inventory */}
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
                                  onClick={() => handleDeleteProperty(h.hotelId, h.name)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ROOM INVENTORY MANAGEMENT                                         */}
        {/* ========================================================================= */}
        {activeTab === 'rooms' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Room Inventory & Capacity Desk</h3>
                  <p className="text-xs text-slate-500">
                    Select a property to view or configure individual room types, rates, and stock.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-xs font-bold text-slate-600">Select Property:</label>
                  <select
                    value={selectedHotelForRooms?.hotelId || ''}
                    onChange={(e) => {
                      const found = hotels.find((h) => h.hotelId === e.target.value);
                      if (found) openRoomsModal(found);
                    }}
                    className="text-xs px-3 py-2 rounded-xl border border-slate-200 font-medium bg-white"
                  >
                    <option value="">-- Choose Accommodation --</option>
                    {hotels.map((h) => (
                      <option key={h.hotelId} value={h.hotelId}>
                        {h.name} ({h.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {selectedHotelForRooms ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h4 className="text-base font-black text-slate-900">{selectedHotelForRooms.name}</h4>
                    <span className="text-xs text-slate-500">
                      {selectedHotelForRooms.city} • Category: {selectedHotelForRooms.category}
                    </span>
                  </div>
                  <button
                    onClick={() => openEditModal(selectedHotelForRooms)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs"
                  >
                    Edit Base Rates
                  </button>
                </div>

                {/* Rooms List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Existing Room Types ({hotelRooms.length})
                  </h5>
                  {roomsLoading ? (
                    <div className="py-8 text-center text-slate-400 text-xs">Loading rooms...</div>
                  ) : hotelRooms.length === 0 ? (
                    <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/70 text-center text-xs text-slate-500">
                      No separate rooms configured yet. Add your first room type below!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hotelRooms.map((r) => (
                        <div
                          key={r.roomId}
                          className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between gap-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-200/80 shrink-0 bg-slate-200 relative">
                              <img
                                src={(r.images && r.images.length > 0) ? r.images[0] : (selectedHotelForRooms?.coverImage || '')}
                                alt={r.roomType}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 text-sm truncate">{r.roomType}</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 shrink-0">
                                  Stock: {r.totalInventory} units
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 mt-0.5 block truncate">
                                Bed: {r.bedType} • Max Adults: {r.capacity.adults}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                            <div>
                              <span className="font-mono font-bold text-indigo-700 text-sm block">
                                {formatINR(r.basePrice)} / night
                              </span>
                              {r.monthlyPrice && (
                                <span className="font-mono text-[11px] text-slate-500 block">
                                  {formatINR(r.monthlyPrice)} / month
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <label className="cursor-pointer px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors">
                                <Upload className="w-3 h-3 text-indigo-600" />
                                <span>Photo</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageFileUpload(file, (dataUrl) => {
                                        handleUpdateRoomImage(r.roomId, dataUrl);
                                      });
                                    }
                                  }}
                                />
                              </label>

                              <button
                                onClick={() => {
                                  const p = window.prompt(
                                    `Update nightly rate for ${r.roomType}:`,
                                    String(r.basePrice)
                                  );
                                  if (p && !isNaN(Number(p))) {
                                    handleUpdateRoomPrice(r.roomId, Number(p), r.monthlyPrice);
                                  }
                                }}
                                className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-[11px] flex items-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Rate</span>
                              </button>

                              <button
                                onClick={() => handleDeleteRoom(r.roomId)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Room Form */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Add New Room to this Property
                  </h5>
                  <form onSubmit={handleAddRoom} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Room Type Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Deluxe Single AC Pod"
                        value={newRoomType}
                        onChange={(e) => setNewRoomType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Bed Configuration</label>
                      <select
                        value={newRoomBed}
                        onChange={(e) => setNewRoomBed(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="Single Study Pod Bed">Single Study Pod Bed</option>
                        <option value="Queen Bed">Queen Bed</option>
                        <option value="King Suite Bed">King Suite Bed</option>
                        <option value="Twin Single Beds">Twin Single Beds</option>
                        <option value="Bunk Bed Setup">Bunk Bed Setup</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nightly Rate (₹)</label>
                      <input
                        type="number"
                        required
                        value={newRoomBasePrice}
                        onChange={(e) => setNewRoomBasePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Monthly Rent (₹)</label>
                      <input
                        type="number"
                        value={newRoomMonthlyPrice}
                        onChange={(e) => setNewRoomMonthlyPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Max Adults Capacity</label>
                      <input
                        type="number"
                        value={newRoomAdults}
                        onChange={(e) => setNewRoomAdults(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Available Room Inventory Count</label>
                      <input
                        type="number"
                        value={newRoomInventory}
                        onChange={(e) => setNewRoomInventory(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block font-bold text-slate-700">Room Photo</label>
                        <label className="cursor-pointer text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
                          <Upload className="w-3 h-3" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageFileUpload(file, (dataUrl) => {
                                  setNewRoomImage(dataUrl);
                                  showToast('Room photo selected from device!');
                                });
                              }
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        {newRoomImage && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 relative">
                            <img src={newRoomImage} alt="Room Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Paste image URL or click 'Choose File' above (optional)"
                          value={newRoomImage.startsWith('data:image') ? 'Uploaded image from device' : newRoomImage}
                          onChange={(e) => setNewRoomImage(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                        />
                        {newRoomImage && (
                          <button
                            type="button"
                            onClick={() => setNewRoomImage('')}
                            className="text-[11px] text-slate-400 hover:text-red-500 font-semibold px-1.5 py-1"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={addingRoom}
                      className="sm:col-span-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                    >
                      {addingRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      <span>Create Room Configuration</span>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                <DoorOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">Select a Property Above</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Pick any accommodation from the dropdown menu to inspect its room types and pricing.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: MASTER BOOKINGS & LEDGER                                          */}
        {/* ========================================================================= */}
        {activeTab === 'bookings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter and Search */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search by ref, guest name, phone, hotel..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Payment Statuses</option>
                    <option value="advance_paid">Advance Paid (Escrow)</option>
                    <option value="fully_paid">Fully Paid</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  <select
                    value={bookingCategoryFilter}
                    onChange={(e) => setBookingCategoryFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Stay Types</option>
                    <option value="student">Student Bookings</option>
                    <option value="family">Family Bookings</option>
                    <option value="trip">Trip Bookings</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings Ledger Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-6 py-4">Booking Ref</th>
                      <th className="px-4 py-4">Guest & Stay</th>
                      <th className="px-4 py-4">Category</th>
                      <th className="px-4 py-4">Financial Ledger</th>
                      <th className="px-4 py-4">Payment & Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No bookings found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => {
                        const isFullyPaid = b.paymentStatus === 'fully_paid';
                        const hasRemaining = (b.remainingBalance || 0) > 0;
                        const isCancelled = b.bookingStatus === 'cancelled';
                        const isConfirmed = b.bookingStatus === 'confirmed';

                        return (
                          <tr key={b.bookingId} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                              <span className="block">{b.bookingReference}</span>
                              <span className="text-[10px] text-slate-400 font-sans font-normal mt-0.5 block">
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
                                  {b.hotelName} ({b.roomTypeName || 'Room'})
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
                                {hasRemaining && !isCancelled && (
                                  <span className="text-[11px] text-amber-600 font-bold block">
                                    Due: {formatINR(b.remainingBalance || 0)}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <span
                                  className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    isCancelled
                                      ? 'bg-red-50 text-red-700 border border-red-200'
                                      : isFullyPaid
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : b.paymentStatus === 'advance_paid'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}
                                >
                                  {b.paymentStatus.replace('_', ' ')}
                                </span>
                                <span className="block text-[10px] text-slate-400 uppercase">
                                  Status: {b.bookingStatus}
                                </span>
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Inspect Full Details */}
                                <button
                                  onClick={() => setSelectedBookingDetails(b)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                                  title="View Booking Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>

                                {/* Record Counter Payment if balance due */}
                                {hasRemaining && !isCancelled && (
                                  <button
                                    onClick={() => {
                                      setCounterPaymentBooking(b);
                                      setCounterAmount(String(b.remainingBalance || 0));
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                                    title="Collect Balance at Front Desk"
                                  >
                                    Collect Due
                                  </button>
                                )}

                                {/* Confirm / Check-in */}
                                {!isCancelled && b.bookingStatus === 'pending' && (
                                  <button
                                    onClick={() => handleUpdateBookingStatus(b.bookingId, 'confirmed')}
                                    className="px-2 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-[11px]"
                                    title="Confirm Booking"
                                  >
                                    Confirm
                                  </button>
                                )}

                                {/* Cancel with Refund */}
                                {!isCancelled && b.bookingStatus !== 'completed' && (
                                  <button
                                    onClick={() => setCancellingBooking(b)}
                                    className="px-2 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-bold text-[11px]"
                                    title="Cancel and Process Refund"
                                  >
                                    Cancel
                                  </button>
                                )}

                                {/* Pass Link */}
                                <Link
                                  href={`/booking/confirmation/${b.bookingId}`}
                                  className="px-2 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-[11px]"
                                >
                                  Pass
                                </Link>

                                <button
                                  onClick={() => handleDeleteBooking(b.bookingId, b.bookingReference)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                  title="Delete Record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: USERS & IDENTITY VERIFICATION                                     */}
        {/* ========================================================================= */}
        {activeTab === 'users' && isAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, phone, college..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="property_owner">Property Owners / Hosts</option>
                    <option value="admin">Administrators</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-4 py-4">Contact</th>
                      <th className="px-4 py-4">Assigned Role</th>
                      <th className="px-4 py-4">Student KYC</th>
                      <th className="px-4 py-4">Joined Date</th>
                      <th className="px-6 py-4 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          No users match the search query.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isStudent = !!u.collegeName;
                        const isVerifiedStudent = !!u.studentIdNumber && u.studentIdNumber !== 'PENDING';

                        return (
                          <tr key={u.uid} className="hover:bg-slate-50/70 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
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
                              <select
                                value={u.role}
                                onChange={(e) => handleUpdateUserRole(u.uid, e.target.value as UserRole)}
                                className={`text-xs px-2.5 py-1 rounded-lg border font-bold focus:outline-none ${
                                  u.role === 'admin'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : u.role === 'property_owner'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="customer">Customer</option>
                                <option value="property_owner">Property Owner</option>
                                <option value="admin">Administrator</option>
                              </select>
                            </td>

                            <td className="px-4 py-4">
                              {isStudent ? (
                                <div className="space-y-1">
                                  <span className="font-bold text-slate-800 block text-[11px]">{u.collegeName}</span>
                                  <button
                                    onClick={() => handleToggleStudentVerification(u)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                                      isVerifiedStudent
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                                    }`}
                                  >
                                    {isVerifiedStudent ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600" />
                                        <span>Verified Student</span>
                                      </>
                                    ) : (
                                      <>
                                        <AlertCircle className="w-3 h-3 text-amber-600" />
                                        <span>Click to Verify</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">Regular Guest</span>
                              )}
                            </td>

                            <td className="px-4 py-4 text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>

                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteUser(u.uid, u.fullName)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                                title="Remove User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: REVIEWS MODERATION                                                */}
        {/* ========================================================================= */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input
                    type="text"
                    placeholder="Search reviews by guest name, comment, property..."
                    value={reviewSearch}
                    onChange={(e) => setReviewSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={reviewRatingFilter}
                    onChange={(e) => setReviewRatingFilter(e.target.value)}
                    className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white font-medium"
                  >
                    <option value="all">All Star Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReviews.length === 0 ? (
                <div className="col-span-2 bg-white p-12 rounded-3xl border border-slate-200/80 text-center text-slate-400 text-xs">
                  No guest reviews match the filter.
                </div>
              ) : (
                filteredReviews.map((r) => {
                  const hotel = hotels.find((h) => h.hotelId === r.hotelId);
                  return (
                    <div
                      key={r.reviewId}
                      className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {r.userName ? r.userName.charAt(0) : 'G'}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{r.userName}</span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 italic">
                          "{r.comment}"
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-indigo-700">{hotel?.name || r.hotelId}</span>
                        <button
                          onClick={() => handleDeleteReview(r.reviewId)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 font-bold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Review</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: PLATFORM SETTINGS & CONTROLS                                      */}
        {/* ========================================================================= */}
        {activeTab === 'settings' && isAdmin && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-600" />
                  <span>Platform Parameters & Fee Governance</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Configure global financial commission, minimum advance requirements, and customer announcement broadcasts.
                </p>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                {/* Financial Commission & Advance */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Platform Service Fee (%)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={30}
                      value={settingsFee}
                      onChange={(e) => setSettingsFee(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Commission retained from each completed booking
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Default Minimum Advance (%)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={settingsDeposit}
                      onChange={(e) => setSettingsDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm bg-white"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Minimum required advance to secure stay confirmation
                    </span>
                  </div>
                </div>

                {/* Announcement Banner */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-indigo-600" />
                      <span>Live Customer Announcement Banner</span>
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsBannerEnabled}
                        onChange={(e) => setSettingsBannerEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                    </label>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={settingsBannerText}
                      onChange={(e) => setSettingsBannerText(e.target.value)}
                      placeholder="e.g. ⚡ Student Semester Special: 0% convenience fees on all Jaipur hostels this week!"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-bold">Banner Style:</span>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bannerType"
                        value="offer"
                        checked={settingsBannerType === 'offer'}
                        onChange={() => setSettingsBannerType('offer')}
                      />
                      <span>Offer (Green)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bannerType"
                        value="info"
                        checked={settingsBannerType === 'info'}
                        onChange={() => setSettingsBannerType('info')}
                      />
                      <span>Information (Indigo)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="bannerType"
                        value="alert"
                        checked={settingsBannerType === 'alert'}
                        onChange={() => setSettingsBannerType('alert')}
                      />
                      <span>Alert (Amber)</span>
                    </label>
                  </div>
                </div>

                {/* Supported Cities Manager */}
                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/70">
                  <label className="font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>Supported Service Cities ({platformSettings.supportedCities.length})</span>
                  </label>

                  <div className="flex flex-wrap gap-2">
                    {platformSettings.supportedCities.map((cityName) => (
                      <span
                        key={cityName}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs"
                      >
                        <span>{cityName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(cityName)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 max-w-sm pt-2">
                    <input
                      type="text"
                      placeholder="Add city (e.g. Chandigarh)..."
                      value={newCityInput}
                      onChange={(e) => setNewCityInput(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCity}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                    >
                      Add City
                    </button>
                  </div>
                </div>

                {/* Maintenance Switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-50 border border-amber-200/70">
                  <div>
                    <h5 className="font-bold text-amber-900 text-xs">Emergency Platform Maintenance Mode</h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Temporarily freeze all new reservations and payment checkout sessions.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settingsMaintenance}
                      onChange={(e) => setSettingsMaintenance(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-amber-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600" />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
                >
                  {settingsSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Save & Deploy Platform Settings</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: LIST NEW PROPERTY FORM                                            */}
        {/* ========================================================================= */}
        {activeTab === 'add_property' && (
          <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-slate-900">List New Stay Accommodation</h2>
              <p className="text-xs text-slate-500">
                Submit and instantly publish your property to the live Rentify app catalog.
              </p>
            </div>

            {formMsg && (
              <div
                className={`p-4 rounded-2xl text-xs font-bold ${
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">Cover Photo</label>
                    <label className="cursor-pointer text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3 h-3" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageFileUpload(file, (dataUrl) => {
                              setCoverImage(dataUrl);
                              showToast('Cover photo selected from device!');
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    {coverImage && (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 relative">
                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <input
                      type="text"
                      placeholder="Paste image URL or click 'Choose File' above"
                      value={coverImage.startsWith('data:image') ? 'Uploaded image from device' : coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                    {coverImage && (
                      <button
                        type="button"
                        onClick={() => setCoverImage('')}
                        className="text-[11px] text-slate-400 hover:text-red-500 font-semibold px-1.5 py-1"
                      >
                        Clear
                      </button>
                    )}
                  </div>
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
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
              >
                {formSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Property Listing</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EDIT PROPERTY & PRICING                                          */}
      {/* ========================================================================= */}
      {editingHotel && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
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

            <form onSubmit={handleSaveHotelEdit} className="space-y-4 text-xs">
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  required
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              {/* Dynamic Rates */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editCategory === 'student' ? 'Monthly Rent (₹)' : 'Starting Rate / Nt (₹)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editCategory === 'student' ? editPriceMonthly : editPriceStarting}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editCategory === 'student') setEditPriceMonthly(v);
                      else setEditPriceStarting(v);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold bg-white text-indigo-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {editCategory === 'student' ? 'Security Deposit (₹)' : 'Advance Booking (%)'}
                  </label>
                  <input
                    type="number"
                    required
                    value={editCategory === 'student' ? editPriceDeposit : editAdvanceVal}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      if (editCategory === 'student') setEditPriceDeposit(v);
                      else setEditAdvanceVal(v);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold bg-white text-emerald-700"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-slate-700">Cover Photo</label>
                  <label className="cursor-pointer text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageFileUpload(file, (dataUrl) => {
                            setEditCover(dataUrl);
                            showToast('Cover photo selected from device!');
                          });
                        }
                      }}
                    />
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  {editCover && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-100 relative">
                      <img src={editCover} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Paste image URL or click 'Choose File' above"
                    value={editCover.startsWith('data:image') ? 'Uploaded image from device' : editCover}
                    onChange={(e) => setEditCover(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-600"
                  />
                  {editCover && (
                    <button
                      type="button"
                      onClick={() => setEditCover('')}
                      className="text-[11px] text-slate-400 hover:text-red-500 font-semibold px-1.5 py-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
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
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  {editLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Property Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: MANAGE ROOMS MODAL                                              */}
      {/* ========================================================================= */}
      {selectedHotelForRooms && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
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
                <div className="py-8 text-center text-slate-400 text-xs">Loading rooms...</div>
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
                          Bed: {r.bedType} | Capacity: {r.capacity.adults} Adults | Stock: {r.totalInventory} units
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
                            if (p && !isNaN(Number(p))) handleUpdateRoomPrice(r.roomId, Number(p), r.monthlyPrice);
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
                  className="sm:col-span-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-200"
                >
                  {addingRoom ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Add Room to Property</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BOOKING FULL DETAILS INSPECTION                                  */}
      {/* ========================================================================= */}
      {selectedBookingDetails && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600 uppercase">
                  {selectedBookingDetails.bookingReference}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">Reservation Ledger Breakdown</h3>
              </div>
              <button
                onClick={() => setSelectedBookingDetails(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Guest Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Guest Information</span>
                <span className="font-bold text-slate-900 block text-sm">
                  {selectedBookingDetails.guestDetails.fullName}
                </span>
                <div className="flex items-center gap-4 text-slate-600 pt-1">
                  <span>Phone: {selectedBookingDetails.guestDetails.phone}</span>
                  <span>Email: {selectedBookingDetails.guestDetails.email}</span>
                </div>
              </div>

              {/* Stay & Room */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Stay Details</span>
                <span className="font-bold text-slate-900 block">{selectedBookingDetails.hotelName}</span>
                <span className="text-slate-600 block">
                  Room: {selectedBookingDetails.roomTypeName} • {selectedBookingDetails.stayCategory} category
                </span>
                <span className="text-slate-600 block">
                  Check-in: {new Date(selectedBookingDetails.checkIn).toLocaleDateString()}
                  {selectedBookingDetails.checkOut && ` • Check-out: ${new Date(selectedBookingDetails.checkOut).toLocaleDateString()}`}
                </span>
              </div>

              {/* Student Details if present */}
              {selectedBookingDetails.studentDetails && (
                <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Student Scholar Verification
                  </span>
                  <span className="font-bold text-slate-900 block">
                    College: {selectedBookingDetails.studentDetails.collegeOrUniversity}
                  </span>
                  <span className="text-slate-600 block">
                    ID Card: {selectedBookingDetails.studentDetails.studentIdNumber} • Guardian: {selectedBookingDetails.studentDetails.guardianName} ({selectedBookingDetails.studentDetails.guardianPhone})
                  </span>
                </div>
              )}

              {/* Financial Ledger */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Breakdown</span>
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Contract Value:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedBookingDetails.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Advance Received:</span>
                  <span>{formatINR(selectedBookingDetails.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Remaining Counter Due:</span>
                  <span>{formatINR(selectedBookingDetails.remainingBalance || 0)}</span>
                </div>
                {selectedBookingDetails.paymentDetails?.razorpayPaymentId && (
                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    Razorpay ID: {selectedBookingDetails.paymentDetails.razorpayPaymentId}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link
                href={`/booking/confirmation/${selectedBookingDetails.bookingId}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
              >
                Open Confirmation Pass
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COUNTER SETTLEMENT MODAL                                         */}
      {/* ========================================================================= */}
      {counterPaymentBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
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

      {/* ========================================================================= */}
      {/* MODAL 5: CANCEL BOOKING & REFUND ENGINE                                   */}
      {/* ========================================================================= */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900">Cancel Reservation</h3>
              </div>
              <button
                onClick={() => setCancellingBooking(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Ref:</span>
                <span className="font-mono font-bold text-slate-900">{cancellingBooking.bookingReference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guest:</span>
                <span className="font-bold text-slate-900">{cancellingBooking.guestDetails.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Advance Paid:</span>
                <span className="font-bold text-emerald-600">{formatINR(cancellingBooking.paidAmount || 0)}</span>
              </div>
              <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                Refund eligibility is calculated based on property policy (Full advance refund up to 48-72h prior to check-in, otherwise minus 10% fee).
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Cancellation</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-red-200"
                >
                  {cancelLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span>Confirm Cancellation</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
