'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, StayCategory } from '@/types';
import { HotelCard } from '@/components/HotelCard';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  GraduationCap,
  Users,
  Compass,
  X
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

  const resetFilters = () => {
    setCategory('student');
    setCity('');
    setSearchQuery('');
    setMaxPrice(30000);
    router.push('/hotels?category=student');
  };

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      {/* 1. Header & Category Switcher */}
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
            {category === 'student'
              ? 'Student Accommodations'
              : category === 'family'
              ? 'Family Villas & Suites'
              : category === 'trip'
              ? 'Hotels & Vacation Resorts'
              : 'All Accommodations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            Showing <span className="font-semibold text-slate-900">{hotels.length} verified properties</span> across India with secure direct booking.
          </p>
        </div>

        {/* Category Tabs - Clean Segmented Control */}
        <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 gap-1 flex-wrap">
          <button
            onClick={() => handleCategoryChange('student')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              category === 'student'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            <span>Student Stay</span>
          </button>

          <button
            onClick={() => handleCategoryChange('family')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              category === 'family'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Users className="w-4 h-4 text-slate-700" />
            <span>Family Stay</span>
          </button>

          <button
            onClick={() => handleCategoryChange('trip')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              category === 'trip'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-600" />
            <span>Trip Stay</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Keyword Search */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Search By Name / Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Scholars, Villa, Resort..."
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
              />
            </div>
          </div>

          {/* Location / City */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              City / Destination
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-indigo-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
              >
                <option value="">All Indian Cities</option>
                <option value="Bangalore">Bangalore (Koramangala, SG Palya)</option>
                <option value="Delhi">Delhi (North Campus, Hudson Lane)</option>
                <option value="Goa">Goa (Candolim, Anjuna Beach)</option>
                <option value="Shimla">Shimla (Mall Road & Pine Ridge)</option>
                <option value="Udaipur">Udaipur (Lake Pichola Palace)</option>
                <option value="Pune">Pune (Kothrud IT & University)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Price Slider Bar */}
        <div className="pt-3 border-t border-slate-100">
          <div className="max-w-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span>Max Budget / Rent Limit:</span>
              <span className="text-indigo-600 font-extrabold text-sm">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min={5000}
              max={30000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        </div>
      </div>

      {/* 3. Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : hotels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.hotelId} hotel={hotel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 space-y-3">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No properties matched your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your price ceiling or clear your search to explore all available student, family, and trip stays.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function HotelsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
          Loading accommodations...
        </div>
      }
    >
      <HotelsSearchContent />
    </Suspense>
  );
}
