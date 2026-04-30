import React from 'react';
import { motion } from 'motion/react';
import { Map, User, Settings, HelpCircle } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { cn } from '../lib/utils';

interface BottomNavProps {
  activeTab: 'explore' | 'reservations' | 'account';
  onTabChange: (tab: 'explore' | 'reservations' | 'account') => void;
  unreadNotificationsCount?: number;
}

const CustomTicketIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    stroke="currentColor"
    strokeWidth="0.5"
  >
    <path d="M4 4.5A1.5 1.5 0 0 0 2.5 6v1.5a1.5 1.5 0 0 1 0 3V12h1.5v-1.5a1.5 1.5 0 0 1 0-3V6a1.5 1.5 0 0 0-1.5-1.5ZM1.5 12V13.5a1.5 1.5 0 0 0 0 3V18a1.5 1.5 0 0 0 1.5 1.5H21a1.5 1.5 0 0 0 1.5-1.5v-1.5a1.5 1.5 0 0 0 0-3V12H21v1.5a1.5 1.5 0 0 1 0 3V18a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 18v-1.5a1.5 1.5 0 0 1 0-3V12H1.5Zm21 0H21V10.5a1.5 1.5 0 0 1 0-3V6A1.5 1.5 0 0 0 19.5 4.5H4.5A1.5 1.5 0 0 0 3 6v1.5a1.5 1.5 0 0 1 0 3V12h1.5v-1.5a1.5 1.5 0 0 1 0-3V6a1.5 1.5 0 0 1 1.5-1.5h15a1.5 1.5 0 0 1 1.5 1.5v1.5a1.5 1.5 0 0 1 0 3V12h1.5ZM9 7h1v1.5H9V7Zm0 3.5h1v1.5H9v-1.5Zm0 3.5h1v1.5H9v-1.5Zm0 3.5h1V19H9v-1.5Zm5-10.5h1v1.5h-1V7Zm0 3.5h1v1.5h-1v-1.5Zm0 3.5h1v1.5h-1v-1.5Zm0 3.5h1V19h-1v-1.5Z" />
  </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, unreadNotificationsCount = 0 }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'explore', label: t('explore'), icon: Map },
    { id: 'reservations', label: t('tickets'), icon: CustomTicketIcon },
    { id: 'account', label: t('account'), icon: User },
  ] as const;

  return (
    <div dir="ltr" className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md p-[2px] rounded-[2.5rem] overflow-hidden z-[1000] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex items-center justify-center isolate">
      {/* Snake Border Gradient Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-[1000px] aspect-square bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,#3b82f6_90deg,#2563eb_120deg,transparent_180deg,transparent_240deg,#ef4444_270deg,#dc2626_300deg,transparent_360deg)] will-change-transform"
        />
      </div>
      
      {/* Outer Glow Layer */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-[1000px] aspect-square bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,#3b82f6_90deg,#2563eb_120deg,transparent_180deg,transparent_240deg,#ef4444_270deg,#dc2626_300deg,transparent_360deg)] blur-3xl opacity-30 will-change-transform"
        />
      </div>

      {/* Internal Content Container */}
      <div className="relative w-full h-full bg-white/95 dark:bg-gray-950/98 backdrop-blur-3xl rounded-[calc(2.5rem-2px)] px-4 py-3 flex justify-around items-center">
        {/* Active Indicator Background */}
        <div className="absolute inset-0 px-4 py-3 pointer-events-none flex justify-around items-center">
          {tabs.map((tab) => (
            <div key={tab.id} className="relative flex-1 flex justify-center">
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 w-full h-full bg-blue-600/10 dark:bg-blue-400/10 rounded-[2rem]"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </div>
          ))}
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button 
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 flex flex-col items-center gap-1 py-1 transition-all duration-500 z-10 focus:outline-none",
                isActive ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <motion.div 
                animate={isActive ? { y: -2, scale: 1.1 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={cn(
                  "p-2 rounded-2xl transition-all duration-500",
                  isActive ? "bg-blue-600 dark:bg-blue-500 text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]" : "bg-transparent"
                )}
              >
                <Icon className={cn("w-6 h-6", (isActive && tab.id !== 'reservations') && "fill-current")} />
                {tab.id === 'account' && unreadNotificationsCount > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-950">
                    <span className="text-[8px] font-black text-white">{unreadNotificationsCount}</span>
                  </div>
                )}
              </motion.div>
              <motion.span 
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.7, y: 0 }}
                className="text-[10px] font-black tracking-tight uppercase"
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
