import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Navigation, Share2, Bookmark, Star, Clock, Users, Ticket as TicketIcon, Check, Image as ImageIcon, Calendar } from 'lucide-react';
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
  const { t } = useLanguage();
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

  // Simulator for deterministic daily schedules based on date string and institution ID
  const dailySchedule = useMemo(() => {
    if (!institution) return { slots: [], isFull: false, count: 0 };
    
    // Quick string hash
    const hashStr = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash);
    };

    const hash = hashStr(selectedDateStr + institution.id);
    
    const daysDiff = getDaysDifference(selectedDateStr);
    const baseFill = Math.max(0, 50 - (daysDiff * 2)); // Closer days are fuller
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

  if (!institution) return null;

  const typeInfo = INSTITUTION_TYPES.find(t => t.type === institution.type);

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
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[1050]"
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
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.3)] z-[1100] max-h-[90vh] overflow-y-auto pb-24 border-t border-white/20 dark:border-gray-800"
          >
            <div className="sticky top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10 py-3">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto" />
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
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">{institution.name}</h2>
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

            {/* Date Selection Horizontal Picker */}
            <div className="px-6 mb-6">
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('selectDate') || 'Choisir une date'}</h3>
                 </div>
                 <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg">
                   <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                   <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('next30Days') || '30 proch. jours'}</span>
                 </div>
               </div>
               
               <div className="flex gap-3 overflow-x-auto no-scrollbar pb-3 -mx-2 px-2 snap-x">
                 {dates.map((date, i) => {
                   const dateStr = formatDateToYYYYMMDD(date);
                   const isSelected = selectedDateStr === dateStr;
                   
                   // Very lightweight hash to show red dot on some days
                   const dayHash = dailySchedule.count; // Wait, dailySchedule relies on selected date...
                   // We need a stable hash for each date
                   let hash = 0;
                   const dStr = dateStr + institution.id;
                   for (let j = 0; j < dStr.length; j++) {
                     hash = ((hash << 5) - hash) + dStr.charCodeAt(j);
                     hash |= 0;
                   }
                   hash = Math.abs(hash);
                   const isThisDayFull = (hash % 55) >= 50;
                   
                   return (
                     <button
                       key={dateStr}
                       onClick={() => {
                         setSelectedDate(date);
                         setSelectedDateStr(dateStr);
                       }}
                       className={cn(
                         "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all min-w-[70px] snap-start shrink-0 relative",
                         isSelected 
                           ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
                           : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-600"
                       )}
                     >
                       <span className={cn(
                         "text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 opacity-80"
                       )}>
                         {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                       </span>
                       <span className={cn(
                         "text-xl font-display font-black leading-none",
                       )}>
                         {date.getDate()}
                       </span>
                       <span className="text-[9px] font-bold mt-1 opacity-60">
                         {date.toLocaleDateString('fr-FR', { month: 'short' })}
                       </span>
                       
                       {isThisDayFull && (
                         <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white dark:border-gray-900 rounded-full" />
                       )}
                     </button>
                   );
                 })}
               </div>
            </div>

            {/* Daily Schedule List */}
            <div className="px-6 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">{t('schedule') || 'Planning du jour'}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-500">{dailySchedule.count}/50</span>
                    {dailySchedule.isFull && (
                      <span className="text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        {t('full') || 'Complet'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                  {dailySchedule.slots.map((slot) => {
                    const isSelected = selectedSlot === slot.position;
                    
                    if (slot.isOccupied) {
                      return (
                        <div key={slot.position} className={cn(
                          "flex items-center justify-between p-3 rounded-2xl border transition-all",
                          slot.isUser 
                            ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" 
                            : "bg-gray-50 dark:bg-gray-800/80 border-gray-100 dark:border-gray-800 opacity-60"
                        )}>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black",
                              slot.isUser ? "bg-purple-600 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            )}>
                              {slot.position}
                            </div>
                            <p className={cn("text-sm font-bold", slot.isUser ? "text-purple-700 dark:text-purple-300" : "text-gray-500 dark:text-gray-400 line-through decoration-gray-300 dark:decoration-gray-600")}>
                              {slot.name}
                            </p>
                          </div>
                          {!slot.isUser && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('reserved') || 'Réservé'}</span>
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
                            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 shadow-md shadow-blue-500/10" 
                            : "bg-white dark:bg-gray-800 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors",
                            isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                          )}>
                            {slot.position}
                          </div>
                          <p className={cn("text-sm font-bold transition-colors", isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400")}>
                            {isSelected ? (t('selected') || 'Sélectionné') : (t('available') || 'Disponible')}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Localized Success Animation */}
            <AnimatePresence>
              {isCutting && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -20 }}
                  className="absolute left-1/2 -translate-x-1/2 top-0 -translate-y-full mb-4 z-[1200]"
                >
                  <div className="bg-green-500 text-white px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 whitespace-nowrap">
                    <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <TicketIcon className="w-3 h-3" />
                      </motion.div>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider">{t('ticketTaken')}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          {(hasReservationOnSelectedDay || dailySchedule.isFull) && (
            <div className="space-y-3 mb-8">
              {hasReservationOnSelectedDay && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800/50 rounded-[2rem] flex flex-col items-center text-center gap-3"
                >
                  <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-2xl text-red-600 dark:text-red-400 mb-1">
                    <X className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-red-700 dark:text-red-400 leading-relaxed px-4">
                    {t('ticketLimitReached') || 'Vous avez déjà une réservation pour ce jour dans cet établissement.'}
                  </p>
                </motion.div>
              )}
              {dailySchedule.isFull && !hasReservationOnSelectedDay && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex justify-between items-center p-5 bg-red-50 dark:bg-red-900/20 rounded-3xl border border-red-100 dark:border-red-800/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl shadow-sm">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-0.5">{t('saturation')}</p>
                      <p className="text-sm font-bold text-red-900 dark:text-red-100">{t('full') || 'Complet'}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {!hasReservationOnSelectedDay && !dailySchedule.isFull && (
            <div className="mb-4">
              <motion.button 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleTakeTicket}
                disabled={isCutting || selectedSlot === null}
                className={cn(
                  "w-full py-5 rounded-[2rem] font-display font-bold text-lg shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group",
                  isCutting 
                    ? "bg-green-500 text-white shadow-green-500/30" 
                    : "bg-blue-600 text-white shadow-blue-500/30 hover:bg-blue-700",
                  (isCutting || selectedSlot === null) && "opacity-50 cursor-not-allowed bg-blue-400 dark:bg-blue-800"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative flex items-center justify-center gap-3">
                  <AnimatePresence mode="wait">
                    {isCutting ? (
                      <motion.div 
                        key="success"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                          <motion.div
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            className="w-3 h-3 border-r-2 border-b-2 border-white rotate-45 -mt-0.5"
                          />
                        </div>
                        {t('success')}
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="idle"
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-3"
                      >
                        <TicketIcon className="w-5 h-5" />
                        {selectedSlot !== null ? (
                          <span>{(t('takeTicket') || 'Prendre le ticket')} #{selectedSlot}</span>
                        ) : (
                          <span>{(t('takeTicket') || 'Prendre le ticket')}</span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </span>
              </motion.button>
              {selectedSlot === null && (
                <p className="text-center text-xs font-bold text-gray-500 mt-3">{t('pleaseSelectSlot') || 'Veuillez sélectionner une place disponible ci-dessus'}</p>
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
