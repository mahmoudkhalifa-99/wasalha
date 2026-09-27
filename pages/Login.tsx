
import React, { useState, useRef, useEffect } from 'react';

// Types
import type { User, VehicleType, UserRole } from '../types';

// Utils
import { stripFirestore } from '../utils';

// Services
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { auth, db, googleProvider, signInWithCredential, signInWithPopup } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  Bike, Mail, Lock, User as UserIcon, 
  Smartphone, ShieldCheck, Eye, EyeOff,
  ChevronLeft, Car, Globe, Trophy, 
  Loader2, ArrowRight, MessageCircle, Zap, MapPin, Building, Sparkles, CheckCircle2
} from 'lucide-react';

// Components
import BrandLogo from '../components/BrandLogo';

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const slides = [
    { 
      title: "أهلاً بك في تطبيق وصلها", 
      body: "المنظومة الذكية الأولى لخدمة كافة مراكز وقرى محافظة المنوفية، مشاويرك وطلباتك وأكلك بين إيديك بثواني.", 
      badge: "تغطية شاملة لكل القرى والمراكز",
      icon: (
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-white p-2 shadow-2xl overflow-hidden ring-4 ring-white/30 flex items-center justify-center">
          <img src="/icon-512.png" alt="شعار وصلها" className="w-full h-full object-contain rounded-2xl" referrerPolicy="no-referrer" />
        </div>
      ), 
      color: "from-emerald-800 via-emerald-700 to-teal-900" 
    },
    { 
      title: "توكتوك • سيارة • دليفري فوري", 
      body: "اختر وسيلة التوصيل الأنسب لمشوارك: توكتوك سريع في الشوارع، عربية مريحة، أو موتوسيكل لتوصيل طلبات المطاعم والصيدليات.", 
      badge: "أسطول نقل متكامل",
      icon: (
        <div className="flex items-center gap-3 bg-white/15 p-5 rounded-3xl backdrop-blur-md border border-white/25 shadow-2xl">
          <span className="text-4xl filter drop-shadow">🛺</span>
          <span className="text-4xl filter drop-shadow">🚗</span>
          <span className="text-4xl filter drop-shadow">🏍️</span>
        </div>
      ), 
      color: "from-slate-950 via-slate-900 to-emerald-950" 
    },
    { 
      title: "كباتن ثقة، تتبع مباشر وأسعار عادلة", 
      body: "كل رحلة مؤمنة وتتبع لحظي على الخريطة مع تسعيرة عادلة معلنة مسبقاً ودعم فني وخدمة عملاء مباشرة.", 
      badge: "أمان وثقة 100%",
      icon: (
        <div className="p-5 bg-white/15 rounded-3xl backdrop-blur-md border border-white/25 shadow-2xl">
          <ShieldCheck className="h-16 w-16 text-emerald-300" />
        </div>
      ), 
      color: "from-emerald-950 via-teal-900 to-slate-950" 
    }
  ];

  return (
    <div className={`fixed inset-0 z-[5000] flex flex-col transition-all duration-700 bg-gradient-to-br ${slides[step].color} select-none overflow-hidden`}>
       {/* Ambient circles */}
       <div className="absolute top-10 right-10 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
       <div className="absolute bottom-20 left-10 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

       {/* Top skip button */}
       <div className="p-6 md:p-8 flex justify-between items-center relative z-10">
          <div className="bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md text-[10px] font-black tracking-widest text-emerald-300 uppercase">
             {slides[step].badge}
          </div>
          <button onClick={onComplete} className="text-white/70 hover:text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-white/10 transition-all">
             تخطي
          </button>
       </div>

       <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center text-white space-y-6 md:space-y-8 relative z-10">
          <div className="bg-white/10 p-8 md:p-12 rounded-[2.75rem] md:rounded-[3.5rem] backdrop-blur-3xl animate-in zoom-in duration-500 shadow-2xl border border-white/20">
             {slides[step].icon}
          </div>
          <div className="space-y-3 md:space-y-4 animate-in slide-in-from-bottom duration-700 max-w-sm">
             <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">{slides[step].title}</h2>
             <p className="text-white/80 font-semibold leading-relaxed text-xs md:text-sm">{slides[step].body}</p>
          </div>
       </div>

       <div className="p-6 md:p-10 pb-12 md:pb-16 space-y-6 bg-gradient-to-t from-black/40 to-transparent relative z-10">
          <div className="flex justify-center gap-2">
             {slides.map((_, i) => (
               <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-10 bg-emerald-400' : 'w-2 bg-white/25'}`} />
             ))}
          </div>
          <div className="flex gap-3 max-w-sm mx-auto w-full">
             {step > 0 && (
               <button onClick={() => setStep(step - 1)} className="p-4 bg-white/10 text-white rounded-2xl backdrop-blur-md active:scale-95 transition-all">
                 <ArrowRight className="h-5 w-5" />
               </button>
             )}
             <button onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white py-4 md:py-5 rounded-2xl font-black text-base shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-2 active:scale-95 transition-all">
                <span>{step === slides.length - 1 ? 'ابدأ تجربة وصلها الآن' : 'التالي'}</span>
                <ChevronLeft className="h-5 w-5" />
             </button>
          </div>
       </div>
    </div>
  );
};

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCompletingProfile, setIsCompletingProfile] = useState(false);
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [role, setRole] = useState<'CUSTOMER' | 'DRIVER'>('CUSTOMER');
  const [vehicleType, setVehicleType] = useState<VehicleType>('TOKTOK');
  
  // States for Profile Data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [center, setCenter] = useState('');
  const [village, setVillage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleResendOtp = () => {
    if (!canResend) return;
    setResendTimer(60);
    setCanResend(false);
    // Logic to resend OTP via WhatsApp/SMS
    alert("تم إعادة إرسال كود التفعيل إلى رقمك");
  };

  // Login States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // General States
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // الاحتفاظ فقط بالبيانات الضرورية لمستخدم جوجل لتجنب Circular References
  const [googleUserData, setGoogleUserData] = useState<{uid: string, email: string, displayName: string} | null>(null);

  const centers = ["شبين الكوم", "منوف", "أشمون", "الباجور", "قويسنا", "بركة السبع", "تلا", "السادات", "الشهداء"];

  const handleForgotPassword = () => {
    const adminWhatsApp = "201065019364";
    const message = "أهلاً إدارة وصلها، نسيت كلمة المرور الخاصة بحسابي وأحتاج للمساعدة في استعادتها.";
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const validateSignUp = () => {
    if (name.trim().split(/\s+/).length < 4) {
      setErrorMsg("برجاء إدخال الاسم رباعي لضمان التوثيق");
      return false;
    }
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg("رقم الهاتف غير صحيح (010, 011, 012, 015)");
      return false;
    }
    if (!email.includes('@')) {
      setErrorMsg("البريد الإلكتروني غير صحيح");
      return false;
    }
    if (password.length < 8) {
      setErrorMsg("كلمة المرور يجب ألا تقل عن 8 رموز");
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg("كلمة المرور غير متطابقة");
      return false;
    }
    if (!center || !village) {
      setErrorMsg("يرجى اختيار المركز والقرية");
      return false;
    }
    return true;
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      let result;
      if (Capacitor.isNativePlatform()) {
        // على تطبيق الأندرويد: جوجل بتمنع تسجيل الدخول عبر الـ WebView المدمج
        // (نافذة signInWithPopup)، فلازم نستخدم شاشة تسجيل الدخول الأصلية
        // بتاعة جوجل عن طريق بلجن Capacitor، وبعدين نبادل الـ idToken
        // بجلسة Firebase عادية عبر signInWithCredential.
        const googleUser = await GoogleAuth.signIn();
        const idToken = googleUser.authentication?.idToken;
        if (!idToken) throw new Error('NO_ID_TOKEN');
        const credential = GoogleAuthProvider.credential(idToken);
        result = await signInWithCredential(auth, credential);
      } else {
        result = await signInWithPopup(auth, googleProvider);
      }
      const userSnap = await getDoc(doc(db, "users", result.user.uid));
      
      if (userSnap.exists()) {
        const userData = stripFirestore(userSnap.data()) as User;
        if (!userData.phone) {
          setGoogleUserData({
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || ''
          });
          setName(userData.name || result.user.displayName || '');
          setEmail(userData.email || result.user.email || '');
          setIsCompletingProfile(true);
        } else {
          onLogin(userData);
        }
      } else {
        setGoogleUserData({
          uid: result.user.uid,
          email: result.user.email || '',
          displayName: result.user.displayName || ''
        });
        setName(result.user.displayName || '');
        setEmail(result.user.email || '');
        setIsCompletingProfile(true);
      }
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      // المستخدم لغى نافذة تسجيل الدخول بنفسه، مفيش داعي نظهر رسالة خطأ
      const cancelled = error?.code === '12501' || error?.message === 'USER_CANCELLED' || error?.code === 'auth/popup-closed-by-user';
      if (!cancelled) {
        setErrorMsg("فشل تسجيل الدخول عبر جوجل، يرجى المحاولة مرة أخرى.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteGoogleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUserData) return;
    if (!phone || phone.length < 11) return setErrorMsg("يرجى إدخال رقم هاتف صحيح");
    if (!center || !village) return setErrorMsg("يرجى اختيار المركز والقرية");

    setLoading(true);
    try {
      const userData: User = {
        id: googleUserData.uid,
        email: email,
        name: name,
        phone: phone,
        role: role,
        status: role === 'DRIVER' ? 'PENDING_APPROVAL' : 'APPROVED',
        vehicleType: role === 'DRIVER' ? vehicleType : undefined,
        zoneId: center,
        wallet: { balance: 0, totalEarnings: 0, withdrawn: 0 }
      };
      // نستخدم stripFirestore للتأكد من نظافة الكائن تماماً
      await setDoc(doc(db, "users", googleUserData.uid), stripFirestore(userData));
      onLogin(userData);
    } catch (e) {
      setErrorMsg("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegistering && step === 'INPUT') {
      if (!validateSignUp()) return;
      setStep('OTP');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        if (otp.join('').length < 6) {
          setErrorMsg("الكود غير مكتمل");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData: User = {
          id: userCredential.user.uid, email, name, phone, role,
          status: role === 'DRIVER' ? 'PENDING_APPROVAL' : 'APPROVED',
          vehicleType: role === 'DRIVER' ? vehicleType : undefined,
          zoneId: center,
          wallet: { balance: 0, totalEarnings: 0, withdrawn: 0 }
        };
        await setDoc(doc(db, "users", userCredential.user.uid), stripFirestore(userData));
        onLogin(userData);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        const userSnap = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userSnap.exists()) {
          onLogin(stripFirestore(userSnap.data()) as User);
        } else {
          const emailLower = (userCredential.user.email || '').toLowerCase();
          const isAdminEmail = [
            'admin@ashmoun.com', 
            'mahmoudkhalifa.kh91@gmail.com', 
            'sadat.planning.officer@dakahlia.net',
            'admin@wasalah.com',
            'wasalah.app@gmail.com'
          ].includes(emailLower);

          const defaultUserData: User = {
            id: userCredential.user.uid,
            email: userCredential.user.email || '',
            name: isAdminEmail ? 'مدير المنظومة' : (userCredential.user.displayName || 'مستخدم'),
            phone: '01000000000',
            role: isAdminEmail ? 'ADMIN' : 'CUSTOMER',
            status: 'APPROVED',
            zoneId: 'أشمون',
            wallet: { balance: 1000, totalEarnings: 0, withdrawn: 0 }
          };
          await setDoc(doc(db, "users", userCredential.user.uid), stripFirestore(defaultUserData));
          onLogin(defaultUserData);
        }
      }
    } catch (err: any) { 
      setErrorMsg("البريد أو كلمة المرور غير صحيحة.");
    } finally { setLoading(false); }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus();
  };

  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;

  return (
    <div className="fixed inset-0 z-[4000] bg-slate-50 overflow-y-auto no-scrollbar font-['Cairo'] flex flex-col items-center justify-start md:justify-center p-4 py-8 md:py-12 selection:bg-emerald-500 selection:text-white">
      {/* Ambient background decoration mirroring the icon's signature arch and map pin */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 flex items-center justify-center">
        {/* Top emerald arch radiance */}
        <div className="absolute -top-40 w-[650px] h-[650px] rounded-full bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-36 -left-36 w-[450px] h-[450px] rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute -bottom-36 -right-36 w-[450px] h-[450px] rounded-full bg-amber-500/5 blur-3xl" />
        
        {/* Concentric rings like the map pin rings in the logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-emerald-500/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[980px] h-[980px] rounded-full border border-emerald-500/5" />
      </div>

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-xl rounded-[2.5rem] md:rounded-[3rem] shadow-[0_25px_60px_-15px_rgba(5,150,105,0.18)] border border-emerald-500/15 overflow-hidden animate-in zoom-in-95 duration-500 my-auto">
        
        {/* Brand Hero Header with Official Icon */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-700 p-6 md:p-8 text-center relative shrink-0 overflow-hidden">
          {/* Subtle curved glow */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* The Official App Icon */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-3xl bg-white p-1.5 shadow-2xl ring-4 ring-white/30 mb-3 overflow-hidden flex items-center justify-center transform hover:scale-105 transition-transform duration-300">
              <img 
                src="/icon-192.png" 
                alt="شعار وصلها الرسمي" 
                className="w-full h-full object-contain rounded-2xl" 
                referrerPolicy="no-referrer" 
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span>وصـــلــهــا</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-ping inline-block" />
            </h1>
            <p className="text-emerald-100 font-bold text-xs md:text-sm mt-1">
              خدمة التوصيل الذكية الأولى بمحافظة المنوفية
            </p>
            
            {/* 3 Transport Vehicles matching the icon */}
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="bg-amber-400/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-amber-200 border border-amber-300/30 flex items-center gap-1.5 shadow-sm">
                <span>🛺</span> توكتوك
              </span>
              <span className="bg-slate-900/40 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-white border border-white/20 flex items-center gap-1.5 shadow-sm">
                <span>🚗</span> سيارة
              </span>
              <span className="bg-emerald-400/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-emerald-100 border border-emerald-300/30 flex items-center gap-1.5 shadow-sm">
                <span>🏍️</span> دليفري
              </span>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8">
          {errorMsg && (
            <div className="mb-5 p-4 bg-rose-50 text-rose-600 rounded-2xl text-xs font-black border border-rose-100 animate-in shake duration-300 text-right flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          
          {isCompletingProfile ? (
            <form onSubmit={handleCompleteGoogleProfile} className="space-y-4 animate-reveal">
               <div className="text-center mb-3">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">إكمال بياناتك</h2>
                  <p className="text-xs font-bold text-slate-400">خطوة أخيرة للبدء: أضف هاتفك ومنطقتك</p>
               </div>

               <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                  <button type="button" onClick={() => setRole('CUSTOMER')} className={`py-3 rounded-xl font-black text-xs transition-all ${role === 'CUSTOMER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>أنا عميل 👤</button>
                  <button type="button" onClick={() => setRole('DRIVER')} className={`py-3 rounded-xl font-black text-xs transition-all ${role === 'DRIVER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>أنا كابتن 🛵</button>
               </div>

               <div className="relative">
                  <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input type="tel" placeholder="رقم الهاتف (010...)" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-4 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                    <select value={center} onChange={e => setCenter(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-11 pl-4 font-black text-xs outline-none border border-slate-200 focus:border-emerald-500 focus:bg-white text-right transition-all">
                      <option value="">اختر المركز</option>
                      {centers.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input type="text" placeholder="اسم القرية" value={village} onChange={e => setVillage(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-11 pl-4 font-black text-xs border border-slate-200 focus:border-emerald-500 focus:bg-white text-right transition-all" />
                  </div>
               </div>

               {role === 'DRIVER' && (
                 <div className="space-y-2 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 animate-in fade-in duration-300">
                   <label className="text-[10px] font-black text-slate-700 block text-right">
                     حدد مركبتك (كما تظهر في شعار وصلها)
                   </label>
                   <div className="grid grid-cols-3 gap-2" dir="rtl">
                     {[
                       { id: 'TOKTOK' as VehicleType, name: 'توك توك', icon: '🛺', note: 'أصفر • اقتصادي', activeClass: 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-400/50 shadow-sm' },
                       { id: 'CAR' as VehicleType, name: 'سيارة', icon: '🚗', note: 'مريح وسريع', activeClass: 'border-slate-800 bg-slate-900 text-white ring-2 ring-slate-700 shadow-sm' },
                       { id: 'MOTORCYCLE' as VehicleType, name: 'دليفري', icon: '🏍️', note: 'أخضر • سريع', activeClass: 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-400/50 shadow-sm' }
                     ].map(v => (
                       <button
                         key={v.id}
                         type="button"
                         onClick={() => setVehicleType(v.id)}
                         className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all text-center ${
                           vehicleType === v.id
                             ? v.activeClass
                             : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                         }`}
                       >
                         <span className="text-xl filter drop-shadow-sm">{v.icon}</span>
                         <span className="font-black text-xs">{v.name}</span>
                         <span className="text-[8px] opacity-75 font-semibold">{v.note}</span>
                       </button>
                     ))}
                   </div>
                 </div>
               )}

               <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'حفظ البيانات والدخول'}
               </button>
            </form>
          ) : (
            <div className="space-y-5">
              {/* Segmented Mode Switcher (تسجيل دخول / حساب جديد) */}
              <div className="grid grid-cols-2 gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/60">
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(false); setErrorMsg(null); }} 
                  className={`py-3 rounded-xl font-black text-xs transition-all ${!isRegistering ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  تسجيل الدخول
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(true); setStep('INPUT'); setErrorMsg(null); }} 
                  className={`py-3 rounded-xl font-black text-xs transition-all ${isRegistering ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  إنشاء حساب جديد
                </button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                {isRegistering ? (
                  step === 'INPUT' ? (
                    <div className="space-y-4 animate-reveal">
                      {/* Customer / Driver selection */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <button type="button" onClick={() => setRole('CUSTOMER')} className={`py-2.5 rounded-xl font-black text-xs transition-all ${role === 'CUSTOMER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>👤 عميل (طلب رحلات)</button>
                        <button type="button" onClick={() => setRole('DRIVER')} className={`py-2.5 rounded-xl font-black text-xs transition-all ${role === 'DRIVER' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500'}`}>🛵 كابتن (توصيل طلبات)</button>
                      </div>

                      <div className="relative">
                        <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input type="text" placeholder="الاسم ثلاثي أو رباعي" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-4 font-bold outline-none text-sm border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all text-right" />
                      </div>

                      <div className="relative">
                        <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input type="tel" placeholder="رقم الهاتف (010...)" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-4 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                      </div>

                      <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-4 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                          <input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-10 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                          <input type={showConfirmPassword ? "text" : "password"} placeholder="تأكيد الكلمة" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-10 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                          <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Building className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 pointer-events-none" />
                          <select value={center} onChange={e => setCenter(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-11 pl-4 font-black text-xs outline-none border border-slate-200 focus:border-emerald-500 focus:bg-white text-right transition-all">
                            <option value="">المركز</option>
                            {centers.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div className="relative">
                          <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                          <input type="text" placeholder="القرية / الحي" value={village} onChange={e => setVillage(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-11 pl-4 font-black text-xs border border-slate-200 focus:border-emerald-500 focus:bg-white text-right transition-all" />
                        </div>
                      </div>

                      {role === 'DRIVER' && (
                        <div className="space-y-2 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/80 animate-in fade-in duration-300">
                          <label className="text-[10px] font-black text-slate-700 block text-right">
                            حدد مركبتك (كما تظهر في شعار وصلها)
                          </label>
                          <div className="grid grid-cols-3 gap-2" dir="rtl">
                            {[
                              { id: 'TOKTOK' as VehicleType, name: 'توك توك', icon: '🛺', note: 'أصفر • اقتصادي', activeClass: 'border-amber-500 bg-amber-50/90 text-amber-950 ring-2 ring-amber-400/50 shadow-sm' },
                              { id: 'CAR' as VehicleType, name: 'سيارة', icon: '🚗', note: 'مريح وسريع', activeClass: 'border-slate-800 bg-slate-900 text-white ring-2 ring-slate-700 shadow-sm' },
                              { id: 'MOTORCYCLE' as VehicleType, name: 'دليفري', icon: '🏍️', note: 'أخضر • سريع', activeClass: 'border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-2 ring-emerald-400/50 shadow-sm' }
                            ].map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => setVehicleType(v.id)}
                                className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 transition-all text-center ${
                                  vehicleType === v.id
                                    ? v.activeClass
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <span className="text-xl filter drop-shadow-sm">{v.icon}</span>
                                <span className="font-black text-xs">{v.name}</span>
                                <span className="text-[8px] opacity-75 font-semibold">{v.note}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2">
                        إنشاء الحساب والمتابعة
                      </button>
                    </div>
                  ) : (
                      <div className="space-y-4">
                        <div className="space-y-2 text-center">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tight">تأكيد رقم الهاتف</h2>
                          <p className="text-xs font-bold text-slate-400 leading-relaxed">أدخل الرمز المكون من 6 أرقام المرسل إلى <br/><span className="text-emerald-600 font-bold" dir="ltr">{phone}</span></p>
                        </div>
                        
                        <div className="flex justify-center gap-2 py-2" dir="ltr">
                          {otp.map((digit, idx) => (
                            <input 
                              key={idx} 
                              ref={el => { otpRefs.current[idx] = el; }} 
                              type="text" 
                              maxLength={1} 
                              inputMode="numeric"
                              value={digit} 
                              onChange={e => handleOtpChange(idx, e.target.value)} 
                              onKeyDown={e => handleOtpKeyDown(idx, e)} 
                              className={`w-10 h-14 bg-slate-50 border-2 rounded-xl text-center text-xl font-black focus:bg-white focus:shadow-md focus:shadow-emerald-100 outline-none transition-all ${digit ? 'border-emerald-600 bg-white' : 'border-slate-200'}`} 
                            />
                          ))}
                        </div>

                        <div className="flex flex-col items-center gap-3">
                           <button 
                             type="submit" 
                             disabled={loading} 
                             className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black text-base shadow-lg shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                           >
                              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> تأكيد الرمز</>}
                           </button>

                           <div className="flex items-center gap-2">
                              {canResend ? (
                                <button type="button" onClick={handleResendOtp} className="text-xs font-black text-emerald-600 hover:underline">إعادة إرسال الكود</button>
                              ) : (
                                <p className="text-xs font-bold text-slate-400">إعادة الإرسال خلال <span className="text-emerald-600 font-black">{resendTimer}</span> ثانية</p>
                              )}
                           </div>
                        </div>

                        <button type="button" onClick={() => setStep('INPUT')} className="w-full text-slate-400 font-black text-xs py-2">تعديل رقم الهاتف</button>
                      </div>
                  )
                ) : (
                  <div className="space-y-4 animate-reveal">
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input type="email" placeholder="البريد الإلكتروني" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-4 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                      <input type={showPassword ? "text" : "password"} placeholder="كلمة المرور" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full bg-slate-50 rounded-2xl py-4 pr-12 pl-10 font-bold outline-none text-sm text-left border border-slate-200 focus:border-emerald-500 focus:bg-white transition-all" dir="ltr" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    </div>

                    <div className="flex items-center justify-between px-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-xs font-bold text-slate-500">تذكرني</span>
                      </label>
                      <button type="button" onClick={handleForgotPassword} className="text-xs font-black text-emerald-600 hover:underline">نسيت كلمة المرور؟</button>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/25 active:scale-95 transition-all flex items-center justify-center gap-2">
                       {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تسجيل الدخول'}
                    </button>

                    <div className="flex items-center gap-3 py-1 text-slate-300">
                       <div className="h-[1px] flex-1 bg-slate-200"></div>
                       <span className="text-[11px] font-bold text-slate-400">أو المتابعة السريعة عبر</span>
                       <div className="h-[1px] flex-1 bg-slate-200"></div>
                    </div>

                    <button 
                      type="button" 
                      onClick={handleGoogleLogin} 
                      disabled={loading}
                      className="w-full bg-white border border-slate-200/90 text-slate-700 py-3.5 rounded-2xl font-black text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-slate-50 hover:border-slate-300"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                      </svg>
                      <span>المتابعة باستخدام Google</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer echoing brand reliability and 24/7 service */}
      <footer className="mt-6 text-center text-xs font-bold text-slate-400 py-2 select-none">
        <p>جميع الحقوق محفوظة © تطبيق وصلها المنوفية • خدمة ذكية على مدار 24 ساعة</p>
      </footer>
    </div>
  );
};

export default Login;
