import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { User, Settings, HelpCircle, LogOut, ChevronRight, Bookmark, Moon, Sun, Mail, Info, Phone, Camera, Bell, Archive, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Institution, INSTITUTION_TYPES } from '../types';
import { mockInstitutions } from '../data/mockData';
import { AppLogo } from './AppLogo';

interface AccountCenterProps {
  user: { firstName: string; lastName: string; phone: string } | null;
  isLoggedIn: boolean;
  onLogout: () => void;
  onUpdateUser: (userData: { firstName: string; lastName: string; phone: string }) => void;
  savedInstitutions: string[];
  onSelectInstitution: (inst: Institution) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notifications: any[];
  setNotifications: (notifications: any[]) => void;
  onNotificationClick?: (notification: any) => void;
}

export const AccountCenter: React.FC<AccountCenterProps> = ({ 
  user,
  isLoggedIn, 
  onLogout,
  onUpdateUser,
  savedInstitutions,
  onSelectInstitution,
  isDarkMode,
  toggleDarkMode,
  notifications,
  setNotifications,
  onNotificationClick
}) => {
  const { t, lang, setLang } = useLanguage();
  const [showFAQ, setShowFAQ] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsTab, setNotificationsTab] = useState<'inbox' | 'archived'>('inbox');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);

  // Edit states
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [smsCode, setSmsCode] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const savedList = mockInstitutions.filter(inst => savedInstitutions.includes(inst.id));

  const faqs = [
    { q: t('faq1'), a: t('faq1Ans') },
    { q: t('faq2'), a: t('faq2Ans') },
    { q: t('faq3'), a: t('faq3Ans') },
    { q: t('faq4'), a: t('faq4Ans') },
  ];

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleUpdateInfo = async () => {
    if (!editFirstName || !editLastName || !editPhone) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    setError('');
    
    if (editPhone !== user?.phone) {
      setIsLoading(true);
      setError('');
      // Reverting to mock SMS for simplicity
      setTimeout(() => {
        setIsLoading(false);
        setIsVerifyingPhone(true);
      }, 1000);
    } else {
      setIsLoading(true);
      try {
        // We still save the non-phone updates if user exists
        onUpdateUser({ firstName: editFirstName, lastName: editLastName, phone: editPhone });
        setIsEditingInfo(false);
      } catch (err) {
        console.error('Update Info Error:', err);
        setError('Erreur lors de la mise à jour.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVerifyUpdate = async () => {
    if (smsCode !== '1234') {
      setError('Code incorrect (utilisez 1234 pour tester)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate confirmation
      onUpdateUser({ firstName: editFirstName, lastName: editLastName, phone: editPhone });
      setIsVerifyingPhone(false);
      setIsEditingInfo(false);
    } catch (err: any) {
      console.error('Verify Update Error:', err);
      setError('Erreur lors de la validation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 pb-40 transition-colors">
      <div className="p-6">
        <div className="flex justify-center mb-8">
          <AppLogo size="md" showText={true} layout="horizontal" />
        </div>
        <AnimatePresence mode="wait">
          {isLoggedIn && user ? (
            <div className="space-y-6 mb-8">
              <motion.div 
                key="logged-in-compact"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-6"
              >
                <div className="relative">
                  <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-[2rem] flex items-center justify-center text-blue-600 overflow-hidden shadow-2xl border-[3px] border-white dark:border-gray-800">
                    {profilePic ? (
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <User className="w-10 h-10" />
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer border-2 border-white dark:border-gray-800 shadow-xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} />
                  </label>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                    {user.firstName} {user.lastName}
                  </h2>
                </div>
              </motion.div>

              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">{t('personalInfo')}</h3>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setEditFirstName(user.firstName);
                    setEditLastName(user.lastName);
                    setEditPhone(user.phone);
                    setIsEditingInfo(true);
                  }}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-gray-700 dark:text-gray-200">
                      {t('changePersonalInfo')}
                    </span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transition-colors" />
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div 
              key="logged-out"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-8 flex flex-col items-center text-center gap-4 border border-gray-100 dark:border-gray-700"
            >
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                <User className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('createAccount')}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">{t('loginPrompt')}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoggedIn && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 focus:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-xl text-yellow-600 bg-yellow-50 dark:bg-yellow-900/30">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-700 dark:text-gray-200">Notifications</span>
              </div>
              <div className="flex items-center gap-2">
                {notifications.filter(n => !n.read && !n.archived).length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                    {notifications.filter(n => !n.read && !n.archived).length}
                  </span>
                )}
                <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform", showNotifications && "rotate-90")} />
              </div>
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-50 dark:bg-gray-900/50 flex flex-col items-stretch overflow-hidden"
                >
                  <div className="flex p-2 gap-2 border-b border-gray-100 dark:border-gray-700">
                    <button 
                      onClick={() => setNotificationsTab('inbox')}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        notificationsTab === 'inbox' 
                          ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      Boîte de réception
                    </button>
                    <button 
                      onClick={() => setNotificationsTab('archived')}
                      className={cn(
                        "flex-1 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                        notificationsTab === 'archived' 
                          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" 
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      )}
                    >
                      Archivées
                    </button>
                  </div>

                  {notificationsTab === 'inbox' && (
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex justify-end mb-1 gap-4">
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                          className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Tout marquer lu
                        </button>
                        <button 
                          onClick={() => setNotifications(notifications.map(n => ({...n, archived: true})))}
                          className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 hover:underline hover:text-red-500"
                        >
                          Tout archiver
                        </button>
                      </div>
                      
                      {notifications.filter(n => !n.archived).length > 0 ? (
                        notifications.filter(n => !n.archived).map((notif) => (
                          <div 
                            key={notif.id}
                            onClick={() => {
                              if (!notif.read) {
                                setNotifications(notifications.map(n => n.id === notif.id ? {...n, read: true} : n));
                              }
                              onNotificationClick?.(notif);
                            }}
                            className={cn(
                              "w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left border cursor-pointer",
                              !notif.read ? "border-blue-200 dark:border-blue-900/50 shadow-md" : "border-gray-100 dark:border-gray-700"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className={cn("font-bold text-sm", !notif.read ? "text-blue-700 dark:text-blue-400" : "text-gray-900 dark:text-white")}>
                                {notif.title}
                              </h4>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNotifications(notifications.map(n => n.id === notif.id ? {...n, archived: true} : n));
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1">
                              {new Date(notif.timestamp).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <Check className="w-8 h-8 text-green-200 dark:text-gray-700 mx-auto mb-2" />
                          <p className="text-xs font-bold text-gray-400">Rien à signaler</p>
                        </div>
                      )}
                    </div>
                  )}

                  {notificationsTab === 'archived' && (
                    <div className="p-4 flex flex-col gap-3">
                      {notifications.filter(n => n.archived).length > 0 ? (
                        notifications.filter(n => n.archived).map((notif) => (
                          <div 
                            key={notif.id}
                            className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex flex-col gap-2 text-left border border-gray-100 dark:border-gray-700 opacity-70"
                          >
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
                              {notif.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{notif.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <Archive className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                          <p className="text-xs font-bold text-gray-400">Archives vides</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">{t('appearance')}</h3>
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 transition-all focus:outline-none"
          >
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon className="w-5 h-5 text-blue-400" />
              ) : (
                <Sun className="w-5 h-5 text-orange-500" />
              )}
              <span className="font-bold text-gray-700 dark:text-gray-200">
                {isDarkMode ? t('darkMode') : t('lightMode')}
              </span>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              isDarkMode ? "bg-blue-600" : "bg-gray-300"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                isDarkMode ? "left-7" : "left-1"
              )} />
            </div>
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm mb-6 border border-gray-100 dark:border-gray-700">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4 ml-1">{t('language')}</h3>
          <div className="flex bg-gray-50 dark:bg-gray-900/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700" dir="ltr">
            {(['fr', 'en', 'ar'] as const).map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 focus:outline-none",
                  lang === l 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm border border-gray-100 dark:border-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {lang === l && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                {t(l === 'fr' ? 'french' : l === 'en' ? 'english' : 'arabic')}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm overflow-hidden mb-6 border border-gray-100 dark:border-gray-700">
          <button 
            onClick={() => setShowSaved(!showSaved)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/30">
                <Bookmark className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200">{t('savedPlaces')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">{savedList.length}</span>
              <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform", showSaved && "rotate-90")} />
            </div>
          </button>

          {showSaved && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3">
              {savedList.length > 0 ? (
                savedList.map((inst) => {
                  const typeInfo = INSTITUTION_TYPES.find(t => t.type === inst.type);
                  const Icon = typeInfo?.icon || Bookmark;
                  return (
                    <button 
                      key={inst.id}
                      onClick={() => onSelectInstitution(inst)}
                      className="w-full bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left border border-gray-100 dark:border-gray-700"
                    >
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${typeInfo?.color}15`, color: typeInfo?.color }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate">{inst.name}</h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{inst.address}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                  );
                })
              ) : (
                <div className="py-8 text-center">
                  <Bookmark className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">{t('noSavedPlaces')}</p>
                </div>
              )}
            </div>
          )}

          <button 
            onClick={() => setShowFAQ(!showFAQ)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl text-purple-600 bg-purple-50 dark:bg-purple-900/30">
                <HelpCircle className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200">{t('faqs')}</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform", showFAQ && "rotate-90")} />
          </button>
          
          {showFAQ && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 bg-gray-50 dark:bg-gray-900/50 space-y-3"
            >
              {faqs.map((faq, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
                >
                  <button 
                    onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                    className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <span className="font-bold text-sm text-gray-900 dark:text-white pr-4">{faq.q}</span>
                    <div className={cn(
                       "p-1.5 rounded-lg transition-colors",
                      openFaqIndex === i ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600" : "text-gray-300"
                    )}>
                      <ChevronRight className={cn("w-4 h-4 transition-transform duration-300", openFaqIndex === i && "rotate-90")} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaqIndex === i && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-5"
                      >
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </motion.div>
          )}

          <button 
            onClick={() => window.open('https://mail.google.com/mail/?view=cm&fs=1&to=contact@qless.com', '_blank')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl text-blue-600 bg-blue-50 dark:bg-blue-900/30">
                <Mail className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200">{t('help')}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>

          <button 
            onClick={() => setShowAbout(!showAbout)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl text-gray-600 bg-gray-50 dark:bg-gray-700/50">
                <Info className="w-5 h-5" />
              </div>
              <span className="font-bold text-gray-700 dark:text-gray-200">{t('about')}</span>
            </div>
            <ChevronRight className={cn("w-5 h-5 text-gray-300 transition-transform", showAbout && "rotate-90")} />
          </button>

          {showAbout && (
            <div className="p-6 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t('aboutContent')}
              </p>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 p-4 text-red-600 font-bold bg-red-50 dark:bg-red-900/20 rounded-2xl focus:outline-none"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        )}
      </div>

      {/* Edit Personal Info Modal */}
      <AnimatePresence>
        {isEditingInfo && (
          <div className="fixed inset-0 bg-black/40 z-[4000] flex items-end sm:items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-t-[3rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-4">
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
                  {isVerifyingPhone ? t('verifyTitle') : t('changePersonalInfo' as any) || 'Modifier mes infos'}
                </h3>
                <p className="text-sm font-bold text-gray-400">
                  {isVerifyingPhone 
                    ? t('verifySubtitle') + ' ' + editPhone 
                    : 'Mettez à jour vos informations personnelles'
                  }
                </p>
              </div>

              <div className="p-8 pt-4 space-y-6 flex-1 overflow-y-auto no-scrollbar">
                {!isVerifyingPhone ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('firstName')}</label>
                        <input 
                          type="text" 
                          value={editFirstName}
                          onChange={(e) => setEditFirstName(e.target.value)}
                          className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-bold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('lastName')}</label>
                        <input 
                          type="text" 
                          value={editLastName}
                          onChange={(e) => setEditLastName(e.target.value)}
                          className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-bold"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('phone')}</label>
                      <input 
                        type="tel" 
                        maxLength={10}
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-mono text-lg tracking-wider"
                      />
                      {editPhone !== user?.phone && (
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest mt-1 ml-1">
                          La modification du numéro nécessite un SMS
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-6 py-4">
                    <input 
                      type="text" 
                      maxLength={4}
                      placeholder="----"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      className="w-full p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-center text-4xl font-black tracking-[1em] placeholder:text-gray-200 dark:placeholder:text-gray-800"
                    />
                    <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      Entrez 1234 pour tester
                    </p>
                  </div>
                )}

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs font-bold text-center"
                  >
                    {error}
                  </motion.p>
                )}
              </div>

              <div className="p-8 pt-4 flex flex-col gap-3">
                <button 
                  onClick={isVerifyingPhone ? handleVerifyUpdate : handleUpdateInfo}
                  disabled={isLoading}
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isLoading ? '...' : isVerifyingPhone ? t('continue') : t('save')}
                </button>
                <button 
                  onClick={() => {
                    if (isVerifyingPhone) setIsVerifyingPhone(false);
                    else setIsEditingInfo(false);
                    setSmsCode('');
                    setError('');
                  }}
                  className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold text-sm"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/40 z-[3000] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-700"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                  <LogOut className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('logout')}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('logoutConfirm')}</p>
              </div>
              <div className="px-6 pb-8 flex flex-col gap-3">
                <button 
                  onClick={() => {
                    onLogout();
                    setShowLogoutConfirm(false);
                  }}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all"
                >
                  {t('logoutAction')}
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl font-bold active:scale-95 transition-all"
                >
                  {t('cancel')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
