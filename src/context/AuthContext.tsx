'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'otp' | 'email' | 'roles';
  openAuthModal: (tab?: 'otp' | 'email' | 'roles') => void;
  closeAuthModal: () => void;
  sendOtp: (target: string) => Promise<{ success: boolean; message: string; otpPreview?: string }>;
  verifyOtp: (target: string, otp: string, fullName?: string, role?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  registerWithEmail: (data: { email: string; fullName: string; phone?: string; role?: UserRole }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  switchRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'find_your_stay_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'otp' | 'email' | 'roles'>('otp');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const openAuthModal = (tab: 'otp' | 'email' | 'roles' = 'otp') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const sendOtp = async (target: string) => {
    try {
      const isEmail = target.includes('@');
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: target } : { phone: target })
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to send OTP' };
    }
  };

  const verifyOtp = async (target: string, otp: string, fullName?: string, role: UserRole = 'customer') => {
    try {
      const isEmail = target.includes('@');
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEmail ? { email: target, otp, fullName, role } : { phone: target, otp, fullName, role })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
        closeAuthModal();
        return { success: true, message: 'Logged in successfully' };
      }
      return { success: false, message: data.message || 'OTP verification failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Verification network error' };
    }
  };

  const loginWithEmail = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
        closeAuthModal();
        return { success: true, message: 'Welcome back!' };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Email login failed' };
    }
  };

  const registerWithEmail = async (data: { email: string; fullName: string; phone?: string; role?: UserRole }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(result.user));
        closeAuthModal();
        return { success: true, message: 'Registration complete' };
      }
      return { success: false, message: result.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, message: 'User not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid, ...updates })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
        return { success: true, message: 'Profile updated successfully', user: data.user };
      }
      return { success: false, message: data.message || 'Update failed' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Update failed' };
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.user));
        closeAuthModal();
      }
    } catch (err) {
      console.error('Failed to switch role', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        sendOtp,
        verifyOtp,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfile,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
