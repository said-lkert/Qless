import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, Share2, Bookmark, Star, Clock, Users, Ticket as TicketIcon, Check, Image as ImageIcon, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Institution, INSTITUTION_TYPES, Ticket } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { cn, formatWaitTime, generateAvailabilityDates, formatDateToYYYYMMDD, getDaysDifference, calculateEstimatedWaitTime } from '../lib/utils';

import { QRCodeSVG } from 'qrcode.react';

interface DetailsSheetProps {
  institution: Institution | null;
  onClose: () => void;
  onTakeTicket: (inst: Institution) => void;
  userTickets?: Ticket[];
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export const DetailsSheet: React.FC<DetailsSheetProps> = ({ 
  institution, 
  onClose, 
  onTakeTicket, 
  userTickets = [],
  isSaved,
  onToggleSave
}) => {
  const { t, lang } = useLanguage();
  const [isCutting, setIsCutting] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [copied, setCopied] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date>(() => generateAvailabilityDates()[0]);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => formatDateToYYYYMMDD(generateAvailabilityDates()[0]));
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  useEffect(() => {
    if (institution) {
      setIsCutting(false);
      setShowLimitWarning(false);
      setCopied(false);
      // reset date on new institution load
      const firstDate = generateAvailabilityDates()[0];
      setSelectedDate(firstDate);
      setSelectedDateStr(formatDateToYYYYMMDD(firstDate));
      setSelectedSlot(null);
    }
  }, [institution?.id]);

