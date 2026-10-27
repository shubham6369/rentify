'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

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
    <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-md mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Compass className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-800">Find Your Stay</span>
          <span>&copy; {new Date().getFullYear()} Find Your Stay India. All rights reserved.</span>
        </div>

        <div className="flex items-center gap-5 font-semibold text-slate-600">
          <Link href="/privacy" className="hover:text-indigo-600 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-indigo-600 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
