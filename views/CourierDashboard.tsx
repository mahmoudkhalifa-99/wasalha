
import React, { useState, useEffect, useRef } from 'react';

// Types
import type { User, Order, OrderCategory } from '../types';
import { OrderStatus } from '../types';

// Utils
import { stripFirestore } from '../utils';

// Icons
import { 
  Bike, MapPin, Loader2, Power, 
  MessageCircle, History, X,
  PhoneCall, Wallet, User as UserIcon, Home, 
  ShieldAlert, StickyNote, Coffee, Pill, Bot, Zap, Car
} from 'lucide-react';

// Firebase
import { db } from '../firebase';
import { 
  collection, query, where, onSnapshot, updateDoc, 
  doc, addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Components
import ChatView from './ChatView';
import WalletView from './WalletView';
import ActivityView from './ActivityView';
import ProfileView from './ProfileView';

const CourierDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState<'HOME' | 'WALLET' | 'ACTIVITY' | 'PROFILE'>('HOME');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOfferInput, setShowOfferInput] = useState<string | null>(null);
  const [offerPrice, setOfferPrice] = useState<number>(0);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    if (!isOnline || user.status !== 'APPROVED') return;
    const unsubAvailable = onSnapshot(query(collection(db, "orders"), where("status", "==", OrderStatus.WAITING_FOR_OFFERS)), (snapshot) => {
      setAvailableOrders(snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Order[]);
    });
    const unsubActive = onSnapshot(query(collection(db, "orders"), where("driverId", "==", user.id)), (snapshot) => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) } as Order));
      setActiveOrder(all.find(o => ![OrderStatus.DELIVERED, OrderStatus.DELIVERED_RATED, OrderStatus.CANCELLED].includes(o.status)) || null);
    });
    return () => { unsubAvailable(); unsubActive(); };
  }, [isOnline, user.id, user.status]);

  const handleSendOffer = async (order: Order) => {
    if (offerPrice <= 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "offers"), {
        orderId: order.id, driverId: user.id, driverName: user.name, driverPhone: user.phone,
        driverRating: 4.9, vehicleType: user.vehicleType || 'TOKTOK', price: offerPrice, createdAt: Date.now()
      });
      setShowOfferInput(null);
    } catch (e) { alert('فشل'); } finally { setIsSubmitting(false); }
  };

  const updateOrderStatus = async (status: OrderStatus) => {
    if (!activeOrder || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const updates: any = { status };
      if (status === OrderStatus.DELIVERED) updates.deliveredAt = Date.now();
      await updateDoc(doc(db, "orders", activeOrder.id), updates);
    } catch (e) { alert('خطأ'); } finally { setIsSubmitting(false); }
  };

  if (user.status !== 'APPROVED') {
     return (
       <div className="p-12 text-center font-black space-y-6">
         <ShieldAlert className="h-20 w-20 mx-auto text-emerald-600 animate-bounce" />
         <h2 className="text-3xl tracking-tighter">حسابك بانتظار التفعيل</h2>
         <p className="text-slate-400 text-sm">يرجى التواصل مع الإدارة في أشمون للبدء في استقبال الطلبات.</p>
         <button onClick={() => window.open('https://wa.me/201065019364')} className="w-full bg-[#25D366] text-white py-6 rounded-[2rem] font-black shadow-xl">تواصل عبر واتساب</button>
       </div>
     );
  }

  if (showChat && activeOrder) return <ChatView user={user} order={activeOrder} onBack={() => setShowChat(false)} />;
  if (activeView === 'WALLET') return <WalletView user={user} onBack={() => setActiveView('HOME')} />;
  if (activeView === 'ACTIVITY') return <ActivityView user={user} onBack={() => setActiveView('HOME')} />;
  if (activeView === 'PROFILE') return <ProfileView user={user} onBack={() => setActiveView('HOME')} onUpdate={() => {}} />;

  return (
    <div className="rh-layout h-full relative overflow-hidden bg-slate-50 px-6 space-y-6 pb-32 pt-8 animate-in fade-in overflow-y-auto no-scrollbar">
        <div className={`p-10 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl transition-all duration-700 ${isOnline ? 'bg-emerald-600' : 'bg-slate-950'}`}>
           <div>
              <h2 className="text-3xl font-black tracking-tighter">{isOnline ? 'نشط الآن' : 'أوفلاين'}</h2>
              <p className="text-[10px] font-black opacity-60 mt-2 uppercase tracking-[0.3em]">مركبات أشمون النشطة</p>
           </div>
           <button onClick={() => setIsOnline(!isOnline)} className={`p-6 rounded-[2.5rem] shadow-2xl active:scale-90 transition-all ${isOnline ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'}`}>
              <Power className="h-10 w-10" />
           </button>
        </div>

        {activeOrder ? (
           <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-10 space-y-10 animate-in zoom-in border-t-8 border-t-emerald-500">
              <div className="flex justify-between items-center">
                 <span className="bg-emerald-100 text-emerald-700 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{activeOrder.status}</span>
                 <p className="text-5xl font-black text-slate-950">{activeOrder.price} <span className="text-lg opacity-30 font-bold uppercase">ج.م</span></p>
              </div>
              <div className="space-y-8">
                 <div className="flex gap-6 items-start">
                    <div className="bg-slate-50 p-5 rounded-3xl text-emerald-600 shadow-inner shrink-0"><MapPin className="h-8 w-8" /></div>
                    <div className="flex-1 text-right">
                       <p className="helper-text uppercase mb-2 tracking-widest">مسار الرحلة</p>
                       <p className="font-black text-2xl text-slate-950 leading-tight mb-4">{activeOrder.pickup?.villageName} ← {activeOrder.dropoff?.villageName}</p>
                       
                       <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4 shadow-inner">
                          {activeOrder.pickupNotes && (
                            <div>
                              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">وصف الاستلام:</p>
                              <p className="text-xs font-bold text-slate-700 leading-relaxed">{activeOrder.pickupNotes}</p>
                            </div>
                          )}
                          {activeOrder.dropoffNotes && (
                            <div className="pt-3 border-t border-slate-200">
                              <p className="text-[9px] font-black text-rose-600 uppercase mb-1">وصف الوجهة:</p>
                              <p className="text-xs font-bold text-slate-700 leading-relaxed">{activeOrder.dropoffNotes}</p>
                            </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-5 pt-4">
                 <a href={`tel:${activeOrder.customerPhone}`} className="bg-slate-950 text-white py-7 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><PhoneCall className="h-7 w-7" /> اتصال</a>
                 <button onClick={() => setShowChat(true)} className="bg-white border-4 border-slate-50 text-slate-900 py-7 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all relative">
                    <MessageCircle className="h-7 w-7" /> دردشة
                 </button>
                 <button onClick={() => updateOrderStatus(activeOrder.status === OrderStatus.ACCEPTED ? OrderStatus.PICKED_UP : OrderStatus.DELIVERED)} disabled={isSubmitting} className="col-span-2 bg-emerald-600 text-white py-8 rounded-[2.5rem] font-black text-2xl shadow-2xl active:scale-95 transition-all">
                    {isSubmitting ? <Loader2 className="h-10 w-10 animate-spin mx-auto" /> : activeOrder.status === OrderStatus.ACCEPTED ? 'تأكيد استلام الطلب' : 'تأكيد التوصيل والتحصيل'}
                 </button>
              </div>
           </div>
        ) : (
           <div className="space-y-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] px-4 text-right">مشاوير بانتظارك ({availableOrders.length})</h3>
              {availableOrders.map(o => (
                 <div key={o.id} className="bg-white p-10 rounded-[4rem] border-2 border-slate-50 shadow-xl space-y-8 animate-in slide-in-from-bottom hover:border-emerald-500 transition-all">
                    <div className="flex justify-between items-start text-right">
                       <div className="space-y-2">
                          <p className="text-2xl font-black text-slate-950 leading-none">{o.pickup?.villageName} ← {o.dropoff?.villageName}</p>
                          <p className="text-[10px] font-black text-emerald-600 mt-2 bg-emerald-50 inline-block px-4 py-1.5 rounded-full">{o.requestedVehicleType}</p>
                          {o.pickupNotes && (
                            <p className="text-xs font-bold text-slate-400 line-clamp-1 mt-2">🏠 {o.pickupNotes}</p>
                          )}
                       </div>
                       <div className="bg-slate-950 text-emerald-400 p-6 rounded-[2.5rem] font-black text-3xl shadow-2xl shrink-0">
                          {o.price}
                       </div>
                    </div>
                    <button onClick={() => { setShowOfferInput(o.id); setOfferPrice(o.price); }} className="w-full bg-slate-950 text-white py-7 rounded-[2.8rem] font-black text-xl shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-4">
                        <Zap className="h-6 w-6 text-emerald-400" /> تقديم عرض سعر
                    </button>
                 </div>
              ))}
              {availableOrders.length === 0 && (
                 <div className="py-24 text-center text-slate-300 font-black border-4 border-dashed border-slate-100 rounded-[4rem] bg-white/50">
                    <Bot className="h-16 w-16 mx-auto mb-6 opacity-20" />
                    <p className="tracking-widest uppercase">بانتظار طلبات جديدة من أشمون...</p>
                 </div>
              )}
           </div>
        )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 p-8 flex justify-around items-center z-[200] shadow-[0_-20px_50px_rgba(0,0,0,0.12)]">
         {[
           {id: 'HOME', icon: <Home className="h-7 w-7" />, label: 'الرئيسية'},
           {id: 'ACTIVITY', icon: <History className="h-7 w-7" />, label: 'سجلي'},
           {id: 'WALLET', icon: <Wallet className="h-7 w-7" />, label: 'محفظتي'},
           {id: 'PROFILE', icon: <UserIcon className="h-7 w-7" />, label: 'حسابي'}
         ].map(tab => (
           <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`flex flex-col items-center gap-2 transition-all ${activeView === tab.id ? 'text-emerald-600 scale-125' : 'text-slate-300'}`}>
              <div className={`p-3.5 rounded-[1.5rem] transition-all ${activeView === tab.id ? 'bg-emerald-50 shadow-inner' : ''}`}>
                 {tab.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default CourierDashboard;
