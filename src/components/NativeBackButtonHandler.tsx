'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function NativeBackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const lastBackPressRef = useRef<number>(0);
  const [showExitToast, setShowExitToast] = useState(false);

  useEffect(() => {
    let removeListener: (() => void) | null = null;

    async function setupCapacitorBack() {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (!Capacitor.isNativePlatform()) return;

        const { App } = await import('@capacitor/app');

        const listenerHandle = await App.addListener('backButton', ({ canGoBack }) => {
          const now = Date.now();

          // 1. Check if on root home or catalog page with nowhere to go back
          const isAtRoot = pathname === '/' || pathname === '';

          // On home page, check if we can step back from 'home' to 'choose', or 'choose' to 'onboarding'
          if (isAtRoot) {
            const searchParams = new URLSearchParams(window.location.search);
            const currentStep = searchParams.get('step');
            if (currentStep === 'home') {
              window.dispatchEvent(new CustomEvent('rentify:navigate-step', { detail: 'choose' }));
              return;
            }
            if (currentStep === 'choose') {
              window.dispatchEvent(new CustomEvent('rentify:navigate-step', { detail: 'onboarding' }));
              return;
            }
          }

          // 2. If browser has history, navigate back smoothly
          if (canGoBack || (typeof window !== 'undefined' && window.history.length > 1 && !isAtRoot)) {
            window.history.back();
            return;
          }

          // 3. Double-tap back within 2 seconds to exit app
          if (now - lastBackPressRef.current < 2000) {
            App.exitApp();
          } else {
            lastBackPressRef.current = now;
            setShowExitToast(true);
            setTimeout(() => {
              setShowExitToast(false);
            }, 2000);
          }
        });

        removeListener = () => {
          listenerHandle.remove();
        };
      } catch (err) {
        console.warn('Capacitor BackButton handler setup error:', err);
      }
    }

    setupCapacitorBack();

    return () => {
      if (removeListener) removeListener();
    };
  }, [pathname, router]);

  if (!showExitToast) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl border border-white/10 backdrop-blur-md animate-fade-in pointer-events-none select-none">
      Press back again to exit
    </div>
  );
}
