'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import {
  BedDouble,
  User,
  ArrowRight,
  GraduationCap,
  Users,
  Clock,
  Calendar,
  Sparkles
} from 'lucide-react';

interface OptionItem {
  id: StayCategory;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
}

interface OnboardingSlide {
  title: string;
  subtitle: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: 'Find Best\nStudent Bookings',
    subtitle: 'Hostel, PG, College Stay & More'
  },
  {
    title: 'Comfortable\nFamily Stays',
    subtitle: 'Villas, Suites & Private Getaways'
  },
  {
    title: 'Flexible\nHourly Stays',
    subtitle: 'Book by the hour, not the whole day'
  },
  {
    title: 'Handpicked\nRegular Hotels',
    subtitle: 'Verified resorts and premium stays'
  }
];

function HomeFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  // Navigation / View flow: 'splash' -> 'onboarding' -> 'choose'
  const initialStepParam = searchParams.get('step') as 'splash' | 'onboarding' | 'choose' | null;
  const [currentStep, setCurrentStep] = useState<'splash' | 'onboarding' | 'choose'>(
    initialStepParam || 'splash'
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory>('student');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Splash Screen Auto-Transition: Show for exactly 2 seconds then transition to Onboarding
  useEffect(() => {
    if (currentStep === 'splash' && !initialStepParam) {
      const timer = setTimeout(() => {
        setCurrentStep('onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, initialStepParam]);

  const stayOptions: OptionItem[] = [
    {
      id: 'student',
      title: 'Student booking',
      subtitle: 'For students and learners',
      icon: GraduationCap,
      gradient: 'from-[#4f46e5] via-[#5b54fa] to-[#3b82f6]'
    },
    {
      id: 'family',
      title: 'Family booking',
      subtitle: 'For families and group stays',
      icon: Users,
      gradient: 'from-[#10b981] via-[#059669] to-[#0d9488]'
    },
    {
      id: 'hourly',
      title: 'Hourly booking',
      subtitle: 'Book by the hour, not the day',
      icon: Clock,
      gradient: 'from-[#f59e0b] via-[#ea580c] to-[#f97316]'
    },
    {
      id: 'regular',
      title: 'Regular stay',
      subtitle: 'For daily and long-term stays',
      icon: Calendar,
      gradient: 'from-[#fb7185] via-[#f43f5e] to-[#e11d48]'
    }
  ];

  const handleContinue = () => {
    router.push(`/auth?category=${selectedCategory}`);
  };

  const handleUserClick = () => {
    if (user) {
      router.push('/account');
    } else {
      openAuthModal('otp');
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900/95 flex items-center justify-center sm:py-6 sm:px-4"
      suppressHydrationWarning
    >
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[412px] min-h-screen sm:min-h-[870px] bg-white sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        {/* ========================================================================= */}
        {/* STEP 1: SPLASH SCREEN (Shown for 2 seconds on app open)                   */}
        {/* ========================================================================= */}
        {currentStep === 'splash' && (
          <div className="flex-1 bg-gradient-to-b from-[#185ae8] via-[#144fcb] to-[#0b3499] text-white flex flex-col justify-between p-6 sm:p-7 relative overflow-hidden animate-fade-in select-none">
            {/* Ambient background particles / glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Empty Space */}
            <div className="pt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep('onboarding')}
                className="text-[11px] font-semibold text-white/60 hover:text-white px-2.5 py-1 rounded-full bg-white/10 transition-colors"
              >
                Skip
              </button>
            </div>

            {/* Middle Logo & Branding */}
            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto relative z-10">
              {/* Paper Plane Origami Icon */}
              <div className="relative mb-2">
                <svg
                  viewBox="0 0 100 100"
                  className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Main Wing (White) */}
                  <path
                    d="M18 52 L85 18 L50 82 L44 58 Z"
                    fill="#FFFFFF"
                  />
                  {/* Upper Right Fold (Soft Cyan / Light Slate) */}
                  <path
                    d="M85 18 L44 58 L64 60 Z"
                    fill="#E0E7FF"
                  />
                  {/* Under Shadow Fold */}
                  <path
                    d="M44 58 L50 82 L58 68 Z"
                    fill="#93C5FD"
                  />
                </svg>
              </div>

              {/* Brand Name: Rentify */}
              <div className="flex items-center justify-center">
                <span className="text-4xl sm:text-[42px] font-extrabold tracking-tight text-white drop-shadow-sm">
                  Rent
                </span>
                <span className="text-4xl sm:text-[42px] font-extrabold tracking-tight text-[#44c4ff] drop-shadow-sm">
                  ify
                </span>
              </div>

              {/* Tagline: Study • Stay • Travel */}
              <p className="text-white/95 text-base sm:text-lg font-medium italic tracking-wide font-serif pt-1">
                Study &nbsp;•&nbsp; Stay &nbsp;•&nbsp; Travel
              </p>
            </div>

            {/* Bottom Section: Heritage City Skyline Silhouette & Slogan */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 pb-4">
              {/* Skyline Silhouette */}
              <div className="w-full overflow-hidden opacity-35 px-2">
                <svg
                  viewBox="0 0 400 90"
                  preserveAspectRatio="none"
                  className="w-full h-16 fill-current text-[#061d56]"
                >
                  {/* Monument skyline silhouettes: domes, minarets, towers */}
                  <path d="M0,90 L0,78 L12,78 L12,65 L18,65 L18,52 L22,46 L26,52 L26,65 L32,65 L32,78 L45,78 L45,68 L52,68 L52,90 L60,90 L60,60 L68,60 L72,40 L76,40 L80,60 L88,60 L88,90 L95,90 L95,72 L102,72 L106,62 L112,62 L116,72 L125,72 L125,90 L135,90 L135,48 L142,48 L146,30 L150,48 L158,48 L158,90 L168,90 L168,58 L176,58 L180,42 C184,32 196,32 200,42 L204,58 L212,58 L212,90 L220,90 L220,68 L228,68 L232,56 L238,56 L242,68 L250,68 L250,90 L258,90 L258,45 L264,45 L268,26 L272,45 L278,45 L278,90 L288,90 L288,62 L298,62 L302,48 C306,38 318,38 322,48 L326,62 L336,62 L336,90 L345,90 L345,72 L352,72 L356,58 L360,72 L368,72 L368,90 L380,90 L380,66 L388,66 L392,54 L396,66 L400,66 L400,90 Z" />
                </svg>
              </div>

              {/* Slogan */}
              <div className="space-y-0.5 text-white/85 text-xs font-medium tracking-wide">
                <p>Your Journey</p>
                <p>Our Priority</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ONBOARDING SCREEN (Image 2)                                      */}
        {/* ========================================================================= */}
        {currentStep === 'onboarding' && (
          <div className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-7 animate-fade-in select-none">
            {/* Top Brand / Skip */}
            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900">
                  Rent
                </span>
                <span className="text-base font-extrabold tracking-tight text-[#1877f2]">
                  ify
                </span>
              </div>
              <button
                onClick={() => setCurrentStep('choose')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 py-1 px-2.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>

            {/* Illustration & Headline */}
            <div className="my-auto flex flex-col items-center text-center space-y-6 pt-2 pb-4">
              {/* Illustration in thought cloud / arched soft container */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden flex items-center justify-center">
                <img
                  src="/images/student-onboarding.jpg"
                  alt="Find Best Student Bookings"
                  className="w-full h-full object-cover rounded-3xl shadow-sm"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2 px-2">
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-snug whitespace-pre-line">
                  {ONBOARDING_SLIDES[activeSlide].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  {ONBOARDING_SLIDES[activeSlide].subtitle}
                </p>
              </div>

              {/* Carousel Indicator Dots */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {ONBOARDING_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activeSlide === idx
                        ? 'w-6 h-2 bg-[#1877f2]'
                        : 'w-2 h-2 bg-blue-200 hover:bg-blue-300'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Actions: Get Started & Login */}
            <div className="space-y-4 pt-4 pb-2">
              {/* Big Blue "Get Started" Pill Button -> Opens Choose Stay Screen */}
              <button
                onClick={() => setCurrentStep('choose')}
                type="button"
                className="w-full py-4 rounded-full bg-[#1877f2] hover:bg-[#1565c0] active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center text-center cursor-pointer"
              >
                Get Started
              </button>

              {/* Login Link */}
              <div className="text-center">
                <button
                  onClick={() => openAuthModal('otp')}
                  type="button"
                  className="text-sm font-bold text-[#1877f2] hover:underline cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: CHOOSE STAY SCREEN (Image 3)                                      */}
        {/* ========================================================================= */}
        {currentStep === 'choose' && (
          <div className="flex-1 flex flex-col justify-between bg-white animate-fade-in">
            {/* Top Hero Section */}
            <div className="relative bg-gradient-to-b from-[#0a0e2f] via-[#0d1445] to-[#121856] text-white pt-7 pb-8 px-5 sm:px-6 overflow-hidden">
              {/* Subtle ambient lighting glows */}
              <div className="absolute -top-12 -left-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/4 right-0 w-52 h-52 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

              {/* Top Bar: Brand */}
              <div className="relative z-10 flex items-center justify-between mb-5">
                {/* Logo + Brand (Rentify / Find Your Stay) */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b82f6] via-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-md shadow-indigo-600/30">
                    <BedDouble className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold tracking-tight text-white/95">
                      Find Your Stay
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 bg-white/10 text-sky-300 rounded border border-white/15">
                      Rentify
                    </span>
                  </div>
                </div>
              </div>

              {/* Hero Content: Title & 3D Bedroom Illustration */}
              <div className="relative z-10 grid grid-cols-12 items-center gap-2 pt-1 pb-1">
                {/* Left: Titles */}
                <div className="col-span-7 pr-1">
                  <h1 className="text-[32px] sm:text-[34px] font-extrabold tracking-tight leading-tight">
                    <span className="text-white">Choose </span>
                    <span className="bg-gradient-to-r from-[#38bdf8] via-[#818cf8] to-[#c084fc] bg-clip-text text-transparent">
                      Stay
                    </span>
                  </h1>
                  <p className="text-xs sm:text-[13px] text-indigo-200/80 font-normal mt-1">
                    Select your booking
                  </p>
                </div>

                {/* Right: Arched Bedroom 3D Graphic */}
                <div className="col-span-5 relative flex justify-end">
                  <div className="relative w-36 h-28 sm:w-40 sm:h-30 rounded-t-[2.5rem] rounded-b-xl overflow-hidden border border-indigo-400/25 shadow-[0_12px_28px_rgba(0,0,0,0.5)] bg-slate-950/80">
                    <img
                      src="/images/hero-bed.jpg"
                      alt="Cozy Stay Bedroom"
                      className="w-full h-full object-cover object-center transform scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121856]/70 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Smooth curved bottom wave separator matching original reference */}
              <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
                <svg
                  viewBox="0 0 500 35"
                  preserveAspectRatio="none"
                  className="w-full h-6 text-white fill-current"
                >
                  <path d="M0,18 C160,35 340,5 500,22 L500,35 L0,35 Z" />
                </svg>
              </div>
            </div>

            {/* Main Content: Booking Option Cards */}
            <div className="flex-1 px-5 sm:px-6 pt-3 pb-6 flex flex-col justify-between bg-white">
              {/* Cards Stack */}
              <div className="space-y-3.5">
                {stayOptions.map((opt) => {
                  const isSelected = selectedCategory === opt.id;
                  const Icon = opt.icon;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedCategory(opt.id)}
                      className={`w-full py-3.5 px-4 rounded-[1.25rem] transition-all duration-200 text-left flex items-center justify-between cursor-pointer group ${
                        isSelected
                          ? 'bg-blue-50/20 border-2 border-[#2563eb] shadow-[0_4px_16px_rgba(37,99,235,0.08)]'
                          : 'bg-white hover:bg-slate-50/60 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
                      }`}
                    >
                      {/* Left: Circular Icon Badge + Text */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Vibrant Gradient Circle Icon */}
                        <div
                          className={`w-13 h-13 rounded-full bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105`}
                          style={{ width: '3.125rem', height: '3.125rem' }}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
                        </div>

                        {/* Title + Subtitle */}
                        <div className="min-w-0">
                          <h3
                            className={`text-[15px] sm:text-base font-bold tracking-tight leading-snug ${
                              isSelected ? 'text-slate-900' : 'text-slate-900'
                            }`}
                          >
                            {opt.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-normal mt-0.5 whitespace-nowrap">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Right: Radio Button */}
                      <div className="shrink-0 pl-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-2 border-[#2563eb] bg-white'
                              : 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Action Area: CONTINUE & Legal Links */}
              <div className="pt-6 sm:pt-7 space-y-3">
                {/* Gradient CONTINUE Button */}
                <button
                  onClick={handleContinue}
                  type="button"
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#0d1645] via-[#1d2275] to-[#6d28d9] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-lg shadow-indigo-950/25 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>

                {/* Privacy Policy • Terms of Service */}
                <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-normal pt-1">
                  <Link
                    href="/privacy"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link
                    href="/terms"
                    className="hover:text-indigo-600 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#185ae8] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeFlowContent />
    </Suspense>
  );
}
