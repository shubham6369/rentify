'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  X,
  Smartphone,
  Mail,
  Shield,
  User,
  Building,
  AlertCircle,
  ArrowRight,
  Home,
  Box,
  ChevronDown,
  ChevronRight,
  Info,
  Lock
} from 'lucide-react';
import { UserRole } from '@/types';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    user,
    sendOtp,
    verifyOtp,
    loginWithEmail,
    registerWithEmail,
    switchRole
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'otp' | 'email' | 'roles'>(authModalTab || 'otp');

  // OTP State matching Image 2
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(30);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Email State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Sync tab if opened with specific request
  useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab]);

  // Active countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAuthModalOpen && activeTab === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isAuthModalOpen, activeTab, countdown]);

  if (!isAuthModalOpen) return null;

  // Handle individual OTP digit change
  const handleDigitChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setOtpError(null);

    // Auto advance
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace / navigation
  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
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
    const newDigits = [...otpDigits];
    for (let i = 0; i < paste.length; i++) {
      newDigits[i] = paste[i];
    }
    setOtpDigits(newDigits);
    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Quick autofill demo credentials
  const fillDemoOtp = () => {
    if (!phoneNumber) {
      setPhoneNumber('9876543210');
    }
    setOtpDigits(['5', '5', '5', '6', '', '']);
    setOtpError(null);
  };

  // Verify and login with OTP
  const handleVerifyAndContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    const code = otpDigits.join('').trim() || '5556';
    if (!code || code.length < 4) {
      setOtpError('Please enter the verification code');
      return;
    }

    setOtpLoading(true);
    const res = await verifyOtp(`+91${cleanPhone}`, code, undefined, selectedRole);
    setOtpLoading(false);

    if (!res.success) {
      setOtpError(res.message);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setOtpError('Please enter your 10-digit mobile number first');
      return;
    }

    setOtpLoading(true);
    const res = await sendOtp(`+91${cleanPhone}`);
    setOtpLoading(false);

    if (res.success) {
      setCountdown(30);
      setOtpError(null);
    } else {
      setOtpError(res.message);
    }
  };

  // Email authentication submit
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailLoading(true);

    if (isRegisterMode) {
      const res = await registerWithEmail({
        email,
        fullName,
        role: selectedRole
      });
      setEmailLoading(false);
      if (!res.success) setEmailError(res.message);
    } else {
      const res = await loginWithEmail(email);
      setEmailLoading(false);
      if (!res.success) setEmailError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-[430px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden max-h-[94vh] overflow-y-auto">
        
        {/* ========================================================================= */}
        {/* 1. TOP HEADER: NIGHT CITYSCAPE & 3D HOTEL BUILDING ARTWORK (MATCHING IMAGE 2) */}
        {/* ========================================================================= */}
        <div className="relative bg-gradient-to-r from-[#170e3c] via-[#281263] to-[#120731] px-5 sm:px-6 pt-6 pb-9 text-white overflow-hidden select-none">
          {/* Subtle star & ambient lights */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%)] pointer-events-none" />

          {/* Close button X */}
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors z-20 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Right Vector Illustration: 3D Night Hotel & Floating Location Pin */}
          <div className="absolute right-0 top-0 bottom-0 w-44 pointer-events-none select-none overflow-hidden opacity-95">
            <svg className="w-full h-full" viewBox="0 0 180 140" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="skyGlow" x1="90" y1="0" x2="180" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#4338ca" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#1e1045" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="pinGrad" x1="0" y1="0" x2="28" y2="36" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Ambient sky aura */}
              <ellipse cx="140" cy="65" rx="60" ry="50" fill="url(#skyGlow)" />
              
              {/* Distant atmospheric night curve */}
              <path d="M 60 140 C 90 90 140 100 180 115 L 180 140 Z" fill="#1b0e45" opacity="0.6" />

              {/* 3D Modern Hotel Building */}
              <g transform="translate(10, 5)">
                {/* Left Wall (Deep Indigo) */}
                <path d="M 85 30 L 85 130 L 115 140 L 115 42 Z" fill="#20114f" />
                {/* Right Wall (Rich Violet) */}
                <path d="M 115 42 L 115 140 L 145 130 L 145 30 Z" fill="#2e156b" />
                {/* Roof */}
                <path d="M 85 30 L 115 20 L 145 30 L 115 42 Z" fill="#43228a" />
                
                {/* Balcony horizontal ledges */}
                <path d="M 82 58 L 115 68 L 115 65 L 82 55 Z" fill="#582ba8" opacity="0.8" />
                <path d="M 82 85 L 115 95 L 115 92 L 82 82 Z" fill="#582ba8" opacity="0.8" />
                <path d="M 82 112 L 115 122 L 115 119 L 82 109 Z" fill="#582ba8" opacity="0.8" />

                {/* Lit Warm Yellow Windows (Left facade) */}
                <rect x="90" y="44" width="8" height="9" rx="1.5" fill="#fde047" filter="url(#softGlow)" />
                <rect x="102" y="48" width="8" height="9" rx="1.5" fill="#fef08a" />
                <rect x="90" y="70" width="8" height="9" rx="1.5" fill="#fde047" />
                <rect x="102" y="74" width="8" height="9" rx="1.5" fill="#facc15" filter="url(#softGlow)" />
                <rect x="90" y="97" width="8" height="9" rx="1.5" fill="#facc15" />
                <rect x="102" y="101" width="8" height="9" rx="1.5" fill="#fef08a" />

                {/* Cool Lit Windows (Right facade) */}
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
                  fill="url(#pinGrad)"
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

        {/* ========================================================================= */}
        {/* 2. BODY CONTENT: CURVED OVERLAY CARD                                      */}
        {/* ========================================================================= */}
        <div className="-mt-4 rounded-t-[28px] bg-white pt-5 px-5 sm:px-6 pb-6 relative z-10 shadow-xs">
          
          {/* Tab Switcher Segment */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100/70 rounded-2xl border border-slate-200/50 mb-4">
            <button
              type="button"
              onClick={() => setActiveTab('otp')}
              className={`py-2 px-1.5 sm:px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'otp'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Smartphone className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">Mobile OTP</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('email')}
              className={`py-2 px-1.5 sm:px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'email'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Mail className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">Email Login</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`py-2 px-1.5 sm:px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-indigo-50 text-indigo-700 shadow-2xs border border-indigo-200/60'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <Shield className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="truncate">Switch Demo Role</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: MOBILE NUMBER & 6-DIGIT OTP (EXACT MATCH TO IMAGE 2)              */}
          {/* ========================================================================= */}
          {activeTab === 'otp' && (
            <div className="space-y-3.5 animate-fade-in">
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
                    value={phoneNumber}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneNumber(raw);
                    }}
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
                    disabled={countdown > 0}
                    className={`text-xs font-bold transition-colors ${
                      countdown > 0
                        ? 'text-indigo-600 cursor-default'
                        : 'text-indigo-600 hover:text-indigo-800 underline cursor-pointer'
                    }`}
                  >
                    Resend OTP {countdown > 0 && `(00:${countdown.toString().padStart(2, '0')})`}
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

              {/* Error Callout */}
              {otpError && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Primary Submit Button: Verify & Continue */}
              <button
                type="button"
                onClick={() => handleVerifyAndContinue()}
                disabled={otpLoading}
                className="w-full py-3 bg-gradient-to-r from-[#1d4ed8] via-[#4338ca] to-[#7c3aed] hover:from-[#1e40af] hover:to-[#6d28d9] text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-lg shadow-indigo-300/40 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{otpLoading ? 'Verifying...' : 'Verify & Continue'}</span>
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
                onClick={() => setActiveTab('email')}
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

              {/* Security & Legal Footer */}
              <div className="pt-1 text-center">
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
          )}

          {/* ========================================================================= */}
          {/* TAB 2: EMAIL LOGIN & REGISTER                                             */}
          {/* ========================================================================= */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3 animate-fade-in">
              {isRegisterMode && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  required
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Account Type
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="customer">Student / Family / Traveler (Customer)</option>
                    <option value="property_owner">Property Owner / Host</option>
                  </select>
                </div>
              )}

              {emailError && (
                <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-3 bg-gradient-to-r from-[#1d4ed8] via-[#4338ca] to-[#7c3aed] text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-200 disabled:opacity-50 cursor-pointer"
              >
                {emailLoading
                  ? 'Processing...'
                  : isRegisterMode
                  ? 'Create Account'
                  : 'Sign In With Email'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-indigo-600 hover:underline font-semibold cursor-pointer"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: SWITCH DEMO ROLE                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'roles' && (
            <div className="space-y-2.5 animate-fade-in">
              <p className="text-xs text-slate-500 mb-2">
                Instantly switch roles to test customer bookings, host property management, or admin center:
              </p>

              <button
                type="button"
                onClick={() => switchRole('customer')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  user?.role === 'customer'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Student & Family Guest</span>
                    {user?.role === 'customer' && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Browse stays, book nearest hostels, manage student discounts.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchRole('property_owner')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  user?.role === 'property_owner'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">Property Owner / Host</span>
                    {user?.role === 'property_owner' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Add new hostels or family villas, update monthly rent, view tenant bookings.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => switchRole('admin')}
                className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  user?.role === 'admin'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">System Administrator</span>
                    {user?.role === 'admin' && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Approve/reject property listings, monitor revenue metrics, record counter desk payments.
                  </p>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
