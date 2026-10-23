'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { StayCategory } from '@/types';
import { CategoryBadge } from '@/components/CategoryBadge';
import {
  Smartphone,
  Mail,
  GraduationCap,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  User,
  Phone,
  Building,
  RotateCcw,
  Lock,
  ChevronLeft,
  X
} from 'lucide-react';



function AuthFlowContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, sendOtp, verifyOtp, loginWithEmail, registerWithEmail, updateProfile, logout } = useAuth();

  const categoryParam = (searchParams.get('category') as StayCategory) || 'student';
  const redirectParam = searchParams.get('redirect');

  // Stages: 'auth' (Phone OTP / Email) -> 'profile' (Profile Creation & Details)
  const [stage, setStage] = useState<'auth' | 'profile'>('auth');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');

  // Phone OTP State (Default OTP is 5556 as requested)
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('5556');
  const [otpPreview, setOtpPreview] = useState<string | null>('5556');
  const [otpTimer, setOtpTimer] = useState(60);
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Email State
  const [email, setEmail] = useState('');
  const [emailFullName, setEmailFullName] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Profile Fields State
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [collegeName, setCollegeName] = useState('Christ University');
  const [studentIdNumber, setStudentIdNumber] = useState('CU2026-ENG-492');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [guardianName, setGuardianName] = useState('Rajesh Sharma');
  const [guardianPhone, setGuardianPhone] = useState('+91 98111 22334');
  const [familyMembersCount, setFamilyMembersCount] = useState(4);
  const [emergencyContact, setEmergencyContact] = useState('+91 98111 22334 (Guardian)');
  const [profileSaving, setProfileSaving] = useState(false);

  // Sync profile fields if user becomes available
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
      if (user.aadhaarNumber) {
        const raw = user.aadhaarNumber.replace(/\D/g, '').slice(0, 12);
        const parts = [];
        for (let i = 0; i < raw.length; i += 4) {
          parts.push(raw.slice(i, i + 4));
        }
        setAadhaarNumber(parts.join(' '));
      }
      if (user.collegeName) setCollegeName(user.collegeName);
      if (user.studentIdNumber) setStudentIdNumber(user.studentIdNumber);
      if (user.emergencyContact) setEmergencyContact(user.emergencyContact);
      // If user exists, advance to profile verification stage
      setStage('profile');
    }
  }, [user]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Clean and format phone number as user types (e.g., 98765 43210)
  const handlePhoneChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 10);
    if (raw.length > 5) {
      setPhone(`${raw.slice(0, 5)} ${raw.slice(5)}`);
    } else {
      setPhone(raw);
    }
    if (errorMsg) setErrorMsg(null);
  };

  // Clean and format Aadhaar Number (12 digits grouped by 4)
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    setAadhaarNumber(parts.join(' '));
    if (errorMsg) setErrorMsg(null);
  };

  // Handle Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('Please enter a complete 10-digit mobile number');
      return;
    }

    setAuthLoading(true);
    const res = await sendOtp(cleanPhone);
    setAuthLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpTimer(60);
      setOtpPreview('5556');
      setOtpCode('5556');
      setSuccessMsg('Default OTP: 5556 (Bypass enabled)');
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle Email Verification with default OTP 5556
  const handleEmailOtpBypass = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setAuthLoading(true);
    const res = await verifyOtp(email, '5556', emailFullName || email.split('@')[0]);
    setAuthLoading(false);
    if (res.success) {
      setStage('profile');
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanOtp = otpCode.replace(/\D/g, '');
    if (cleanOtp.length < 4) {
      setErrorMsg('Please enter the verification code');
      return;
    }

    setAuthLoading(true);
    const cleanPhone = phone.replace(/\D/g, '');
    const res = await verifyOtp(cleanPhone, cleanOtp);
    setAuthLoading(false);

    if (res.success) {
      // Advance to Step 2: Customer Profile Creation/Editing
      setStage('profile');
    } else {
      setErrorMsg(res.message);
    }
  };

  // Handle Email Auth
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setAuthLoading(true);
    if (isRegisterMode) {
      if (!emailFullName) {
        setErrorMsg('Please enter your full name');
        setAuthLoading(false);
        return;
      }
      const res = await registerWithEmail({ email, fullName: emailFullName });
      setAuthLoading(false);
      if (res.success) {
        setStage('profile');
      } else {
        setErrorMsg(res.message);
      }
    } else {
      const res = await loginWithEmail(email);
      setAuthLoading(false);
      if (res.success) {
        setStage('profile');
      } else {
        setErrorMsg(res.message);
      }
    }
  };

  // Handle Profile Save & Proceed to Booking Flow
  const handleSaveProfileAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }

    const cleanAadhaar = aadhaarNumber.replace(/\D/g, '');
    if (cleanAadhaar.length !== 12) {
      setErrorMsg('Please enter a valid mandatory 12-digit Aadhaar Card Number');
      return;
    }

    setProfileSaving(true);
    const updates: any = {
      fullName: fullName.trim(),
      aadhaarNumber: cleanAadhaar,
      emergencyContact
    };
    if (avatarUrl) updates.avatarUrl = avatarUrl;

    if (categoryParam === 'student') {
      updates.collegeName = collegeName.trim();
      updates.studentIdNumber = studentIdNumber.trim();
      updates.emergencyContact = `${guardianName} (${guardianPhone})`;
    }

    const res = await updateProfile(updates);
    setProfileSaving(false);

    if (res.success) {
      // Proceed to the selected booking flow
      if (redirectParam) {
        router.push(redirectParam);
      } else {
        router.push(`/hotels?category=${categoryParam}`);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6" suppressHydrationWarning>
      <div className="max-w-xl mx-auto space-y-6">
        {/* Back navigation */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Category Selection</span>
        </button>

        {/* Selected Category Banner */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CategoryBadge category={categoryParam} />
            <div>
              <p className="text-xs text-slate-500 font-medium">Selected Booking Option:</p>
              <h3 className="text-sm font-extrabold text-slate-900 capitalize">
                {categoryParam} Stay
              </h3>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Step {stage === 'auth' ? '1 of 2' : '2 of 2'}
          </span>
        </div>

        {/* STAGE 1: AUTHENTICATION (Mobile Number OTP / Email Verification) */}
        {stage === 'auth' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Authentication & Verification
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Verify your mobile number or email to proceed with your{' '}
                <strong className="text-slate-700 capitalize">{categoryParam} Stay</strong> reservation.
              </p>
            </div>

            {/* Master Bypass OTP Card */}
            <div className="p-4 bg-gradient-to-r from-amber-50 via-indigo-50 to-emerald-50 border-2 border-indigo-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-mono font-black text-xs shadow-sm shrink-0">
                  <span className="text-[9px] leading-none opacity-80">OTP</span>
                  <span className="text-base font-extrabold leading-tight">5556</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-md">
                      Universal Bypass OTP
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      ● Default Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    Master OTP is <span className="font-mono text-indigo-700 font-black text-sm bg-white px-1.5 py-0.5 rounded border border-indigo-200">5556</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Bypasses verification for any Mobile Number or Email automatically.
                  </p>
                </div>
              </div>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Mobile OTP (5556)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  setErrorMsg(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Bypass (5556)</span>
              </button>
            </div>

            {/* A. MOBILE NUMBER + REAL OTP FORM */}
            {authMethod === 'phone' && (
              <div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Mobile Number
                        </label>
                        {phone.replace(/\D/g, '').length === 10 ? (
                          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> 10 Digits
                          </span>
                        ) : phone.replace(/\D/g, '').length > 0 ? (
                          <span className="text-[11px] font-semibold text-slate-400">
                            {phone.replace(/\D/g, '').length}/10 digits
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center rounded-2xl border-2 border-slate-200 focus-within:border-indigo-600 focus-within:ring-4 focus-within:ring-indigo-100 bg-white transition-all overflow-hidden shadow-xs">
                        {/* Country Code Pill */}
                        <div className="flex items-center gap-1.5 px-3.5 py-3.5 bg-slate-50 border-r border-slate-200 select-none shrink-0">
                          <span className="text-base leading-none">🇮🇳</span>
                          <span className="text-sm font-bold text-slate-700 tracking-wide">+91</span>
                        </div>

                        {/* Phone Digits Input */}
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9 ]*"
                          autoComplete="tel-national"
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          placeholder="98765 43210"
                          className="flex-1 px-4 py-3.5 text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none tracking-wider bg-transparent"
                          required
                          autoFocus
                        />

                        {/* Clear Button */}
                        {phone && (
                          <button
                            type="button"
                            onClick={() => setPhone('')}
                            className="p-2 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                            title="Clear"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[11px] text-slate-500">
                          Default OTP is set to <strong className="text-indigo-600">5556</strong> for all numbers.
                        </p>
                        <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                          OTP: 5556
                        </span>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Sending OTP...' : 'Send OTP (Default: 5556)'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    {/* Live OTP Preview Banner for Verification */}
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between shadow-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <span className="font-bold text-emerald-900 block">Default OTP Ready</span>
                          <span className="text-[11px] text-emerald-700">Pre-filled with master bypass code</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-base bg-emerald-200/80 px-3 py-1 rounded-xl text-emerald-950 tracking-widest border border-emerald-300">
                        {otpPreview || '5556'}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Enter Verification Code (Default: 5556)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setOtpSent(false);
                            setOtpCode('5556');
                            setErrorMsg(null);
                          }}
                          className="text-xs text-indigo-600 hover:underline font-semibold"
                        >
                          Change Number
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="tel"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="5556"
                          className="w-full px-4 py-3.5 text-center tracking-[0.4em] font-mono text-2xl font-black text-slate-900 rounded-2xl border-2 border-indigo-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all shadow-xs bg-indigo-50/20"
                          required
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Auto-fill Helper */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="text-slate-600">Quick fill default OTP:</span>
                      <button
                        type="button"
                        onClick={() => setOtpCode('5556')}
                        className="font-mono font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                      >
                        ⚡ 5556
                      </button>
                    </div>

                    {errorMsg && (
                      <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Didn&apos;t receive code?</span>
                      {otpTimer > 0 ? (
                        <span className="font-semibold text-slate-700">Resend in {otpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          Resend OTP (5556)
                        </button>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {authLoading ? 'Verifying...' : 'Verify OTP 5556 & Proceed to Profile'}
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* B. EMAIL VERIFICATION & LOGIN FORM */}
            {authMethod === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {/* Default Master OTP info banner */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900">⚡ Master OTP Bypass: 5556</span>
                    <span className="font-mono font-black text-xs text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">5556</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Enter any email below and tap &quot;Bypass with Default OTP (5556)&quot; to instantly verify.
                  </p>
                </div>

                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={emailFullName}
                      onChange={(e) => setEmailFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 font-medium"
                    required
                  />
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Instant Bypass Button */}
                <button
                  type="button"
                  onClick={handleEmailOtpBypass}
                  disabled={authLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {authLoading ? 'Verifying...' : 'Bypass & Verify with OTP (5556)'}
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <div className="relative py-1 flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-2 text-[10px] text-slate-400 uppercase font-semibold absolute">or</span>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl text-xs transition-all shadow-xs disabled:opacity-50"
                >
                  {authLoading
                    ? 'Processing...'
                    : isRegisterMode
                    ? 'Register & Continue'
                    : 'Sign In With Email'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setErrorMsg(null);
                    }}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    {isRegisterMode
                      ? 'Already registered? Sign in with email'
                      : "New user? Create an account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* STAGE 2: CUSTOMER PROFILE CREATION & EDITING */}
        {stage === 'profile' && (
          <form
            onSubmit={handleSaveProfileAndProceed}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Customer Profile & Booking Details
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Complete your customer profile to finalize reservations for{' '}
                <strong className="text-slate-700 capitalize">{categoryParam} Stay</strong>.
              </p>
            </div>


            {/* Core Profile Fields */}
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (As on Government ID)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Mobile Number
                  </label>
                  <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-mono font-medium text-slate-800">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{user?.phone || phone || '+91 98765 43210'}</span>
                    <span className="text-[10px] font-sans font-bold text-emerald-600 ml-auto">
                      ✓ Verified
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Verified Email
                  </label>
                  <div className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 truncate">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{user?.email || email || 'guest@findyourstay.in'}</span>
                  </div>
                </div>
              </div>

              {/* Mandatory Aadhaar Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    Aadhaar Card Number
                    <span className="text-red-500 font-bold">*</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Mandatory
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={aadhaarNumber}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="xxxx xxxx xxxx"
                    maxLength={14}
                    className="w-full px-4 py-2.5 pl-10 text-xs rounded-2xl border border-slate-200 font-mono font-medium tracking-wider text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {aadhaarNumber.replace(/\D/g, '').length === 12 && (
                    <span className="text-[10px] font-sans font-bold text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      ✓ 12-Digit Valid
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  12-digit Indian Government UID required for guest identity & safety compliance.
                </p>
              </div>
            </div>

            {/* CATEGORY-SPECIFIC REQUIRED BOOKING INFORMATION */}
            {categoryParam === 'student' && (
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student Academic Credentials</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      University / College Name
                    </label>
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder="e.g. Christ University"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 bg-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      Student ID / Roll Number
                    </label>
                    <input
                      type="text"
                      value={studentIdNumber}
                      onChange={(e) => setStudentIdNumber(e.target.value)}
                      placeholder="e.g. CU2026-ENG-492"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 bg-white font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      Course / Department
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-indigo-950 mb-1">
                      Parent / Guardian Contact
                    </label>
                    <input
                      type="text"
                      value={guardianPhone}
                      onChange={(e) => setGuardianPhone(e.target.value)}
                      placeholder="+91 98111 22334"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-indigo-200 bg-white font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {categoryParam === 'family' && (
              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <Users className="w-4 h-4 text-amber-600" />
                  <span>Family Stay Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Total Family Members
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={familyMembersCount}
                      onChange={(e) => setFamilyMembersCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                      Family Emergency Phone
                    </label>
                    <input
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="+91 98111 22334"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-amber-200 bg-white font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={profileSaving}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs transition-all shadow-xl shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{profileSaving ? 'Saving Profile...' : `Confirm Profile & Proceed to ${categoryParam.toUpperCase()} Stay`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
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
        <div className="max-w-xl mx-auto px-4 py-20 text-center text-slate-400">
          Loading authentication & verification desk...
        </div>
      }
    >
      <AuthFlowContent />
    </Suspense>
  );
}
