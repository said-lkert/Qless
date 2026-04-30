import React from 'react';
import { Institution, INSTITUTION_TYPES, SECTORS, Sector, InstitutionType } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { Search, MapPin, Users, Clock, ChevronRight, ArrowLeft, Mail, Landmark, Shield, HeartPulse, Building, Wifi, Droplet, FileText, Briefcase, Smartphone, Zap, Calendar } from 'lucide-react';
import { cn, formatWaitTime } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const COMING_SOON_PUBLIC = [
  { id: 'POSTES', label: 'Postes (Algérie Poste)', icon: Mail, color: '#0284c7' },
  { id: 'MAIRIES', label: 'Mairies (APC)', icon: Building, color: '#16a34a' },
  { id: 'CNAS', label: 'CNAS', icon: HeartPulse, color: '#ea580c' },
  { id: 'CASNOS', label: 'CASNOS', icon: Shield, color: '#0f766e' },
  { id: 'CNR', label: 'CNR', icon: Landmark, color: '#4f46e5' },
  { id: 'TELECOM', label: 'Algérie Télécom', icon: Wifi, color: '#0369a1' },
  { id: 'POLY', label: 'Polycliniques', icon: HeartPulse, color: '#ef4444' },
  { id: 'ADE', label: 'ADE (Eau)', icon: Droplet, color: '#3b82f6' },
  { id: 'IMPOTS', label: 'Impôts', icon: FileText, color: '#9ca3af' },
  { id: 'ANEM', label: 'ANEM', icon: Briefcase, color: '#6366f1' },
  { id: 'MOBILIS', label: 'Mobilis', icon: Smartphone, color: '#10b981' },
  { id: 'DJEZZY', label: 'Djezzy', icon: Smartphone, color: '#dc2626' },
  { id: 'OOREDOO', label: 'Ooredoo', icon: Smartphone, color: '#ea580c' },
  { id: 'SONELGAZ', label: 'Sonelgaz', icon: Zap, color: '#f59e0b' },
];

interface ListViewProps {
  institutions: Institution[];
  onSelectInstitution: (inst: Institution) => void;
}

export const ListView: React.FC<ListViewProps> = ({ institutions, onSelectInstitution }) => {
  const { t } = useLanguage();
  const [selectedSector, setSelectedSector] = React.useState<Sector | null>(null);
  const [selectedType, setSelectedType] = React.useState<InstitutionType | null>(null);

  // Group stats for sectors
  const sectorStats = SECTORS.map(sector => ({
    ...sector,
    count: institutions.filter(inst => {
      const typeInfo = INSTITUTION_TYPES.find(t => t.type === inst.type);
      return typeInfo?.sector === sector.id;
    }).length
  }));

  // Get types for selected sector
  const availableTypes = selectedSector 
    ? INSTITUTION_TYPES.filter(it => it.sector === selectedSector)
    : [];

  const filteredList = selectedType 
    ? institutions.filter(i => i.type === selectedType)
    : selectedSector
      ? institutions.filter(inst => {
          const typeInfo = INSTITUTION_TYPES.find(t => t.type === inst.type);
          return typeInfo?.sector === selectedSector;
        })
      : [];

  return (
    <div className="absolute inset-0 pt-24 px-4 pb-40 bg-gray-50 dark:bg-gray-900 overflow-y-auto overflow-x-hidden transition-colors duration-300">
      <AnimatePresence mode="wait">
        {!selectedSector ? (
          <motion.div 
            key="sectors"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-3">{t('private' as any)}</h3>
              <div className="grid grid-cols-2 gap-2.5 pb-4">
                {sectorStats.map((stat) => (
                  <motion.button 
                    key={stat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSector(stat.id)}
                    className="p-5 rounded-3xl shadow-sm border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-3 transition-all hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-1" style={{ backgroundColor: stat.color }}>
                      <stat.icon className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter leading-tight">{t(stat.id as any)}</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{stat.count}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
               <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-2 mb-3">{t('public' as any)} (Coming Soon)</h3>
               <div className="grid grid-cols-2 gap-2.5 pb-4 opacity-60 grayscale filter">
                  {COMING_SOON_PUBLIC.map((pub) => (
                    <div 
                      key={pub.id}
                      className="p-5 rounded-3xl shadow-sm border bg-gray-50 dark:bg-gray-800/50 border-gray-100/50 dark:border-gray-800 flex flex-col items-center text-center gap-3 transition-all cursor-not-allowed"
                    >
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-inner mb-1" style={{ backgroundColor: pub.color, opacity: 0.8 }}>
                        <pub.icon className="w-7 h-7" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter leading-tight">{pub.label}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </motion.div>
        ) : !selectedType ? (
          <motion.div 
            key="types"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setSelectedSector(null)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold dark:text-white">
                {t(selectedSector)}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-8">
              {availableTypes.map((typeInfo) => {
                const count = institutions.filter(i => i.type === typeInfo.type).length;
                return (
                  <motion.button 
                    key={typeInfo.type}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedType(typeInfo.type)}
                    className="p-4 rounded-3xl shadow-sm border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 flex flex-col items-center text-center gap-2 transition-all hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm mb-1" style={{ backgroundColor: typeInfo.color }}>
                      <typeInfo.icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter leading-tight">{t(typeInfo.type as any)}</p>
                      <p className="text-lg font-black text-gray-900 dark:text-white">{count}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => setSelectedType(null)}
                className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-400 active:scale-90 transition-transform"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold dark:text-white">
                {t(selectedType)}
              </h3>
            </div>

            <div className="space-y-3 pb-8">
              {filteredList.length > 0 ? (
                filteredList.map((inst) => {
                  const typeInfo = INSTITUTION_TYPES.find(t => t.type === inst.type);
                  const isBooking = typeInfo && ['HEALTHCARE', 'SERVICES', 'TECHNOLOGY'].includes(typeInfo.sector);
                  const wait = inst.lastGivenTicket - inst.currentTicket;
                  
                  let saturationColor = '#22c55e'; // Green
                  if (wait >= 20) saturationColor = '#ef4444'; // Red
                  else if (wait >= 10) saturationColor = '#f97316'; // Orange
                  
                  return (
                    <button 
                      key={inst.id}
                      onClick={() => onSelectInstitution(inst)}
                      className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left relative overflow-hidden"
                    >
                      {!isBooking && <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: saturationColor }}></div>}
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ backgroundColor: typeInfo?.color }}>
                        {typeInfo && <typeInfo.icon className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 dark:text-white truncate">{inst.name}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{inst.address}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {!isBooking ? (
                            <>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{wait} {t('inWaiting')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-gray-400" />
                                <span className="text-[10px] font-bold text-gray-400">{formatWaitTime(wait * 4, t)}</span>
                              </div>
                              <div className="flex items-center gap-1 ml-auto">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: saturationColor }}></div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/40 px-2 py-0.5 rounded-md">
                              <Calendar className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                              <span className="text-[9px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-tighter">
                                {t('reserve')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">{t('noInstitutionsFound')}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
