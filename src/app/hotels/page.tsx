'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, StayCategory } from '@/types';
import { HotelCard } from '@/components/HotelCard';
import {
  Search,
  MapPin,
  GraduationCap,
  Users,
  Clock,
  Building,
  Bell,
  Compass,
  X,
  SlidersHorizontal
} from 'lucide-react';

function HotelsSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL Query Parameters
  const initialCategory = (searchParams.get('category') as StayCategory) || 'student';
  const initialCity = searchParams.get('city') || '';
  const initialSearch = searchParams.get('search') || '';

  // Local Filter States
  const [category, setCategory] = useState<StayCategory | 'all'>(initialCategory);
  const [city, setCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(30000);

  // Hotels State
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL when search params change
  useEffect(() => {
    const cat = searchParams.get('category') as StayCategory;
    if (cat) setCategory(cat);
    const c = searchParams.get('city');
    if (c) setCity(c);
  }, [searchParams]);

  useEffect(() => {
    async function fetchHotels() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (category !== 'all') params.append('category', category);
        if (city) params.append('city', city);
        if (searchQuery) params.append('search', searchQuery);
        params.append('maxPrice', maxPrice.toString());

        const res = await fetch(`/api/hotels?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setHotels(data.hotels);
        }
      } catch (err) {
        console.error('Fetch hotels error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [category, city, searchQuery, maxPrice]);

  const handleCategoryChange = (newCat: StayCategory | 'all') => {
    setCategory(newCat);
    const params = new URLSearchParams(searchParams.toString());
    if (newCat === 'all') {
      params.delete('category');
    } else {
      params.set('category', newCat);
    }
    router.push(`/hotels?${params.toString()}`);
  };

  const categoryTitle =
    category === 'student'
      ? 'Student Accommodations'
      : category === 'family'
      ? 'Family Accommodations'
      : category === 'hourly'
      ? 'Hourly Stays'
      : category === 'regular'
      ? 'Regular Hotel Stays'
      : 'All Accommodations';

  return (
    <div className="min-h-screen bg-[#0d111d] flex justify-center sm:py-6 sm:px-4">
      {/* Mobile-First Frame matching Image 3 with desktop responsiveness */}
      <div className="w-full max-w-[430px] sm:max-w-2xl lg:max-w-4xl min-h-screen bg-[#f8faff] sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col transition-all">
        
        {/* Top Midnight Indigo/Purple Curved Header matching Image 3 */}
        <div className="bg-gradient-to-br from-[#0c0836] via-[#1c0f64] to-[#3a1396] text-white pt-7 pb-6 px-5 sm:px-6 rounded-b-[2.5rem] shadow-xl space-y-4 select-none">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] text-white flex items-center justify-center shadow-md shadow-indigo-950/40">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Find Your Stay
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black tracking-wider bg-white/15 text-white border border-white/20 rounded-md backdrop-blur-xs">
                  PRO
                </span>
              </div>
            </div>

            <button
              type="button"
              aria-label="Notifications"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center relative transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="w-2 h-2 rounded-full bg-pink-500 absolute top-2 right-2 ring-2 ring-[#1c0f64]" />
            </button>
          </div>

          {/* Heading & Subheading */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              {categoryTitle}
            </h1>
            <p className="text-xs text-indigo-200/90 font-medium">
              Showing <strong className="text-white font-bold">verified properties</strong> across India with secured direct booking.
            </p>
          </div>

          {/* Search & Filter Card Inset matching Image 3 */}
          <div className="bg-white rounded-2xl p-4 shadow-lg text-slate-800 space-y-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-indigo-600 absolute left-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, area, university..."
                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-all"
              />
            </div>

            {/* City Selector */}
            <div className="relative flex items-center">
              <MapPin className="w-4 h-4 text-indigo-600 absolute left-3" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 appearance-none transition-all cursor-pointer"
              >
                <option value="">All Indian Cities</option>
                <option value="Bangalore">Bangalore (Koramangala, SG Palya)</option>
                <option value="Delhi">Delhi (North Campus, Hudson Lane)</option>
                <option value="Goa">Goa (Candolim, Anjuna Beach)</option>
                <option value="Shimla">Shimla (Mall Road & Pine Ridge)</option>
                <option value="Udaipur">Udaipur (Lake Pichola Palace)</option>
                <option value="Pune">Pune (Kothrud IT & University)</option>
              </select>
              <span className="absolute right-3 text-slate-400 pointer-events-none text-xs">▼</span>
            </div>

            {/* Budget Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="text-[11px] font-semibold text-slate-500">Max Budget / Rent Limit:</span>
                <span className="text-[#3b49df] font-black text-sm">
                  ₹{maxPrice.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={30000}
                step={1000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#5a14d5]"
              />
            </div>
          </div>

          {/* Category Filter Pills matching Image 3 */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleCategoryChange('student')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                category === 'student'
                  ? 'bg-gradient-to-r from-[#281078] to-[#5a14d5] text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white text-slate-700 hover:bg-white/90 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Stay</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('family')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                category === 'family'
                  ? 'bg-gradient-to-r from-[#281078] to-[#5a14d5] text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white text-slate-700 hover:bg-white/90 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Family Stay</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('hourly')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                category === 'hourly'
                  ? 'bg-gradient-to-r from-[#281078] to-[#5a14d5] text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white text-slate-700 hover:bg-white/90 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hourly Booking</span>
            </button>

            <button
              type="button"
              onClick={() => handleCategoryChange('regular')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                category === 'regular'
                  ? 'bg-gradient-to-r from-[#281078] to-[#5a14d5] text-white shadow-md shadow-indigo-950/20'
                  : 'bg-white text-slate-700 hover:bg-white/90 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>Regular Stay</span>
            </button>
          </div>
        </div>

        {/* Accommodation Cards List */}
        <div className="flex-1 p-4 sm:p-5 space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Finding verified accommodations...</p>
            </div>
          ) : hotels.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl p-8 border border-slate-100">
              <p className="text-sm font-bold text-slate-700">No properties match your filters.</p>
              <p className="text-xs text-slate-400">Try adjusting your budget limit or location filter.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCity('');
                  setMaxPrice(30000);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            hotels.map((hotel) => (
              <HotelCard key={hotel.hotelId} hotel={hotel} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0836] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HotelsSearchContent />
    </Suspense>
  );
}
