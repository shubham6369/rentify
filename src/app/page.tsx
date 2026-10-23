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
  CheckCircle2,
  Sparkles,
  LogOut,
  UserCheck
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
        <div className="text-center space-y-3 mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-indigo-100 text-indigo-700 text-xs font-bold shadow-xs backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Select Your Stay Category</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Find Your Ideal Stay,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-sky-600 to-emerald-600 bg-clip-text text-transparent">
              Simplified & Verified
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
            Transparent monthly student leases, private family holiday villas, and leisure getaways across India with direct booking and secure advance payments.
          </p>
        </div>

        {/* The 3 Core Booking Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto w-full items-stretch">
          {/* OPTION 1: STUDENT STAY */}
          <div
            onClick={() => handleSelectCategory('student')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-indigo-100 hover:border-indigo-400 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-sky-500" />

            <div className="space-y-5">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <GraduationCap className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                  HOSTELS & PGS
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  Student Stay
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Tailored for university scholars, coaching aspirants, and interns. Features monthly rent, deposit advance, mess meal plans, and quiet study libraries.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Monthly rent billing & security deposit hold</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>4 nutritious meals / mess included</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>300 Mbps Wi-Fi & biometric curfew security</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Student ID & guardian verification</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=student' : '/auth?category=student'}
                className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-200 group-hover:shadow-lg group-hover:shadow-indigo-300 transition-all"
              >
                <span>Book Student Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OPTION 2: FAMILY STAY */}
          <div
            onClick={() => handleSelectCategory('family')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-amber-100 hover:border-amber-400 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-orange-500" />

            <div className="space-y-5">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 group-hover:scale-105 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                <Users className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200/70 inline-block">
                  VILLAS & SUITES
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  Family Stay
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Spacious accommodations curated for parents, kids, and grandparents. Enjoy private pools, modular kitchens, child cots, and flexible checkout.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Adults & children count breakdown</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Pay 30% advance, balance at check-in desk</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Child cribs & family lawn amenities</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Multi-bedroom private villas & chalets</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=family' : '/auth?category=family'}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-200 group-hover:shadow-lg group-hover:shadow-amber-300 transition-all"
              >
                <span>Book Family Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OPTION 3: TRIP STAY */}
          <div
            onClick={() => handleSelectCategory('trip')}
            className="group cursor-pointer bg-white rounded-3xl p-7 sm:p-8 shadow-card hover:shadow-card-hover card-lift border border-emerald-100 hover:border-emerald-400 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="space-y-5">
              {/* Icon Container */}
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-700 group-hover:scale-105 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                <Compass className="w-7 h-7" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/70 inline-block">
                  HOTELS & RESORTS
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  Trip Stay
                </h2>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Leisure hotels and boutique resorts located right next to beaches, historic monuments, and mountain valleys with daily & package pricing.
                </p>
              </div>

              {/* Feature Checklist */}
              <ul className="space-y-2.5 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily & package rate calculation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Flexible advance payment or pay in full</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant Trip Voucher with QR confirmation</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Free cancellation up to 48h prior</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-8">
              <Link
                href={user ? '/hotels?category=trip' : '/auth?category=trip'}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-300 transition-all"
              >
                <span>Book Trip Stay</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Security Features */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">100% Aadhaar Verified</p>
              <p className="text-[11px] text-slate-500">Genuine verified hosts & safe stays</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Zero Brokerage</p>
              <p className="text-[11px] text-slate-500">Direct booking with advance terms</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Instant QR Confirmation</p>
              <p className="text-[11px] text-slate-500">Official digital stay vouchers</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
