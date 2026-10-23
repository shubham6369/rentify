import React from 'react';
import { StayCategory } from '@/types';
import { GraduationCap, Users, Compass } from 'lucide-react';

interface CategoryBadgeProps {
  category: StayCategory;
  className?: string;
  showIcon?: boolean;
}

export function CategoryBadge({ category, className = '', showIcon = true }: CategoryBadgeProps) {
  switch (category) {
    case 'student':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-indigo-50/95 text-indigo-700 border border-indigo-200/80 backdrop-blur-md shadow-xs ${className}`}
        >
          {showIcon && <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
          <span>Student Stay</span>
        </span>
      );
    case 'family':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-amber-50/95 text-amber-800 border border-amber-200/80 backdrop-blur-md shadow-xs ${className}`}
        >
          {showIcon && <Users className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
          <span>Family Stay</span>
        </span>
      );
    case 'trip':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-50/95 text-emerald-800 border border-emerald-200/80 backdrop-blur-md shadow-xs ${className}`}
        >
          {showIcon && <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
          <span>Trip Stay</span>
        </span>
      );
  }
}
