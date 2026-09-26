
import React, { useState } from 'react';

// Types
import type { User, VehicleType } from './types';

// Utils
import { stripFirestore } from './utils';

// Firebase
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  Bike, Mail, Lock, User as UserIcon, 
  Smartphone, ShieldCheck,
  ChevronLeft, Car, Globe, Trophy, 
  Loader2, ArrowRight, MessageCircle, Zap
} from 'lucide-react';

const APP_LOGO_ICON = "/icon-192.png";

const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const slides = [
    { title: "أهلاً بك في أشمون", body: "تطبيق التوصيل الأول والوحيد المخصص لخدمة مركز أشمون وكافة قراه بعزة وكرامة.", icon: <Globe className="h-20 w-20 text-emerald-400" />, color: "from-[#2D9469] to-[#1e6346]" },
    { title: "كباتن ثقة وأمان", body: "كل رحلاتك مراقبة ومؤمنة، كباتننا هم جيرانك وأهلك من قلب أشمون.", icon: <ShieldCheck className="h-20 w-20 text-emerald-400" />, color: "from-slate-900 to-slate-800" },
    { title: "وفر وقتك وفلوسك", body: "أفضل تسعيرة في المنوفية، مع نظام نقاط ومكافآت لكل مشوار بتمشي معانا فيه.", icon: <Trophy className="h-20 w-20 text-amber-400" />, color: "from-indigo-900 to-indigo-800" }
  ];

  return (
    <div className={`fixed inset-0 z-[5000] flex flex-col transition-all duration-1000 bg-gradient-to-br ${slides[step].color}`}>
       <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-white space-y-12">
          <div className="bg-white/10 p-16 rounded-[4.5rem] backdrop-blur-3xl animate-in zoom-in duration-700 shadow-2xl border border-white/20">
             {slides[step].icon}
          </div>
          <div className="space-y-6 animate-in slide-in-from-bottom duration-1000 max-w-sm">
             <h2 className="text-5xl font-black tracking-tighter leading-tight">{slides[step].title}</h2>
             <p className="text-white/70 font-bold leading-relaxed text-md">{slides[step].body}</p>
          </div>
       </div>
       <div className="p-12 pb-20 space-y-12 bg-gradient-to-t from-black/20 to-transparent">
          <div className="flex justify-center gap-3">
             {slides.map((_, i) => (
               <div key={i} className={`h-2.5 rounded-full transition-all duration-500 ${i === step ? 'w-16 bg-white' : 'w-2.5 bg-white/20'}`}></div>
             ))}
          </div>
          <div className="flex gap-4">
             {step > 0 && (
               <button onClick={() => setStep(step - 1)} className="p-7 bg-white/10 text-white rounded-[2.5rem] backdrop-blur-md active:scale-90 transition-all">
                 <ArrowRight className="h-6 w-6" />
               </button>
             )}
             <button onClick={() => step < slides.length - 1 ? setStep(step + 1) : onComplete()} className="flex-1 bg-white text-slate-900 py-7 rounded-[3rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl active:scale-95 transition-all">
                {step === slides.length - 1 ? 'ابدأ مشوارك الآن' : 'استمر'}
                <ChevronLeft className="h-6 w-6" />
             </button>
          </div>
       </div>
    </div>
  );
};

