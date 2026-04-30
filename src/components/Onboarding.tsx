import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../hooks/useLanguage';
import { Phone, ArrowRight, CheckCircle2, ShieldCheck, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { AppLogo } from './AppLogo';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface OnboardingProps {
  onComplete: (user: { firstName: string; lastName: string; phone: string }) => void;
  showSplash?: boolean;
  onSplashComplete?: () => void;
}

const TicketIcon = ({ className }: { className?: string }) => (
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

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, showSplash = true, onSplashComplete }) => {
  const { t, lang, setLang } = useLanguage();
  const [step, setStep] = useState<'splash' | 'intro' | 'auth' | 'verify'>(showSplash ? 'splash' : 'intro');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Auth state
  const [firstName, setFirstName] = useState('admin');
  const [lastName, setLastName] = useState('admin');
  const [phone, setPhone] = useState('0123456789');
  const [smsCode, setSmsCode] = useState('1234');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const slides = [
    {
      title: t('onboarding1Title'),
      description: t('onboarding1Desc'),
      icon: Clock,
      color: 'bg-blue-600'
    },
    {
      title: t('onboarding2Title'),
      description: t('onboarding2Desc'),
      icon: ShieldCheck,
      color: 'bg-teal-600'
    },
    {
      title: t('onboarding3Title'),
      description: t('onboarding3Desc'),
      icon: Users,
      color: 'bg-indigo-600'
    },
    {
      title: t('onboarding4Title'),
      description: t('onboarding4Desc'),
      icon: Clock, // Reusing icons since user didn't specify
      color: 'bg-purple-600'
    },
    {
      title: t('onboarding5Title'),
      description: t('onboarding5Desc'),
      icon: ShieldCheck,
      color: 'bg-orange-600'
    }
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-slide effect
  useEffect(() => {
    if (step === 'intro' && !isDragging) {
      const interval = setInterval(handleNext, 6000);
      return () => clearInterval(interval);
    }
  }, [step, slides.length, isDragging]);

  const hasCalledSplashComplete = React.useRef(false);

  // Periodic ticket updates
  useEffect(() => {
    if (step === 'splash') {
      const timer = setTimeout(() => {
        if (onSplashComplete && !hasCalledSplashComplete.current) {
          hasCalledSplashComplete.current = true;
          onSplashComplete();
        }
        setStep('intro');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, onSplashComplete]);

  const handleDragEnd = (_: any, info: any) => {
    setIsDragging(false);
    const swipeThreshold = 30; // Better sensitivity
    if (info.offset.x < -swipeThreshold) {
      handleNext();
    } else if (info.offset.x > swipeThreshold) {
      handlePrev();
    }
  };

  const handleSendSms = async () => {
    if (authMode === 'signup') {
      if (!firstName || !lastName || !phone) {
        setError('Veuillez remplir tous les champs');
        return;
      }
    } else {
      if (!phone) {
        setError('Veuillez entrer votre numéro');
        return;
      }
    }

    if (phone.length < 10) {
      setError('Numéro de téléphone invalide (10 chiffres requis)');
      return;
    }

    setIsLoading(true);
    setError('');

    // Reverting to mock SMS as requested for simplicity
    setTimeout(() => {
      setIsLoading(false);
      setStep('verify');
    }, 1000);
  };

  const handleVerify = async () => {
    if (smsCode !== '1234') {
      setError('Code incorrect (utilisez 1234 pour tester)');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate completion
      onComplete({ firstName: firstName || 'Utilisateur', lastName: lastName || 'Qless', phone: phone });
    } catch (err: any) {
      console.error('Verify Error:', err);
      setError('Une erreur est survenue lors de la vérification.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-[9999] flex flex-col font-sans transition-colors duration-300">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-gray-900 px-8 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px] -z-10"
            />

            {/* Floating Decorative Tickets */}
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * 400 - 200, 
                  y: Math.random() * 800 - 400,
                  rotate: Math.random() * 360,
                  opacity: 0 
                }}
                animate={{ 
                  y: [null, Math.random() * -100 - 100],
                  opacity: [0, 0.2, 0],
                  rotate: [null, Math.random() * 20 - 10]
                }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                className="absolute text-blue-200 dark:text-blue-900/40"
              >
                <TicketIcon className="w-12 h-12" />
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 1
              }}
              className="mb-10"
            >
              <AppLogo size="xl" showText={true} layout="vertical" />
            </motion.div>
            
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
              className="text-center relative -mt-10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 1, duration: 1 }}
                className="h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent mb-4 mx-auto"
              />
              <motion.p 
                initial={{ letterSpacing: '0.1em', opacity: 0, y: 10 }}
                animate={{ letterSpacing: '0.5em', opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1.5 }}
                className="text-gray-400 font-bold uppercase text-[10px]"
              >
                Smart Reservations
              </motion.p>
            </motion.div>
            
            <div className="absolute bottom-20 left-0 right-0 flex justify-center">
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      y: [0, -10, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 1.2, 
                      repeat: Infinity, 
                      delay: i * 0.15 
                    }}
                    className="w-2 h-2 bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : step === 'intro' ? (
          <motion.div 
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col pt-10 pb-8"
          >
            <div className="px-8 mb-6">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex items-center mb-4"
              >
                <AppLogo size="md" showText={true} layout="horizontal" />
              </motion.div>
            </div>

            <div className="flex-1 px-8 flex flex-col justify-center relative touch-none select-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="space-y-4 cursor-grab active:cursor-grabbing pb-8"
                >
                  <div className={cn(
                    "w-20 h-20 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500",
                    slides[currentSlide].color
                  )}>
                    {React.createElement(slides[currentSlide].icon, { className: "w-10 h-10" })}
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                      {slides[currentSlide].title}
                    </h2>
                    <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm">
                      {slides[currentSlide].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="flex items-center justify-between mt-auto py-2">
                <button 
                  onClick={handlePrev}
                  className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSlide(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        currentSlide === i ? "w-8 bg-blue-600" : "w-1.5 bg-gray-200 dark:bg-gray-800"
                      )}
                    />
                  ))}
                </div>
                
                <button 
                  onClick={handleNext}
                  className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="px-8 space-y-4">
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setStep('auth');
                }}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {t('getStarted')}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setStep('auth');
                  }}
                  className="text-gray-500 dark:text-gray-400 font-bold text-sm"
                >
                  {t('alreadyRegistered')} <span className="text-blue-600 dark:text-blue-500">{t('loginAction')}</span>
                </button>

                <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 w-fit" dir="ltr">
                  {(['fr', 'en', 'ar'] as const).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={cn(
                        "px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                        lang === l ? "bg-white dark:bg-gray-700 text-blue-600 shadow-sm" : "text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      )}
                    >
                      {lang === l && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                      {l === 'fr' ? 'fr' : l === 'en' ? 'eng' : 'ar'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : step === 'auth' ? (
          <motion.div 
            key="auth"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-8 pt-12"
          >
            <div className="mb-10">
              <button 
                onClick={() => setStep('intro')}
                className="mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl"
              >
                <ChevronLeft className={cn("w-5 h-5", lang === 'ar' && "rotate-180")} />
              </button>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {authMode === 'signup' ? t('loginTitle') : t('loginAction')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">
                {authMode === 'signup' ? t('loginSubtitle') : t('loginSubtitle')}
              </p>
            </div>

            <div className="flex-1 space-y-6">
              {authMode === 'signup' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('firstName')}</label>
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('lastName')}</label>
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    />
                  </div>
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t('phone')}</label>
                <div className="relative" dir="ltr">
                  <input 
                    type="tel" 
                    placeholder="0XXXXXXXXX"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full p-5 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white font-mono text-center text-xl tracking-wider"
                  />
                </div>
              </div>

              {authMode === 'login' && (
                <button 
                  onClick={() => setAuthMode('signup')}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400"
                >
                  {t('createAccount')}
                </button>
              )}

              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-bold ml-1"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <button
              onClick={handleSendSms}
              disabled={isLoading}
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {t('continue')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div 
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col p-8 pt-20"
          >
            <div className="mb-10 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
                <Phone className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-white leading-tight">
                {t('verifyTitle')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 font-bold mt-2">
                {t('verifySubtitle')} <span className="text-blue-600 dark:text-blue-500" dir="ltr">{phone}</span>
              </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="space-y-4 w-full">
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="----"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  className="w-full p-8 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white text-center text-4xl font-black tracking-[1em] placeholder:text-gray-200 dark:placeholder:text-gray-800"
                />
                <p className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  Entrez 1234 pour tester
                </p>
              </div>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs font-bold mt-4"
                >
                  {error}
                </motion.p>
              )}
            </div>

            <div className="space-y-4">
              <button
                onClick={handleVerify}
                disabled={isLoading}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('continue')}
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
              <button
                onClick={() => setStep('auth')}
                className="w-full py-4 text-gray-500 dark:text-gray-400 font-bold text-sm"
              >
                Modifier le numéro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
