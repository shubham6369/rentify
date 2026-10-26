'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StayCategory, UserRole } from '@/types';
import {
  ChevronLeft,
  Check,
  Smartphone,
  Mail,
  ShieldCheck,
  User,
  AlertCircle,
  GraduationCap,
  Users,
  Clock,
  Compass,
  ArrowRight,
  Phone,
  Home,
  Box,
  ChevronDown,
  ChevronRight,
  Info,
  Lock,
  Shield,
  Building
} from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, sendOtp, verifyOtp, updateProfile } = useAuth();

  const categoryParam = (searchParams.get('category') as StayCategory) || 'student';
  const redirectParam = searchParams.get('redirect');
  const initialStage = searchParams.get('stage') === 'profile' ? 'profile' : 'auth';

  // Overall Stage: 'auth' (Step 1/2: Mobile & OTP) or 'profile' (Step 3: Customer Profile & Details)
  const [stage, setStage] = useState<'auth' | 'profile'>(initialStage);

  // Active step inside auth stage: 1: 'phone' | 2: 'otp' | 3: 'profile'
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Authentication Fields
  const [phone, setPhone] = useState(user?.phone?.replace('+91', '') || '0708032826');
  const [otpCode, setOtpCode] = useState('5556');
  const [otpTimer, setOtpTimer] = useState(30);

  // Customer Profile & Booking Details Fields
  const [fullName, setFullName] = useState(user?.fullName || 'User ' + (phone.slice(-4) || '2826'));
  const [aadhaarNumber, setAadhaarNumber] = useState(
    user?.aadhaarNumber ? formatAadhaar(user.aadhaarNumber) : '5421 8901 2345'
  );

  // Category specific fields
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Christ University');
  const [studentId, setStudentId] = useState(user?.studentIdNumber || 'CU2026-ENG-492');
  const [course, setCourse] = useState('B. Tech Computer Science');
  const [guardianPhone, setGuardianPhone] = useState(user?.emergencyContact || '+91 98111 22334');

  const [familyMembersCount, setFamilyMembersCount] = useState(4);
  const [hourlyStayHours, setHourlyStayHours] = useState('3 Hours');
  const [stayPurpose, setStayPurpose] = useState('Transit & Day Refresh');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact || '+91 98111 22334');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function formatAadhaar(val: string) {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(' ');
  }

  // Sync user details if already logged in
  useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone.replace('+91', ''));
      if (user.fullName) setFullName(user.fullName);
      if (user.aadhaarNumber) setAadhaarNumber(formatAadhaar(user.aadhaarNumber));
      if (user.collegeName) setCollegeName(user.collegeName);
      if (user.studentIdNumber) setStudentId(user.studentIdNumber);
      if (user.emergencyContact) {
        setGuardianPhone(user.emergencyContact);
        setEmergencyPhone(user.emergencyContact);
      }
    }
  }, [user]);

  // Tab state in auth view
  const [authActiveTab, setAuthActiveTab] = useState<'otp' | 'email' | 'roles'>('otp');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (stage === 'auth' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, otpTimer]);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (errorMsg) setErrorMsg(null);
  };

  const handleAadhaarChange = (val: string) => {
    setAadhaarNumber(formatAadhaar(val));
    if (errorMsg) setErrorMsg(null);
  };

  // Quick autofill demo credentials
  const fillDemoOtp = () => {
    setPhone('9876543210');
    setOtpCode('5556');
    setErrorMsg(null);
  };

  // Handle individual OTP digit change
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = otpCode.padEnd(6, ' ').split('');
    newDigits[index] = digit;
    setOtpCode(newDigits.join('').trim());
    setErrorMsg(null);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace / navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const chars = otpCode.split('');
      if (!chars[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste full OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!paste) return;
    setOtpCode(paste);
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (otpTimer > 0) return;
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter your 10-digit mobile number first');
      return;
    }

    setLoading(true);
    const res = await sendOtp(`+91${cleanPhone}`);
    setLoading(false);

    if (res.success) {
      setOtpTimer(30);
      setErrorMsg(null);
    } else {
      setErrorMsg(res.message);
    }
  };

  // CONTINUE / VERIFY action in the Auth Stage
  const handleAuthContinue = async () => {
    setErrorMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    const cleanOtp = otpCode.replace(/\D/g, '') || '5556';
    if (cleanOtp.length < 4) {
      setErrorMsg('Please enter the verification code');
      return;
    }

    setLoading(true);
    const res = await verifyOtp(`+91${cleanPhone}`, cleanOtp, fullName);
    setLoading(false);

    if (res.success) {
      setCurrentStep(3);
      setStage('profile');
    } else {
      setErrorMsg(res.message || 'Invalid verification code');
    }
  };

  // Profile Save & Proceed to Booking Flow
  const handleSaveProfileAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name as on Government ID');
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMsg('Please enter a valid mandatory 12-digit Aadhaar Card Number');
      return;
    }

    setLoading(true);
    const updates: any = {
      fullName: fullName.trim(),
      phone: `+91${phone.replace(/\D/g, '')}`,
      aadhaarNumber: cleanAadhaar
    };

    if (categoryParam === 'student') {
      updates.collegeName = collegeName.trim();
      updates.studentIdNumber = studentId.trim();
      updates.emergencyContact = guardianPhone.trim();
    } else if (categoryParam === 'family') {
      updates.emergencyContact = emergencyPhone.trim();
    } else {
      updates.emergencyContact = emergencyPhone.trim();
    }

    const res = await updateProfile(updates);
    setLoading(false);

    if (res.success) {
      // Proceed to selected stay catalog
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push(`/hotels?category=${categoryParam}`);
      }
    } else {
      setErrorMsg(res.message || 'Failed to update profile');
    }
  };

  const categoryName = categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1);

  // Split OTP into 6 boxes display
  const otpDigits = [
    otpCode[0] || '5',
    otpCode[1] || '5',
    otpCode[2] || '5',
    otpCode[3] || '6',
    otpCode[4] || '',
    otpCode[5] || ''
  ];

  return (
    <div
      className="min-h-screen bg-[#0d111d] flex items-center justify-center sm:py-6 sm:px-4"
      suppressHydrationWarning
    >
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[890px] bg-[#f8faff] sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-y-auto flex flex-col justify-between transition-all relative">
        
        {/* ========================================================================= */}
        {/* VIEW 1: AUTHENTICATION & VERIFICATION (EXACT MATCH TO IMAGE 2)            */}
        {/* ========================================================================= */}
        {stage === 'auth' ? (
          <div className="flex-1 flex flex-col justify-between bg-white">
            {/* Top Header: Night Cityscape & 3D Hotel Building Artwork */}
            <div className="relative bg-gradient-to-r from-[#170e3c] via-[#281263] to-[#120731] px-5 sm:px-6 pt-6 pb-9 text-white overflow-hidden select-none">
              <div className="flex items-center justify-between mb-3 relative z-10">
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.history.length > 1) {
                      window.history.back();
                    } else {
                      router.push('/?step=choose');
                    }
                  }}
                  type="button"
                  className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#221054]/90 border border-white/20 text-white px-3.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                  {categoryParam} stay
                </span>
              </div>

              {/* Vector Illustration: 3D Night Hotel & Floating Location Pin */}
              <div className="absolute right-0 top-0 bottom-0 w-44 pointer-events-none select-none overflow-hidden opacity-95">
                <svg className="w-full h-full" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="authPageSky" x1="90" y1="0" x2="180" y2="140" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#4338ca" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#1e1045" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="authPagePin" x1="0" y1="0" x2="28" y2="36" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>

                  <ellipse cx="140" cy="65" rx="60" ry="50" fill="url(#authPageSky)" />
                  <path d="M 60 140 C 90 90 140 100 180 115 L 180 140 Z" fill="#1b0e45" opacity="0.6" />

                  {/* 3D Modern Hotel Building */}
                  <g transform="translate(10, 5)">
                    <path d="M 85 30 L 85 130 L 115 140 L 115 42 Z" fill="#20114f" />
                    <path d="M 115 42 L 115 140 L 145 130 L 145 30 Z" fill="#2e156b" />
                    <path d="M 85 30 L 115 20 L 145 30 L 115 42 Z" fill="#43228a" />
                    
                    <path d="M 82 58 L 115 68 L 115 65 L 82 55 Z" fill="#582ba8" opacity="0.8" />
                    <path d="M 82 85 L 115 95 L 115 92 L 82 82 Z" fill="#582ba8" opacity="0.8" />
                    <path d="M 82 112 L 115 122 L 115 119 L 82 109 Z" fill="#582ba8" opacity="0.8" />

                    <rect x="90" y="44" width="8" height="9" rx="1.5" fill="#fde047" />
                    <rect x="102" y="48" width="8" height="9" rx="1.5" fill="#fef08a" />
                    <rect x="90" y="70" width="8" height="9" rx="1.5" fill="#fde047" />
                    <rect x="102" y="74" width="8" height="9" rx="1.5" fill="#facc15" />
                    <rect x="90" y="97" width="8" height="9" rx="1.5" fill="#facc15" />
                    <rect x="102" y="101" width="8" height="9" rx="1.5" fill="#fef08a" />

                    <rect x="120" y="48" width="8" height="9" rx="1.5" fill="#93c5fd" opacity="0.9" />
                    <rect x="131" y="44" width="8" height="9" rx="1.5" fill="#bfdbfe" opacity="0.8" />
                    <rect x="120" y="74" width="8" height="9" rx="1.5" fill="#a5b4fc" opacity="0.8" />
                    <rect x="131" y="70" width="8" height="9" rx="1.5" fill="#c4b5fd" opacity="0.9" />
                    <rect x="120" y="101" width="8" height="9" rx="1.5" fill="#818cf8" opacity="0.7" />
                    <rect x="131" y="97" width="8" height="9" rx="1.5" fill="#93c5fd" opacity="0.8" />
                  </g>

                  {/* Floating 3D Glowing Blue Location Pin */}
                  <g transform="translate(132, 80)">
                    <ellipse cx="14" cy="38" rx="12" ry="4" fill="#09041a" opacity="0.6" />
                    <path
                      d="M 14 0 C 6.268 0 0 6.268 0 14 C 0 25.5 14 37 14 37 C 14 37 28 25.5 28 14 C 28 6.268 21.732 0 14 0 Z"
                      fill="url(#authPagePin)"
                      filter="drop-shadow(0 6px 12px rgba(37,99,235,0.6))"
                    />
                    <circle cx="14" cy="13.5" r="5" fill="#ffffff" />
                  </g>
                </svg>
              </div>

              {/* Title row with icon & PRO badge */}
              <div className="flex items-center gap-3 relative z-10 pr-12">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-950/50 border border-white/20 shrink-0">
                  <Home className="w-6 h-6 text-white stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">Find Your Stay</h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#8b5cf6] text-white shadow-xs">
                      PRO
                    </span>
                  </div>
                  <p className="text-xs text-indigo-200/90 font-medium mt-0.5">
                    Sign in to book and manage accommodations
                  </p>
                </div>
              </div>
            </div>

            {/* Body Overlay Card */}
            <div className="-mt-4 rounded-t-[28px] bg-white pt-5 px-5 sm:px-6 pb-6 relative z-10 shadow-xs flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Tab Switcher Segment */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/50 mb-3">
                  <button
                    type="button"
                    onClick={() => setAuthActiveTab('otp')}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authActiveTab === 'otp'
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="truncate">Mobile OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthActiveTab('email')}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authActiveTab === 'email'
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">Email Login</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthActiveTab('roles')}
                    className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      authActiveTab === 'roles'
                        ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                        : 'text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="truncate">Switch Role</span>
                  </button>
                </div>

                {/* Demo OTP for Testing banner */}
                <div className="p-3 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-indigo-50/80 border border-indigo-100 rounded-2xl flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100/80 border border-indigo-200/60 flex items-center justify-center text-indigo-600 shrink-0">
                      <Box className="w-4 h-4 text-indigo-600 stroke-[2.2]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Demo OTP for Testing</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Use the default OTP to log in quickly.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fillDemoOtp}
                    className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                    title="Click to auto-fill demo OTP 5556"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  </button>
                </div>

                {/* Mobile Number Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 tracking-wider uppercase mb-1.5">
                    MOBILE NUMBER
                  </label>
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 transition-all p-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 select-none shrink-0 cursor-default">
                      <span className="text-base leading-none">🇮🇳</span>
                      <span className="text-xs font-bold text-slate-800">+91</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="h-5 w-px bg-slate-200 mx-1.5" />
                    <input
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="Enter your 10-digit mobile number"
                      className="flex-1 px-2 py-1.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent"
                      maxLength={10}
                    />
                  </div>
                </div>

                {/* Enter Verification OTP Section */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700 tracking-wider uppercase">
                      ENTER VERIFICATION OTP
                    </label>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0}
                      className={`text-xs font-bold transition-colors ${
                        otpTimer > 0
                          ? 'text-indigo-600 cursor-default'
                          : 'text-indigo-600 hover:text-indigo-800 underline cursor-pointer'
                      }`}
                    >
                      Resend OTP {otpTimer > 0 && `(00:${otpTimer.toString().padStart(2, '0')})`}
                    </button>
                  </div>

                  {/* 6 Digit Input Boxes */}
                  <div className="grid grid-cols-6 gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        onPaste={idx === 0 ? handlePaste : undefined}
                        className={`w-full h-12 text-center font-bold text-lg rounded-2xl border transition-all ${
                          digit
                            ? 'border-indigo-600 bg-white text-indigo-900 shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Informational Message Banner */}
                <div className="p-2.5 bg-indigo-50/70 border border-indigo-100/80 rounded-xl flex items-center gap-2 text-xs text-indigo-950">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span className="font-medium text-slate-600 text-[11px] leading-tight">
                    Please enter the verification code sent to your mobile number.
                  </span>
                </div>

                {/* Error Message Alert */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Primary Submit Button: Verify & Continue */}
                <button
                  type="button"
                  onClick={handleAuthContinue}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#1d4ed8] via-[#4338ca] to-[#7c3aed] hover:from-[#1e40af] hover:to-[#6d28d9] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-300/40 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* OR Divider */}
                <div className="flex items-center my-2">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="px-3 text-[11px] font-bold text-slate-400 tracking-wider">OR</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>

                {/* Sign In with Email Card */}
                <button
                  type="button"
                  onClick={() => setAuthActiveTab('email')}
                  className="w-full p-2.5 sm:p-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-left transition-all hover:border-indigo-200 hover:shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900">Sign In with Email</h5>
                      <p className="text-[11px] text-slate-500 mt-0.5">Use your registered email to log in.</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Security & Legal Footer */}
              <div className="pt-2 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Your information is secure and encrypted</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  By continuing, you agree to our{' '}
                  <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Terms of Service</span> and{' '}
                  <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">Privacy Policy</span>.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: CUSTOMER PROFILE & DETAILS PAGE (EXACT MATCH TO IMAGE 2)          */
          /* ========================================================================= */
          <form
            onSubmit={handleSaveProfileAndProceed}
            className="flex-1 flex flex-col justify-between bg-[#f8faff]"
          >
            {/* Top Midnight Indigo/Purple Curved Header */}
            <div className="bg-gradient-to-br from-[#0c0836] via-[#1c0f64] to-[#3a1396] text-white pt-8 pb-7 px-6 rounded-b-[2.5rem] shadow-xl relative select-none">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setStage('auth')}
                  className="flex items-center gap-1.5 text-xs text-indigo-200 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>

                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#221054]/90 border border-white/20 text-white px-3.5 py-1 rounded-full backdrop-blur-md shadow-xs">
                  {categoryParam} stay
                </span>
              </div>

              {/* User Avatar Card & Title matching Image 2 */}
              <div className="flex items-center gap-3.5 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#3b49df] flex items-center justify-center shadow-lg shadow-indigo-950/20 shrink-0">
                  <User className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black tracking-tight text-white leading-tight">
                    Customer Profile & Booking Details
                  </h1>
                  <p className="text-xs text-indigo-200/90 font-normal mt-0.5">
                    Complete your profile to finalize reservations for <strong className="text-white capitalize">{categoryName} Stay</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 px-5 py-4 overflow-y-auto space-y-3.5">
              
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name (As on Government ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#3b49df]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="User 2826"
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-white shadow-2xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                    required
                  />
                </div>
              </div>

              {/* CONTACT NUMBER & EMAIL ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Contact Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Contact Mobile Number
                  </label>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800 font-mono text-[11px]">
                      <Smartphone className="w-3.5 h-3.5 text-[#3b49df] shrink-0" />
                      +91 {phone}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Verified Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Verified Email
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#3b49df] shrink-0" />
                    <span className="font-medium text-slate-700 truncate text-[11px]">
                      {user?.email || `${phone}@phone.findyourstay.in`}
                    </span>
                  </div>
                </div>
              </div>

              {/* AADHAAR CARD NUMBER (MANDATORY WITH ORANGE PILL) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Aadhaar Card Number</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                    Mandatory
                  </span>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#3b49df]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="5421 8901 2345"
                    className="w-full pl-9 pr-24 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 rounded-xl border border-slate-200 bg-white shadow-2xs focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 transition-all"
                    required
                  />
                  {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                    <span className="absolute right-2.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                      ✓ Valid
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  12-digit Indian Government UID required for guest identity & safety compliance.
                </p>
              </div>

              {/* CATEGORY SPECIFIC CREDENTIALS CARD */}
              {categoryParam === 'student' && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-[#3b49df]" />
                    <span>Student Academic Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        University / College Name
                      </label>
                      <input
                        type="text"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        placeholder="Christ University"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Student ID / Roll Number
                      </label>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="CU2026-ENG-492"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Course / Department
                      </label>
                      <input
                        type="text"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="B. Tech Computer Science"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Parent / Guardian Contact
                      </label>
                      <input
                        type="tel"
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryParam === 'family' && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <Users className="w-4 h-4 text-[#3b49df]" />
                    <span>Family Stay Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Total Family Members
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={15}
                        value={familyMembersCount}
                        onChange={(e) => setFamilyMembersCount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Family Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryParam === 'hourly' && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <Clock className="w-4 h-4 text-[#3b49df]" />
                    <span>Hourly Booking Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Hours Needed
                      </label>
                      <select
                        value={hourlyStayHours}
                        onChange={(e) => setHourlyStayHours(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      >
                        <option value="3 Hours">3 Hours (Day Rest)</option>
                        <option value="6 Hours">6 Hours (Work / Transit)</option>
                        <option value="12 Hours">12 Hours (Half-Day)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Purpose of Day Stay
                      </label>
                      <input
                        type="text"
                        value={stayPurpose}
                        onChange={(e) => setStayPurpose(e.target.value)}
                        placeholder="Transit & Refresh"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(categoryParam === 'regular' || categoryParam === 'trip') && (
                <div className="p-4 bg-white border border-indigo-100 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                    <Compass className="w-4 h-4 text-[#3b49df]" />
                    <span>Trip & General Stay Details</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Purpose of Visit
                      </label>
                      <input
                        type="text"
                        value={stayPurpose}
                        onChange={(e) => setStayPurpose(e.target.value)}
                        placeholder="Vacation / Business"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+91 98111 22334"
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-200 bg-[#f8faff] focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            {/* Bottom Sticky Action Area with Signature Gradient Button */}
            <div className="px-5 py-4 bg-white border-t border-slate-100 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-xl shadow-indigo-950/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Saving Profile...' : `CONFIRM PROFILE & PROCEED TO ${categoryParam.toUpperCase()} STAY`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0c0836] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
