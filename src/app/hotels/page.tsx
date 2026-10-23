'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Hotel, StayCategory, PropertyType } from '@/types';
import { HotelCard } from '@/components/HotelCard';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  GraduationCap,
  Users,
  Compass,
  X,
  Building
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
  const [propertyType, setPropertyType] = useState<PropertyType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [selectedAmenity, setSelectedAmenity] = useState<string>('all');

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
        if (propertyType !== 'all') params.append('propertyType', propertyType);
        if (searchQuery) params.append('search', searchQuery);
        params.append('maxPrice', maxPrice.toString());

        const res = await fetch(`/api/hotels?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          let list: Hotel[] = data.hotels;
          if (selectedAmenity !== 'all') {
            list = list.filter((h) =>
              h.amenities.some((a) => a.toLowerCase().includes(selectedAmenity.toLowerCase()))
            );
          }
          setHotels(list);
        }
      } catch (err) {
        console.error('Fetch hotels error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHotels();
  }, [category, city, propertyType, searchQuery, maxPrice, selectedAmenity]);

  const resetFilters = () => {
    setCategory('student');
    setCity('');
    setPropertyType('all');
    setSearchQuery('');
    setMaxPrice(30000);
    setSelectedAmenity('all');
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
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {category === 'student'
              ? '🎓 Student Stays'
              : category === 'family'
              ? '👨‍👩‍👧‍👦 Family Villas & Chalets'
              : category === 'trip'
              ? '✈️ Holiday Hotels & Trip Resorts'
              : 'Browse Accommodations'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 font-medium">
            Showing <span className="font-bold text-slate-900">{hotels.length} verified properties</span> across India with secure advance payment.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            onClick={() => handleCategoryChange('student')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              category === 'student'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2'
                : 'bg-white text-indigo-700 border border-indigo-200/80 hover:bg-indigo-50/70 shadow-2xs'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Stay (Hostels & PGs)</span>
          </button>

          <button
            onClick={() => handleCategoryChange('family')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              category === 'family'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-200 ring-2 ring-amber-600 ring-offset-2'
                : 'bg-white text-amber-800 border border-amber-200/80 hover:bg-amber-50/70 shadow-2xs'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Family Stay (Villas & Suites)</span>
          </button>

          <button
            onClick={() => handleCategoryChange('trip')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              category === 'trip'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 ring-2 ring-emerald-600 ring-offset-2'
                : 'bg-white text-emerald-700 border border-emerald-200/80 hover:bg-emerald-50/70 shadow-2xs'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Trip Stay (Hotels & Resorts)</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Search & Filters Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Property Type */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Accommodation Type
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as any)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
              >
                <option value="all">All Types (Hostel, Villa, Hotel...)</option>
                <option value="hostel">Hostel (Student)</option>
                <option value="pg">PG Accommodation (Student)</option>
                <option value="villa">Private Villa (Family)</option>
                <option value="apartment">Family Apartment</option>
                <option value="hotel">Boutique Hotel</option>
                <option value="resort">Leisure Resort</option>
              </select>
            </div>
          </div>

          {/* Key Amenities */}
          <div>
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
              Must-Have Amenity
            </label>
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium transition-all"
            >
              <option value="all">Any Amenity</option>
              <option value="Wi-Fi">Dedicated High-Speed Wi-Fi</option>
              <option value="Mess">Nutritious Mess Meals Included</option>
              <option value="Study">Quiet Study Library / Pods</option>
              <option value="Pool">Swimming Pool</option>
              <option value="Kitchen">Equipped Kitchen</option>
              <option value="CCTV">24/7 Biometric / CCTV Security</option>
            </select>
          </div>
        </div>

        {/* Price Slider Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
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

          <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span>💡</span>
            <span>Student stays show monthly rent; Family and Trip stays show nightly/package rates.</span>
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
