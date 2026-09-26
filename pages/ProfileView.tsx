import React, { useState, useRef, useEffect } from 'react';

// Types
import type { User, Order } from '../types';
import { OrderStatus } from '../types';
import { MENOFIA_DATA } from '../config/constants';

// Services
import { auth, db } from '../services/firebase';
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Icons
import { 
  User as UserIcon, Smartphone, Edit3, Camera, Loader2, ChevronRight, 
  Bike, Car, Star, ShieldCheck, Zap, Wallet as WalletIcon, ArrowRight,
  Building2, MapPin, LogOut, AlertTriangle, X
} from 'lucide-react';

const ProfileView: React.FC<{ user: User, onUpdate: (u: User) => void, onBack: () => void, onOpenWallet?: () => void }> = ({ user, onUpdate, onBack, onOpenWallet }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async () => {
    if (!name.trim() || phone.length < 11) {
      alert("يرجى التأكد من الاسم ورقم الهاتف");
      return;
    }
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.id), { name, phone });
      onUpdate({ ...user, name, phone });
      setIsEditing(false);
    } catch (e) { 
      alert('خطأ في التحديث'); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) return alert('يرجى اختيار ملف صورة صحيح');
    setIsUploading(true);
    const reader = new FileReader();
    
    reader.onload = async () => {
      const base64Image = reader.result as string;
      try {
        await updateDoc(doc(db, "users", user.id), { photoURL: base64Image });
        onUpdate({ ...user, photoURL: base64Image });
      } catch (err) {
        alert('فشل في حفظ الصورة');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    try {
      setShowLogoutConfirm(false);
      await signOut(auth);
      // إعادة تحميل الصفحة بالكامل لضمان الخروج الآمن وتجنب أخطاء المسارات
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-32 space-y-6 p-5 md:p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto h-full no-scrollbar relative" dir="rtl">
      
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1200] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center space-y-5 shadow-2xl animate-in zoom-in-95 border border-slate-100">
              <div className="bg-rose-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
                <LogOut className="h-9 w-9 rotate-180" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-2xl font-black text-slate-900">تأكيد الخروج</h3>
                 <p className="text-xs font-medium text-slate-500">هل تريد حقاً تسجيل الخروج من حسابك في وصلها؟</p>
              </div>
              <div className="flex flex-col gap-2.5 pt-2">
                 <button onClick={handleLogout} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-all">نعم، تسجيل الخروج</button>
                 <button onClick={() => setShowLogoutConfirm(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-sm active:scale-95 transition-all">إلغاء والتراجع</button>
              </div>
           </div>
        </div>
      )}

      <div className="flex items-center justify-between px-1">
        <div className="text-right">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">حسابي الشخصي</h2>
           <p className="text-xs font-medium text-slate-500 mt-0.5">إدارة بيانات حسابك وتفاصيل محفظتك</p>
        </div>
        <button onClick={onBack} className="p-3 bg-white border border-slate-200/70 rounded-2xl shadow-xs active:scale-90 hover:bg-slate-50 transition-all text-slate-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Profile Header Hero Card */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 rounded-3xl p-8 md:p-10 text-white text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative inline-block group">
          <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center mb-5 overflow-hidden border-4 border-white/30 shadow-xl relative transition-transform hover:scale-105 duration-300">
            {isUploading ? (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            ) : null}
            
            {user.photoURL ? (
              <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-white/10 text-white font-black text-4xl">
                {(user.name || 'ع')[0]}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-4 -right-1 bg-white text-emerald-700 p-2.5 rounded-xl shadow-lg active:scale-75 transition-all border-2 border-emerald-600 hover:rotate-6"
            title="تغيير الصورة"
          >
            <Camera className="h-4 w-4" />
          </button>
          
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
        </div>

        <h3 className="text-2xl font-black tracking-tight">{user.name}</h3>
        <p className="text-xs text-white/80 font-semibold mt-1" dir="ltr">{user.phone}</p>
        <div className="flex items-center justify-center gap-2 mt-3">
          {user.status === 'APPROVED' && (
            <div className="flex items-center gap-1.5 bg-white/15 text-emerald-100 px-3.5 py-1 rounded-full text-xs font-bold border border-white/20 backdrop-blur-md">
               <ShieldCheck className="h-4 w-4 text-emerald-300" /> حساب معتمد وموثق
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {onOpenWallet && (
           <div>
              <button 
                onClick={onOpenWallet} 
                className="w-full bg-slate-900 hover:bg-slate-950 text-white p-6 rounded-3xl flex justify-between items-center shadow-md group active:scale-[0.99] transition-all border border-slate-800"
              >
                 <div className="flex items-center gap-4 text-right">
                    <div className="brand-gradient p-3.5 rounded-2xl group-hover:scale-110 transition-transform shadow-md shadow-emerald-900/40">
                       <WalletIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                       <p className="text-[11px] font-bold text-emerald-400 mb-0.5">رصيد المحفظة</p>
                       <p className="text-2xl font-black">{(user.wallet?.balance || 0).toFixed(2)} <span className="text-xs opacity-60 font-bold">ج.م</span></p>
                    </div>
                 </div>
                 <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold bg-white/5 px-3 py-1.5 rounded-xl">
                   <span>إدارة</span>
                   <ChevronRight className="h-4 w-4 rotate-180" />
                 </div>
              </button>
           </div>
        )}

        <div className="glass-card p-6 md:p-8 rounded-3xl shadow-xs border border-slate-200/60 space-y-6">
           <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-emerald-600" /> البيانات الأساسية
              </h4>
              <button 
                onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} 
                disabled={isSaving}
                className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all ${
                  isEditing 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : isEditing ? 'حفظ التعديلات' : 'تعديل البيانات'}
              </button>
           </div>
           <div className="space-y-4">
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-600 block">الاسم الكامل</label>
                 <input 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   disabled={!isEditing} 
                   className={`w-full rounded-2xl p-4 font-bold text-sm outline-none transition-all ${
                     isEditing 
                       ? 'bg-white border-2 border-emerald-500 ring-2 ring-emerald-500/20' 
                       : 'bg-slate-50 border border-slate-200 text-slate-800'
                   }`} 
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-600 block">رقم الهاتف المسجل</label>
                 <input 
                   value={phone} 
                   onChange={e => setPhone(e.target.value)} 
                   disabled={!isEditing} 
                   maxLength={11} 
                   className={`w-full rounded-2xl p-4 font-bold text-sm outline-none transition-all text-left ${
                     isEditing 
                       ? 'bg-white border-2 border-emerald-500 ring-2 ring-emerald-500/20' 
                       : 'bg-slate-50 border border-slate-200 text-slate-800'
                   }`} 
                   dir="ltr" 
                 />
              </div>
           </div>
        </div>

        <div className="pt-2">
           <button 
             onClick={() => setShowLogoutConfirm(true)}
             className="w-full bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 p-5 rounded-3xl flex items-center justify-between border border-rose-200/70 active:scale-[0.99] transition-all group"
           >
              <div className="flex items-center gap-3.5">
                 <div className="bg-white p-3 rounded-2xl shadow-xs text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                   <LogOut className="h-5 w-5 rotate-180" />
                 </div>
                 <div className="text-right">
                    <p className="font-extrabold text-base">تسجيل الخروج</p>
                    <p className="text-xs text-rose-500/80 font-medium">الخروج بأمان من هذا الجهاز</p>
                 </div>
              </div>
              <ChevronRight className="h-5 w-5 text-rose-400 rotate-180" />
           </button>
        </div>
      </div>
      
      <div className="py-6 text-center text-slate-400 space-y-1">
         <p className="text-xs font-bold">تطبيق وصلها • محافظة المنوفية</p>
         <p className="text-[10px] text-slate-400">الإصدار الذكي 2.0 • كل الحقوق محفوظة</p>
      </div>
    </div>
  );
};

export default ProfileView;