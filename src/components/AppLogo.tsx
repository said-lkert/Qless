import React, { useState } from 'react';
import { cn } from '../lib/utils';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, showText = true, size = 'md', layout = 'horizontal' }) => {
  const [imgError, setImgError] = useState(false);

  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  const textSizes = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
    xl: 'text-7xl',
  };

  const containerClass = layout === 'horizontal' ? "flex flex-row items-center gap-1" : "flex flex-col items-center justify-center";

  if (!imgError) {
    return (
      <div className={cn(containerClass, className)}>
        <img 
          src="/logo.png" 
          alt="Qless Logo" 
          className={cn("object-contain", iconSizes[size], !showText && "scale-150")}
          onError={() => setImgError(true)}
        />
        {showText && (
          <div className={cn(
            "font-display font-black text-[#1e3a8a] dark:text-white tracking-tighter leading-none -ml-1",
            layout === 'vertical' ? "mt-4" : "",
            textSizes[size]
          )}>
            Qless
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(containerClass, className)}>
      <div className={cn("relative shrink-0", iconSizes[size])}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#2DD4BF" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
              <feOffset dx="0" dy="5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <path
            d="M100 40C66.8629 40 40 66.8629 40 100C40 133.137 66.8629 160 100 160C133.137 160 160 133.137 160 100"
            stroke="url(#logo-gradient)"
            strokeWidth="30"
            strokeLinecap="round"
            filter="url(#shadow)"
          />
          <path
            d="M100 40C120 40 145 55 155 75C165 95 160 120 140 140L170 170"
            stroke="url(#logo-gradient)"
            strokeWidth="30"
            strokeLinecap="round"
            filter="url(#shadow)"
          />
          <circle cx="170" cy="170" r="8" fill="white" className="dark:fill-gray-900" />
          <circle cx="160" cy="180" r="8" fill="white" className="dark:fill-gray-900" />
        </svg>
      </div>
      {showText && (
        <div className={cn(
          "font-display font-black text-[#1e3a8a] dark:text-white tracking-tighter leading-none -ml-1",
          layout === 'vertical' ? "mt-4" : "",
          textSizes[size]
        )}>
          Qless
        </div>
      )}
    </div>
  );
};
