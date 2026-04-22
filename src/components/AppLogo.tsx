import React from 'react';
import { cn } from '../lib/utils';

interface AppLogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  layout?: 'horizontal' | 'vertical';
}

export const AppLogo: React.FC<AppLogoProps> = ({ className, showText = true, size = 'md', layout = 'horizontal' }) => {
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

  return (
    <div className={cn(containerClass, className)}>
      <div className={cn("relative shrink-0", iconSizes[size])}>
        <img
          src="/logo.png"
          alt="Qless Logo"
          className="w-full h-full object-contain"
        />
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
