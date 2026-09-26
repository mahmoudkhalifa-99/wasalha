
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from "react-router-dom";

// Types
import type { User } from '../types';

// Utils
import { stripFirestore } from '../utils';

// Icons
import { LogOut, RefreshCcw, WifiOff, Loader2, Bell, MessageCircle, X } from 'lucide-react';

// Services
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Components / UI
import BrandLogo from '../components/BrandLogo';
import Login from './Login';
import CustomerDashboard from './CustomerDashboard';
import CourierDashboard from './CourierDashboard';
import OperatorDashboard from './OperatorDashboard';
import SuperAdminDashboard from './SuperAdminDashboard';
import AdminEditUser from './AdminEditUser';
import AdminUsersList from './AdminUsersList';
import AdminRestaurantManager from './AdminRestaurantManager';
import AdminAdsManager from './AdminAdsManager';
import AdminGeographyManager from './AdminGeographyManager';
import NotificationsView from './NotificationsView';
import SupportView from './SupportView';

const LogoutModal: React.FC<{ isOpen: boolean, onConfirm: () => void, onCancel: () => void }> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100">
        <div className="p-8 text-center space-y-6">
           <div className="bg-rose-50 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-rose-500 shadow-inner">
              <LogOut className="h-9 w-9 rotate-180" />
           </div>
           <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">تسجيل الخروج؟</h3>
              <p className="text-xs font-bold text-slate-400 leading-relaxed px-2">هل ترغب بالفعل في مغادرة التطبيق الآن؟ يمكنك العودة في أي وقت.</p>
           </div>
           <div className="flex flex-col gap-2.5 pt-2">
              <button onClick={onConfirm} className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-black shadow-lg shadow-rose-500/20 active:scale-95 transition-all">تأكيد الخروج</button>
              <button onClick={onCancel} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3.5 rounded-2xl font-black active:scale-95 transition-all">البقاء في التطبيق</button>
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

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
    const userRef = doc(db, "users", uid);
    const unsubscribe = onSnapshot(userRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = stripFirestore(docSnap.data()) as User;
        setUser(data);
        setLoading(false);
        setConnectionError(false);

        const q = query(collection(db, "notifications"), where("userId", "in", [data.id, "ALL", data.role]));
        onSnapshot(q, (snap) => {
          const unread = snap.docs.filter(d => !d.data().read).length;
          setUnreadCount(unread);
        }, (err) => {
          console.warn("Notifications listener:", err);
        });
      } else {
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          const emailLower = (currentUser.email || '').toLowerCase();
          const isAdminEmail = [
            'admin@ashmoun.com', 
            'mahmoudkhalifa.kh91@gmail.com', 
            'sadat.planning.officer@dakahlia.net',
            'admin@wasalah.com',
            'wasalah.app@gmail.com'
          ].includes(emailLower);

          const defaultUserData: User = {
            id: uid,
            email: currentUser.email || '',
            name: isAdminEmail ? 'مدير المنظومة' : (currentUser.displayName || 'مستخدم'),
            phone: '01000000000',
            role: isAdminEmail ? 'ADMIN' : 'CUSTOMER',
            status: 'APPROVED',
            zoneId: 'أشمون',
            wallet: { balance: 1000, totalEarnings: 0, withdrawn: 0 }
          };
          try {
            await setDoc(userRef, stripFirestore(defaultUserData));
            setUser(defaultUserData);
          } catch (err) {
            console.error("Auto user creation error:", err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    }, (error) => {
      if (!navigator.onLine) setConnectionError(true);
      setLoading(false);
    });
    return unsubscribe;
  };

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut(auth);
    window.location.reload();
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-['Cairo'] select-none">
      {/* Ambient background glows matching the logo */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      
      {/* Concentric rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full border border-emerald-500/15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full border border-emerald-500/10 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-white p-2 shadow-2xl shadow-emerald-950/80 ring-4 ring-white/20 overflow-hidden flex items-center justify-center animate-pulse">
          <img 
            src="/icon-512.png" 
            alt="شعار وصلها الرسمي" 
            className="w-full h-full object-contain rounded-2xl" 
            referrerPolicy="no-referrer" 
          />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-white font-black text-3xl md:text-4xl tracking-tight">وصـــلــهــا المنوفية</h2>
          <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest">مشاويرك، أكلك، وطلباتك في ثواني</p>
        </div>

        {/* Transport pills */}
        <div className="flex items-center gap-2">
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-amber-300 border border-white/15">🛺 توكتوك</span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-slate-200 border border-white/15">🚗 سيارة</span>
          <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black text-emerald-300 border border-white/15">🏍️ دليفري</span>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-6 py-2.5 rounded-full backdrop-blur-md border border-white/15">
          <Loader2 className="h-4 w-4 text-emerald-400 animate-spin" />
          <p className="text-white/90 font-bold text-[11px] tracking-wide">جاري الاتصال بالخدمة الذكية...</p>
        </div>
      </div>
    </div>
  );

  if (connectionError) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center">
       <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center text-rose-500 mb-6 shadow-inner">
         <WifiOff className="h-10 w-10" />
       </div>
       <h2 className="text-2xl font-black text-slate-800 mb-2">تعذر الاتصال بالشبكة</h2>
       <p className="text-xs font-bold text-slate-400 mb-6 max-w-xs">يرجى التأكد من اتصال هاتفك بالإنترنت ثم إعادة المحاولة</p>
       <button onClick={() => window.location.reload()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-emerald-600/25 flex items-center gap-3 active:scale-95 transition-all">
         <RefreshCcw className="h-4 w-4" /> إعادة المحاولة
       </button>
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
      default: return <div className="p-20 text-center font-black">الحساب معلق</div>;
    }
  };

  return (
    <HashRouter>
      <LogoutModal isOpen={isLogoutModalOpen} onConfirm={handleLogout} onCancel={() => setIsLogoutModalOpen(false)} />
      <div className="app-container">
        <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 sticky top-0 z-[110] px-4 md:px-8 h-[68px] md:h-[84px] flex items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <Link to="/" onClick={() => { setShowNotifications(false); setShowSupport(false); }} className="flex items-center gap-3 group">
              <BrandLogo size="sm" showSubtitle={true} />
            </Link>

            {/* Middle Regional Badge (Desktop/Tablet) */}
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50/80 border border-emerald-100 px-4 py-1.5 rounded-full text-emerald-800 text-xs font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
              <span>المنوفية • خدمة 24 ساعة مباشرة</span>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowSupport(true)} 
                title="الدعم الفني والمساعدة"
                className="p-2.5 md:p-3 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-2xl border border-slate-200/60 transition-all active:scale-90"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowNotifications(true)} 
                title="الإشعارات"
                className="p-2.5 md:p-3 bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-2xl relative border border-slate-200/60 transition-all active:scale-90"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white w-4 h-4 rounded-full text-[9px] flex items-center justify-center border-2 border-white font-black animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setIsLogoutModalOpen(true)} 
                title="تسجيل الخروج"
                className="p-2.5 md:p-3 bg-rose-50/80 hover:bg-rose-100 text-rose-600 rounded-2xl border border-rose-100/80 transition-all active:scale-90"
              >
                <LogOut className="h-5 w-5 rotate-180" />
              </button>
            </div>
          </div>
        </header>
        <main className="main-content">
          <Routes>
            <Route path="/" element={getDashboard()} />
            {user?.role === 'ADMIN' && (
              <>
                <Route path="/admin/users" element={<AdminUsersList user={user} />} />
                <Route path="/admin/edit-user/:userId" element={<AdminEditUser user={user} />} />
                <Route path="/admin/restaurants" element={<AdminRestaurantManager user={user} />} />
                <Route path="/admin/ads" element={<AdminAdsManager user={user} />} />
                <Route path="/admin/geography" element={<AdminGeographyManager user={user} />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
