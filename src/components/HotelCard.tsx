'use client';

import React from 'react';
import Link from 'next/link';
import { Hotel } from '@/types';
import { MapPin, Star, ArrowRight, Heart, GraduationCap, Users, Clock, Building, Compass } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
}

export function HotelCard({ hotel }: HotelCardProps) {
  const isStudent = hotel.category === 'student';
  const isFamily = hotel.category === 'family';

  // Format currency in INR (₹)
  const formatINR = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt);
  };

  const getCategoryIcon = () => {
    switch (hotel.category) {
      case 'student':
        return <GraduationCap className="w-3.5 h-3.5 text-[#3b49df]" />;
      case 'family':
        return <Users className="w-3.5 h-3.5 text-slate-700" />;
      case 'hourly':
        return <Clock className="w-3.5 h-3.5 text-sky-600" />;
      case 'regular':
        return <Building className="w-3.5 h-3.5 text-slate-700" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-teal-600" />;
    }
  };

  const getCategoryLabel = () => {
    switch (hotel.category) {
      case 'student':
        return 'Student Stay';
      case 'family':
        return 'Family Stay';
      case 'hourly':
        return 'Hourly Booking';
      case 'regular':
        return 'Regular Stay';
      default:
        return 'Trip Stay';
    }
  };

  return (
    <div className="group bg-white rounded-3xl border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image & Badges matching Image 3 */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={hotel.coverImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges: Category Pill & Property Type Pill */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-[#3b49df] shadow-xs flex items-center gap-1">
            {getCategoryIcon()}
            <span>{getCategoryLabel()}</span>
          </span>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-slate-800 shadow-xs">
            {hotel.propertyType}
          </span>
        </div>

        {/* Star Rating Badge on Top Right */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/10 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{hotel.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-300 font-medium">({hotel.reviewCount})</span>
          </div>
        </div>

        {/* City & Heart overlay at bottom of photo */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-1.5 text-xs font-bold drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">{hotel.city}, {hotel.state}</span>
          </div>

          <button
            type="button"
            aria-label="Add to favorites"
            className="p-1 rounded-full text-white/90 hover:text-white hover:scale-110 transition-all drop-shadow-md cursor-pointer"
          >
            <Heart className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <Link href={`/hotels/${hotel.hotelId}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 tracking-tight leading-snug">
              {hotel.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
            {hotel.description}
          </p>

          {/* Key Amenities Preview */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100/80 text-slate-600 rounded-lg"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[11px] text-slate-400 font-semibold px-1">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Booking CTA matching Image 3 */}
        <div className="pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                {isStudent
                  ? formatINR(hotel.monthlyRent || hotel.startingPrice)
                  : formatINR(hotel.startingPrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isStudent ? '/ month' : '/ night'}
              </span>
            </div>

            {/* Advance deposit pill callout */}
            <div className="mt-1">
              {isStudent && hotel.securityDeposit ? (
                <span className="text-[10px] font-bold tracking-wide uppercase text-[#3b49df] bg-indigo-50 border border-indigo-100/70 px-2 py-0.5 rounded-md inline-block">
                  DEPOSIT: {formatINR(hotel.securityDeposit)}
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-wide uppercase text-[#3b49df] bg-indigo-50 border border-indigo-100/70 px-2 py-0.5 rounded-md inline-block">
                  ADVANCE: {hotel.advancePaymentValue}{hotel.advancePaymentType === 'percentage' ? '%' : ' INR'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/hotels/${hotel.hotelId}`}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Details
            </Link>
            <Link
              href={`/book?hotelId=${hotel.hotelId}&category=${hotel.category}`}
              className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-[#281078] to-[#5a14d5] hover:opacity-95 rounded-xl shadow-md shadow-indigo-950/20 transition-all flex items-center gap-1.5"
            >
              <span>Book</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
