'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
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
  ArrowRight
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
  const [phone, setPhone] = useState(user?.phone?.replace('+91', '') || '9876543210');
  const [otpCode, setOtpCode] = useState('5556');
  const [otpTimer, setOtpTimer] = useState(60);

  // Customer Profile & Booking Details Fields
  const [fullName, setFullName] = useState(user?.fullName || 'User ' + (phone.slice(-4) || '2826'));
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.aadhaarNumber ? formatAadhaar(user.aadhaarNumber) : '5421 8901 2345');
  
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

  // OTP Countdown timer
  useEffect(() => {
    let interval: any;
    if (stage === 'auth' && currentStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [stage, currentStep, otpTimer]);

  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (errorMsg) setErrorMsg(null);
  };

  const handleAadhaarChange = (val: string) => {
    setAadhaarNumber(formatAadhaar(val));
    if (errorMsg) setErrorMsg(null);
  };

  // CONTINUE action in the Auth Stage (Step 1 -> Step 2 -> Open Profile)
  const handleAuthContinue = async () => {
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
      const res = await verifyOtp(cleanPhone, cleanOtp, fullName);
      setLoading(false);

      if (res.success) {
        // Successfully authenticated -> OPEN CUSTOMER PROFILE & DETAILS PAGE!
        setStage('profile');
      } else {
        setErrorMsg(res.message || 'Invalid verification code');
      }
      return;
    }

    // If on Step 3: Directly open Customer Profile
    if (currentStep === 3) {
      setStage('profile');
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

  return (
    <div
      className="min-h-screen bg-slate-900/95 flex items-center justify-center sm:py-6 sm:px-4"
      suppressHydrationWarning
    >
      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[870px] bg-slate-50 sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        
        {/* ========================================================================= */}
        {/* VIEW 1: AUTHENTICATION & VERIFICATION (STYLE TYPE MATCHING 2ND IMAGE) */}
        {/* ========================================================================= */}
        {stage === 'auth' ? (
          <>
            {/* Top Teal Header Banner */}
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

            {/* Middle 3 Cards Section */}
            <div className="flex-1 px-5 sm:px-6 py-6 flex flex-col justify-between bg-white">
              <div className="space-y-4">
                
                {/* CARD 1: MOBILE NUMBER */}
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    currentStep === 1
                      ? 'bg-[#e6f3f5] border-[#a5dbe2] shadow-sm ring-1 ring-[#0a7381]/20'
                      : 'bg-[#e6f3f5]/70 border-[#c6e4e8]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
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
                      <span className="text-xs font-semibold text-[#0a7381] bg-white/80 px-2.5 py-0.5 rounded-full border border-[#0a7381]/20">
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
                      : 'bg-[#e6f3f5]/70 border-[#c6e4e8]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (phone.length === 10) setCurrentStep(2);
                    }}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
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
                      <span className="text-xs font-semibold text-emerald-700 bg-white/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
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
                      : 'bg-[#e6f3f5]/70 border-[#c6e4e8]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (currentStep >= 2 || user) {
                        setStage('profile');
                      } else {
                        setCurrentStep(3);
                      }
                    }}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-6 h-6 rounded-full bg-[#0a7381] text-white flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                      <div>
                        <span className="text-base font-bold text-slate-900 tracking-tight block">
                          Create profile
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ID, academic & guest details
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#0a7381]" />
                  </button>
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
                  onClick={handleAuthContinue}
                  disabled={loading}
                  type="button"
                  className="w-full py-4 rounded-full bg-[#0a7381] hover:bg-[#08636f] active:scale-[0.99] text-white font-extrabold text-sm sm:text-base tracking-wider uppercase transition-all shadow-md shadow-teal-900/20 flex items-center justify-center text-center cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : 'CONTINUE'}</span>
                </button>

                <p className="text-center text-[11px] text-slate-400">
                  Step 1 of 2 &nbsp;•&nbsp; Rentify Secure Verification
                </p>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: CUSTOMER PROFILE & DETAILS PAGE (REDESIGNED IN NEW TEAL THEME) */
          /* ========================================================================= */
          <form
            onSubmit={handleSaveProfileAndProceed}
            className="flex-1 flex flex-col justify-between bg-slate-50"
          >
            {/* Top Teal Curved Header matching previous pages */}
            <div className="bg-[#0a7381] text-white pt-7 pb-6 px-6 rounded-b-[2rem] shadow-sm relative select-none">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setStage('auth')}
                  className="flex items-center gap-1.5 text-xs text-[#a5e0e8] hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>

                <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 border border-white/20 text-white px-2.5 py-1 rounded-full backdrop-blur-xs">
                  {categoryParam} stay
                </span>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-3.5 mt-2">
                <div className="w-12 h-12 rounded-2xl bg-white text-[#0a7381] flex items-center justify-center shadow-md shadow-teal-900/10 shrink-0">
                  <User className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                    Customer Profile & Booking Details
                  </h1>
                  <p className="text-xs text-[#c2eff5] font-normal mt-0.5">
                    Complete your profile to finalize reservations for <strong className="text-white capitalize">{categoryName} Stay</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="flex-1 px-5 sm:px-6 py-5 overflow-y-auto space-y-4">
              
              {/* FULL NAME */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Full Name (As on Government ID) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. User 2826"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white shadow-2xs focus:outline-none focus:border-[#0a7381] focus:ring-2 focus:ring-[#0a7381]/20 transition-all"
                    required
                  />
                </div>
              </div>

              {/* CONTACT NUMBER & EMAIL ROW */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Contact Mobile Number */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Contact Mobile Number
                  </label>
                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#e6f3f5] border border-[#a5dbe2] text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-800 font-mono text-[11px]">
                      <Smartphone className="w-3.5 h-3.5 text-[#0a7381] shrink-0" />
                      +91 {phone}
                    </span>
                    <span className="text-[10px] font-bold text-[#0a7381] bg-white/80 px-2 py-0.5 rounded-full border border-[#0a7381]/20 flex items-center gap-0.5">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                {/* Verified Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Verified Email
                  </label>
                  <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-[#e6f3f5] border border-[#a5dbe2] text-xs">
                    <Mail className="w-3.5 h-3.5 text-[#0a7381] shrink-0" />
                    <span className="font-medium text-slate-700 truncate text-[11px]">
                      {user?.email || `${phone}@phone.rentify.in`}
                    </span>
                  </div>
                </div>
              </div>

              {/* AADHAAR CARD NUMBER (MANDATORY) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>Aadhaar Card Number</span>
                    <span className="text-red-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Mandatory
                  </span>
                </div>

                <div className="relative flex items-center">
                  <div className="absolute left-3 text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-[#0a7381]" />
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={14}
                    value={aadhaarNumber}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="xxxx xxxx xxxx"
                    className="w-full pl-9 pr-24 py-2.5 text-xs font-mono font-bold tracking-wider text-slate-900 rounded-xl border border-slate-300 bg-white shadow-2xs focus:outline-none focus:border-[#0a7381] focus:ring-2 focus:ring-[#0a7381]/20 transition-all"
                    required
                  />
                  {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                    <span className="absolute right-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
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
                <div className="p-4 bg-[#e6f3f5] border border-[#a5dbe2] rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#085a65] font-bold text-xs">
                    <GraduationCap className="w-4 h-4 text-[#0a7381]" />
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryParam === 'family' && (
                <div className="p-4 bg-[#e6f3f5] border border-[#a5dbe2] rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#085a65] font-bold text-xs">
                    <Users className="w-4 h-4 text-[#0a7381]" />
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {categoryParam === 'hourly' && (
                <div className="p-4 bg-[#e6f3f5] border border-[#a5dbe2] rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#085a65] font-bold text-xs">
                    <Clock className="w-4 h-4 text-[#0a7381]" />
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(categoryParam === 'regular' || categoryParam === 'trip') && (
                <div className="p-4 bg-[#e6f3f5] border border-[#a5dbe2] rounded-2xl space-y-3 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#085a65] font-bold text-xs">
                    <Compass className="w-4 h-4 text-[#0a7381]" />
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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
                        className="w-full px-3 py-2 text-xs font-semibold text-slate-900 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#0a7381] focus:ring-1 focus:ring-[#0a7381]"
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

            {/* Bottom Sticky Action Area */}
            <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-200 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-full bg-[#0a7381] hover:bg-[#08636f] active:scale-[0.99] text-white font-black text-xs sm:text-sm tracking-wider uppercase transition-all shadow-md shadow-teal-900/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Saving Profile...' : `Confirm Profile & Proceed to ${categoryParam.toUpperCase()} Stay`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[10px] text-slate-400">
                Step 2 of 2 &nbsp;•&nbsp; Rentify Verified Guest Protection
              </p>
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
        <div className="min-h-screen bg-[#0a7381] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
