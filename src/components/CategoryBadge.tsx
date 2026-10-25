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
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-indigo-50/90 text-indigo-700 border border-indigo-200/70 backdrop-blur-md shadow-2xs ${className}`}
        >
          {showIcon && <GraduationCap className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
          <span>Student Stay</span>
        </span>
      );
    case 'family':
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-slate-100/90 text-slate-800 border border-slate-200/80 backdrop-blur-md shadow-2xs ${className}`}
        >
          {showIcon && <Users className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
          <span>Family Stay</span>
        </span>
      );
    case 'trip':
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-teal-50/90 text-teal-800 border border-teal-200/70 backdrop-blur-md shadow-2xs ${className}`}
        >
          {showIcon && <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
          <span>Trip Stay</span>
        </span>
      );
  }
}
