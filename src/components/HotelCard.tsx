'use client';

import React from 'react';
import Link from 'next/link';
import { Hotel } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { MapPin, Star, ShieldCheck, ArrowRight, Utensils, Wifi, Sparkles } from 'lucide-react';

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

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden">
      {/* Cover Image & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={hotel.coverImage}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap items-center gap-1.5 z-10">
          <CategoryBadge category={hotel.category} />
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/95 text-slate-800 backdrop-blur-md shadow-xs border border-white/40">
            {hotel.propertyType}
          </span>
        </div>

        {/* Star Rating Badge */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{hotel.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-300 font-medium">({hotel.reviewCount})</span>
          </div>
        </div>

        {/* City overlay at bottom */}
        <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white z-10">
          <div className="flex items-center gap-1.5 text-xs font-semibold drop-shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
            <span className="truncate">{hotel.city}, {hotel.state}</span>
          </div>
          {hotel.featured && (
            <span className="flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600/90 text-white px-2.5 py-0.5 rounded-full backdrop-blur-md border border-indigo-400/30">
              <Sparkles className="w-3 h-3" /> Featured
            </span>
          )}
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link href={`/hotels/${hotel.hotelId}`} className="block group-hover:text-indigo-600 transition-colors">
            <h3 className="text-base font-bold text-slate-900 line-clamp-1 tracking-tight leading-snug">
              {hotel.name}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {hotel.description}
          </p>

          {/* Key Amenities Preview */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {hotel.amenities.slice(0, 3).map((amenity, i) => (
              <span
                key={i}
                className="px-2.5 py-1 text-[11px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60 rounded-lg"
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

        {/* Pricing & Booking CTA */}
        <div className="pt-3.5 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                {isStudent
                  ? formatINR(hotel.monthlyRent || hotel.startingPrice)
                  : formatINR(hotel.startingPrice)}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isStudent ? '/ month' : '/ night'}
              </span>
            </div>

            {/* Advance deposit callout */}
            <div className="mt-1">
              {isStudent && hotel.securityDeposit ? (
                <span className="text-[10px] font-semibold tracking-wide uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                  Deposit: {formatINR(hotel.securityDeposit)}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">
                  Advance: {hotel.advancePaymentValue}{hotel.advancePaymentType === 'percentage' ? '%' : ' INR'}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/hotels/${hotel.hotelId}`}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Details
            </Link>
            <Link
              href={`/book?hotelId=${hotel.hotelId}&category=${hotel.category}`}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
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
