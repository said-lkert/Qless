import React, { useState, useMemo } from 'react';
import { MapView } from './components/MapView';
import { SearchHeader } from './components/SearchHeader';
import { BottomNav } from './components/BottomNav';
import { DetailsSheet } from './components/DetailsSheet';
import { TicketList } from './components/TicketList';
import { AccountCenter } from './components/AccountCenter';
import { ListView } from './components/ListView';
import { Onboarding } from './components/Onboarding';
import { mockInstitutions } from './data/mockData';
import { Institution, Ticket, INSTITUTION_TYPES, WILAYAS, WILAYA_COMMUNES, SECTORS, Sector, InstitutionType } from './types';
import { useLanguage } from './hooks/useLanguage';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, ChevronDown, MapPin, Navigation, Clock } from 'lucide-react';
import { cn, calculateDistance, formatDistance, calculateEstimatedWaitTime } from './lib/utils';

export default function App() {
  const { t, lang } = useLanguage();
  const [activeTab, setActiveTab] = useState<'explore' | 'reservations' | 'account'>('explore');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>(mockInstitutions);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [savedInstitutions, setSavedInstitutions] = useState<string[]>([]);
  
  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([
    {
      id: '1',
      userId: 'mock',
      title: 'Rappel de réservation',
      message: 'Votre réservation chez Dr. Lilia B. est dans 2 jours.',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      read: false,
      archived: false,
      type: 'REMINDER'
    },
    {
      id: '2',
      userId: 'mock',
      title: 'Confirmation de ticket',
      message: 'Votre ticket #21 pour Hôpital Central a été confirmé.',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      read: true,
      archived: false,
      type: 'INFO'
    }
  ]);

  // Auth state
  const [user, setUser] = useState<{ firstName: string; lastName: string; phone: string } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('qless_dark') === 'true');
  const [shouldShowSplash, setShouldShowSplash] = useState(true);
  
  // Map persistence state
  const [mapCenter, setMapCenter] = useState<[number, number]>([36.7372, 3.0889]);
  const [mapZoom, setMapZoom] = useState(13);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // Filter states
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<InstitutionType[]>([]);
  const [selectedSectors, setSelectedSectors] = useState<Sector[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<string>('');
  const [selectedCommune, setSelectedCommune] = useState<string>('');
  const [wilayaSearch, setWilayaSearch] = useState('');
  const [communeSearch, setCommuneSearch] = useState('');
  const [isWilayaDropdownOpen, setIsWilayaDropdownOpen] = useState(false);
  const [isCommuneDropdownOpen, setIsCommuneDropdownOpen] = useState(false);
  const filterContentRef = React.useRef<HTMLDivElement>(null);

  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);

  React.useEffect(() => {
    if (navigator.geolocation) {
      // Faster initial acquisition
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Initial geolocation error:", error),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
      );

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Geolocation watch error:", error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  const smartAlert = null;

  React.useEffect(() => {
    // Smart alert auto-dismissal logic was here
  }, []);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('qless_dark', isDarkMode.toString());
  }, [isDarkMode]);

  React.useEffect(() => {
    if ((isWilayaDropdownOpen || isCommuneDropdownOpen) && filterContentRef.current) {
      setTimeout(() => {
        filterContentRef.current?.scrollTo({
          top: filterContentRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [isWilayaDropdownOpen, isCommuneDropdownOpen]);
  
  // Ticket increments make no sense for future date calendars, so removing them.

  const filteredInstitutions = useMemo(() => {
    return institutions.filter(inst => {
      const typeLabel = t(inst.type as any).toLowerCase();
      const matchesSearch = inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          typeLabel.includes(searchQuery.toLowerCase()) ||
                          inst.wilaya.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inst.commune.toLowerCase().includes(searchQuery.toLowerCase());
      
      const typeInfo = INSTITUTION_TYPES.find(it => it.type === inst.type);
      const matchesSector = selectedSectors.length === 0 || (typeInfo && selectedSectors.includes(typeInfo.sector));
      const matchesType = selectedTypes.length === 0 || selectedTypes.includes(inst.type);
      
      const matchesWilaya = !selectedWilaya || inst.wilaya === selectedWilaya;
      const matchesCommune = !selectedCommune || inst.commune === selectedCommune;
      
      return matchesSearch && matchesSector && matchesType && matchesWilaya && matchesCommune;
    });
  }, [searchQuery, selectedSectors, selectedTypes, selectedWilaya, selectedCommune, institutions]);

  React.useEffect(() => {
    // We intentionally don't auto-load user from localStorage here to ensure 
    // the user is asked to sign in every fresh open as requested.
    localStorage.setItem('qless_user', user ? JSON.stringify(user) : '');
  }, [user]);

  const onMapMove = React.useCallback((c: [number, number], z: number) => {
    setMapCenter(c);
    setMapZoom(z);
  }, []);

  const handleSelectInstitution = React.useCallback((inst: Institution) => {
    setSelectedInstitution(inst);
  }, []);

  const handleOnboardingComplete = React.useCallback((userData: { firstName: string; lastName: string; phone: string }) => {
    setUser(userData);
    setShouldShowSplash(false);
    setToast({ message: t('loginSuccess'), type: 'success' });
    setTimeout(() => setToast(null), 3000);
  }, [t]);

  const handleUpdateUser = React.useCallback((userData: { firstName: string; lastName: string; phone: string }) => {
    setUser(userData);
    setToast({ message: t('profileUpdated' as any), type: 'success' });
    setTimeout(() => setToast(null), 3000);
  }, [t]);

  const handleLogout = React.useCallback(() => {
    setUser(null);
    setShouldShowSplash(false);
    setToast({ message: t('logoutSuccess'), type: 'info' });
    setTimeout(() => setToast(null), 3000);
  }, [t]);

  const handleTakeTicket = (inst: Institution) => {
    // The details sheet should prevent duplicates, but we triple check here
    const targetDate = (inst as any)._targetDate || new Date().toISOString().split('T')[0];
    
    // Check if user already has a ticket for this specific day
    const activeTicketsForInst = tickets.filter(t => 
      t.institutionId === inst.id && 
      t.targetDate === targetDate
    );

    if (activeTicketsForInst.length >= 1) {
      return; // Already booked this day
    }

    const generateReservationId = () => {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const numbers = '0123456789';
      const all = letters + numbers;
      const pick = (source: string) => source.charAt(Math.floor(Math.random() * source.length));
      // Force at least one letter and one number to ensure a mix, format: XXX-X-X
      return `${pick(letters)}${pick(numbers)}${pick(all)}-${pick(all)}-${pick(all)}`;
    };

    const position = (inst as any)._queuePosition || 1;
    const estimatedTimeMin = calculateEstimatedWaitTime(targetDate, position);

    const newTicket: Ticket = {
      id: generateReservationId(),
      institutionId: inst.id,
      institutionName: inst.name,
      ticketNumber: position.toString(),
      timestamp: new Date().toISOString(),
      targetDate: targetDate,
      userFullName: user ? `${user.firstName} ${user.lastName}` : undefined,
      status: 'waiting',
      estimatedTime: estimatedTimeMin 
    };
    
    setTickets([newTicket, ...tickets]);
    
    setSelectedInstitution(null);
    setActiveTab('reservations');
  };

  const handleDeleteTicket = (ticketId: string) => {
    setTickets(tickets.filter(t => t.id !== ticketId));
  };

  const toggleSave = (id: string) => {
    if (savedInstitutions.includes(id)) {
      setSavedInstitutions(savedInstitutions.filter(i => i !== id));
    } else {
      setSavedInstitutions([...savedInstitutions, id]);
    }
  };

  const userTicketsForSelected = useMemo(() => {
    if (!selectedInstitution) return [];
    return tickets.filter(t => t.institutionId === selectedInstitution.id);
  }, [selectedInstitution, tickets]);

  const currentSelectedInstitution = useMemo(() => {
    if (!selectedInstitution) return null;
    return institutions.find(i => i.id === selectedInstitution.id) || selectedInstitution;
  }, [selectedInstitution, institutions]);

   return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 overflow-hidden flex flex-col font-sans transition-colors duration-300">
      {(!user || shouldShowSplash) && (
        <Onboarding 
          onComplete={handleOnboardingComplete} 
          showSplash={shouldShowSplash} 
          onSplashComplete={() => {
            setShouldShowSplash(false);
          }}
        />
      )}
      {/* Main Content Area */}
      <div className="flex-1 relative pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'explore' && (
            <motion.div 
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <SearchHeader 
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                onToggleFilter={() => setShowFilterModal(true)}
                viewMode={viewMode}
                onToggleViewMode={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
              />
              
              <AnimatePresence mode="wait">
                {viewMode === 'map' ? (
                  <motion.div 
                    key="map-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <MapView 
                      institutions={filteredInstitutions} 
                      onSelectInstitution={handleSelectInstitution}
                      selectedInstitutionId={selectedInstitution?.id}
                      selectedWilaya={selectedWilaya}
                      isDarkMode={isDarkMode}
                      center={mapCenter}
                      zoom={mapZoom}
                      onMapMove={onMapMove}
                      userLocation={userLocation}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="list-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <ListView 
                      institutions={filteredInstitutions}
                      onSelectInstitution={setSelectedInstitution}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'reservations' && (
            <motion.div 
              key="reservations"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute inset-0 bg-gray-50 dark:bg-gray-900 overflow-y-auto h-full transition-colors duration-300"
            >
              <TicketList 
                tickets={tickets} 
                institutions={institutions}
                onDeleteTicket={handleDeleteTicket}
                onSelectTicket={(ticket) => {
                  const inst = institutions.find(i => i.id === ticket.institutionId);
                  if (inst) {
                    setSelectedInstitution(inst);
                  }
                }}
              />
            </motion.div>
          )}

          {activeTab === 'account' && (
            <motion.div 
              key="account"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              className="absolute inset-0 h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300"
            >
              <AccountCenter 
                user={user}
                isLoggedIn={!!user} 
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
                savedInstitutions={savedInstitutions}
                onSelectInstitution={(inst) => {
                  setSelectedInstitution(inst);
                  setActiveTab('explore');
                }}
                isDarkMode={isDarkMode}
                toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                notifications={notifications}
                setNotifications={setNotifications}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Overlays */}
      <DetailsSheet 
        institution={currentSelectedInstitution} 
        onClose={() => setSelectedInstitution(null)}
        onTakeTicket={handleTakeTicket}
        userTickets={userTicketsForSelected}
        isSaved={selectedInstitution ? savedInstitutions.includes(selectedInstitution.id) : false}
        onToggleSave={toggleSave}
      />

      {/* Filter Modal */}
      <AnimatePresence>
        {showFilterModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[2000] flex items-end sm:items-center justify-center p-4"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold dark:text-white">{t('filter')}</h3>
                <button onClick={() => setShowFilterModal(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div 
                ref={filterContentRef}
                className="p-5 space-y-6 max-h-[60vh] overflow-y-auto"
              >
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 block">{t('filter')}</label>
                  
                  {/* Sector Selection */}
                  <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                    <button 
                      onClick={() => {
                        setSelectedSectors([]);
                        setSelectedTypes([]);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all",
                        selectedSectors.length === 0 ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 dark:bg-gray-700 text-gray-500 border-gray-100 dark:border-gray-600"
                      )}
                    >
                      {t('all')}
                    </button>
                    {SECTORS.map(sector => (
                      <button 
                        key={sector.id}
                        onClick={() => {
                          if (selectedSectors.includes(sector.id)) {
                            setSelectedSectors(selectedSectors.filter(s => s !== sector.id));
                            // Also remove types tied to this sector? 
                            // User might want to keep some if they select multiple, but usually unselecting a sector should clear its sub-filters
                            const typesInSector = INSTITUTION_TYPES.filter(it => it.sector === sector.id).map(it => it.type);
                            setSelectedTypes(selectedTypes.filter(t => !typesInSector.includes(t)));
                          } else {
                            setSelectedSectors([...selectedSectors, sector.id]);
                          }
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-bold border whitespace-nowrap transition-all flex items-center gap-2",
                          selectedSectors.includes(sector.id) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 dark:bg-gray-700 text-gray-500 border-gray-100 dark:border-gray-600"
                        )}
                      >
                        <sector.icon className="w-3.5 h-3.5" />
                        {t(sector.id as any)}
                      </button>
                    ))}
                  </div>

                  {/* Type Selection based on selected Sectors */}
                  <AnimatePresence>
                    {selectedSectors.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-2"
                      >
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-50 dark:border-gray-700">
                          {INSTITUTION_TYPES.filter(it => selectedSectors.includes(it.sector)).map(type => (
                            <button 
                              key={type.type}
                              onClick={() => {
                                if (selectedTypes.includes(type.type)) {
                                  setSelectedTypes(selectedTypes.filter(t => t !== type.type));
                                } else {
                                  setSelectedTypes([...selectedTypes, type.type]);
                                }
                              }}
                              className={cn(
                                "px-3 py-2 rounded-xl text-[10px] font-bold border transition-all flex items-center gap-1.5",
                                selectedTypes.includes(type.type) 
                                  ? "bg-blue-500 text-white border-blue-500 shadow-sm" 
                                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-800"
                              )}
                            >
                              <type.icon className={cn("w-3 h-3", selectedTypes.includes(type.type) ? "text-white" : "text-gray-400")} />
                              {t(type.type as any)}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Summary labels if no sector selected but custom types are (edge case/legacy) */}
                  {selectedSectors.length === 0 && selectedTypes.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {selectedTypes.map(type => {
                        const typeInfo = INSTITUTION_TYPES.find(it => it.type === type);
                        const Icon = typeInfo?.icon || Search;
                        return (
                          <div key={type} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[9px] font-black flex items-center gap-1">
                            <Icon className="w-2.5 h-2.5" />
                            {t(type as any)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">{t('wilaya')}</label>
                  <div className="relative">
                    <button 
                      onClick={() => setIsWilayaDropdownOpen(!isWilayaDropdownOpen)}
                      className="w-full p-3.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl text-[12px] font-bold flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <span className={cn(selectedWilaya ? "text-gray-900 dark:text-white" : "text-gray-400")}>
                        {selectedWilaya || t('selectWilaya')}
                      </span>
                      <motion.div
                        animate={{ rotate: isWilayaDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isWilayaDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[2100] left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="p-3 border-b border-gray-50 dark:border-gray-700">
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder={t('searchWilaya')}
                                value={wilayaSearch}
                                onChange={(e) => setWilayaSearch(e.target.value)}
                                className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                              />
                              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-1 no-scrollbar bg-white dark:bg-gray-800">
                            <button 
                              onClick={() => {
                                setSelectedWilaya('');
                                setSelectedCommune('');
                                setIsWilayaDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left",
                                selectedWilaya === '' 
                                  ? "bg-blue-600 text-white shadow-sm" 
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                              )}
                            >
                              {t('all')}
                            </button>
                            {WILAYAS.filter(w => w.toLowerCase().includes(wilayaSearch.toLowerCase())).map(w => (
                              <button 
                                key={w}
                                onClick={() => {
                                  setSelectedWilaya(w);
                                  setSelectedCommune('');
                                  setIsWilayaDropdownOpen(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left",
                                  selectedWilaya === w 
                                    ? "bg-blue-600 text-white shadow-sm" 
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                )}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className={cn(
                    "text-[10px] font-black uppercase tracking-widest block transition-colors",
                    selectedWilaya ? "text-gray-400" : "text-gray-200 dark:text-gray-700"
                  )}>
                    {t('commune')}
                  </label>
                  <div className="relative">
                    <button 
                      disabled={!selectedWilaya}
                      onClick={() => setIsCommuneDropdownOpen(!isCommuneDropdownOpen)}
                      className={cn(
                        "w-full p-3.5 border rounded-xl text-[12px] font-bold flex items-center justify-between transition-all",
                        selectedWilaya 
                          ? "bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700" 
                          : "bg-gray-50/50 dark:bg-gray-800/20 border-gray-50 dark:border-gray-800 cursor-not-allowed opacity-50"
                      )}
                    >
                      <span className={cn(selectedCommune ? "text-gray-900 dark:text-white" : "text-gray-400")}>
                        {selectedCommune || (selectedWilaya ? t('selectCommune') : t('chooseWilayaFirst'))}
                      </span>
                      <motion.div
                        animate={{ rotate: isCommuneDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isCommuneDropdownOpen && selectedWilaya && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-[2100] left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
                        >
                          <div className="p-3 border-b border-gray-50 dark:border-gray-700">
                            <div className="relative">
                              <input 
                                type="text"
                                placeholder={t('searchCommune')}
                                value={communeSearch}
                                onChange={(e) => setCommuneSearch(e.target.value)}
                                className="w-full p-3 pl-10 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white dark:placeholder-gray-400"
                              />
                              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                          </div>
                          <div className="max-h-60 overflow-y-auto p-1 no-scrollbar bg-white dark:bg-gray-800">
                            <button 
                              onClick={() => {
                                setSelectedCommune('');
                                setIsCommuneDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left",
                                selectedCommune === '' 
                                  ? "bg-blue-600 text-white shadow-sm" 
                                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                              )}
                            >
                              {t('all')}
                            </button>
                            {(WILAYA_COMMUNES[selectedWilaya] || [])
                              .filter(c => c.toLowerCase().includes(communeSearch.toLowerCase()))
                              .map(c => (
                                <button 
                                  key={c}
                                  onClick={() => {
                                    setSelectedCommune(c);
                                    setIsCommuneDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "w-full px-4 py-3 rounded-xl text-[13px] font-bold transition-all text-left",
                                    selectedCommune === c 
                                      ? "bg-blue-600 text-white shadow-sm" 
                                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400"
                                  )}
                                >
                                  {c}
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50/50 dark:bg-gray-900/50 flex gap-3 border-t border-gray-100 dark:border-gray-700">
                <button 
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedWilaya('');
                    setSelectedCommune('');
                    setWilayaSearch('');
                    setCommuneSearch('');
                    setIsWilayaDropdownOpen(false);
                    setIsCommuneDropdownOpen(false);
                  }}
                  className="flex-1 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
                >
                  {t('reset')}
                </button>
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 text-sm"
                >
                  {t('apply')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[6000] px-6 py-3 bg-gray-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-gray-900 rounded-2xl shadow-2xl border border-white/10 dark:border-black/10 flex items-center gap-3"
          >
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              toast.type === 'success' ? "bg-green-500" : "bg-blue-500"
            )} />
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Alert */}
      <AnimatePresence>
        {smartAlert && (
          <motion.div 
            initial={{ y: -60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -40, opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: "easeInOut" } }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="fixed top-24 left-4 right-4 z-[2500]"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-blue-500/30 shadow-blue-500/10 overflow-hidden relative">
              <button 
                onClick={() => setDismissedAlertId(smartAlert.ticket.id)}
                className="absolute top-4 right-4 p-2 bg-gray-100/50 dark:bg-gray-800/50 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-20"
              >
                <X className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              </button>

              <div className="flex flex-col gap-4 relative z-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/30">
                    <Navigation className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="mb-1">
                      <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{t('smartAlert')}</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 dark:text-white leading-tight mb-1">
                      {t('leaveNow')}
                    </h4>
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 leading-tight">
                      {parseInt(smartAlert.ticket.ticketNumber) - smartAlert.institution.currentTicket} {t('peopleAhead')} {t('at')} {smartAlert.institution.name}.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {userLocation && (
                    <>
                      <div className="flex-1 px-3 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center gap-2 border border-gray-100 dark:border-white/5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{formatDistance(smartAlert.distance)}</span>
                      </div>
                      <div className="flex-1 px-3 py-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                        <Clock className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-black text-blue-600 dark:text-blue-400">~{smartAlert.travelTime} {t('min')}</span>
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${smartAlert.institution.lat},${smartAlert.institution.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 whitespace-nowrap active:scale-95"
                  >
                    <Navigation className="w-3.5 h-3.5 fill-current" />
                    {t('itinerary' as any)}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        unreadNotificationsCount={notifications.filter(n => !n.read && !n.archived).length}
      />
    </div>
  );
}
