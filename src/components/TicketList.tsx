import React from 'react';
import { Ticket, Institution, INSTITUTION_TYPES } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { Clock, MapPin, ChevronRight, Users, Trash2, X, Calendar } from 'lucide-react';
import { cn, formatWaitTime } from '../lib/utils';
import { mockInstitutions } from '../data/mockData';

interface TicketListProps {
  tickets: Ticket[];
  institutions: Institution[];
  onSelectTicket: (ticket: Ticket) => void;
  onDeleteTicket?: (ticketId: string, silent?: boolean) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ tickets, institutions, onSelectTicket, onDeleteTicket }) => {
  const { t } = useLanguage();

  return (
    <div className="p-6 pb-40 space-y-4">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{t('tickets')}</h2>
        <p className="text-gray-500 dark:text-gray-400 font-bold text-sm mt-1">{t('subtitle' as any)}</p>
      </div>
      
      {tickets.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-900 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
          <p className="text-gray-400 dark:text-gray-500 font-bold">{t('noActiveTickets')}</p>
        </div>
      ) : (
        tickets.map((ticket) => {
          const inst = institutions.find(i => i.id === ticket.institutionId);
          const typeInfo = INSTITUTION_TYPES.find(ti => ti.type === inst?.type);
          const Icon = typeInfo?.icon || Clock;
          const isLiveTicket = !(['HEALTHCARE', 'SERVICES', 'TECHNOLOGY'].includes(typeInfo?.sector || ''));
          
          const todayDate = new Date();
          todayDate.setHours(0,0,0,0);
          
          const ticketDate = new Date(ticket.targetDate);
          ticketDate.setHours(0,0,0,0);

          const userTicketNum = parseInt(ticket.ticketNumber);
          const wait = Math.max(0, userTicketNum - (inst?.currentTicket || 0));
          const estimatedTime = wait * 4;
          
          let status: 'waiting' | 'completed' | 'expired' = 'waiting';
          
          const isToday = ticketDate.getTime() === todayDate.getTime();
          const isPast = ticketDate.getTime() < todayDate.getTime();

          if (isPast) {
            status = 'expired';
          } else if (isToday && isLiveTicket && userTicketNum < (inst?.currentTicket || 0)) {
            status = 'expired';
          }
          
          const canDelete = status === 'expired' || true;
          
          const formattedDate = ticketDate.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });

          return (
            <div 
              key={ticket.id} 
              onClick={() => onSelectTicket(ticket)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectTicket(ticket);
                }
              }}
              className="w-full bg-white dark:bg-gray-800 rounded-[2rem] p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left group active:scale-[0.98] focus:outline-none cursor-pointer relative overflow-hidden"
            >
              {/* Delete Button (X) - Only works when expired */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (status === 'expired') {
                    onDeleteTicket?.(ticket.id, true);
                  }
                }}
                className={cn(
                  "absolute top-4 right-4 p-2 rounded-xl transition-all z-20",
                  status === 'expired' 
                    ? "bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-90" 
                    : "bg-gray-50 dark:bg-gray-700/50 text-gray-300 dark:text-gray-600 cursor-not-allowed"
                )}
              >
                <X className="w-4 h-4" />
              </button>
              <div 
                className={cn(
                  "w-20 h-20 rounded-[1.5rem] flex flex-col items-center justify-center text-white relative shadow-xl transition-opacity",
                  status === 'expired' && "opacity-40 grayscale-[0.5]"
                )}
                style={{ backgroundColor: typeInfo?.color || '#3b82f6' }}
              >
                <span className="text-[10px] font-black uppercase opacity-60 leading-none mb-1">N°</span>
                <span className="text-3xl font-black tracking-tighter leading-none">{ticket.ticketNumber}</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 dark:border-gray-800">
                  <Icon className="w-5 h-5" style={{ color: typeInfo?.color || '#3b82f6' }} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={cn(
                  "font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate leading-tight mb-1",
                  status === 'expired' && "text-gray-400 dark:text-gray-600"
                )}>
                  {ticket.institutionName}
                </h3>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-black tracking-widest uppercase">{formattedDate}</span>
                  </div>
                  
                  {status !== 'expired' ? (
                    <>
                      {isLiveTicket && (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="text-xs font-bold">{formatWaitTime(estimatedTime, t)} d'attente</span>
                        </div>
                      )}
                      <div className={cn(
                        "flex items-center gap-2",
                        wait > 25 ? "text-red-500" : wait > 10 ? "text-orange-500" : "text-green-500"
                      )}>
                        {isLiveTicket ? <Users className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span className="text-xs font-black uppercase tracking-wider">
                          {isLiveTicket ? (wait > 0 ? `${wait} ${t('beforeYou')}` : t('yourTurn')) : 'Réservation Active'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                      <Clock className="w-3.5 h-3.5 opacity-50" />
                      <span className="text-xs font-bold">{t('passed')}</span>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-2">
                   <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                    status === 'waiting' && (isLiveTicket ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"),
                    status === 'expired' && "bg-red-50 text-red-400 dark:bg-red-900/20 dark:text-red-500/80"
                  )}>
                    {isLiveTicket ? t(status as any) : 'Réserve'}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                  <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
