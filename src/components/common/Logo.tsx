import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showSubtitle?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark';
}

/**
 * Maya Sports Centre Official Brand Logo Component.
 * Renders the official shield crest with crisp scaling, proper proportions,
 * and high-contrast typography for both light and dark themes.
 */
export const Logo: React.FC<LogoProps> = ({
  className,
  imageClassName,
  showSubtitle = true,
  showText = true,
  size = 'md',
  variant = 'light',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  // Size mappings for the crest image
  const sizeStyles = {
    sm: 'h-9 sm:h-10',
    md: 'h-11 sm:h-12 md:h-14',
    lg: 'h-14 sm:h-16 md:h-20',
    xl: 'h-20 sm:h-24 md:h-28',
  }[size];

  const titleSizes = {
    sm: 'text-sm font-extrabold',
    md: 'text-base sm:text-lg font-black',
    lg: 'text-xl sm:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black',
  }[size];

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs',
    xl: 'text-xs sm:text-sm',
  }[size];

  return (
    <div className={cn('inline-flex items-center gap-3 select-none group', className)}>
      {/* Official Shield Crest */}
      {!imageFailed ? (
        <div className="relative shrink-0 flex items-center justify-center">
          <img
            src="/logo.png"
            alt="Maya Sports Centre Official Logo"
            onError={() => setImageFailed(true)}
            className={cn(
              'w-auto object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105',
              sizeStyles,
              imageClassName
            )}
            loading="eager"
          />
        </div>
      ) : (
        /* Fallback crest icon */
        <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex items-center justify-center font-black text-base shadow-md border-2 border-emerald-600">
          M
        </div>
      )}

      {/* Brand Name Lockup */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={cn(
              'tracking-tight uppercase transition-colors',
              titleSizes,
              variant === 'dark' ? 'text-white' : 'text-surface-900'
            )}
          >
            MAYA <span className="text-emerald-700">SPORTS</span>
          </span>

          {showSubtitle && (
            <span
              className={cn(
                'font-bold tracking-wider uppercase mt-1 transition-colors flex items-center gap-1.5',
                subtitleSizes,
                variant === 'dark' ? 'text-emerald-400' : 'text-emerald-800'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Centre • Hetauda
            </span>
          )}
        </div>
      )}
    </div>
  );
};
