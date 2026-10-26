'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import {
  ChevronLeft,
  Check,
  Smartphone,
  ShieldCheck,
  User,
  AlertCircle,
  GraduationCap
} from 'lucide-react';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, sendOtp, verifyOtp, updateProfile } = useAuth();

  const categoryParam = (searchParams.get('category') as StayCategory) || 'student';
  const redirectParam = searchParams.get('redirect');

  // Active step in the 3-step auth flow: 1: 'phone' | 2: 'otp' | 3: 'profile'
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [phone, setPhone] = useState(user?.phone?.replace('+91', '') || '');
  const [otpCode, setOtpCode] = useState('5556');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [collegeName, setCollegeName] = useState(user?.collegeName || 'Christ University');
  const [studentId, setStudentId] = useState(user?.studentIdNumber || 'CU2026-ENG-492');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [otpTimer, setOtpTimer] = useState(60);

  // Sync user details if already logged in
  useEffect(() => {
    if (user) {
      if (user.phone) setPhone(user.phone.replace('+91', ''));
      if (user.fullName) setFullName(user.fullName);
      if (user.collegeName) setCollegeName(user.collegeName);
      if (user.studentIdNumber) setStudentId(user.studentIdNumber);
    }
  }, [user]);

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (currentStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, otpTimer]);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (errorMsg) setErrorMsg(null);
  };

  // Main CONTINUE action handling all 3 steps
  const handleContinue = async () => {
    setErrorMsg(null);

    // STEP 1: MOBILE NUMBER
    if (currentStep === 1) {
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number');
        return;
      }

      setLoading(true);
      try {
        await sendOtp(cleanPhone);
        setOtpTimer(60);
        setCurrentStep(2);
      } catch (err: any) {
        // Fallback to next step for master OTP bypass
        setCurrentStep(2);
      } finally {
        setLoading(false);
      }
      return;
    }

    // STEP 2: OTP VERIFICATION
    if (currentStep === 2) {
      const cleanOtp = otpCode.replace(/\D/g, '');
      if (cleanOtp.length < 4) {
        setErrorMsg('Please enter the 4-digit verification code');
        return;
      }

      setLoading(true);
      const cleanPhone = phone.replace(/\D/g, '');
      const res = await verifyOtp(cleanPhone, cleanOtp);
      setLoading(false);

      if (res.success) {
        setCurrentStep(3);
      } else {
        setErrorMsg(res.message || 'Invalid verification code');
      }
      return;
    }

    // STEP 3: CREATE PROFILE
    if (currentStep === 3) {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name');
        return;
      }

      setLoading(true);
      const updates: any = {
        fullName: fullName.trim(),
        phone: `+91${phone.replace(/\D/g, '')}`
      };

      if (categoryParam === 'student') {
        updates.collegeName = collegeName.trim();
        updates.studentIdNumber = studentId.trim();
      }

      await updateProfile(updates);
      setLoading(false);

      // Successfully authenticated & verified -> Redirect to listings
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push(`/hotels?category=${categoryParam}`);
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-900/95 flex items-center justify-center sm:py-6 sm:px-4"
      suppressHydrationWarning
    >
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[412px] min-h-screen sm:min-h-[870px] bg-white sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        {/* Top Header Banner matching Image 2 */}
        <div className="bg-[#0a7381] text-white pt-9 pb-8 px-6 rounded-b-[2rem] shadow-sm relative select-none">
          {/* Back button */}
          <button
            onClick={() => router.push('/')}
            type="button"
            className="flex items-center gap-1.5 text-xs text-[#a5e0e8] hover:text-white font-semibold mb-4 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Choose Stay</span>
          </button>

          {/* Heading & Subheading */}
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome
          </h1>
          <p className="text-sm text-[#c2eff5] font-normal mt-1.5">
            Sign in to continue
          </p>

          {/* Category Pill Tag */}
          <div className="absolute top-9 right-6">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
              {categoryParam} stay
            </span>
          </div>
        </div>

        {/* Middle Steps Section matching Image 2 */}
        <div className="flex-1 px-5 sm:px-6 py-6 flex flex-col justify-between bg-white">
          <div className="space-y-4">
            {/* CARD 1: MOBILE NUMBER */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                currentStep === 1
                  ? 'bg-[#e6f3f5] border-[#a5dbe2] shadow-sm ring-1 ring-[#0a7381]/20'
                  : currentStep > 1
                  ? 'bg-[#e6f3f5]/70 border-[#c6e4e8]'
                  : 'bg-[#e6f3f5] border-[#c6e4e8]'
              }`}
            >
              {/* Header row of Card 1 */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {/* Solid Teal Circle Indicator */}
                  <div className="w-6 h-6 rounded-full bg-[#0a7381] text-white flex items-center justify-center shrink-0">
                    {currentStep > 1 ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    Mobile number
                  </span>
                </div>

                {currentStep > 1 && phone && (
                  <span className="text-xs font-semibold text-[#0a7381] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#0a7381]/20">
                    +91 {phone}
                  </span>
                )}
              </button>

              {/* Expanded Input for Step 1 */}
              {currentStep === 1 && (
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 animate-fade-in border-t border-[#cde8ec]">
                  <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:border-[#0a7381] focus-within:ring-2 focus-within:ring-[#0a7381]/20 transition-all">
                    <div className="flex items-center gap-1.5 px-3 py-3 bg-slate-50 border-r border-slate-200 text-xs font-bold text-slate-700 select-none shrink-0">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="98765 43210"
                      className="flex-1 px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none tracking-wider bg-transparent"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Enter your 10-digit mobile number</span>
                    <span className="font-mono text-[#0a7381] font-bold bg-white px-1.5 py-0.5 rounded border border-[#0a7381]/30">
                      OTP: 5556
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 2: OTP VERIFICATION */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                currentStep === 2
                  ? 'bg-[#e6f3f5] border-[#a5dbe2] shadow-sm ring-1 ring-[#0a7381]/20'
                  : currentStep > 2
                  ? 'bg-[#e6f3f5]/70 border-[#c6e4e8]'
                  : 'bg-[#e6f3f5] border-[#c6e4e8]'
              }`}
            >
              {/* Header row of Card 2 */}
              <button
                type="button"
                onClick={() => {
                  if (phone.length === 10) setCurrentStep(2);
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {/* Solid Teal Circle Indicator */}
                  <div className="w-6 h-6 rounded-full bg-[#0a7381] text-white flex items-center justify-center shrink-0">
                    {currentStep > 2 ? (
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    OTP verification
                  </span>
                </div>

                {currentStep > 2 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-white/70 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Verified ✓
                  </span>
                )}
              </button>

              {/* Expanded Input for Step 2 */}
              {currentStep === 2 && (
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3 animate-fade-in border-t border-[#cde8ec]">
                  <p className="text-xs text-slate-600">
                    Enter the 4-digit verification code sent to{' '}
                    <strong className="text-slate-900">+91 {phone}</strong>
                  </p>

                  <div className="flex items-center rounded-xl border border-slate-300 bg-white shadow-2xs overflow-hidden focus-within:border-[#0a7381] focus-within:ring-2 focus-within:ring-[#0a7381]/20 transition-all">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="5556"
                      className="w-full px-4 py-3 text-center text-lg font-mono font-bold text-slate-900 tracking-[0.4em] placeholder:text-slate-300 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
                    <span>
                      {otpTimer > 0 ? (
                        <>Resend in <strong className="text-[#0a7381]">{otpTimer}s</strong></>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setOtpTimer(60);
                            sendOtp(phone);
                          }}
                          className="font-bold text-[#0a7381] hover:underline"
                        >
                          Resend OTP
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode('5556')}
                      className="text-[11px] font-bold text-[#0a7381] bg-white px-2 py-0.5 rounded border border-[#0a7381]/30 hover:bg-[#0a7381]/10"
                    >
                      Fill 5556
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 3: CREATE PROFILE */}
            <div
              className={`rounded-2xl border transition-all overflow-hidden ${
                currentStep === 3
                  ? 'bg-[#e6f3f5] border-[#a5dbe2] shadow-sm ring-1 ring-[#0a7381]/20'
                  : 'bg-[#e6f3f5] border-[#c6e4e8]'
              }`}
            >
              {/* Header row of Card 3 */}
              <button
                type="button"
                onClick={() => {
                  if (currentStep >= 2) setCurrentStep(3);
                }}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  {/* Solid Teal Circle Indicator */}
                  <div className="w-6 h-6 rounded-full bg-[#0a7381] text-white flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-base font-bold text-slate-900 tracking-tight">
                    Create profile
                  </span>
                </div>
              </button>

              {/* Expanded Input for Step 3 */}
              {currentStep === 3 && (
                <div className="px-4 sm:px-5 pb-5 pt-1 space-y-3.5 animate-fade-in border-t border-[#cde8ec]">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-2 focus:ring-[#0a7381]/20"
                      required
                      autoFocus
                    />
                  </div>

                  {categoryParam === 'student' && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          College / University Name
                        </label>
                        <input
                          type="text"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="e.g. Christ University"
                          className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-2 focus:ring-[#0a7381]/20"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Student ID / Roll Number
                        </label>
                        <input
                          type="text"
                          value={studentId}
                          onChange={(e) => setStudentId(e.target.value)}
                          placeholder="e.g. CU2026-ENG-492"
                          className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-2 focus:ring-[#0a7381]/20"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Bottom Action Area: CONTINUE Button matching Image 2 */}
          <div className="pt-6 pb-2 space-y-3">
            <button
              onClick={handleContinue}
              disabled={loading}
              type="button"
              className="w-full py-4 rounded-full bg-[#0a7381] hover:bg-[#08636f] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-md shadow-teal-900/20 flex items-center justify-center text-center cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Processing...' : 'CONTINUE'}</span>
            </button>

            <p className="text-center text-[11px] text-slate-400">
              Step {currentStep} of 3 &nbsp;•&nbsp; Rentify Secure Verification
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a7381] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