  // Reset selected slot when changing dates
  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDateStr]);

  const dates = useMemo(() => generateAvailabilityDates(), []);

  // Quick string hash
  const hashStr = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  // Simulator for deterministic daily schedules based on date string and institution ID
  const dailySchedule = useMemo(() => {
    if (!institution) return { slots: [], isFull: false, count: 0 };
    
    const hash = hashStr(selectedDateStr + institution.id);
    
    const daysDiff = getDaysDifference(selectedDateStr);
    const baseFill = Math.max(5, Math.floor(48 - (daysDiff * 0.75))); // Closer days are fuller
    const randomVariance = (hash % 15) - 5; 
    const count = Math.min(50, Math.max(0, Math.floor(baseFill + randomVariance)));
    
    // Add real user tickets if they exist for this day
    const userTicketsForDay = userTickets.filter(t => t.institutionId === institution.id && t.targetDate === selectedDateStr);
    
    // Initialize 50 empty slots
    const slots = Array.from({ length: 50 }).map((_, i) => ({
      position: i + 1,
      isOccupied: false,
      name: null as string | null,
      isUser: false,
    }));

    const mockNames = ['Lilia Benali', 'Amine Kadi', 'Sarah Mansouri', 'Karim Djebbar', 'Ines Rahoual', 'Youcef Taleb', 'Lydia Atmani', 'Rayen Saidi', 'Aya Hammadou', 'Younes Meziane', 'Sofiane Bougherra', 'Rayan Mahrez', 'Manel Haddad', 'Nassim Belkacem', 'Idir Ziani'];

    // Occupy slots randomly based on count, using the hash as a seed
    let spotsToFill = count;
    let seed = hash;
    while(spotsToFill > 0) {
      // simple pseudo random
      seed = (seed * 9301 + 49297) % 233280;
      const index = Math.floor((seed / 233280) * 50);
      
      if (!slots[index].isOccupied) {
        slots[index].isOccupied = true;
        slots[index].name = mockNames[(seed + index) % mockNames.length];
        spotsToFill--;
      }
    }

    // Override with user's actual tickets
    userTicketsForDay.forEach(t => {
      const pos = parseInt(t.ticketNumber) - 1;
      if (pos >= 0 && pos < 50) {
        slots[pos].isOccupied = true;
        slots[pos].name = t.userFullName || 'Vous';
        slots[pos].isUser = true;
      }
    });

    const isFull = slots.filter(s => s.isOccupied).length >= 50;

    return { 
      slots,
      count: slots.filter(s => s.isOccupied).length,
      isFull 
    };
  }, [institution?.id, selectedDateStr, selectedDate, userTickets]);

  // Ensure only 1 reservation per DAY per institution for the current user
  const hasReservationOnSelectedDay = userTickets.some(t => t.institutionId === institution?.id && t.targetDate === selectedDateStr);

  const handleTakeTicket = () => {
    if (!institution || selectedSlot === null) return;
    
    if (hasReservationOnSelectedDay || dailySchedule.isFull) {
      return;
    }

    setIsCutting(true);
    // Send selected date explicitly to parent component
    setTimeout(() => {
      // Create a temporary mock property passing the selected date
      (institution as any)._targetDate = selectedDateStr;
      (institution as any)._queuePosition = selectedSlot;
      onTakeTicket(institution);
    }, 1200); 
  };

  const handleShare = async () => {
    if (!institution) return;
    
    const shareData = {
      title: 'Qless - ' + institution.name,
      text: t('shareText').replace('{name}', institution.name),
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to copy
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (copyErr) {
        console.error('Copy failed:', copyErr);
      }
    }
  };

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0=Sun, 1=Mon, ..., 6=Sat)
    // We want Mon=1, ..., Sun=7 (or 0)
    let startDay = firstDay.getDay(); 
    if (startDay === 0) startDay = 7; // Convert Sun to 7
    
    const days = [];
    
    // Padding from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i > 0; i--) {
      days.push({ 
        date: new Date(year, month - 1, prevMonthLastDay - i + 1), 
        currentMonth: false 
      });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ 
        date: new Date(year, month, i), 
        currentMonth: true 
      });
    }
    
    // Next month padding
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({ 
        date: new Date(year, month + 1, i), 
        currentMonth: false 
      });
    }
    
    return days;
  }, [currentMonth]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isFriday = (date: Date) => date.getDay() === 5;
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  const isTodayOrPast = (date: Date) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return date <= today;
  };

  const isMoreThanTwoMonthsAway = (date: Date) => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 60);
    return date > maxDate;
  };

  if (!institution) return null;

  const typeInfo = INSTITUTION_TYPES.find(t => t.type === institution.type);
  const isBookingSector = typeInfo && ['HEALTHCARE', 'SERVICES', 'TECHNOLOGY'].includes(typeInfo.sector);
  const peopleAhead = institution.lastGivenTicket - institution.currentTicket;
  const estimatedTime = peopleAhead * 4;

  return (
    <AnimatePresence>
      {institution && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-[8px] z-[1050]"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 32, 
              stiffness: 300,
              mass: 1,
              restDelta: 0.5
            }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black rounded-t-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] z-[1100] max-h-[96vh] overflow-y-auto pb-24 border-t border-white/10 dark:border-white/5"
          >
            <div className="sticky top-0 left-0 right-0 bg-white/80 dark:bg-black/90 backdrop-blur-md z-10 py-3">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-white/10 rounded-full mx-auto" />
            </div>

            {/* Photos Gallery */}
            {institution.photos && institution.photos.length > 0 && (
              <div className="px-6 mb-6">
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                  {institution.photos.map((photo, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative min-w-[280px] h-48 rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800"
                    >
                      <img 
                        src={photo} 
                        alt={`${institution.name} ${i}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  ))}
                  {institution.photos.length === 1 && (
                    <div className="min-w-[100px] h-48 rounded-3xl bg-gray-50 dark:bg-gray-800 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-100 dark:border-gray-800">
                      <ImageIcon className="w-8 h-8 text-gray-300" />
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none px-4 text-center">{t('morePhotosPending')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="px-6 pt-2">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-start mb-6"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{institution.name}</h2>
                {isFriday(new Date()) ? (
                  <div className="bg-red-50/50 dark:bg-red-900/40 px-3 py-1.5 rounded-full mt-1 shrink-0">
                    <span className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest">{t('closed' as any) || 'Fermé'}</span>
                  </div>
                ) : (
                  <div className="bg-green-50/50 dark:bg-green-900/40 px-3 py-1.5 rounded-full mt-1 shrink-0">
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">{t('open' as any)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-yellow-400/10 dark:bg-yellow-400/5 px-2 py-0.5 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  <span className="text-sm font-black text-yellow-700 dark:text-yellow-500">{institution.rating}</span>
                </div>
                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 tracking-wide uppercase">({institution.reviewsCount} {t('reviews') || 'avis'})</span>
                <div className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">{t(institution.type as any)}</span>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-90"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex gap-4 mb-8 overflow-x-auto no-scrollbar pb-2"
          >
            <button 
              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${institution.lat},${institution.lng}`)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30 group-hover:bg-blue-700 group-hover:-translate-y-1 transition-all active:scale-90">
                <Navigation className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('directions')}</span>
            </button>
            <button 
              onClick={() => onToggleSave(institution.id)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "p-4 rounded-2xl border-2 transition-all active:scale-90 group-hover:-translate-y-1 shadow-sm",
                isSaved 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 shadow-blue-500/10" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800"
              )}>
                <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('save')}</span>
            </button>
            <button 
              onClick={handleShare}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={cn(
                "p-4 rounded-2xl border-2 transition-all active:scale-90 group-hover:-translate-y-1 shadow-sm",
                copied 
                  ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 shadow-green-500/10" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-800"
              )}>
                {copied ? <Check className="w-6 h-6" /> : <Share2 className="w-6 h-6" />}
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {copied ? t('copied') || 'Copié !' : t('share')}
              </span>
            </button>
          </motion.div>
        </div>

            {/* Conditional Content based on Sector */}
            {isBookingSector ? (
              <div className="px-6">                  {/* Month Calendar UI */}
                  <div className="bg-white dark:bg-[#1c1c1e] text-gray-900 dark:text-white rounded-[2rem] shadow-xl dark:shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col p-5 mx-2 mt-2 font-sans">
                    {/* Month Picker Header */}
                    <div className="flex justify-between items-center mb-6 relative">
                      {/* Decorative top bar like the image */}
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-indigo-500 rounded-b-xl opacity-80"></div>
                      
                      <button 
                        onClick={() => changeMonth(-1)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-lg font-medium tracking-wide">
                        {currentMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                      <button 
                        onClick={() => changeMonth(1)}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-all active:scale-90 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="px-1 pb-1">
                      <div className="grid grid-cols-7 gap-y-3 gap-x-2 mb-4">
                        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, idx) => (
                          <div key={idx} className="text-center text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{day}</div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-y-3 gap-x-1">
                        {calendarDays.map((day, i) => {
                          const dateStr = formatDateToYYYYMMDD(day.date);
                          const isSelected = selectedDateStr === dateStr;
                          const hasUserReservation = userTickets.some(t => t.institutionId === institution.id && t.targetDate === dateStr);
                          const disabled = !day.currentMonth || isTodayOrPast(day.date) || isMoreThanTwoMonthsAway(day.date);
                          const friday = isFriday(day.date);
                          const today = isToday(day.date);
                          const isPast = isTodayOrPast(day.date) && !today;
                          
                          // Check if full (simulation)
                          const hashForFull = hashStr(dateStr + institution.id);
                          const daysDiffForFull = getDaysDifference(dateStr);
                          const baseFillForFull = Math.max(5, Math.floor(48 - (daysDiffForFull * 0.75)));
                          const randomVarianceForFull = (hashForFull % 15) - 5; 
                          const simulatedCount = Math.min(50, Math.max(0, Math.floor(baseFillForFull + randomVarianceForFull)));
                          
                          const isDayFull = simulatedCount >= 50;
                          
                          return (
                            <div key={i} className="relative flex flex-col items-center justify-start group h-10">
                              <button
                                disabled={disabled || friday || isDayFull || hasUserReservation}
                                onClick={() => {
                                  setSelectedDate(day.date);
                                  setSelectedDateStr(dateStr);
                                }}
                                className={cn(
                                  "w-9 h-9 rounded-full flex items-center justify-center text-[15px] font-medium transition-all relative z-10",
                                  isSelected ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/40" : 
                                  hasUserReservation ? "bg-purple-600 text-white shadow-md shadow-purple-500/40" :
                                  today ? "ring-1 ring-gray-300 dark:ring-white/20 text-gray-900 dark:text-white/90 font-bold" :
                                  isPast ? "text-gray-300 dark:text-gray-700 opacity-40 cursor-default" :
                                  !day.currentMonth ? "text-gray-100 dark:text-gray-900 opacity-[0.05]" :
                                  disabled && !hasUserReservation && !friday && !isDayFull ? "text-gray-400 dark:text-gray-600 opacity-40 cursor-not-allowed" :
                                  (friday || isDayFull) ? "text-red-500 dark:text-red-400 opacity-90" :
                                  "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 disabled:hover:bg-transparent"
                                )}
                              >
                                {day.date.getDate()}
                              </button>
                              
                              {/* Status Labels below the date */}
                              {day.currentMonth && !isTodayOrPast(day.date) && (
                                <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap z-20 pointer-events-none">
                                  {hasUserReservation ? (
                                    <span className="text-[9px] font-bold text-purple-600 dark:text-purple-400 tracking-tight uppercase">{t('reserved')}</span>
                                  ) : friday ? (
                                    <span className="text-[9px] font-bold text-red-500 tracking-tight uppercase">{t('closed')}</span>
                                  ) : isDayFull ? (
                                    <span className="text-[9px] font-bold text-red-500 tracking-tight uppercase">{t('full')}</span>
                                  ) : null}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Planning Header */}
                  <div className="px-6 pt-8 pb-2 flex justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="text-sm font-black dark:text-white uppercase tracking-widest opacity-40 mb-1">{t('schedule') || 'Planning du jour'}</h3>
                        <span className="text-xs font-bold text-gray-500">{selectedDate.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : (lang === 'en' ? 'en-US' : 'fr-FR'), { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-full">
                         <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-tighter">{dailySchedule.count}/50 {t('occupied').toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Planning Content */}
                    <div className="p-4 px-6 pb-8">
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                        {dailySchedule.slots.map((slot) => {
                          const isSelected = selectedSlot === slot.position;
                          
                          if (slot.isOccupied) {
                            return (
                              <div key={slot.position} className={cn(
                                "flex items-center justify-between p-3 rounded-2xl border transition-all",
                                slot.isUser 
                                  ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" 
                                  : "bg-gray-100 dark:bg-white/[0.03] border-transparent opacity-60"
                              )}>
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                                    slot.isUser ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-white/10 text-gray-500"
                                  )}>
                                    {slot.position}
                                  </div>
                                  <p className={cn("text-sm font-bold", slot.isUser ? "text-purple-700 dark:text-purple-300" : "text-gray-400 dark:text-gray-500")}>
                                    {slot.isUser ? slot.name : (t('reserved') || 'Réservé')}
                                  </p>
                                </div>
                                {!slot.isUser && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('occupied')}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <button 
                              key={slot.position} 
                              onClick={() => setSelectedSlot(slot.position)}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-2xl border-2 transition-all active:scale-[0.98]",
                                isSelected 
                                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20" 
                                  : "bg-white dark:bg-white/5 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors",
                                  isSelected ? "bg-white text-blue-600" : "bg-gray-100 dark:bg-white/10 text-gray-500"
                                )}>
                                  {slot.position}
                                </div>
                                <p className={cn("text-sm font-bold transition-colors", isSelected ? "text-white" : "text-gray-600 dark:text-gray-400")}>
                                  {isSelected ? (t('selected') || 'Sélectionné') : (t('available') || 'Disponible')}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-white text-blue-600 flex items-center justify-center">
                                  <Check className="w-3 h-3" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                </div>
              ) : (
              /* RESTORED Old System: Live Queue UI from Screenshot */
              <div className="px-6 mb-8 space-y-4">
                {/* Main Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-6 border border-blue-100 dark:border-blue-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <TicketIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest leading-none">{t('currentTicketInLine')}</span>
                    </div>
                    <div className="overflow-hidden h-14">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.h4 
                          key={institution.currentTicket}
                          initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                          exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="text-5xl font-black text-blue-700 dark:text-blue-400 leading-none"
                        >
                          {institution.currentTicket}
                        </motion.h4>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-white/[0.03] rounded-[2rem] p-6 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest leading-none">{t('nextTicket')}</span>
                    </div>
                    <div className="overflow-hidden h-14">
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.h4 
                          key={institution.lastGivenTicket}
                          initial={{ y: 40, opacity: 0, filter: 'blur(10px)' }}
                          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                          exit={{ y: -40, opacity: 0, filter: 'blur(10px)' }}
                          transition={{ type: "spring", stiffness: 400, damping: 25 }}
                          className="text-5xl font-black text-gray-900 dark:text-white leading-none"
                        >
                          {institution.lastGivenTicket + 1}
                        </motion.h4>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Additional Info Rows */}
                <div className="space-y-3">
                  <div className="bg-white dark:bg-white/5 p-4 py-5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-2xl",
                        (institution.lastGivenTicket - institution.currentTicket) < 10 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                        (institution.lastGivenTicket - institution.currentTicket) < 25 ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600" :
                        "bg-red-50 dark:bg-red-900/20 text-red-600"
                      )}>
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white">{t('saturation' as any)}</p>
                        <p className="text-[11px] font-bold text-gray-400">
                          {(institution.lastGivenTicket - institution.currentTicket) < 10 ? t('low' as any) :
                           (institution.lastGivenTicket - institution.currentTicket) < 25 ? t('medium' as any) : t('high' as any)}
                        </p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1.5 rounded-full",
                      (institution.lastGivenTicket - institution.currentTicket) < 10 ? "bg-green-50 dark:bg-green-900/20 text-green-600" :
                      (institution.lastGivenTicket - institution.currentTicket) < 25 ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600" :
                      "bg-red-50 dark:bg-red-900/20 text-red-600"
                    )}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.span 
                          key={institution.lastGivenTicket - institution.currentTicket}
                          initial={{ opacity: 0, x: 20, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                          exit={{ opacity: 0, x: -20, filter: 'blur(4px)' }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          className="text-[11px] font-black uppercase inline-block whitespace-nowrap"
                        >
                          {institution.lastGivenTicket - institution.currentTicket} {t('ticketsCount' as any)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-4 py-5 rounded-[1.5rem] border border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl text-blue-600">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('estimatedTime' as any)}</p>
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.p 
                            key={estimatedTime}
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5"
                          >
                            {formatWaitTime(estimatedTime, t)}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Sticky Take Ticket Button Container */}
            <AnimatePresence>
              {selectedSlot !== null && !isCutting && !hasReservationOnSelectedDay && !dailySchedule.isFull && (
                <motion.div 
                  initial={{ y: 100, scale: 0.8, opacity: 0 }}
                  animate={{ y: 0, scale: 1, opacity: 1 }}
                  exit={{ y: 100, scale: 0.8, opacity: 0 }}
                  transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  className="fixed bottom-8 left-0 right-0 px-8 z-[2300] pointer-events-none"
                >
                  <div className="max-w-xs mx-auto pointer-events-auto">
                    <button 
                      onClick={handleTakeTicket}
                      className="w-full py-3.5 relative overflow-hidden rounded-full font-black text-sm bg-blue-600 dark:bg-blue-500 text-white shadow-[0_20px_50px_rgba(37,99,235,0.4)] flex flex-col items-center justify-center gap-0.5 active:scale-90 transition-all group overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                      <div className="flex items-center gap-2 relative z-10">
                        <TicketIcon className="w-4 h-4" />
                        <span className="uppercase tracking-[0.2em]">
                          {t('confirmPlace' as any)} #{selectedSlot}
                        </span>
                      </div>
                      <span className="text-[8px] font-black opacity-60 uppercase tracking-[0.2em] relative z-10">
                        {selectedDate.toLocaleDateString(lang === 'ar' ? 'ar-DZ' : (lang === 'en' ? 'en-US' : 'fr-FR'), { day: 'numeric', month: 'short' })}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation & Limits */}
            <div className="px-6 relative">
              <AnimatePresence>
                {isCutting && (
                  <motion.div 
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[2500]"
                  >
                    <div className="bg-gray-900/95 dark:bg-white text-white dark:text-gray-900 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 whitespace-nowrap border border-white/10 backdrop-blur-md">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md shadow-green-500/20">
                        <Check className="w-3.5 h-3.5" strokeWidth={3} />
                      </div>
                      <span className="text-sm font-bold tracking-wide">{t('ticketTaken')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isBookingSector && (hasReservationOnSelectedDay || dailySchedule.isFull) && (
                <div className="mb-6">
                  {hasReservationOnSelectedDay && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-[2rem] flex flex-col items-center text-center gap-3"
                    >
                      <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl text-red-600 dark:text-red-400">
                        <X className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">
                        {t('ticketLimitReached') || 'Vous avez déjà une réservation pour ce jour.'}
                      </p>
                    </motion.div>
                  )}
                </div>
              )}

              {/* Take Ticket Button (Non-Booking) */}
              {!isBookingSector && (
                 <div className="mb-4">
                    {isFriday(new Date()) ? (
                      <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-[2rem] flex flex-col items-center text-center gap-3 mt-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl text-red-600 dark:text-red-400">
                          <X className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-widest">
                          {t('closed' as any) || 'Fermé'}
                        </p>
                      </div>
                    ) : (
                      <>
                        <motion.button 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            setIsCutting(true);
                            setTimeout(() => {
                              const todayStr = formatDateToYYYYMMDD(new Date());
                              (institution as any)._targetDate = todayStr;
                              (institution as any)._queuePosition = institution.lastGivenTicket + 1;
                              onTakeTicket(institution);
                            }, 1200);
                          }}
                          disabled={isCutting}
                          className={cn(
                            "w-full py-6 rounded-[2rem] font-display font-black text-xl shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group",
                            isCutting 
                              ? "bg-green-500 text-white" 
                              : "bg-blue-600 text-white shadow-blue-500/40 hover:bg-blue-700"
                          )}
                        >
                          <span className="relative z-10 flex items-center justify-center gap-3">
                            {isCutting ? (
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <TicketIcon className="w-6 h-6" />
                                <span>{t('takeTicket' as any) || "Prendre un ticket"}</span>
                              </>
                            )}
                          </span>
                        </motion.button>
                        <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">{t('liveQueueSystemDesc' as any) || "Système de file d'attente en direct"}</p>
                      </>
                    )}
                 </div>
              )}
            </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
  );
};
