
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { db, messaging, getToken } from '../firebase';
import { collection, query, where, onSnapshot, limit, doc, updateDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { Bell, Info, CheckCircle, AlertCircle, MessageCircle, ChevronRight, Loader2, Sparkles, Volume2, ShieldCheck, Smartphone } from 'lucide-react';
import { stripFirestore } from '../utils';

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
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "in", [user.id, "ALL", user.role])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...stripFirestore(d.data()) 
      })) as NotificationItem[];
      setNotifications(docs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 30));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id, user.role]);

  const requestPermissionAndRegister = async () => {
    if (!("Notification" in window)) {
      alert("هذا المتصفح لا يدعم الإشعارات.");
      return;
    }

    setIsActivating(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        // الحصول على تسجيل Service Worker الحالي
        const registration = await navigator.serviceWorker.getRegistration();

        // الحصول على توكن FCM للجهاز
        const token = await getToken(messaging, {
          vapidKey: 'BGH9nBvH8O8r6M8D9v6_R1i_v4_Y7_Y6_Y5_Y4_Y3_Y2_Y1_Y0', // ملاحظة: يجب استخدام مفتاح حقيقي من Firebase Console
          serviceWorkerRegistration: registration
        });

        if (token) {
          // حفظ التوكن في بيانات المستخدم في Firestore
          await updateDoc(doc(db, "users", user.id), {
            fcmToken: token,
            notificationsEnabled: true,
            lastTokenUpdate: Date.now()
          });
          alert("تم تفعيل إشعارات الهاتف بنجاح! ستصلك التنبيهات حتى والتطبيق مغلق.");
        }
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      alert("حدث خطأ أثناء تفعيل الإشعارات. تأكد من إعدادات المتصفح.");
    } finally {
      setIsActivating(false);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;
    
    try {
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, "notifications", n.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.error("Mark as read failed", e);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle className="h-5 w-5" />;
      case 'WARNING': return <AlertCircle className="h-5 w-5" />;
      case 'ALERT': return <Bell className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getStyle = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'WARNING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ALERT': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center px-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">مركز التنبيهات</h2>
        <div className="flex items-center gap-3">
          <button onClick={markAllAsRead} className="text-[10px] font-black text-[#2D9469] hover:underline uppercase tracking-widest px-2">
            تمييز الكل كمقروء
          </button>
          <button 
            onClick={onBack}
            className="bg-white border border-slate-100 p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 shadow-sm active:scale-90 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {permission !== "granted" ? (
        <div className="bg-emerald-600 text-white p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center gap-6 animate-in slide-in-from-top border-4 border-emerald-500/20">
          <div className="bg-white/20 p-4 rounded-2xl shrink-0"><Smartphone className="h-8 w-8" /></div>
          <div className="flex-1 text-center md:text-right">
            <h4 className="font-black text-lg mb-1">فعّل تنبيهات الهاتف</h4>
            <p className="text-xs font-bold opacity-80">ستظهر الإشعارات على شاشة هاتفك مع صوت التنبيه حتى لو التطبيق مقفول تماماً.</p>
          </div>
          <button 
            onClick={requestPermissionAndRegister} 
            disabled={isActivating}
            className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black text-xs active:scale-95 transition-all shadow-lg flex items-center gap-2"
          >
            {isActivating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
            تفعيل التنبيه بالصوت
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] flex items-center gap-3 justify-center">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">تنبيهات النظام الخارجية مفعلة بنجاح</p>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 shadow-sm">
            <Sparkles className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-black text-sm uppercase tracking-widest">لا توجد تنبيهات جديدة حالياً</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`bg-white p-6 rounded-[2.2rem] shadow-sm border flex gap-5 hover:border-emerald-200 transition-all group relative overflow-hidden ${n.read ? 'opacity-70 border-slate-50' : 'border-slate-100 shadow-md ring-1 ring-emerald-500/5'}`}>
              <div className={`shrink-0 h-14 w-14 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110 ${getStyle(n.type)}`}>
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">{n.title}</h4>
                  <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap mr-2 tracking-widest uppercase">
                    {new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  {n.body}
                </p>
              </div>
              {!n.read && <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>}
            </div>
          ))
        )}
      </div>
      
      <div className="p-8 text-center bg-slate-900 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
        <MessageCircle className="h-7 w-7 text-emerald-400 mx-auto mb-3" />
        <p className="text-[11px] text-white font-black tracking-widest uppercase mb-1">هل لديك استفسار؟</p>
        <p className="text-[10px] text-slate-400 font-bold mb-4">فريق دعم أشمون متاح لمساعدتك على مدار الساعة</p>
        <button onClick={() => window.open('https://wa.me/201065019364')} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-xs active:scale-95 transition-all shadow-xl shadow-emerald-900/20">اتصل بالدعم الفني</button>
      </div>
    </div>
  );
};

export default NotificationsView;
