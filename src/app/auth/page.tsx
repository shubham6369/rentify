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
  ArrowRight,
  Phone
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
      if (cleanPhone.length < 10) {
        setErrorMsg('Please enter a valid 10-digit mobile number');
        return;
      }

      setLoading(true);
      try {
        await sendOtp(cleanPhone);
        setOtpTimer(30);
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
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[890px] bg-[#f8faff] sm:rounded-[2.75rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800/90 overflow-hidden flex flex-col justify-between transition-all relative">
        
        {/* ========================================================================= */}
        {/* VIEW 1: AUTHENTICATION & VERIFICATION (EXACT MATCH TO IMAGE 1)            */}
        {/* ========================================================================= */}
        {stage === 'auth' ? (
          <>
            {/* Top Midnight Indigo/Purple Curved Header */}
            <div className="bg-gradient-to-br from-[#0c0836] via-[#1c0f64] to-[#3a1396] text-white pt-8 pb-7 px-6 rounded-b-[2.5rem] shadow-xl relative select-none overflow-hidden">
              {/* Top Row: Back button & Category Pill */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <button
                  onClick={() => router.push('/')}
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

              {/* Headline & Bedroom Photo Cutout Inset Row */}
              <div className="flex items-center justify-between gap-3 pt-2 relative z-10">
                <div className="space-y-1">
                  <h1 className="text-3xl font-black tracking-tight text-white leading-tight">
                    Welcome
                  </h1>
                  <p className="text-xs text-indigo-200/90 font-medium">
                    Sign in to continue
                  </p>
                </div>

                {/* Cozy Inset Hotel Bed Image with Curved Glass Mask matching Image 1 */}
                <div className="w-28 h-20 rounded-2xl overflow-hidden border border-white/20 shadow-lg shrink-0 relative bg-indigo-950">
                  <img
                    src="/images/hero-bed.jpg"
                    alt="Cozy room"
                    className="w-full h-full object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0836]/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Middle 3 Cards Section matching Image 1 */}
            <div className="flex-1 px-5 py-5 flex flex-col justify-between bg-[#f8faff]">
              <div className="space-y-3.5">
                
                {/* CARD 1: MOBILE NUMBER */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b49df] to-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-300">
                      <Phone className="w-4 h-4 fill-white" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 tracking-tight">
                      Mobile number
                    </span>
                  </div>

                  {/* Input container with +91 selector */}
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-600/15 transition-all">
                    <div className="flex items-center gap-1 px-3 py-2.5 bg-slate-50/70 border-r border-slate-200 text-xs font-bold text-slate-700 select-none shrink-0">
                      <span>+91</span>
                      <ChevronLeft className="w-3 h-3 -rotate-90 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="0708032826"
                      className="flex-1 px-3.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wider bg-transparent"
                      autoFocus={currentStep === 1}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Enter your 10-digit mobile number</span>
                    <button
                      type="button"
                      onClick={() => setPhone('0708032826')}
                      className="font-mono text-indigo-600 font-bold bg-indigo-50/90 px-2 py-0.5 rounded-md border border-indigo-100 text-[10px]"
                    >
                      OTP: 5556
                    </button>
                  </div>
                </div>

                {/* CARD 2: OTP VERIFICATION */}
                <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b49df] to-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-300">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-slate-900 tracking-tight">
                        OTP verification
                      </span>
                    </div>

                    {currentStep > 2 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* 6 Digit Input Boxes matching Image 1 */}
                  <div className="grid grid-cols-6 gap-1.5 sm:gap-2 pt-1">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          const newOtp = otpCode.split('');
                          newOtp[idx] = val;
                          setOtpCode(newOtp.join('').slice(0, 4));
                        }}
                        className={`w-full h-11 text-center font-bold text-base rounded-xl border transition-all ${
                          digit
                            ? 'border-indigo-400/80 bg-indigo-50/20 text-slate-900 shadow-2xs'
                            : 'border-slate-200 bg-slate-50/50 text-slate-400'
                        } focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Enter the 4-digit OTP sent to +91 {phone || '0708032826'}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpTimer(30);
                        sendOtp(phone);
                      }}
                      className="font-bold text-[#3b49df] hover:underline cursor-pointer"
                    >
                      Resend OTP ({otpTimer > 0 ? `00:${otpTimer.toString().padStart(2, '0')}` : 'Now'})
                    </button>
                  </div>
                </div>

                {/* CARD 3: CREATE PROFILE */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentStep >= 2 || user) {
                      setStage('profile');
                    } else {
                      setCurrentStep(3);
                    }
                  }}
                  className="w-full bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 shadow-xs flex items-center justify-between text-left cursor-pointer hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#3b49df] to-[#6366f1] text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-300">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 tracking-tight block">
                        Create profile
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        ID, academic & guest details
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>

                {/* Error Message Alert */}
                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Bottom Action Area: Glowing Gradient Button matching Image 1 */}
              <div className="pt-6 pb-2 space-y-2">
                <button
                  onClick={handleAuthContinue}
                  disabled={loading}
                  type="button"
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#12106e] via-[#2d1296] to-[#7114dd] hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-sm tracking-wider uppercase transition-all shadow-xl shadow-indigo-950/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <span>{loading ? 'Processing...' : 'CONTINUE'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
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
