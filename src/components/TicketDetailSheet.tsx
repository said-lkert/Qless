import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, MapPin, Heart, Users, Ticket as TicketIcon } from 'lucide-react';
import { Ticket, Institution, INSTITUTION_TYPES } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { QRCodeSVG } from 'qrcode.react';
import { cn, formatWaitTime } from '../lib/utils';

interface TicketDetailSheetProps {
  ticket: Ticket | null;
  institution: Institution | null;
  onClose: () => void;
  onDeleteTicket?: (id: string, silent?: boolean) => void;
  onPostpone?: (institution: Institution) => void;
}

const getQueueColor = (peopleAhead: number) => {
  if (peopleAhead < 10) return 'text-green-500';
  if (peopleAhead < 20) return 'text-orange-500';
  return 'text-red-500';
};
const getQueueBgColor = (peopleAhead: number) => {
  if (peopleAhead < 10) return 'bg-green-500';
  if (peopleAhead < 20) return 'bg-orange-500';
  return 'bg-red-500';
};

export const TicketDetailSheet: React.FC<TicketDetailSheetProps> = ({ 
  ticket, 
  institution, 
  onClose,
  onDeleteTicket,
  onPostpone
}) => {
  const { t, lang } = useLanguage();
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);
  
  // Reset confirmation when ticket changes
  React.useEffect(() => {
    setShowCancelConfirm(false);
  }, [ticket?.id]);

  // Format ID Ticket: ensure XX-X-X format by padding if needed
  const formatTicketId = (id: string) => {
    const cleanId = id.replace(/[^a-zA-Z0-9]/g, '');
    const part1 = (cleanId.substring(0, 2) || '00').toUpperCase();
    const part2 = (cleanId.substring(2, 3) || '0').toUpperCase();
    const part3 = (cleanId.substring(3, 4) || '0').toUpperCase();
    return `${part1}-${part2}-${part3}`;
  };

  const formattedTicketId = formatTicketId(ticket?.id || '');
  const peopleAhead = Math.max(0, ticket ? ticket.ticketNumber - (institution?.currentTicket || 0) : 0);
  const queueColor = getQueueColor(peopleAhead);
  const queueBgColor = getQueueBgColor(peopleAhead);

  if (!ticket || !institution) return null;

  const typeInfo = INSTITUTION_TYPES.find(ti => ti.type === institution.type);
  const isLiveTicket = !(['HEALTHCARE', 'SERVICES', 'TECHNOLOGY'].includes(typeInfo?.sector || ''));
  const estimatedTime = isLiveTicket ? peopleAhead * 4 : ticket.estimatedTime;

  const isExpired = isLiveTicket && (institution.currentTicket > parseInt(ticket.ticketNumber));

  const formattedDate = new Date(ticket.targetDate).toLocaleDateString(lang === 'ar' ? 'ar-DZ' : (lang === 'en' ? 'en-US' : 'fr-FR'), {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <AnimatePresence>
      {ticket && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2100]"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-950 rounded-t-[3rem] shadow-2xl z-[2200] max-h-[95vh] overflow-y-auto overflow-x-hidden pb-12"
          >
            <div className="sticky top-0 bg-white dark:bg-gray-950 z-[2210] py-4 border-b border-gray-100 dark:border-white/5">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center px-6">
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                   {isExpired ? t('ticketExpired') : (isLiveTicket ? t('yourLiveTicket') : t('yourReservation'))}
                </h2>
                <button 
                  onClick={onClose}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full"
                >
                  {isExpired ? (
                    <X className="w-5 h-5 text-red-500" />
                  ) : (
                    <X className="w-5 h-5 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 pt-0 space-y-3">
              {/* Premium Vertical Ticket Design - Refined Smaller & Purple */}
              <div className="relative w-full max-w-[240px] mx-auto bg-[#E9D5FF] dark:bg-purple-900/40 rounded-[2.2rem] shadow-[0_20px_50px_rgba(255,255,255,0.15)] border border-purple-200 dark:border-purple-600/50 pt-5 pb-7 px-5 flex flex-col items-center overflow-visible z-10">
                  {/* Top Perforated Edge */}
                <div className="absolute top-0 left-6 right-6 h-4 flex justify-between items-start -translate-y-1/2">
                   {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-3 h-3 bg-white rounded-full" />
                   ))}
                </div>

                {/* Institution Header */}
                <div className="w-full flex items-center gap-3 mb-4 relative z-10">
                  <div className="w-9 h-9 bg-white dark:bg-white/10 rounded-xl flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm border border-purple-100 dark:border-purple-800/10">
                    {typeInfo?.icon && <typeInfo.icon className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[12px] font-black text-gray-900 dark:text-white truncate leading-tight uppercase tracking-tight">
                      {institution.name}
                    </h2>
                    <p className="text-[7px] font-black text-purple-600/60 dark:text-purple-400 uppercase tracking-widest truncate">
                      {t(institution.type as any)}
                    </p>
                  </div>
                </div>

                {/* Perforated Divider with Side Cutouts */}
                <div className="w-full relative py-1.5 flex items-center justify-center mb-4">
                  <div className="absolute -left-[34px] w-7 h-7 rounded-full bg-white z-20" />
                  <div className="absolute -right-[34px] w-7 h-7 rounded-full bg-white z-20" />
                  <div className="w-full border-t border-dashed border-purple-300 dark:border-purple-800/50 relative z-10" />
                </div>

                {/* QR Section */}
                <div className="flex flex-col items-center w-full space-y-4 relative z-10">
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-white rounded-xl shadow-[0_10px_30px_rgba(153,0,255,0.06)] border border-purple-100"
                  >
                    <QRCodeSVG
                      value={JSON.stringify({ id: ticket.id, num: ticket.ticketNumber })}
                      size={135} 
                      level="H" 
                    />
                  </motion.div>

                  <div className="text-center space-y-2.5 w-full">
                    <div className="flex flex-col items-center py-1.5 border-t border-b border-purple-300/30 dark:border-purple-800/10">
                      <p className="text-gray-500 text-[9px] font-black uppercase tracking-[0.4em] mb-0.5">ID TICKET</p>
                      <p className="text-[18px] font-black font-mono text-gray-900 dark:text-white tracking-[0.2em] uppercase leading-none">
                        {formattedTicketId}
                      </p>
                    </div>
                    
                    <div className="px-3 py-1.5 bg-white/40 dark:bg-purple-900/20 rounded-xl border border-purple-200/50 dark:border-purple-800/10 inline-block">
                      <p className="text-[10px] font-black text-purple-700 dark:text-purple-400 uppercase tracking-widest leading-none">
                         Show this QR code when it's your turn
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ticket Number Section */}
                <div className="mt-4 text-center w-full pt-4 border-t border-purple-300/30 dark:border-purple-800/10 relative z-10">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-0.5">{t('yourNumber' as any)}</p>
                  <motion.p 
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl font-black text-purple-700 dark:text-purple-500 leading-none tracking-tighter"
                  >
                    #{ticket.ticketNumber}
                  </motion.p>
                </div>

                {/* Bottom Perforated Edge */}
                <div className="absolute bottom-0 left-6 right-6 h-4 flex justify-between items-end translate-y-1/2">
                   {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-3 h-3 bg-white rounded-full" />
                   ))}
                </div>
              </div>

            {/* Redesigned Status Info */}
              {isLiveTicket ? (
                <div className="space-y-3">
                  <div className="bg-gray-50/50 dark:bg-white/5 rounded-[1.75rem] p-4 border border-gray-100 dark:border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    
                    <div className="flex flex-col items-center relative z-10">
                      <div className="flex items-center gap-2 mb-2 bg-blue-600/10 px-3 py-1 rounded-full">
                         <div className={`w-2 h-2 rounded-full ${queueBgColor} animate-pulse`} />
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">
                            {t('currentTicketInLine')}
                         </span>
                      </div>
                      
                      <div className="flex items-end gap-1 mb-4">
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.span 
                            key={institution.currentTicket}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            className="text-7xl font-black text-gray-900 dark:text-white tracking-tighter leading-none"
                          >
                            {institution.currentTicket}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      <div className="w-full space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                        {/* Saturation Card (People Ahead) */}
                        <div className="bg-white dark:bg-white/5 p-4 rounded-[1.75rem] border border-gray-100 dark:border-white/5 flex items-center gap-2">
                          <div className={`w-10 h-10 ${queueBgColor}/10 rounded-2xl flex items-center justify-center ${queueColor} shrink-0`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-gray-900 dark:text-white leading-tight mb-0.5 uppercase tracking-widest">Saturation</p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${queueColor} opacity-80`}>
                              {peopleAhead < 10 ? 'Faible' : (peopleAhead < 20 ? 'Moyenne' : 'Élevée')}
                            </p>
                          </div>
                          <div className={`px-4 py-2 ${queueBgColor}/10 rounded-[1.2rem] shrink-0 ml-auto flex flex-col items-center justify-center min-w-[100px]`}>
                            <p className={`text-[16px] font-black uppercase tracking-tight ${queueColor} leading-none mb-1`}>
                              {peopleAhead}
                            </p>
                            <p className={`text-[9px] font-black uppercase tracking-widest ${queueColor} opacity-100 leading-tight text-center`}>
                               {t('aheadOfYou')}
                            </p>
                          </div>
                        </div>

                        {/* Estimated Time Card */}
                        <div className="bg-white dark:bg-white/5 p-4 rounded-[1.75rem] border border-gray-100 dark:border-white/5 flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">{t('estimatedWait' as any)}</p>
                            <p className={`text-xl font-black ${queueColor} tracking-tight leading-none`}>
                              {formatWaitTime(estimatedTime, t)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-white/5 p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Calendar className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t('dateLabel' as any)}</span>
                    </div>
                    <p className="text-xs font-black text-gray-900 dark:text-white leading-tight capitalize">{formattedDate}</p>
                  </div>

                  <div className="bg-white dark:bg-white/5 p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{t('timeRemaining' as any)}</span>
                    </div>
                    <p className="text-xs font-black text-gray-900 dark:text-white">{formatWaitTime(estimatedTime, t)}</p>
                  </div>
                </div>
              )}

            {/* Addressing Action Buttons */}
            {isExpired ? (
              <div className="flex justify-center px-6">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTicket?.(ticket.id, true);
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gray-100 dark:bg-white/5 text-gray-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 border border-gray-200 dark:border-white/10"
                >
                  <X className="w-4 h-4" />
                  {t('clearExpiredTicket' as any) || 'Effacer le ticket expiré'}
                </button>
              </div>
            ) : !isLiveTicket && (
               <div className="px-6 space-y-3">
                  {/* NEW CANCEL BUTTON DESIGN */}
                  {!showCancelConfirm ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          className="flex justify-center items-center py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
                        >
                          {t('cancelMyReservation')}
                        </button>
                        <button
                          onClick={() => onPostpone?.(institution)}
                          className="flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 active:scale-95 group overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                          <span className="relative z-10">{t('postpone')}</span>
                        </button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-500 rounded-[2.5rem] space-y-4"
                    >
                      <div className="p-3 bg-red-500/10 rounded-full w-fit mx-auto">
                        <X className="w-6 h-6 text-red-500" />
                      </div>
                      <p className="text-center text-sm font-black text-red-600 dark:text-red-400">
                        {t('cancelReservationConfirm')}
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setShowCancelConfirm(false)}
                          className="py-3 bg-white dark:bg-gray-800 text-gray-500 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 border border-gray-100 dark:border-gray-700"
                        >
                          {t('cancel')}
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTicket?.(ticket.id);
                            onClose();
                          }}
                          className="py-3 bg-red-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/25"
                        >
                          {t('confirmCancel')}
                        </button>
                      </div>
                    </motion.div>
                  )}
               </div>
            )}

              {/* Address & Directions */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-white/5 p-6 rounded-[2.5rem] border border-gray-100 dark:border-white/5 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">{t('location' as any)}</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white leading-tight mb-0.5 truncate">{institution.name}</p>
                    <p className="text-xs font-bold text-gray-400 truncate">
                      {institution.address || `${institution.commune}, ${institution.wilaya}`}
                    </p>
                  </div>
                  <button 
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${institution.lat},${institution.lng}`, '_blank')}
                    className="ml-auto px-4 py-2 bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800/50 rounded-2xl text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest transition-all shadow-sm active:scale-95"
                  >
                    {t('directions')}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
