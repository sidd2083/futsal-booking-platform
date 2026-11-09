import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  imageClassName?: string;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark';
}

/**
 * Maya Sports Centre Official Brand Logo Component.
 * Automatically displays the real logo image from `/logo.png` or `/logo.svg`
 * while preserving its natural aspect ratio.
 */
export const Logo: React.FC<LogoProps> = ({
  className,
  imageClassName,
  showSubtitle = true,
  variant = 'light',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className={cn('flex items-center gap-3 select-none', className)}>
      {!imageFailed ? (
        <img
          src="/logo.png"
          alt="Maya Sports Centre Logo"
          onError={() => setImageFailed(true)}
          className={cn(
            'h-10 w-auto object-contain max-w-[160px] transition-transform duration-200',
            imageClassName
          )}
        />
      ) : (
        /* Fallback typographic lockup while awaiting the logo image re-upload */
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-extrabold text-sm shadow-sm tracking-tight border border-emerald-900">
            MS
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                'font-extrabold text-base tracking-tight leading-tight',
                variant === 'dark' ? 'text-white' : 'text-surface-900'
              )}
            >
              MAYA <span className="text-emerald-700">SPORTS</span>
            </span>
            {showSubtitle && (
              <span
                className={cn(
                  'text-[10px] uppercase font-semibold tracking-wider',
                  variant === 'dark' ? 'text-surface-400' : 'text-surface-500'
                )}
              >
                Centre • Hetauda
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
