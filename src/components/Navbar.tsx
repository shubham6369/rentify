'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Compass,
  BedDouble,
  GraduationCap,
  Users,
  Building,
  Clock,
  Shield,
  User,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Calendar
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    {
      name: 'Student Stay',
      href: '/hotels?category=student',
      icon: GraduationCap,
      category: 'student',
      badge: 'Hostels & PGs'
    },
    {
      name: 'Family Stay',
      href: '/hotels?category=family',
      icon: Users,
      category: 'family',
      badge: 'Villas & Suites'
    },
    {
      name: 'Hourly Booking',
      href: '/hotels?category=hourly',
      icon: Clock,
      category: 'hourly',
      badge: 'Flexible Day Stays'
    },
    {
      name: 'Regular Stay',
      href: '/hotels?category=regular',
      icon: Building,
      category: 'regular',
      badge: 'Hotels & Resorts'
    }
  ];

  if (
    pathname === '/' ||
    pathname.startsWith('/auth') ||
    pathname.startsWith('/hotels') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/book') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/portal')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#3b49df] to-[#7916e2] flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <BedDouble className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tight text-slate-900 select-none">
                  Rent<span className="text-[#3b49df]">ify</span>
                </span>
                <span className="px-2 py-0.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-md select-none">
                  Find Your Stay
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 hidden sm:block">
                Student • Family • Trip Accommodations
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Category Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith('/hotels') && pathname.includes(`category=${link.category}`);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200/80 transition-colors"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${user.fullName}`}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate hidden lg:block">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {user.role.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-slate-400" />
                        My Bookings & Profile
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('otp')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 transition-all"
              >
                Sign In
              </button>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 font-semibold text-xs text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-indigo-600" />
                  <span>{link.name}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-normal">{link.badge}</span>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/hotels"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
            >
              Explore All Stays
            </Link>

            {user && (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-indigo-600" />
                My Bookings
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
