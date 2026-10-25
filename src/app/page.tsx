'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import {
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  LogOut
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<StayCategory | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectCategory = (cat: StayCategory) => {
    setSelectedCategory(cat);
    if (!user) {
      // Proceed directly to 2. Authentication
      router.push(`/auth?category=${cat}`);
    } else {
      // If already authenticated, proceed to the category stay flow
      router.push(`/hotels?category=${cat}`);
    }
  };

  return (
    <div className="min-h-screen mesh-gradient flex flex-col justify-between" suppressHydrationWarning>
      {/* Header Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-800 bg-clip-text text-transparent">
              Find Your Stay
            </span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
              Verified
            </span>
          </div>
        </Link>

        {mounted && user ? (
          <div className="flex items-center gap-2.5 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">
              {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
              {user.fullName || 'User'}
            </span>
            <button
              onClick={() => logout()}
              title="Logout"
              className="text-slate-400 hover:text-red-600 transition-colors ml-1 p-0.5 rounded-full hover:bg-red-50"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : mounted ? (
          <Link
            href="/auth"
            className="text-xs font-bold text-slate-700 hover:text-indigo-600 bg-white/90 hover:bg-white px-4 py-2 rounded-full border border-slate-200/80 shadow-xs hover:shadow-sm transition-all"
          >
            Sign In / Register
          </Link>
        ) : (
          <div className="w-28 h-8" />
        )}
      </header>

      {/* Main Container: The 3 Core Booking Experiences */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex flex-col justify-center">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Find Your Ideal Stay,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 bg-clip-text text-transparent">
              Simplified &amp; Verified
            </span>
          </h1>
        </div>

        {/* The 3 Core Booking Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto w-full items-stretch">
          {/* OPTION 1: STUDENT STAY */}
          <div
            onClick={() => handleSelectCategory('student')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-slate-200/90 hover:border-indigo-400 relative overflow-hidden flex flex-col justify-between transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600" />

            <div className="space-y-4">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-indigo-700 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Student Stay
                </h2>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=student' : '/auth?category=student'}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all duration-200"
              >
                <span>Book Student Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OPTION 2: FAMILY STAY */}
          <div
            onClick={() => handleSelectCategory('family')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-slate-200/90 hover:border-slate-400 relative overflow-hidden flex flex-col justify-between transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700" />

            <div className="space-y-4">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 group-hover:scale-105 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-xs">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Family Stay
                </h2>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=family' : '/auth?category=family'}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all duration-200"
              >
                <span>Book Family Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OPTION 3: TRIP STAY */}
          <div
            onClick={() => handleSelectCategory('trip')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-slate-200/90 hover:border-teal-400 relative overflow-hidden flex flex-col justify-between transition-all"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-teal-600" />

            <div className="space-y-4">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100/80 flex items-center justify-center text-teal-700 group-hover:scale-105 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-xs">
                <Compass className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Trip Stay
                </h2>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=trip' : '/auth?category=trip'}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs group-hover:shadow-md transition-all duration-200"
              >
                <span>Book Trip Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
