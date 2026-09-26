
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Types
import type { User } from './types';

// Utils
import { stripFirestore } from './utils';

// Icons
import { LogOut, RefreshCcw, WifiOff, Loader2, Bell, MessageCircle } from 'lucide-react';

// Firebase
import { auth, db, handleFirestoreError, OperationType } from './services/firebase';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Components / Views
import Login from './Login';
import CustomerDashboard from './views/CustomerDashboard';
import CourierDashboard from './views/CourierDashboard';
import OperatorDashboard from './views/OperatorDashboard';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import NotificationsView from './views/NotificationsView';
import SupportView from './views/SupportView';

const APP_LOGO_ICON = "https://img.icons8.com/fluency-systems-filled/512/FFFFFF/bicycle.png";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      try {
        if (fbUser) {
          await fetchUserData(fbUser.uid);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const fetchUserData = async (uid: string) => {
    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        const data = stripFirestore(userSnap.data()) as User;
        setUser(data);
        
        // مراقبة الإشعارات غير المقروءة
        const q = query(collection(db, "notifications"), where("userId", "in", [data.id, "ALL", data.role]));
        onSnapshot(q, (snap) => {
          const unread = snap.docs.filter(d => !d.data().read).length;
          setUnreadCount(unread);
        }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));
      }
    } catch (error) {
      if (!navigator.onLine) setConnectionError(true);
      else handleFirestoreError(error, OperationType.GET, `users/${uid}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#10b981] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white/20 p-12 rounded-[5rem] backdrop-blur-3xl mb-12 border border-white/30 shadow-2xl animate-pulse">
         <img src={APP_LOGO_ICON} alt="Loading..." className="h-32 w-32 object-contain" />
      </div>
      <h2 className="text-white font-black text-5xl tracking-tighter mb-4">وصـــلــهــا</h2>
      <div className="flex items-center gap-3 bg-black/10 px-8 py-3 rounded-full backdrop-blur-md border border-white/10">
        <Loader2 className="h-5 w-5 text-white animate-spin" />
        <p className="text-white/80 font-bold text-[10px] uppercase tracking-widest">تحميل البيانات...</p>
      </div>
    </div>
  );

  if (connectionError) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
       <WifiOff className="h-20 w-20 text-rose-500 mb-6" />
       <h2 className="text-2xl font-black text-slate-800 mb-2">عذراً، لا يوجد اتصال</h2>
       <button onClick={() => window.location.reload()} className="bg-[#10b981] text-white px-10 py-5 rounded-[2rem] font-black shadow-xl flex items-center gap-3"><RefreshCcw className="h-5 w-5" /> إعادة المحاولة</button>
    </div>
  );

  if (!user) return <Login onLogin={(u) => setUser(stripFirestore(u))} />;

  const getDashboard = () => {
    if (showNotifications) return <NotificationsView user={user} onBack={() => setShowNotifications(false)} />;
    if (showSupport) return <SupportView user={user} onBack={() => setShowSupport(false)} />;
    
    switch (user.role) {
      case 'ADMIN': return <SuperAdminDashboard user={user} />;
      case 'OPERATOR': return <OperatorDashboard user={user} />;
      case 'DRIVER': return <CourierDashboard user={user} />;
      case 'CUSTOMER': return <CustomerDashboard user={user} />;
      default: return <div className="p-20 text-center font-black">الدور الوظيفي غير مفعّل</div>;
    }
  };

  return (
    <HashRouter>
      <div className="app-container">
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[60] px-5 h-24 md:h-28 flex items-center shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <Link to="/" onClick={() => { setShowNotifications(false); setShowSupport(false); }} className="flex items-center gap-5">
              <div className="bg-[#10b981] p-3.5 rounded-[1.8rem] shadow-xl border-4 border-emerald-50">
                <img src={APP_LOGO_ICON} alt="Logo" className="h-8 w-8 md:h-11 md:w-11" />
              </div>
              <div className="flex flex-col">
                <h1 className="font-black text-xl md:text-3xl text-slate-800 tracking-tighter leading-none mb-1">وصـــلــهــا</h1>
                <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest">محافظة المنوفية</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={() => setShowSupport(true)} className="p-4 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100 transition-all active:scale-90 hover:text-emerald-600">
                <MessageCircle className="h-6 w-6" />
              </button>
              <button onClick={() => setShowNotifications(true)} className={`p-4 bg-slate-50 text-slate-400 rounded-2xl relative border border-slate-100 transition-all active:scale-90 hover:text-emerald-600`}>
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-6 h-6 rounded-full text-[10px] flex items-center justify-center border-2 border-white font-black animate-bounce">{unreadCount}</span>
                )}
              </button>
              <button onClick={() => signOut(auth)} className="p-4 bg-rose-50 text-rose-500 rounded-2xl border border-rose-100 transition-all active:scale-90 hover:bg-rose-100">
                <LogOut className="h-6 w-6 rotate-180" />
              </button>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={getDashboard()} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