const Login: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [step, setStep] = useState<'INPUT' | 'OTP'>('INPUT');
  const [role, setRole] = useState<'CUSTOMER' | 'DRIVER'>('CUSTOMER');
  const [vehicleType, setVehicleType] = useState<VehicleType>('TOKTOK');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const validateInputs = () => {
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length < 4) {
      setErrorMsg('يرجى إدخال الاسم رباعياً لضمان التوثيق');
      return false;
    }

    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      setErrorMsg('رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010 أو 011 أو 012 أو 015 ويكون 11 رقماً');
      return false;
    }

    if (password.length < 8) {
      setErrorMsg('كلمة المرور يجب أن تكون 8 رموز على الأقل');
      return false;
    }
    if (!/[a-zA-Z]/.test(password)) {
      setErrorMsg('كلمة المرور يجب أن تحتوي على حرف واحد على الأقل');
      return false;
    }

    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isRegistering && step === 'INPUT') {
      if (!validateInputs()) return;

      setLoading(true);
      const whatsappMsg = `أنا ${name}\nرقم هاتفي: ${phone}\nمحتاج كود تفعيل لتطبيق وصلها أشمون.`;
      window.open(`https://wa.me/201065019364?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
      
      setTimeout(() => { 
        setStep('OTP'); 
        setLoading(false); 
      }, 1000);
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const userData: User = {
          id: userCredential.user.uid, email, name, phone, role,
          status: role === 'DRIVER' ? 'PENDING_APPROVAL' : 'APPROVED',
          vehicleType: role === 'DRIVER' ? vehicleType : undefined,
          wallet: { balance: 0, totalEarnings: 0, withdrawn: 0 }
        };
        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        onLogin(userData);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userSnap.exists()) onLogin(stripFirestore(userSnap.data()) as User);
      }
    } catch (err: any) { 
      let msg = "حدث خطأ ما";
      if (err.code === 'auth/email-already-in-use') msg = "هذا البريد الإلكتروني مسجل بالفعل";
      if (err.code === 'auth/weak-password') msg = "كلمة المرور ضعيفة جداً";
      if (err.code === 'auth/invalid-email') msg = "البريد الإلكتروني غير صحيح";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = "بيانات الدخول غير صحيحة";
      setErrorMsg(msg);
    } finally { 
      setLoading(false); 
    }
  };

  if (showOnboarding) return <Onboarding onComplete={() => setShowOnboarding(false)} />;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 font-['Cairo'] relative">
      <div className="w-full max-w-xl bg-white rounded-[5rem] shadow-2xl border border-slate-50 overflow-hidden animate-in zoom-in duration-700">
        <div className="bg-[#2D9469] p-12 text-center flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-3xl bg-white p-2 shadow-2xl mb-4 overflow-hidden flex items-center justify-center ring-4 ring-white/20">
            <img src={APP_LOGO_ICON} alt="شعار وصلها" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">وصلها</h1>
          <p className="text-emerald-100 font-bold text-xs mt-1 tracking-wider">خدمة التوصيل الذكية بالمنوفية</p>
        </div>
        <div className="p-12">
          {errorMsg && <div className="mb-8 p-6 bg-rose-50 text-rose-600 rounded-[2rem] text-sm font-black border border-rose-100 animate-in shake">{errorMsg}</div>}
          <form onSubmit={handleAuth} className="space-y-6">
            {isRegistering ? (
              step === 'INPUT' ? (
                <div className="space-y-6">
                  <div className="flex bg-slate-100 p-2 rounded-[2.5rem]">
                    <button type="button" onClick={() => setRole('CUSTOMER')} className={`flex-1 py-4 rounded-[2.2rem] font-black text-xs ${role === 'CUSTOMER' ? 'bg-white text-[#2D9469] shadow-md' : 'text-slate-400'}`}>عميل</button>
                    <button type="button" onClick={() => setRole('DRIVER')} className={`flex-1 py-4 rounded-[2.2rem] font-black text-xs ${role === 'DRIVER' ? 'bg-white text-[#2D9469] shadow-md' : 'text-slate-400'}`}>كابتن</button>
                  </div>

                  {role === 'DRIVER' && (
                    <div className="space-y-3 animate-in zoom-in duration-300">
                      <label className="text-[10px] font-black text-slate-400 block px-4 uppercase tracking-widest">نوع المركبة</label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'TOKTOK' as VehicleType, icon: <Zap className="h-5 w-5" />, label: 'توكتوك' },
                          { id: 'MOTORCYCLE' as VehicleType, icon: <Bike className="h-5 w-5" />, label: 'موتوسيكل' },
                          { id: 'CAR' as VehicleType, icon: <Car className="h-5 w-5" />, label: 'سيارة' }
                        ].map(v => (
                          <button 
                            key={v.id} 
                            type="button" 
                            onClick={() => setVehicleType(v.id)} 
                            className={`py-4 rounded-[1.8rem] flex flex-col items-center gap-2 border-2 transition-all ${vehicleType === v.id ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-md' : 'bg-slate-50 border-transparent text-slate-300'}`}
                          >
                            {v.icon}
                            <span className="text-[9px] font-black">{v.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <UserIcon className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                    <input type="text" placeholder="الاسم الرباعي" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 pr-14 pl-6 font-black outline-none focus:border-[#2D9469] border border-transparent transition-all" />
                  </div>
                  <div className="relative">
                    <Smartphone className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                    <input type="tel" placeholder="رقم الموبايل (010...)" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 pr-14 pl-6 font-black outline-none text-left" dir="ltr" />
                  </div>
                  <div className="relative">
                    <Mail className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                    <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 pr-14 pl-6 font-black outline-none text-left" dir="ltr" />
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
                    <input type="password" placeholder="كلمة المرور (٨ رموز وحرف)" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 pr-14 pl-6 font-black outline-none text-left" dir="ltr" />
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-7 rounded-[2.5rem] font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'طلب رمز التفعيل'}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 text-center animate-in zoom-in">
                  <h2 className="text-2xl font-black">أثبت هويتك</h2>
                  <p className="text-xs font-bold text-slate-400">أدخل الرمز الذي أرسلته لك الإدارة</p>
                  <input type="text" maxLength={6} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] py-8 text-center text-4xl font-black tracking-[0.5em]" />
                  <button type="submit" disabled={loading} className="w-full bg-[#2D9469] text-white py-7 rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'إنشاء الحساب'}
                  </button>
                  <button type="button" onClick={() => setStep('INPUT')} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تعديل البيانات</button>
                </div>
              )
            ) : (
              <div className="space-y-6">
                <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 px-8 font-black outline-none text-left" dir="ltr" />
                <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 rounded-[1.8rem] py-6 px-8 font-black outline-none text-left" dir="ltr" />
                <button type="submit" disabled={loading} className="w-full bg-[#2D9469] text-white py-7 rounded-[2.5rem] font-black shadow-xl flex items-center justify-center gap-4">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'دخول'}
                </button>
              </div>
            )}
            <button type="button" onClick={() => { setIsRegistering(!isRegistering); setStep('INPUT'); setErrorMsg(null); }} className="w-full text-slate-400 font-black text-[10px] py-4 uppercase tracking-widest">
              {isRegistering ? 'لديك حساب؟ سجل دخولك' : 'جديد في أشمون؟ انضم إلينا'}
            </button>
          </form>
        </div>
      </div>
      
      <footer className="app-footer">
        © جميع الحقوق محفوظة – M.R Mahmoud Khalifa
      </footer>
    </div>
  );
};

export default Login;
