
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { db, messaging, getToken } from '../services/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stripFirestore } from '../utils';
import { Bell, Info, CheckCircle, AlertCircle, ChevronRight, Loader2, Volume2, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  createdAt: number;
  read: boolean;
}

const NotificationsView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isActivating, setIsActivating] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }

    const q = query(collection(db, "notifications"), where("userId", "in", [user.id, "ALL", user.role]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as NotificationItem[];
      setNotifications(docs.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.id, user.role]);

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("عذراً، متصفحك لا يدعم إشعارات النظام.");
      return;
    }

    setIsActivating(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);

      if (permission === "granted") {
        // مفتاح VAPID العام من Firebase Console
        const VAPID_KEY = "BGH9nBvH8O8r6M8D9v6_R1i_v4_Y7_Y6_Y5_Y4_Y3_Y2_Y1_Y0"; // استبدله بمفتاحك الحقيقي إذا لزم الأمر
        
        // الحصول على تسجيل Service Worker الحالي
        const registration = await navigator.serviceWorker.getRegistration();
        
        const token = await getToken(messaging, { 
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: registration
        });
        
        if (token) {
          // حفظ التوكن في Firestore لتمكين الإرسال من السيرفر
          await updateDoc(doc(db, "users", user.id), {
            fcmToken: token,
            notificationsEnabled: true,
            lastTokenUpdate: Date.now()
          });
          alert("تم تفعيل إشعارات الهاتف بنجاح! ستصلك التنبيهات حتى والتطبيق مغلق.");
        }
      } else {
        alert("يجب السماح بالإشعارات من إعدادات المتصفح لتلقي التنبيهات.");
      }
    } catch (error) {
      console.error("Notification Error:", error);
      alert("فشل تفعيل الإشعارات، يرجى المحاولة لاحقاً.");
    } finally {
      setIsActivating(false);
    }
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 p-6 animate-in fade-in duration-500 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center px-2">
        <div className="text-right">
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">مركز التنبيهات</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تنبيهات النظام والرسائل</p>
        </div>
        <div className="flex items-center gap-3">
          {notifications.some(n => !n.read) && (
            <button onClick={markAllAsRead} className="text-[10px] font-black text-[#2D9469] uppercase tracking-widest px-2">قراءة الكل</button>
          )}
          <button onClick={onBack} className="p-3.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm active:scale-90 transition-all"><ChevronRight /></button>
        </div>
      </div>

      {/* بطاقة تفعيل الإشعارات */}
      {permissionStatus !== "granted" && (
        <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-white/5 animate-reveal">
           <div className="absolute top-0 right-0 w-32 h-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-all"></div>
           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4 flex-row-reverse text-right">
                 <div className="bg-white/10 p-4 rounded-2xl shadow-inner border border-white/10">
                    <Smartphone className="h-8 w-8 text-emerald-400" />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-xl font-black">فعّل تنبيهات الهاتف</h4>
                    <p className="text-[10px] font-bold opacity-60 mt-1">لتصلك العروض والرسائل فوراً كرسالة نصية على هاتفك</p>
                 </div>
              </div>
              <button 
                onClick={requestNotificationPermission}
                disabled={isActivating}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isActivating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
                تفعيل الإشعارات الآن
              </button>
           </div>
        </div>
      )}

      {permissionStatus === "granted" && (
        <div className="bg-emerald-50 border-2 border-emerald-100 p-4 rounded-[2rem] flex items-center justify-center gap-3 animate-in zoom-in">
           <ShieldCheck className="h-5 w-5 text-emerald-600" />
           <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">إشعارات النظام المباشرة مفعلة بنجاح</p>
        </div>
      )}

      <div className="space-y-4">
        {loading ? (
           <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-emerald-500" /></div>
        ) : notifications.length === 0 ? (
           <div className="py-32 text-center text-slate-300 font-bold border-4 border-dashed border-slate-100 rounded-[4rem]">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-30" />
              لا توجد تنبيهات جديدة حالياً
           </div>
        ) : notifications.map(n => (
          <div key={n.id} className={`p-7 rounded-[2.8rem] border-2 transition-all flex gap-6 items-start relative overflow-hidden ${n.read ? 'bg-white/50 opacity-60 grayscale border-slate-100' : 'bg-white border-white shadow-xl shadow-slate-200/50'}`}>
            {!n.read && <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
            <div className={`p-4 rounded-2xl ${n.read ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>
               {n.type === 'SUCCESS' ? <CheckCircle className="h-6 w-6" /> : n.type === 'ALERT' ? <Bell className="h-6 w-6" /> : <Info className="h-6 w-6" />}
            </div>
            <div className="flex-1 space-y-1 text-right">
              <h4 className="font-black text-sm text-slate-800 leading-tight">{n.title}</h4>
              <p className="text-xs font-bold text-slate-500 leading-relaxed opacity-80">{n.body}</p>
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest pt-2">{new Date(n.createdAt).toLocaleTimeString('ar-EG')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsView;
