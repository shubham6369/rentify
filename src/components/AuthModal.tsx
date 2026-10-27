'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { X, Smartphone, Mail, Shield, CheckCircle2, User, Building, AlertCircle, ArrowRight } from 'lucide-react';
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

  // OTP State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);

  // Email State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setOtpSuccess(null);
    if (!phoneNumber || phoneNumber.replace(/\D/g, '').length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    setOtpLoading(true);
    const res = await sendOtp(phoneNumber);
    setOtpLoading(false);

    if (res.success) {
      setOtpSent(true);
      setOtpPreview(res.otpPreview || null);
      setOtpSuccess(res.message);
    } else {
      setOtpError(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    if (!otpCode || otpCode.length < 4) {
      setOtpError('Please enter the verification code');
      return;
    }

    setOtpLoading(true);
    const res = await verifyOtp(phoneNumber, otpCode, undefined, selectedRole);
    setOtpLoading(false);

    if (!res.success) {
      setOtpError(res.message);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Find Your Stay Account</h3>
            <p className="text-xs text-slate-500">Sign in to book and manage accommodations</p>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            onClick={() => setActiveTab('otp')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'otp'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile OTP
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-3 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-indigo-600 text-indigo-600 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-4 h-4" />
            Email Login
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {/* Master OTP Bypass Banner */}
          <div className="mb-4 p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-950">Default Master OTP:</span>
            <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-200 text-indigo-700">5556</span>
          </div>

          {/* TAB 1: MOBILE OTP */}
          {activeTab === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Enter Mobile Number
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white overflow-hidden shadow-xs">
                      <div className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-50 border-r border-slate-200 select-none shrink-0">
                        <span className="text-sm">🇮🇳</span>
                        <span className="text-xs font-bold text-slate-700">+91</span>
                      </div>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phoneNumber}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5)}` : raw);
                        }}
                        placeholder="98765 43210"
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none bg-transparent tracking-wide"
                        required
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      Default bypass code is set to <strong className="text-indigo-600">5556</strong>.
                    </p>
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? 'Sending OTP...' : 'Send OTP (Default: 5556)'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
                    <span className="font-semibold">Default OTP:</span>
                    <span className="font-mono font-bold text-sm bg-emerald-100 px-2.5 py-0.5 rounded-md text-emerald-900 tracking-widest">
                      {otpPreview || '5556'}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Enter Verification OTP
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('5556');
                          setOtpError(null);
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Change Number
                      </button>
                    </div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      value={otpCode || '5556'}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="5556"
                      className="w-full px-4 py-2.5 text-center tracking-widest font-mono text-xl font-bold rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-indigo-50/20"
                      required
                      autoFocus
                    />
                  </div>

                  {otpError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP 5556 & Continue'}
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: EMAIL LOGIN / REGISTER */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  required
                />
              </div>

              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Account Type
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="customer">Student / Family / Traveler (Customer)</option>
                    <option value="property_owner">Property Owner / Host</option>
                  </select>
                </div>
              )}

              {emailError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={emailLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {emailLoading
                  ? 'Processing...'
                  : isRegisterMode
                  ? 'Create Account'
                  : 'Sign In With Email'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-xs text-indigo-600 hover:underline font-medium"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in'
                    : "Don't have an account? Create one"}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: DEMO ROLE SWITCHER */}
          {activeTab === 'roles' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Instantly switch roles to test full permission boundaries across the customer booking flow, property owner listings, and administrator management center:
              </p>

              <button
                onClick={() => switchRole('customer')}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  user?.role === 'customer'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Student & Family Guest</span>
                    {user?.role === 'customer' && (
                      <span className="text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse stays, book with advance payments, manage student & family vouchers.
                  </p>
                </div>
              </button>

              <button
                onClick={() => switchRole('property_owner')}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  user?.role === 'property_owner'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">Property Owner / Host</span>
                    {user?.role === 'property_owner' && (
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Add new hostels or family villas, update monthly rent, view tenant bookings.
                  </p>
                </div>
              </button>

              <button
                onClick={() => switchRole('admin')}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  user?.role === 'admin'
                    ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">System Administrator</span>
                    {user?.role === 'admin' && (
                      <span className="text-[10px] bg-purple-600 text-white font-bold px-1.5 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
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
