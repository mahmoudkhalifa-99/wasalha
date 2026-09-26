
import React, { useState, useRef, useEffect } from 'react';
import { User, VehicleType, Order, OrderStatus } from '../types';
import { 
  User as UserIcon, 
  Smartphone, 
  Edit3, 
  Save, 
  Camera,
  Loader2,
  ChevronRight,
  Bike,
  Car,
  Star,
  ShieldCheck,
  Calendar,
  MapPin,
  Trophy,
  History,
  Zap,
  ArrowRight
} from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const ToktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 15h18" /><path d="M5 15V9a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /><path d="M10 7v8" /><path d="M14 7v8" />
  </svg>
);

// Added onOpenWallet to props interface to match CustomerDashboard usage
const ProfileView: React.FC<{ user: User, onUpdate: (u: User) => void, onBack: () => void, onOpenWallet?: () => void }> = ({ user, onUpdate, onBack, onOpenWallet }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [stats, setStats] = useState({ totalOrders: 0, rating: 5.0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const field = user.role === 'DRIVER' ? 'driverId' : 'customerId';
      const q = query(collection(db, "orders"), where(field, "==", user.id));
      const snap = await getDocs(q);
      const orders = snap.docs.map(d => d.data() as Order);
      const completed = orders.filter(o => o.status === OrderStatus.DELIVERED || o.status === OrderStatus.DELIVERED_RATED);
      const ratings = completed.filter(o => o.rating).map(o => o.rating!);
      const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 5.0;
      setStats({ totalOrders: orders.length, rating: Number(avgRating) });
    };
    fetchStats();
  }, [user.id]);

  const handleUpdateProfile = async () => {
    if (!name.trim() || phone.length < 11) {
      alert("يرجى التأكد من الاسم ورقم الهاتف");
      return;
    }
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, { name, phone });
      onUpdate({ ...user, name, phone });
      setIsEditing(false);
    } catch (error) {
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const userRef = doc(db, "users", user.id);
        await updateDoc(userRef, { photoURL: base64String });
        onUpdate({ ...user, photoURL: base64String });
      } catch (error) {
        alert('فشل في رفع الصورة');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-2xl mx-auto pb-20 space-y-8 animate-in slide-in-from-bottom duration-700">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">الصفحة الشخصية</h2>
        <button onClick={onBack} className="bg-white border border-slate-100 p-3.5 rounded-[1.5rem] text-slate-400 hover:text-[#2D9469] shadow-sm active:scale-90 transition-all">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="bg-[#2D9469] rounded-[4rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] -mr-32 -mt-32"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative group mb-8">
            <div className="w-40 h-40 bg-white/20 backdrop-blur-2xl rounded-[3.5rem] border-8 border-white/10 flex items-center justify-center shadow-2xl overflow-hidden relative transition-transform group-hover:scale-105 duration-500">
              {isUploading ? (
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              ) : user.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.name} />
              ) : (
                <span className="text-5xl font-black text-white opacity-40">{(user.name || 'م')[0]}</span>
              )}
            </div>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-4 -right-2 bg-white text-[#2D9469] p-4 rounded-3xl shadow-2xl active:scale-90 transition-all border-4 border-[#2D9469]">
              <Camera className="h-6 w-6" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <h3 className="text-3xl font-black mb-2">{user.name}</h3>
          <div className="flex items-center gap-3">
             <div className="bg-white/20 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                {user.role === 'DRIVER' ? 'كابتن أشمون' : 'عميل مميز'}
             </div>
             {user.status === 'APPROVED' && (
               <div className="flex items-center gap-2 bg-emerald-400/20 text-emerald-100 px-4 py-2 rounded-full text-[9px] font-black border border-emerald-400/20">
                  <ShieldCheck className="h-3.5 w-3.5" /> حساب موثق
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 px-2">
         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Zap className="h-5 w-5" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">المشاوير</p>
            <p className="text-xl font-black text-slate-800">{stats.totalOrders}</p>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl"><Star className="h-5 w-5" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التقييم</p>
            <p className="text-xl font-black text-slate-800">{stats.rating}</p>
         </div>
         <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar className="h-5 w-5" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">منذ</p>
            <p className="text-xl font-black text-slate-800">2024</p>
         </div>
      </div>

      {/* Wallet Shortcut - Added to match CustomerDashboard requirement */}
      {onOpenWallet && (
         <div className="px-2">
           <button onClick={onOpenWallet} className="w-full bg-slate-950 text-white p-8 rounded-[3rem] flex justify-between items-center shadow-xl group active:scale-95 transition-all">
              <div className="flex items-center gap-5">
                 <div className="bg-emerald-500 p-4 rounded-2xl">
                    <Zap className="h-6 w-6 text-white" />
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">محفظتي</p>
                    <p className="text-2xl font-black">{(user.wallet?.balance || 0).toFixed(1)} <span className="text-xs opacity-40">ج.م</span></p>
                 </div>
              </div>
              <ArrowRight className="h-6 w-6 text-slate-700" />
           </button>
         </div>
      )}

      {/* Info Sections */}
      <div className="space-y-6">
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-slate-100 space-y-8">
           <div className="flex justify-between items-center mb-2">
              <h4 className="text-xl font-black text-slate-800 flex items-center gap-3"><Edit3 className="h-5 w-5 text-[#2D9469]" /> البيانات الأساسية</h4>
              <button 
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} 
                disabled={isSaving}
                className={`px-8 py-3 rounded-2xl font-black text-xs transition-all ${isEditing ? 'bg-[#2D9469] text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:text-[#2D9469]'}`}
              >
                {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEditing ? 'حفظ التغييرات' : 'تعديل البيانات'}
              </button>
           </div>

           <div className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">الاسم بالكامل</label>
                 <div className="relative">
                    <UserIcon className={`absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isEditing ? 'text-[#2D9469]' : 'text-slate-300'}`} />
                    <input 
                      disabled={!isEditing} 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className={`w-full bg-slate-50 rounded-[1.8rem] py-5 pr-14 pl-6 font-black text-sm outline-none transition-all ${isEditing ? 'bg-white border-2 border-[#2D9469]/20 shadow-inner' : 'border border-transparent'}`} 
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">رقم الموبايل</label>
                 <div className="relative">
                    <Smartphone className={`absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${isEditing ? 'text-[#2D9469]' : 'text-slate-300'}`} />
                    <input 
                      disabled={!isEditing} 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      maxLength={11}
                      className={`w-full bg-slate-50 rounded-[1.8rem] py-5 pr-14 pl-6 font-black text-sm outline-none text-left transition-all ${isEditing ? 'bg-white border-2 border-[#2D9469]/20 shadow-inner' : 'border border-transparent'}`} 
                      dir="ltr"
                    />
                 </div>
              </div>
           </div>
        </div>

        {user.role === 'DRIVER' && (
          <div className="bg-slate-900 text-white p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
             <h4 className="text-xl font-black mb-8 flex items-center gap-3 text-emerald-400"><History className="h-5 w-5" /> معلومات الكابتن</h4>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">نوع المركبة</p>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500 rounded-lg">{user.vehicleType === 'CAR' ? <Car className="h-4 w-4" /> : user.vehicleType === 'MOTORCYCLE' ? <Bike className="h-4 w-4" /> : <ToktokIcon className="h-4 w-4" />}</div>
                      <span className="font-black text-sm">{user.vehicleType || 'توكتوك'}</span>
                   </div>
                </div>
                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-2">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">المنطقة</p>
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500 rounded-lg"><MapPin className="h-4 w-4" /></div>
                      <span className="font-black text-sm">أشمون</span>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      <div className="p-10 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm text-center space-y-4">
         <Trophy className="h-10 w-10 text-amber-400 mx-auto" />
         <h5 className="font-black text-slate-800">نظام الولاء والمكافآت</h5>
         <p className="text-xs font-bold text-slate-400 leading-relaxed px-4">استمر في استخدام "وصلها أشمون" لجمع النقاط والحصول على خصومات حصرية في مشاويرك القادمة.</p>
         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-[#2D9469] w-1/3 rounded-full"></div>
         </div>
         <p className="text-[9px] font-black text-[#2D9469] uppercase tracking-[0.2em]">المستوى البرونزي • 320 نقطة</p>
      </div>
      
      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] py-8">
        كل الحقوق محفوظه ©M.r Mahmoud Khalifa
      </p>
    </div>
  );
};

export default ProfileView;