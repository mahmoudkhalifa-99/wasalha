import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  inverted = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-9 h-9',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  const subtitleSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Brand Emblem Icon */}
      <div
        className={`relative ${iconSizes[size]} rounded-[1.25rem] md:rounded-[1.75rem] overflow-hidden flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0 ${
          inverted
            ? 'bg-white shadow-white/20 ring-2 ring-white/30'
            : 'bg-white shadow-emerald-500/20 ring-1 ring-slate-200/80'
        }`}
      >
        <img
          src="/icon-192.png"
          alt="شعار وصلها"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-right leading-tight">
        <div className="flex items-center gap-1.5">
          <h1
            className={`font-black tracking-tight ${titleSizes[size]} ${
              inverted ? 'text-white' : 'text-slate-900'
            }`}
          >
            وصـــلــهــا
          </h1>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
        </div>
        {showSubtitle && (
          <span
            className={`font-black tracking-wider uppercase mt-0.5 ${subtitleSizes[size]} ${
              inverted ? 'text-emerald-100/90' : 'text-slate-400'
            }`}
          >
            توصيل ذكي • المنوفية
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;
