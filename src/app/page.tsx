'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import { Compass, LogOut } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<StayCategory>('student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stayOptions: { id: StayCategory; label: string }[] = [
    { id: 'student', label: 'Student booking' },
    { id: 'family', label: 'Family booking' },
    { id: 'hourly', label: 'Hourly booking' },
    { id: 'regular', label: 'Regular stay' }
  ];

  const handleContinue = () => {
    const cat = selectedCategory;
    if (!user) {
      router.push(`/auth?category=${cat}`);
    } else {
      router.push(`/hotels?category=${cat}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 sm:bg-slate-200/60 flex items-center justify-center sm:p-4 md:p-6" suppressHydrationWarning>
      {/* Mobile Device Screen Container */}
      <div className="w-full max-w-sm sm:max-w-[400px] min-h-screen sm:min-h-0 bg-white sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white px-6 sm:px-7 pt-10 sm:pt-11 pb-8 rounded-b-[2rem] shadow-sm relative">
          {/* Subtle Brand & Auth Row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-white">
                <Compass className="w-3.5 h-3.5 text-indigo-300" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/90">Find Your Stay</span>
            </div>

            {mounted && user ? (
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
                <span className="text-[11px] font-semibold text-white truncate max-w-[90px]">
                  {user.fullName || 'User'}
                </span>
                <button
                  onClick={() => logout()}
                  title="Sign Out"
                  className="text-white/70 hover:text-white transition-colors"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : mounted ? (
              <Link
                href="/auth"
                className="text-[11px] font-semibold text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/15 transition-all"
              >
                Sign In
              </Link>
            ) : (
              <div className="w-14 h-5" />
            )}
          </div>

          {/* Heading & Subheading matching Wireframe */}
          <h1 className="text-2xl sm:text-[1.75rem] font-bold tracking-tight text-white leading-tight">
            Choose Stay
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200/90 font-normal mt-1">
            Select your booking
          </p>
        </div>

        {/* Option Cards matching Wireframe */}
        <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between bg-white">
          <div className="space-y-3.5">
            {stayOptions.map((opt) => {
              const isSelected = selectedCategory === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSelectedCategory(opt.id)}
                  className={`w-full py-4 px-4 sm:px-5 rounded-2xl border transition-all text-left flex items-center gap-4 select-none ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-slate-50/90 hover:bg-slate-100/80 border-slate-200/80'
                  }`}
                >
                  {/* Solid circle matching wireframe */}
                  <div
                    className={`w-5 h-5 rounded-full shrink-0 transition-all ${
                      isSelected
                        ? 'bg-indigo-600 ring-4 ring-indigo-100 scale-105'
                        : 'bg-slate-300'
                    }`}
                  />

                  {/* Option Label */}
                  <span
                    className={`text-sm sm:text-base tracking-tight ${
                      isSelected
                        ? 'font-bold text-slate-900'
                        : 'font-semibold text-slate-700'
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Action: CONTINUE Button */}
          <div className="pt-6 sm:pt-7 space-y-3">
            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-indigo-600 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md hover:shadow-lg flex items-center justify-center text-center"
            >
              CONTINUE
            </button>

            {/* Legal Links */}
            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
              <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
