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
  Sparkles,
  Compass,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell,
  Search,
  MapPin,
  Heart,
  Star,
  Wifi,
  Car,
  Utensils,
  Waves,
  Snowflake,
  ConciergeBell,
  Home,
  ShoppingBag,
  Navigation,
  X,
  SlidersHorizontal,
  Check
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
  image: string;
}

const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: 'Find Best\nStudent Bookings',
    subtitle: 'Hostel, PG, College Stay & More',
    image: '/images/student-onboarding.jpg'
  },
  {
    title: 'Comfortable\nFamily Stays',
    subtitle: 'Villas, Suites & Private Getaways',
    image: '/images/family-onboarding.jpg'
  },
  {
    title: 'Flexible\nHourly Stays',
    subtitle: 'Book by the hour, not the whole day',
    image: '/images/hourly-onboarding.jpg'
  },
  {
    title: 'Handpicked\nRegular Hotels',
    subtitle: 'Verified resorts and premium stays',
    image: '/images/regular-onboarding.jpg'
  }
];

const POPULAR_CITIES = [
  { id: 'mariyahu', name: 'Mariyahu', image: '/images/city-mariyahu.jpg', hasPin: true },
  { id: 'jaunpur', name: 'Jaunpur', image: '/images/city-jaunpur.jpg' },
  { id: 'varanasi', name: 'Varanasi', image: '/images/city-varanasi.jpg' },
  { id: 'lucknow', name: 'Lucknow', image: '/images/city-lucknow.jpg' },
  { id: 'nearby', name: 'Nearby', isNearby: true }
];

const FEATURED_HOTELS = [
  {
    id: 'hotel_grand_vista_jnp',
    title: 'Hotel Grand Vista',
    image: '/images/hotel-grand-vista.jpg',
    rating: 4.6,
    reviewsCount: '1.2k reviews',
    location: 'Civil Lines, Jaunpur',
    city: 'Jaunpur',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Car, label: 'Free Parking' },
      { icon: Utensils, label: 'Restaurant' }
    ],
    price: 2499,
    originalPrice: 3999,
    discountBadge: '38% OFF',
    badge: { text: 'Top Rated', bg: 'bg-[#4f46e5]', emoji: '🔥' },
    category: 'regular' as StayCategory
  },
  {
    id: 'royal_heritage_resort_vns',
    title: 'Royal Heritage Resort',
    image: '/images/hotel-royal-heritage.jpg',
    rating: 4.5,
    reviewsCount: '856 reviews',
    location: 'Ganga Ghat Road, Varanasi',
    city: 'Varanasi',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Waves, label: 'Swimming Pool' },
      { icon: Utensils, label: 'Restaurant' }
    ],
    price: 3199,
    originalPrice: 5499,
    discountBadge: '42% OFF',
    badge: { text: 'Best Value', bg: 'bg-[#059669]', emoji: '🛡️' },
    category: 'family' as StayCategory
  },
  {
    id: 'the_park_inn_lko',
    title: 'The Park Inn',
    image: '/images/hotel-the-park-inn.jpg',
    rating: 4.3,
    reviewsCount: '642 reviews',
    location: 'Hazratganj, Lucknow',
    city: 'Lucknow',
    amenities: [
      { icon: Wifi, label: 'Free WiFi' },
      { icon: Snowflake, label: 'AC Rooms' },
      { icon: ConciergeBell, label: 'Room Service' }
    ],
    price: 1799,
    originalPrice: 2999,
    discountBadge: '40% OFF',
    badge: { text: 'Budget Friendly', bg: 'bg-[#4f46e5]', emoji: '🛡️' },
    category: 'hourly' as StayCategory
  }
];

function HomeFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, openAuthModal } = useAuth();

  // Navigation / View flow: 'splash' -> 'onboarding' -> 'choose' -> 'home'
  const initialStepParam = searchParams.get('step') as 'splash' | 'onboarding' | 'choose' | 'home' | null;
  const [currentStep, setCurrentStep] = useState<'splash' | 'onboarding' | 'choose' | 'home'>(
    initialStepParam || 'home'
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<StayCategory>('student');
  const [mounted, setMounted] = useState(false);

  // Home Screen interactive states
  const [searchDestination, setSearchDestination] = useState('');
  const [checkInDate, setCheckInDate] = useState('26 Oct 2025');
  const [checkOutDate, setCheckOutDate] = useState('27 Oct 2025');
  const [guestsCount, setGuestsCount] = useState('1 Room · 2 Guests');
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [activeQuickPick, setActiveQuickPick] = useState<'recommended' | 'recent'>('recommended');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'bookings' | 'search' | 'wishlist' | 'profile'>('home');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Step navigation with history push so going back doesn't close the app
  const goToStep = (step: 'splash' | 'onboarding' | 'choose' | 'home') => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      const url =
        step === 'home'
          ? '/?step=home'
          : step === 'choose'
          ? '/?step=choose'
          : step === 'onboarding'
          ? '/?step=onboarding'
          : '/?step=splash';
      window.history.pushState({ step }, '', url);
    }
  };

  const handleStepBack = () => {
    if (currentStep === 'home') {
      goToStep('choose');
    } else if (currentStep === 'choose') {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
      } else {
        goToStep('onboarding');
      }
    }
  };

  // Listen to popstate (browser back, Android hardware back, swipe gestures)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const params = new URLSearchParams(window.location.search);
      const step = (e.state?.step || params.get('step') || 'home') as 'splash' | 'onboarding' | 'choose' | 'home';
      if (['splash', 'onboarding', 'choose', 'home'].includes(step)) {
        setCurrentStep(step);
      }
    };

    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent<'splash' | 'onboarding' | 'choose' | 'home'>;
      if (customEvent.detail) {
        setCurrentStep(customEvent.detail);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('rentify:navigate-step', handleCustomNav);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('rentify:navigate-step', handleCustomNav);
    };
  }, []);

  // 1. Splash Screen Auto-Transition: Show for 2 seconds then transition to Onboarding
  useEffect(() => {
    if (currentStep === 'splash' && initialStepParam === 'splash') {
      const timer = setTimeout(() => {
        setCurrentStep('onboarding');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, initialStepParam]);

  // 2. Onboarding Carousel Auto-Slide: Smooth auto-advance every 3.5 seconds
  useEffect(() => {
    if (currentStep !== 'onboarding') return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % ONBOARDING_SLIDES.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [currentStep]);

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('rentify_onboarded', 'true');
    }
    goToStep('home');
  };

  const handleUserClick = () => {
    if (user) {
      router.push('/account');
    } else {
      openAuthModal('otp');
    }
  };

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCityClick = (cityId: string) => {
    if (cityId === 'nearby') {
      setSelectedCity(null);
      return;
    }
    setSelectedCity((prev) => (prev === cityId ? null : cityId));
  };

  const handleSearchHotels = () => {
    const params = new URLSearchParams();
    if (searchDestination) params.append('search', searchDestination);
    if (selectedCity && selectedCity !== 'nearby') params.append('city', selectedCity);
    router.push(`/hotels?${params.toString()}`);
  };

  const handleBookHotel = (hotelId: string) => {
    router.push(`/book?hotelId=${hotelId}`);
  };

  // Filtered hotels based on selected city and search query
  const displayedHotels = FEATURED_HOTELS.filter((h) => {
    if (selectedCity && h.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (searchDestination) {
      const q = searchDestination.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div
      className="min-h-screen bg-slate-900/95 flex items-center justify-center sm:py-6 sm:px-4"
      suppressHydrationWarning
    >
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[420px] min-h-screen sm:min-h-[890px] bg-slate-50 sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        {/* ========================================================================= */}
        {/* STEP 1: SPLASH SCREEN (Shown when step=splash)                            */}
        {/* ========================================================================= */}
        {currentStep === 'splash' && (
          <div className="flex-1 bg-gradient-to-b from-[#185ae8] via-[#144fcb] to-[#0b3499] text-white flex flex-col justify-between p-6 sm:p-7 relative overflow-hidden animate-fade-in select-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />

            <div className="pt-8 flex justify-end">
              <button
                onClick={() => goToStep('onboarding')}
                className="text-[11px] font-semibold text-white/60 hover:text-white px-2.5 py-1 rounded-full bg-white/10 transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto relative z-10">
              <div className="relative mb-2">
                <svg
                  viewBox="0 0 100 100"
                  className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15 50 L85 20 L50 85 L42 58 L15 50Z"
                    fill="url(#origami-gradient-home)"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <path
                    d="M42 58 L85 20"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray="2 2"
                  />
                  <path
                    d="M42 58 L50 85 L55 64"
                    fill="rgba(255,255,255,0.25)"
                  />
                  <defs>
                    <linearGradient id="origami-gradient-home" x1="15" y1="20" x2="85" y2="85" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#ffffff" />
                      <stop offset="0.6" stopColor="#e0e7ff" />
                      <stop offset="1" stopColor="#93c5fd" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Rent<span className="text-[#38bdf8]">ify</span>
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-indigo-100 tracking-wide">
                  Find Your Stay
                </p>
              </div>
            </div>

            <div className="pb-8 text-center">
              <button
                onClick={() => goToStep('onboarding')}
                className="text-xs font-semibold text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                Tap to start &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ONBOARDING SCREEN (4 Sliding Images Track)                        */}
        {/* ========================================================================= */}
        {currentStep === 'onboarding' && (
          <div className="flex-1 bg-white flex flex-col justify-between p-6 sm:p-7 relative select-none animate-fade-in">
            <div className="pt-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white shadow-xs">
                  <BedDouble className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 select-none">
                    Rent<span className="text-[#3b49df]">ify</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200/60 select-none">
                    Find Your Stay
                  </span>
                </div>
              </div>
              <button
                onClick={() => goToStep('choose')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1 rounded-full hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Skip
              </button>
            </div>

            <div className="my-auto flex flex-col items-center text-center space-y-6 pt-2 pb-4">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden flex items-center justify-center bg-slate-100 shadow-md ring-1 ring-slate-200/60 transform-gpu">
                <div
                  className="flex transition-transform duration-700 ease-in-out h-full w-full will-change-transform transform-gpu"
                  style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
                >
                  {ONBOARDING_SLIDES.map((slide, idx) => (
                    <div key={idx} className="w-full h-full shrink-0 flex items-center justify-center">
                      <img
                        src={slide.image}
                        alt={slide.title.replace('\n', ' ')}
                        className="w-full h-full object-cover select-none pointer-events-none transform-gpu"
                        loading={idx === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 px-2 min-h-[5.5rem] flex flex-col justify-center">
                <h2 className="text-2xl sm:text-[26px] font-extrabold text-slate-900 tracking-tight leading-snug whitespace-pre-line transition-all duration-300">
                  {ONBOARDING_SLIDES[activeSlide].title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium transition-all duration-300">
                  {ONBOARDING_SLIDES[activeSlide].subtitle}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                {ONBOARDING_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      activeSlide === idx
                        ? 'w-7 h-2 bg-gradient-to-r from-[#1877f2] to-[#3b49df]'
                        : 'w-2 h-2 bg-blue-200 hover:bg-blue-300'
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 pb-2">
              <button
                onClick={() => goToStep('choose')}
                type="button"
                className="w-full py-4 rounded-full bg-[#1877f2] hover:bg-[#1565c0] active:scale-[0.99] text-white font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center text-center cursor-pointer"
              >
                Get Started
              </button>

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
        {/* STEP 3: CHOOSE STAY SCREEN                                                */}
        {/* ========================================================================= */}
        {currentStep === 'choose' && (
          <div className="flex-1 flex flex-col justify-between bg-white animate-fade-in">
            <div className="relative bg-gradient-to-b from-[#0a0e2f] via-[#0d1445] to-[#121856] text-white pt-7 pb-8 px-5 sm:px-6 overflow-hidden">
              <div className="absolute -top-12 -left-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/4 right-0 w-52 h-52 bg-purple-600/30 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStepBack}
                    type="button"
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white border border-white/15 transition-all cursor-pointer mr-0.5"
                    aria-label="Back to onboarding"
                  >
                    <ChevronLeft className="w-4 h-4 text-white" />
                  </button>

                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center shadow-md shadow-indigo-950/40 text-white">
                    <BedDouble className="w-4 h-4 text-white" strokeWidth={2.4} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg sm:text-xl font-black tracking-tight text-white select-none">
                      Rent<span className="text-[#38bdf8]">ify</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 bg-white/10 text-indigo-200 rounded-md border border-white/20 select-none backdrop-blur-xs">
                      Find Your Stay
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 grid grid-cols-12 items-center gap-2 pt-1 pb-1">
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

            <div className="flex-1 px-5 sm:px-6 pt-3 pb-6 flex flex-col justify-between bg-white">
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
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-13 h-13 rounded-full bg-gradient-to-br ${opt.gradient} flex items-center justify-center text-white shrink-0 shadow-sm transition-transform group-hover:scale-105`}
                          style={{ width: '3.125rem', height: '3.125rem' }}
                        >
                          <Icon className="w-6 h-6 text-white" strokeWidth={2.2} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-[15px] sm:text-base font-bold tracking-tight leading-snug text-slate-900">
                            {opt.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-normal mt-0.5 whitespace-nowrap">
                            {opt.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 pl-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'border-2 border-[#2563eb] bg-white'
                              : 'border-2 border-slate-300 bg-white group-hover:border-slate-400'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-6 sm:pt-7 space-y-3">
                <button
                  onClick={handleContinue}
                  type="button"
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-xl shadow-indigo-950/25 flex items-center justify-center gap-2 text-center cursor-pointer"
                >
                  <span>CONTINUE</span>
                  <ArrowRight className="w-5 h-5 text-white" strokeWidth={2.5} />
                </button>

                <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-normal pt-1">
                  <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
                    Privacy Policy
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href="/terms" className="hover:text-indigo-600 transition-colors">
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: MAIN RENTIFY HOME SCREEN (Matching exact uploaded screenshot)     */}
        {/* ========================================================================= */}
        {currentStep === 'home' && (
          <div className="flex-1 flex flex-col bg-slate-50 animate-fade-in relative">
            {/* 1. Midnight Dark App Bar Header */}
            <header className="bg-[#070a29] text-white px-4 pt-4 pb-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
              {/* Left: Hamburger Menu */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                type="button"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-5 h-5 text-white" strokeWidth={2.2} />
              </button>

              {/* Center: Brand Logo & Tagline */}
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

              {/* Right: Notifications & Profile */}
              <div className="flex items-center gap-2">
                {/* Notification Bell with Red Badge Dot */}
                <button
                  onClick={() => setNotificationsOpen(true)}
                  type="button"
                  className="relative w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell className="w-4 h-4 text-white" strokeWidth={2.2} />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#070a29]" />
                </button>

                {/* Profile Avatar Button */}
                <button
                  onClick={handleUserClick}
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

            {/* Scrollable Main Body Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none pb-20">
              {/* 2. Hero Banner Section with Luxury Panoramic Room */}
              <div className="relative w-full h-[280px] sm:h-[300px] overflow-hidden bg-[#070a29]">
                <img
                  src="/images/hero-panoramic.jpg"
                  alt="Comfortable Stays"
                  className="absolute inset-0 w-full h-full object-cover object-center select-none"
                />
                {/* Dark Vignette Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#070a29]/95 via-[#070a29]/45 to-black/35 pointer-events-none" />

                {/* Hero Text Content */}
                <div className="relative z-10 h-full flex flex-col justify-start px-5 pt-4 pb-14 space-y-2">
                  <div className="self-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white text-[11px] font-semibold shadow-xs">
                      Book Your Perfect Stay
                    </span>
                  </div>

                  <div className="pt-1">
                    <h1 className="text-[25px] sm:text-[27px] font-extrabold text-white leading-tight tracking-tight">
                      Comfortable Stays,
                      <br />
                      <span className="bg-gradient-to-r from-[#60a5fa] via-[#a5b4fc] to-[#e0e7ff] bg-clip-text text-transparent">
                        Memorable Journeys
                      </span>
                    </h1>
                    <p className="text-xs sm:text-[13px] text-white/90 font-medium mt-1 leading-snug max-w-[290px]">
                      Top hotels, great prices, trusted by thousands in India.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Floating Hotel Search Card */}
              <div className="relative z-20 mx-4 -mt-12 bg-white rounded-3xl p-3.5 sm:p-4 shadow-[0_14px_36px_rgba(7,10,41,0.14)] border border-slate-100">
                {/* Destination Search Box */}
                <div className="bg-slate-50/90 hover:bg-slate-50 border border-slate-200/70 rounded-2xl p-2.5 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MapPin className="w-5 h-5 text-indigo-600 shrink-0" strokeWidth={2.4} />
                    <div className="min-w-0 flex-1 text-left">
                      <span className="text-[11px] font-bold text-slate-900 block leading-tight">
                        Where are you going?
                      </span>
                      <input
                        type="text"
                        value={searchDestination}
                        onChange={(e) => setSearchDestination(e.target.value)}
                        placeholder="Search city, hotel, or area..."
                        className="w-full text-xs text-slate-700 placeholder:text-slate-400 bg-transparent outline-none mt-0.5 font-medium"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSearchHotels}
                    type="button"
                    className="p-1.5 text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <Search className="w-4 h-4" strokeWidth={2.4} />
                  </button>
                </div>

                {/* 3-Parameter Box Grid: Check In, Check Out, Guests */}
                <div className="grid grid-cols-3 gap-2 mt-2.5">
                  {/* Check In */}
                  <div className="bg-slate-50/90 border border-slate-200/60 rounded-xl p-2 flex flex-col justify-center text-left hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-1 text-indigo-600 mb-0.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span className="text-[9.5px] font-semibold text-slate-400">Check In</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {checkInDate}
                    </span>
                  </div>

                  {/* Check Out */}
                  <div className="bg-slate-50/90 border border-slate-200/60 rounded-xl p-2 flex flex-col justify-center text-left hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-1 text-indigo-600 mb-0.5">
                      <Calendar className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span className="text-[9.5px] font-semibold text-slate-400">Check Out</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {checkOutDate}
                    </span>
                  </div>

                  {/* Guests */}
                  <div className="bg-slate-50/90 border border-slate-200/60 rounded-xl p-2 flex flex-col justify-center text-left hover:border-indigo-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-1 text-indigo-600 mb-0.5">
                      <User className="w-3.5 h-3.5" strokeWidth={2.2} />
                      <span className="text-[9.5px] font-semibold text-slate-400">Guests</span>
                    </div>
                    <span className="text-[11px] font-bold text-slate-800 truncate">
                      {guestsCount}
                    </span>
                  </div>
                </div>

                {/* Full-width Search Hotels CTA Button */}
                <button
                  onClick={handleSearchHotels}
                  type="button"
                  className="w-full mt-3 py-3.5 rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#4338ca] to-[#3730a3] hover:opacity-95 active:scale-[0.99] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-white" strokeWidth={2.5} />
                  <span>Search Hotels</span>
                </button>
              </div>

              {/* 4. Popular Cities Section */}
              <div className="px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Popular Cities
                  </h2>
                  <Link
                    href="/hotels"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-0.5 transition-colors"
                  >
                    <span>See All</span>
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={2.4} />
                  </Link>
                </div>

                {/* Horizontal Scrolling Carousel of Cities */}
                <div className="flex items-center gap-3 overflow-x-auto scrollbar-none pb-1.5 -mx-4 px-4">
                  {POPULAR_CITIES.map((city) => {
                    const isSelected = selectedCity === city.id;

                    if (city.isNearby) {
                      return (
                        <div
                          key={city.id}
                          onClick={() => handleCityClick(city.id)}
                          className="w-[74px] shrink-0 flex flex-col items-center cursor-pointer group"
                        >
                          <div
                            className={`w-[74px] h-[74px] rounded-2xl bg-indigo-50/90 border flex flex-col items-center justify-center text-indigo-600 transition-all ${
                              isSelected
                                ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                                : 'border-indigo-200/70 shadow-2xs group-hover:bg-indigo-100/70'
                            }`}
                          >
                            <div className="relative">
                              <MapPin className="w-7 h-7 text-indigo-600" strokeWidth={2.2} />
                              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white" />
                            </div>
                          </div>
                          <span className="mt-1.5 flex items-center gap-0.5 text-xs font-bold text-indigo-600">
                            <MapPin className="w-3 h-3 text-indigo-600" />
                            Nearby
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={city.id}
                        onClick={() => handleCityClick(city.id)}
                        className="w-[74px] shrink-0 flex flex-col items-center cursor-pointer group"
                      >
                        <div
                          className={`w-[74px] h-[74px] rounded-2xl overflow-hidden border transition-all ${
                            isSelected
                              ? 'border-indigo-600 ring-2 ring-indigo-500/30 shadow-md'
                              : 'border-slate-200 shadow-2xs group-hover:border-slate-300'
                          }`}
                        >
                          <img
                            src={city.image}
                            alt={city.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <span
                          className={`mt-1.5 text-xs font-bold flex items-center gap-0.5 ${
                            isSelected ? 'text-indigo-600' : 'text-slate-800'
                          }`}
                        >
                          {city.hasPin && <MapPin className="w-3 h-3 text-indigo-600" />}
                          {city.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. Quick Picks for You Section */}
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                    Quick Picks for You
                  </h2>
                  {selectedCity && (
                    <button
                      onClick={() => setSelectedCity(null)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                    >
                      Clear city
                    </button>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-3.5">
                  <button
                    type="button"
                    onClick={() => setActiveQuickPick('recommended')}
                    className={`py-2 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeQuickPick === 'recommended'
                        ? 'bg-[#4338ca] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Star
                      className={`w-3.5 h-3.5 ${
                        activeQuickPick === 'recommended'
                          ? 'fill-white text-white'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>Recommended</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveQuickPick('recent')}
                    className={`py-2 px-4 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      activeQuickPick === 'recent'
                        ? 'bg-[#4338ca] text-white shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Recently Viewed</span>
                  </button>
                </div>
              </div>

              {/* 6. Hotel Listings (Cards matching screenshot) */}
              <div className="px-4 space-y-3 pb-8">
                {displayedHotels.length === 0 ? (
                  <div className="py-10 text-center bg-white rounded-2xl border border-slate-100 p-6">
                    <p className="text-sm font-semibold text-slate-600">
                      No hotels found in {selectedCity || searchDestination}.
                    </p>
                    <button
                      onClick={() => {
                        setSelectedCity(null);
                        setSearchDestination('');
                      }}
                      className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Reset filters & show all stays
                    </button>
                  </div>
                ) : (
                  displayedHotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      onClick={() => handleBookHotel(hotel.id)}
                      className="bg-white rounded-2xl p-2.5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)] flex gap-3 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
                    >
                      {/* Left: Image Container with Badge & Counter */}
                      <div className="relative w-[122px] sm:w-[136px] h-[118px] shrink-0 rounded-xl overflow-hidden bg-slate-900">
                        <img
                          src={hotel.image}
                          alt={hotel.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Top-Left Pill Badge */}
                        <div
                          className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9.5px] font-bold text-white shadow-xs flex items-center gap-1 ${hotel.badge.bg}`}
                        >
                          <span>{hotel.badge.emoji}</span>
                          <span>{hotel.badge.text}</span>
                        </div>

                        {/* Bottom-Left Photo Counter Badge */}
                        <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-semibold text-white tracking-wider">
                          1/5
                        </div>
                      </div>

                      {/* Right: Hotel Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                        {/* Title & Heart Wishlist */}
                        <div className="flex items-start justify-between gap-1">
                          <h3 className="font-bold text-[14px] sm:text-[15px] text-slate-900 truncate leading-snug">
                            {hotel.title}
                          </h3>
                          <button
                            type="button"
                            onClick={(e) => toggleWishlist(hotel.id, e)}
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-1 text-slate-400 hover:text-rose-500 transition-colors"
                            aria-label="Save to Wishlist"
                          >
                            <Heart
                              className={`w-4 h-4 transition-transform active:scale-125 ${
                                wishlist.has(hotel.id)
                                  ? 'fill-rose-500 text-rose-500'
                                  : 'text-slate-400'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Rating & Reviews */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                          <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b] shrink-0" />
                          <span className="font-bold text-slate-900 text-xs">{hotel.rating}</span>
                          <span className="text-slate-400 text-[11px]">
                            ({hotel.reviewsCount})
                          </span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="truncate">{hotel.location}</span>
                        </div>

                        {/* Amenities Icons */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 my-1 truncate">
                          {hotel.amenities.map((amenity, idx) => {
                            const Icon = amenity.icon;
                            return (
                              <div key={idx} className="flex items-center gap-1 shrink-0">
                                <Icon className="w-3 h-3 text-slate-400" />
                                <span>{amenity.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Price & Book Now CTA Button */}
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100/70">
                          <div className="flex items-baseline gap-1.5 min-w-0">
                            <span className="text-base sm:text-lg font-black text-slate-900 leading-none">
                              ₹{hotel.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-400 line-through leading-none">
                              ₹{hotel.originalPrice.toLocaleString()}
                            </span>
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 leading-none">
                              {hotel.discountBadge}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookHotel(hotel.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] active:scale-95 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all ml-auto shrink-0 cursor-pointer"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3 h-3 text-white" strokeWidth={2.4} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 7. Fixed Bottom Navigation Bar (5 Tab Icons) */}
            <nav className="sticky bottom-0 z-30 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 px-3 py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
              <div className="grid grid-cols-5 items-center text-center">
                {/* 1. Home (Active) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('home')}
                  className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    activeTab === 'home' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Home className="w-5 h-5 mx-auto" strokeWidth={activeTab === 'home' ? 2.5 : 2} />
                  <span className="text-[10px] mt-0.5 block leading-tight">Home</span>
                </button>

                {/* 2. Bookings */}
                <button
                  type="button"
                  onClick={() => router.push('/account?tab=bookings')}
                  className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    activeTab === 'bookings' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mx-auto" strokeWidth={2} />
                  <span className="text-[10px] mt-0.5 block leading-tight">Bookings</span>
                </button>

                {/* 3. Search */}
                <button
                  type="button"
                  onClick={() => router.push('/hotels')}
                  className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    activeTab === 'search' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Search className="w-5 h-5 mx-auto" strokeWidth={2} />
                  <span className="text-[10px] mt-0.5 block leading-tight">Search</span>
                </button>

                {/* 4. Wishlist */}
                <button
                  type="button"
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    activeTab === 'wishlist' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <Heart className="w-5 h-5 mx-auto" strokeWidth={2} />
                  <span className="text-[10px] mt-0.5 block leading-tight">Wishlist</span>
                </button>

                {/* 5. Profile */}
                <button
                  type="button"
                  onClick={handleUserClick}
                  className={`flex flex-col items-center justify-center transition-colors cursor-pointer ${
                    activeTab === 'profile' ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  <User className="w-5 h-5 mx-auto" strokeWidth={2} />
                  <span className="text-[10px] mt-0.5 block leading-tight">Profile</span>
                </button>
              </div>
            </nav>

            {/* 8. Slide-over Mobile Navigation Drawer */}
            {mobileMenuOpen && (
              <div className="fixed inset-0 z-50 flex">
                <div
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
                  onClick={() => setMobileMenuOpen(false)}
                />

                <div className="relative w-4/5 max-w-xs bg-slate-900 text-white p-5 flex flex-col justify-between shadow-2xl z-10 animate-slide-right">
                  <div>
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between pb-5 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white">
                          <BedDouble className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-black text-white">
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

                    {/* Navigation Links */}
                    <div className="space-y-1.5 py-4">
                      <Link
                        href="/hotels"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
                      >
                        <Compass className="w-4 h-4 text-indigo-400" />
                        Explore All Hotels
                      </Link>
                      <Link
                        href="/hotels?category=student"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
                      >
                        <GraduationCap className="w-4 h-4 text-blue-400" />
                        Student Stays
                      </Link>
                      <Link
                        href="/hotels?category=family"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
                      >
                        <Users className="w-4 h-4 text-emerald-400" />
                        Family Stays
                      </Link>
                      <Link
                        href="/hotels?category=hourly"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
                      >
                        <Clock className="w-4 h-4 text-amber-400" />
                        Hourly Stays
                      </Link>
                      <Link
                        href="/hotels?category=regular"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 text-sm font-semibold transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-rose-400" />
                        Regular Stays
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-white/10 space-y-1.5">
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          goToStep('choose');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-indigo-300 transition-colors cursor-pointer"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                        Change Stay Category
                      </button>

                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          goToStep('onboarding');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        Replay Intro / Onboarding
                      </button>
                    </div>
                  </div>

                  {/* Drawer Footer */}
                  <div className="pt-4 border-t border-white/10">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleUserClick();
                      }}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      {user ? user.fullName || 'My Account' : 'Sign In / Register'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 9. Notifications Modal */}
            {notificationsOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="relative bg-white rounded-3xl p-5 w-full max-w-sm shadow-2xl z-10 animate-scale-up text-left">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                        <Bell className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                    </div>
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="w-7 h-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-3 space-y-2.5">
                    <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100/70">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700">
                        <span>🔥 40% OFF Special Deal</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                        Use promo code <strong>RENTIFY40</strong> on your first booking in Jaunpur &amp; Varanasi!
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                        <span>🛡️ Best Price Guarantee</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        Verified student PGs and hourly rooms now available with instant check-in.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl mt-1"
                  >
                    Got it
                  </button>
                </div>
              </div>
            )}
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
        <div className="min-h-screen bg-[#070a29] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <HomeFlowContent />
    </Suspense>
  );
}
