'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import { calculateDistanceKm, KNOWN_CITIES, findClosestCity } from '@/lib/geo';
import {
  BedDouble,
  Bell,
  User,
  Search,
  Calendar,
  Users,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Heart,
  ChevronRight,
  Home,
  Briefcase,
  ShoppingBag,
  SlidersHorizontal,
  X,
  Compass,
  GraduationCap,
  Clock,
  LocateFixed,
  Waves,
  Snowflake,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronLeft
} from 'lucide-react';

interface DisplayHotel {
  id: string;
  name: string;
  city: string;
  location: string;
  category: StayCategory;
  rating: number;
  reviewCount: number;
  badge: string;
  badgeColor: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage: number;
  coverImage: string;
  amenities: { icon: React.ElementType; label: string }[];
  isMonthRental?: boolean;
  latitude: number;
  longitude: number;
  distanceKm?: number;
}

const POPULAR_CITIES = [
  { id: 'mariyahu', name: 'Mariyahu', image: '/images/city-mariyahu.jpg' },
  { id: 'jaunpur', name: 'Jaunpur', image: '/images/city-jaunpur.jpg' },
  { id: 'varanasi', name: 'Varanasi', image: '/images/city-varanasi.jpg' },
  { id: 'lucknow', name: 'Lucknow', image: '/images/city-lucknow.jpg' },
  { id: 'nearby', name: 'Nearby', isNearbyAction: true }
];

const DEFAULT_HOTELS: DisplayHotel[] = [
  {
    id: 'hotel_grand_vista_jnp',
    name: 'Hotel Grand Vista',
    city: 'Jaunpur',
    location: 'Civil Lines, Jaunpur',
    category: 'regular',
    rating: 4.6,
    reviewCount: 1200,
    badge: '🔥 Top Rated',
    badgeColor: 'bg-indigo-600',
    currentPrice: 2499,
    originalPrice: 3999,
    discountPercentage: 38,
    coverImage: '/images/hotel-grand-vista.jpg',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Car, label: 'Free Parking' },
      { icon: Utensils, label: 'Restaurant' }
    ],
    latitude: 25.7464,
    longitude: 82.6837
  },
  {
    id: 'hotel_royal_heritage_vns',
    name: 'Royal Heritage Resort',
    city: 'Varanasi',
    location: 'Ganga Ghat Road, Varanasi',
    category: 'family',
    rating: 4.5,
    reviewCount: 856,
    badge: '🛡️ Best Value',
    badgeColor: 'bg-emerald-600',
    currentPrice: 3199,
    originalPrice: 5499,
    discountPercentage: 42,
    coverImage: '/images/hotel-royal-heritage.jpg',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Waves, label: 'Swimming Pool' },
      { icon: Utensils, label: 'Restaurant' }
    ],
    latitude: 25.3176,
    longitude: 82.9739
  },
  {
    id: 'hotel_the_park_inn_lko',
    name: 'The Park Inn',
    city: 'Lucknow',
    location: 'Hazratganj, Lucknow',
    category: 'regular',
    rating: 4.3,
    reviewCount: 642,
    badge: '🛡️ Budget Friendly',
    badgeColor: 'bg-blue-600',
    currentPrice: 1799,
    originalPrice: 2999,
    discountPercentage: 40,
    coverImage: '/images/hotel-the-park-inn.jpg',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Snowflake, label: 'AC Rooms' },
      { icon: Utensils, label: 'Room Service' }
    ],
    latitude: 26.8467,
    longitude: 80.9462
  },
  {
    id: 'apex_scholar_jaunpur',
    name: 'Apex Scholar Youth Hostel & PG',
    city: 'Jaunpur',
    location: 'Civil Lines, Jaunpur',
    category: 'student',
    rating: 4.8,
    reviewCount: 120,
    badge: '🎓 Student Hub',
    badgeColor: 'bg-purple-600',
    currentPrice: 4500,
    originalPrice: 6500,
    discountPercentage: 30,
    coverImage: '/images/hostel-jaunpur.jpg',
    isMonthRental: true,
    amenities: [
      { icon: Wifi, label: '300 Mbps WiFi' },
      { icon: Utensils, label: 'Mess Meals' },
      { icon: Sparkles, label: 'Study Library' }
    ],
    latitude: 25.751,
    longitude: 82.689
  },
  {
    id: 'kashi_scholar_varanasi',
    name: 'Kashi Scholar Co-Living & Hostel',
    city: 'Varanasi',
    location: 'Lanka, BHU Campus Road, Varanasi',
    category: 'student',
    rating: 4.7,
    reviewCount: 94,
    badge: '🎓 BHU Campus PG',
    badgeColor: 'bg-indigo-600',
    currentPrice: 5500,
    originalPrice: 7800,
    discountPercentage: 29,
    coverImage: '/images/hostel-varanasi.jpg',
    isMonthRental: true,
    amenities: [
      { icon: Wifi, label: 'WiFi & RO' },
      { icon: Snowflake, label: 'AC & Cooler' },
      { icon: Utensils, label: 'Mess Food' }
    ],
    latitude: 25.275,
    longitude: 82.998
  },
  {
    id: 'hazratganj_student_suites',
    name: 'Hazratganj Student Suites & Hostel',
    city: 'Lucknow',
    location: 'Hazratganj, Lucknow',
    category: 'student',
    rating: 4.9,
    reviewCount: 145,
    badge: '🎓 Metro Connected',
    badgeColor: 'bg-purple-600',
    currentPrice: 5200,
    originalPrice: 7500,
    discountPercentage: 31,
    coverImage: '/images/hostel-lucknow.jpg',
    isMonthRental: true,
    amenities: [
      { icon: Wifi, label: '400 Mbps WiFi' },
      { icon: Utensils, label: '4 Meals/day' },
      { icon: Sparkles, label: 'Laundry' }
    ],
    latitude: 26.856,
    longitude: 80.945
  },
  {
    id: 'mariyahu_campus_pg',
    name: 'Mariyahu Campus PG & Youth Hostel',
    city: 'Mariyahu',
    location: 'Station Road, Mariyahu',
    category: 'student',
    rating: 4.6,
    reviewCount: 78,
    badge: '🎓 Budget PG',
    badgeColor: 'bg-emerald-600',
    currentPrice: 3800,
    originalPrice: 5000,
    discountPercentage: 24,
    coverImage: '/images/city-mariyahu.jpg',
    isMonthRental: true,
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Utensils, label: 'Home Food' },
      { icon: Sparkles, label: 'Power Backup' }
    ],
    latitude: 25.605,
    longitude: 82.614
  }
];

function HotelsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const initialCat = (searchParams.get('category') as StayCategory) || null;
  const initialCity = searchParams.get('city') || null;

  // Filter States
  const [selectedCity, setSelectedCity] = useState<string | null>(initialCity);
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('26 Oct 2025');
  const [checkOutDate, setCheckOutDate] = useState<string>('27 Oct 2025');
  const [guestsCount, setGuestsCount] = useState<string>('1 Room · 2 Guests');
  const [activeCategory, setActiveCategory] = useState<StayCategory | 'all'>('all');
  const [activeQuickPick, setActiveQuickPick] = useState<'recommended' | 'recent' | 'nearest'>('recommended');

  // UI Interactive States
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bottomNavTab, setBottomNavTab] = useState<'home' | 'bookings' | 'search' | 'wishlist' | 'profile'>('home');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set(['hotel_grand_vista_jnp']));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Geolocation State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [detectedLocationName, setDetectedLocationName] = useState<string>('');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        triggerToast('Removed from Wishlist');
      } else {
        next.add(id);
        triggerToast('Saved to Wishlist ❤️');
      }
      return next;
    });
  };

  // Nearby click geolocation
  const handleNearbyClick = () => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      triggerToast('📍 Detecting your location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          const { city, distanceKm } = findClosestCity(latitude, longitude);
          const name = distanceKm < 15 ? city.name : `${city.name} (~${Math.round(distanceKm)} km)`;
          setDetectedLocationName(name);
          setSelectedCity('nearby');
          setActiveQuickPick('nearest');
          triggerToast(`📍 Showing nearest accommodations to ${name}!`);
        },
        () => {
          // Fallback to Jaunpur center
          setUserCoords({ lat: 25.7464, lng: 82.6837 });
          setDetectedLocationName('Jaunpur');
          setSelectedCity('nearby');
          setActiveQuickPick('nearest');
          triggerToast('📍 Showing nearest accommodations in Jaunpur (Default)');
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setUserCoords({ lat: 25.7464, lng: 82.6837 });
      setDetectedLocationName('Jaunpur');
      setSelectedCity('nearby');
      setActiveQuickPick('nearest');
      triggerToast('📍 Showing nearest accommodations in Jaunpur');
    }
  };

  const handleCitySelect = (cityId: string) => {
    if (cityId === 'nearby') {
      handleNearbyClick();
      return;
    }
    if (selectedCity?.toLowerCase() === cityId.toLowerCase()) {
      setSelectedCity(null);
      triggerToast('Showing all cities');
    } else {
      setSelectedCity(cityId);
      triggerToast(`Filtering by ${cityId.charAt(0).toUpperCase() + cityId.slice(1)}`);
    }
  };

  // Filtered & Computed Hotels
  const displayedHotels = useMemo(() => {
    let list = [...DEFAULT_HOTELS];

    // Compute distance if coords exist
    if (userCoords) {
      list = list.map((h) => ({
        ...h,
        distanceKm: calculateDistanceKm(userCoords.lat, userCoords.lng, h.latitude, h.longitude)
      }));
    }

    // Filter by bottom nav wishlist
    if (bottomNavTab === 'wishlist') {
      list = list.filter((h) => wishlist.has(h.id));
    }

    // Filter by category
    if (activeCategory !== 'all') {
      list = list.filter((h) => h.category === activeCategory);
    }

    // Filter by quick picks
    if (activeQuickPick === 'nearest' && userCoords) {
      list.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else if (activeQuickPick === 'recent') {
      list = list.slice(0, 3).reverse();
    }

    // Filter by city
    if (selectedCity && selectedCity !== 'nearby') {
      list = list.filter((h) => h.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Filter by destination search query
    if (searchDestination.trim()) {
      const q = searchDestination.toLowerCase().trim();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.location.toLowerCase().includes(q) ||
          h.city.toLowerCase().includes(q)
      );
    }

    return list;
  }, [
    selectedCity,
    searchDestination,
    activeCategory,
    activeQuickPick,
    bottomNavTab,
    wishlist,
    userCoords
  ]);

  return (
    <div className="min-h-screen bg-[#070a29] flex justify-center sm:py-6 sm:px-4 select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-2xl border border-white/20 backdrop-blur-md animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Mobile Device Frame matching Image 2 */}
      <div className="w-full max-w-[420px] h-[100dvh] sm:h-[890px] bg-slate-50 sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto pb-20 no-scrollbar">
          
          {/* ========================================================================= */}
          {/* 1. TOP MIDNIGHT HEADER BAR (#070a29) MATCHING IMAGE 2                     */}
          {/* ========================================================================= */}
          <header className="sticky top-0 z-30 bg-[#070a29] border-b border-white/5 px-4 pt-3.5 pb-3 flex items-center justify-between">
            {/* Center: Rentify Brand Identity */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white shadow-md shadow-indigo-950/60">
                <BedDouble className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="text-left">
                <div className="text-xl font-black tracking-tight text-white leading-none select-none">
                  Rent<span className="text-[#38bdf8]">ify</span>
                </div>
                <p className="text-[9.5px] font-semibold text-indigo-200/70 tracking-tight leading-none mt-1 select-none">
                  Hotels &middot; Stays &middot; Better Journey
                </p>
              </div>
            </div>

            {/* Right: Notifications & User Profile Avatar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotificationsOpen(true)}
                type="button"
                className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4 text-white" strokeWidth={2.2} />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#070a29]" />
              </button>

              <button
                onClick={() => {
                  if (user) {
                    router.push('/account?tab=profile');
                  } else {
                    openAuthModal('otp');
                  }
                }}
                type="button"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer overflow-hidden shadow-xs"
                aria-label="User Account"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-white" strokeWidth={2.2} />
                )}
              </button>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* 2. HERO BANNER: PANORAMIC CITY SKYLINE & BEDROOM MATCHING IMAGE 2        */}
          {/* ========================================================================= */}
          <div className="relative h-64 sm:h-68 rounded-b-[2rem] overflow-hidden select-none">
            <img
              src="/images/hero-panoramic.jpg"
              alt="Luxury room overlooking city skyline"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Deep rich contrast gradient mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#070a29]/95 via-[#070a29]/40 to-[#070a29]/70" />

            {/* Hero Overlaid Text */}
            <div className="relative z-10 p-5 pt-4 flex flex-col justify-start h-full">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#1e1b4b]/80 border border-indigo-400/30 text-indigo-200 backdrop-blur-md self-start mb-2 shadow-xs">
                <Sparkles className="w-3 h-3 text-sky-400" />
                <span>Book Your Perfect Stay</span>
              </div>

              <h1 className="text-2xl font-black text-white leading-tight tracking-tight mt-1">
                Comfortable Stays,<br />
                <span className="text-[#38bdf8]">Memorable Journeys</span>
              </h1>

              <p className="text-xs text-indigo-100/90 font-medium max-w-[280px] leading-relaxed mt-1.5">
                Top hotels, great prices, trusted by thousands in India.
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. FLOATING SEARCH CARD MATCHING IMAGE 2                                  */}
          {/* ========================================================================= */}
          <div className="-mt-12 mx-4 relative z-20 bg-white rounded-3xl p-4 shadow-xl border border-slate-100/80 space-y-3">
            {/* Row 1: Destination Search Input */}
            <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Where are you going?
                </label>
                <input
                  type="text"
                  value={searchDestination}
                  onChange={(e) => setSearchDestination(e.target.value)}
                  placeholder="Search city, hotel, or area..."
                  className="w-full text-xs font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (searchDestination) {
                    triggerToast(`Searching "${searchDestination}"`);
                  }
                }}
                className="p-1.5 text-[#3b49df] hover:text-[#313ec9] cursor-pointer"
                title="Search"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Row 2: 3-Parameter Box Grid: Check In, Check Out, Guests */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Check In</span>
                </div>
                <input
                  type="text"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-full text-[11px] font-bold text-slate-800 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                  <Calendar className="w-3 h-3 text-indigo-600" />
                  <span>Check Out</span>
                </div>
                <input
                  type="text"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-full text-[11px] font-bold text-slate-800 bg-transparent focus:outline-none mt-0.5"
                />
              </div>

              <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/70 text-left">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                  <Users className="w-3 h-3 text-indigo-600" />
                  <span>Guests</span>
                </div>
                <input
                  type="text"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full text-[11px] font-bold text-slate-800 bg-transparent focus:outline-none mt-0.5 truncate"
                />
              </div>
            </div>

            {/* Row 3: Blue Search Hotels Button */}
            <button
              onClick={() => {
                triggerToast(
                  searchDestination
                    ? `Searching stays in "${searchDestination}"...`
                    : 'Showing best verified stays'
                );
              }}
              type="button"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#3b49df] to-[#5143eb] hover:from-[#323ec9] hover:to-[#4335da] active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-indigo-300/40 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
              <span>Search Hotels</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* 4. POPULAR CITIES CAROUSEL MATCHING IMAGE 2                               */}
          {/* ========================================================================= */}
          <div className="mt-6 px-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Popular Cities</h3>
              <button
                onClick={() => {
                  setSelectedCity(null);
                  triggerToast('Showing all cities');
                }}
                className="text-xs font-bold text-[#3b49df] hover:underline flex items-center cursor-pointer"
              >
                <span>See All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Horizontal Snap Carousel */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {POPULAR_CITIES.map((c) => {
                const isSelected = selectedCity?.toLowerCase() === c.id.toLowerCase();

                if (c.isNearbyAction) {
                  return (
                    <button
                      key={c.id}
                      onClick={handleNearbyClick}
                      className={`flex flex-col items-center shrink-0 cursor-pointer group transition-transform ${
                        isSelected ? 'scale-105' : 'hover:scale-102'
                      }`}
                    >
                      <div
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 flex items-center justify-center bg-[#f0edff] shadow-xs ${
                          isSelected ? 'border-[#3b49df] ring-2 ring-indigo-200' : 'border-indigo-100'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/80 shadow-xs flex items-center justify-center text-[#3b49df]">
                          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#3b49df] mt-1.5 flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#3b49df]" />
                        Nearby
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={c.id}
                    onClick={() => handleCitySelect(c.id)}
                    className={`flex flex-col items-center shrink-0 cursor-pointer group transition-transform ${
                      isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-xs relative ${
                        isSelected ? 'border-[#3b49df] ring-2 ring-indigo-200' : 'border-white'
                      }`}
                    >
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span
                      className={`text-xs mt-1.5 flex items-center gap-0.5 ${
                        isSelected ? 'font-black text-[#3b49df]' : 'font-bold text-slate-700'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {c.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. QUICK PICKS FOR YOU SECTION MATCHING IMAGE 2                           */}
          {/* ========================================================================= */}
          <div className="mt-6 px-4">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight mb-3">
              Quick Picks for You
            </h3>

            {/* Quick Pick Tabs */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setActiveQuickPick('recommended')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeQuickPick === 'recommended'
                    ? 'bg-[#3b49df] text-white shadow-md shadow-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Recommended</span>
              </button>

              <button
                onClick={() => setActiveQuickPick('recent')}
                className={`px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeQuickPick === 'recent'
                    ? 'bg-[#3b49df] text-white shadow-md shadow-indigo-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Recently Viewed</span>
              </button>
            </div>

            {/* GPS Live Status Bar if Nearby active */}
            {activeQuickPick === 'nearest' && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200/80 rounded-2xl p-2.5 flex items-center justify-between mb-3 text-xs shadow-2xs animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span className="font-bold text-slate-800 text-[11px] truncate">
                    Nearest Accommodations to{' '}
                    <span className="text-emerald-700 font-extrabold">{detectedLocationName || 'Location'}</span>
                  </span>
                </div>
                <button
                  onClick={handleNearbyClick}
                  className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0 ml-2 cursor-pointer"
                >
                  Refresh
                </button>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. HOTEL CARDS MATCHING EXACT CARDS IN IMAGE 2                            */}
          {/* ========================================================================= */}
          <div className="px-4 space-y-3 pb-6">
            {displayedHotels.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-3xl border border-slate-100 p-6">
                <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No accommodations found</h4>
                <p className="text-xs text-slate-500 mt-1">Try selecting another city or clearing your search.</p>
                <button
                  onClick={() => {
                    setSelectedCity(null);
                    setSearchDestination('');
                    setActiveCategory('all');
                    setActiveQuickPick('recommended');
                  }}
                  className="mt-3 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              displayedHotels.map((h) => {
                const isWishlisted = wishlist.has(h.id);

                return (
                  <div
                    key={h.id}
                    onClick={() => router.push(`/hotels/${h.id}`)}
                    className="bg-white rounded-3xl p-3 shadow-xs border border-slate-100 flex gap-2.5 sm:gap-3 hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden"
                  >
                    {/* Left: Hotel Image with Badges */}
                    <div className="relative w-28 h-28 sm:w-34 sm:h-30 rounded-2xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={h.coverImage}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />

                      {/* Top Left Badge */}
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-xs ${h.badgeColor}`}
                      >
                        {h.badge}
                      </span>

                      {/* Bottom Left Counter Badge */}
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded text-[8.5px] font-bold text-white bg-slate-900/60 backdrop-blur-xs">
                        1/5
                      </span>
                    </div>

                    {/* Right: Hotel Information */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Title & Heart Button */}
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug line-clamp-1">
                            {h.name}
                          </h4>
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(h.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-500 active:scale-90 transition-transform cursor-pointer shrink-0"
                            aria-label="Save to wishlist"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Rating Row */}
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500 mt-0.5">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                          <span>{h.rating}</span>
                          <span className="text-slate-400 font-normal truncate">
                            ({h.reviewCount >= 1000 ? `${(h.reviewCount / 1000).toFixed(1)}k` : h.reviewCount} reviews)
                          </span>
                        </div>

                        {/* Location */}
                        <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{h.location}</span>
                          {h.distanceKm !== undefined && (
                            <span className="text-emerald-600 font-bold ml-1 shrink-0">
                              &middot; {h.distanceKm.toFixed(1)} km away
                            </span>
                          )}
                        </p>

                        {/* Amenities Row */}
                        <div className="flex items-center gap-2 text-[9.5px] text-slate-500 mt-1 truncate">
                          {h.amenities.slice(0, 3).map((am, i) => {
                            const AmIcon = am.icon;
                            return (
                              <span key={i} className="flex items-center gap-1 shrink-0">
                                <AmIcon className="w-2.5 h-2.5 text-slate-400" />
                                <span>{am.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pricing & CTA */}
                      <div className="flex items-end justify-between mt-2 pt-1.5 border-t border-slate-100/80 gap-1.5">
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-none">
                              ₹{h.currentPrice.toLocaleString('en-IN')}
                            </span>
                            {h.isMonthRental && (
                              <span className="text-[9.5px] text-slate-400 font-medium">/mo</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-slate-400 line-through leading-none">
                              ₹{h.originalPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[8.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded leading-none">
                              {h.discountPercentage}% OFF
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/hotels/${h.id}`);
                          }}
                          className="shrink-0 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#3b49df] hover:bg-[#313ec9] active:scale-95 text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Book Now</span>
                          <ChevronRight className="w-3 h-3 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. FIXED BOTTOM NAVIGATION BAR MATCHING IMAGE 2                           */}
        {/* ========================================================================= */}
        <nav className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-4 py-2 flex items-center justify-around select-none">
          <button
            onClick={() => {
              setBottomNavTab('home');
              setActiveQuickPick('recommended');
              setSelectedCity(null);
            }}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              bottomNavTab === 'home' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" strokeWidth={bottomNavTab === 'home' ? 2.5 : 2} />
            <span className="text-[10px]">Home</span>
          </button>

          <button
            onClick={() => {
              setBottomNavTab('bookings');
              router.push('/account?tab=bookings');
            }}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              bottomNavTab === 'bookings' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Bookings</span>
          </button>

          <button
            onClick={() => {
              setBottomNavTab('search');
              window.scrollTo({ top: 180, behavior: 'smooth' });
            }}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              bottomNavTab === 'search' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Search className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Search</span>
          </button>

          <button
            onClick={() => {
              setBottomNavTab('wishlist');
              triggerToast('Showing your saved Wishlist stays');
            }}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              bottomNavTab === 'wishlist' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${bottomNavTab === 'wishlist' ? 'fill-indigo-600' : ''}`} strokeWidth={2} />
            <span className="text-[10px]">Wishlist</span>
          </button>

          <button
            onClick={() => {
              setBottomNavTab('profile');
              if (user) {
                router.push('/account?tab=profile');
              } else {
                openAuthModal('otp');
              }
            }}
            type="button"
            className={`flex flex-col items-center gap-0.5 transition-colors cursor-pointer ${
              bottomNavTab === 'profile' ? 'text-[#3b49df] font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <User className="w-5 h-5" strokeWidth={2} />
            <span className="text-[10px]">Profile</span>
          </button>
        </nav>

        {/* ========================================================================= */}
        {/* 8. SLIDE-OVER NAVIGATION DRAWER (TRIGGERED BY ☰ MENU)                    */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="absolute inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs animate-fade-in cursor-pointer"
            />

            {/* Drawer Body */}
            <div className="relative w-4/5 max-w-xs bg-slate-900 text-white p-5 flex flex-col justify-between shadow-2xl z-10 animate-slide-right">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white">
                      <BedDouble className="w-4 h-4" />
                    </div>
                    <span className="font-black text-lg text-white">
                      Rent<span className="text-[#38bdf8]">ify</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 py-4">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleNearbyClick();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <LocateFixed className="w-4 h-4 text-emerald-400" />
                    Nearest Hostels to Me
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveCategory('student');
                      triggerToast('Filtering Student Stays');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors text-left"
                  >
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    Student Stays & PGs
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveCategory('family');
                      triggerToast('Filtering Family Stays');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-emerald-400" />
                    Family Stays & Villas
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveCategory('hourly');
                      triggerToast('Filtering Hourly Stays');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    Hourly Day Stays
                  </button>

                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveCategory('regular');
                      triggerToast('Filtering Regular Hotels');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-xs font-semibold transition-colors text-left"
                  >
                    <Calendar className="w-4 h-4 text-rose-400" />
                    Regular Hotels & Resorts
                  </button>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1.5">
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    My Bookings & Profile
                  </Link>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (user) {
                      router.push('/account');
                    } else {
                      openAuthModal('otp');
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  {user ? user.fullName || 'My Account' : 'Sign In / Register'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 9. NOTIFICATIONS POPUP                                                     */}
        {/* ========================================================================= */}
        {notificationsOpen && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
            <div
              onClick={() => setNotificationsOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl space-y-3 z-10 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950">Welcome to Rentify!</span>
                    <span className="text-[10px] text-indigo-600">Just now</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Use coupon code <strong className="text-indigo-600">STAYNOW</strong> for flat 20% off your booking.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">Student Discount Active</span>
                    <span className="text-[10px] text-emerald-600">2h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Hostels in Jaunpur & Varanasi now include free Wi-Fi and Mess food vouchers.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNotificationsOpen(false)}
                className="w-full py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a29] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HotelsPageContent />
    </Suspense>
  );
}
