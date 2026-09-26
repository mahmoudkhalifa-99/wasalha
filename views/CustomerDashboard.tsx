
import React, { useState, useEffect, useRef } from 'react';

// Types
import type { User, Order, Village, Offer, OrderCategory, Restaurant, MenuItem, CartItem } from '../types';
import { OrderStatus, VehicleType } from '../types';
import { District, MENOFIA_DATA } from '../config/constants';

// Config
import { DEFAULT_PRICING } from '../config/constants';

// Utils
import { stripFirestore, calculateDistance } from '../utils';

// Services
import { db } from '../services/firebase';
import { 
  collection, addDoc, query, where, onSnapshot, 
  doc, updateDoc, getDocs, limit, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  MapPin, Bike, Check, 
  ChevronDown, ChevronRight, DollarSign, Star,
  User as UserIcon, Map as MapIcon,
  Car, MessageCircle, Loader2,
  Bot, Heart, History,
  Navigation2, Zap, Coffee, Pill,
  PhoneCall, ShieldCheck,
  Plus, X, Building2, UtensilsCrossed, ShoppingBag, 
  Trash, ArrowLeft, ArrowRight, ThumbsUp, PartyPopper,
  FileText, Download, ZoomIn, ChevronLeft
} from 'lucide-react';

// Components
import ProfileView from './ProfileView';
import ActivityView from './ActivityView';
import WalletView from './WalletView';
import ChatView from '../components/ChatView';
import AIAssistant from '../components/AIAssistant';

const FullMenuModal: React.FC<{ url: string, onClose: () => void }> = ({ url, onClose }) => {
  useEffect(() => {
    // إضافة حالة لتاريخ المتصفح للتعامل مع زر الرجوع
    window.history.pushState({ modal: 'full-menu' }, '');

    const handlePopState = (event: PopStateEvent) => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (window.history.state?.modal === 'full-menu') {
        window.history.back();
      }
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-3xl flex flex-col animate-in fade-in duration-300">
      <div className="p-8 flex justify-between items-center text-white border-b border-white/10">
        <div className="flex gap-3">
           <button onClick={() => {
             const link = document.createElement('a');
             link.href = url;
             link.download = 'restaurant-menu.png';
             link.click();
           }} className="p-4 bg-emerald-600 rounded-2xl flex items-center gap-2 font-black text-xs shadow-lg active:scale-90 transition-all">
             <Download className="h-5 w-5" /> حفظ المنيو
           </button>
        </div>
        <button onClick={onClose} className="p-4 bg-white/10 rounded-2xl flex items-center gap-2 font-black text-xs hover:bg-white/20 active:scale-90 transition-all">
          إغلاق <ChevronLeft className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4 flex items-center justify-center no-scrollbar">
         <img 
           src={url} 
           className="max-w-full max-h-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-lg animate-in zoom-in duration-500" 
           alt="Restaurant Menu"
         />
      </div>
    </div>
  );
};

const RestaurantMenu: React.FC<{ 
  restaurant: Restaurant, 
  onClose: () => void, 
  onCheckout: (cart: CartItem[]) => void 
}> = ({ restaurant, onClose, onCheckout }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showFullMenu, setShowFullMenu] = useState(false);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <div className="fixed inset-0 bg-white z-[1100] flex flex-col animate-in slide-in-from-left duration-300">
       {showFullMenu && restaurant.menuImageURL && <FullMenuModal url={restaurant.menuImageURL} onClose={() => setShowFullMenu(false)} />}
       
       <div className="bg-slate-900 p-8 pt-14 text-white flex justify-between items-center shadow-xl relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
             {restaurant.photoURL && <img src={restaurant.photoURL} className="w-full h-full object-cover blur-md" />}
          </div>
          <button onClick={onClose} className="p-3 bg-white/10 rounded-2xl relative z-10 hover:bg-white/20 active:scale-90 transition-all"><ArrowRight className="h-6 w-6" /></button>
          <div className="text-right relative z-10">
             <h3 className="text-2xl font-black">{restaurant.name}</h3>
             <p className="text-xs font-bold text-emerald-400">{restaurant.category} • أشمون</p>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50">
          {restaurant.menuImageURL && (
            <button onClick={() => setShowFullMenu(true)} className="w-full bg-emerald-600 p-6 rounded-[2.5rem] text-white flex justify-between items-center shadow-xl cursor-pointer hover:scale-[1.02] transition-transform active:scale-95 border-none">
               <div className="bg-white/20 p-4 rounded-2xl"><ZoomIn className="h-6 w-6" /></div>
               <div className="text-right">
                  <h4 className="font-black text-lg">تصفح المنيو الورقي</h4>
                  <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">عرض صورة المنيو كاملة</p>
               </div>
            </button>
          )}

          <div className="space-y-4">
             <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right px-2">الأصناف المتاحة</h5>
             {restaurant.menu?.map(item => (
               <div key={item.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-4">
                     <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl">
                        <button onClick={() => addToCart(item)} className="p-2 bg-emerald-500 text-white rounded-xl active:scale-75 transition-all shadow-lg"><Plus className="h-4 w-4" /></button>
                        <span className="font-black text-lg w-6 text-center">{cart.find(i => i.id === item.id)?.quantity || 0}</span>
                        <button onClick={() => removeFromCart(item.id)} className="p-2 bg-rose-50 text-rose-500 rounded-xl active:scale-75 transition-all"><Trash className="h-4 w-4" /></button>
                     </div>
                     <div className="text-left"><p className="font-black text-emerald-600">{item.price} ج.م</p></div>
                  </div>
                  <div className="text-right flex items-center gap-4 flex-row-reverse">
                     <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-50 shrink-0">
                        {item.photoURL ? <img src={item.photoURL} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" /> : <UtensilsCrossed className="p-4 text-slate-200" />}
                     </div>
                     <div>
                       <p className="font-black text-slate-800 text-lg leading-tight">{item.name}</p>
                       <p className="text-[10px] font-bold text-slate-400 mt-1">{item.description || 'وجبة طازجة من المطعم'}</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
       </div>

       {cart.length > 0 && (
         <div className="p-8 bg-white border-t border-slate-100 animate-in slide-in-from-bottom pb-12 shadow-2xl shrink-0">
            <div className="flex justify-between items-center mb-6 px-2">
               <p className="text-2xl font-black text-slate-900">{total} <span className="text-xs opacity-40 uppercase">ج.م</span></p>
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">إجمالي الطلبات</p>
            </div>
            <button onClick={() => onCheckout(cart)} className="w-full bg-[#10b981] text-white py-7 rounded-[2.5rem] font-black text-lg shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">
               <ShoppingBag className="h-6 w-6" /> تأكيد طلب الطعام
            </button>
         </div>
       )}
    </div>
  );
};

const VillageInput: React.FC<{
  label: string; helper: string; icon: React.ReactNode; iconBg: string;
  selectedVillage: Village | null; onSelect: (v: Village) => void;
}> = ({ label, helper, icon, iconBg, selectedVillage, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const allVillages = MENOFIA_DATA.flatMap(d => d.villages);
  const filtered = allVillages.filter(v => v.name.includes(searchTerm));

  return (
    <div className="relative space-y-1">
      <div className="flex flex-col px-2 text-right">
        <label className="label-strong">{label}</label>
        <span className="helper-text">{helper}</span>
      </div>
      <div onClick={() => setIsOpen(!isOpen)} className="bg-white border-2 border-slate-100 p-5 rounded-[2.2rem] flex items-center justify-between cursor-pointer hover:border-emerald-200 transition-all shadow-sm">
        <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        <div className="flex items-center gap-4 flex-row-reverse text-right">
          <span className={`text-lg font-black ${selectedVillage ? 'text-slate-900' : 'text-slate-300'}`}>{selectedVillage?.name || "اختر القرية"}</span>
          <div className={`${iconBg} p-4 rounded-2xl text-white shadow-xl`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-6 w-6" }) : icon}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-[3rem] shadow-2xl border border-slate-100 z-[200] max-h-[350px] overflow-hidden flex flex-col animate-in zoom-in">
          <div className="p-4 border-b border-slate-50"><input className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-black outline-none text-right" placeholder="ابحث عن قريتك..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} dir="rtl" /></div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
             {filtered.map(v => (
               <button key={v.id} onClick={() => { onSelect(v); setIsOpen(false); }} className="w-full p-4 hover:bg-emerald-50 rounded-2xl flex justify-between items-center transition-all flex-row-reverse border border-transparent hover:border-emerald-100">
                  <span className="font-bold text-slate-700">{v.name}</span>
                  {selectedVillage?.id === v.id && <Check className="h-5 w-5 text-emerald-500" />}
               </button>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CustomerDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState<'NEW' | 'PROFILE' | 'ACTIVITY' | 'WALLET'>('NEW');
  const [selectedCategory, setSelectedCategory] = useState<OrderCategory>('TAXI');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [viewingRestaurant, setViewingRestaurant] = useState<Restaurant | null>(null);
  const [pickupVillage, setPickupVillage] = useState<Village | null>(null);
  const [dropoffVillage, setDropoffVillage] = useState<Village | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('TOKTOK');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [incomingOffers, setIncomingOffers] = useState<Offer[]>([]);

  useEffect(() => {
    onSnapshot(collection(db, "restaurants"), (snap) => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Restaurant[]);
    });

    return onSnapshot(query(collection(db, "orders"), where("customerId", "==", user.id)), (snapshot) => {
      const all = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) } as Order));
      setActiveOrder(all.find(o => ![OrderStatus.DELIVERED_RATED, OrderStatus.CANCELLED].includes(o.status)) || null);
    });
  }, [user.id]);

  useEffect(() => {
    if (activeOrder?.status === OrderStatus.WAITING_FOR_OFFERS) {
      return onSnapshot(query(collection(db, "offers"), where("orderId", "==", activeOrder.id)), (snap) => {
        setIncomingOffers(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Offer[]);
      });
    }
  }, [activeOrder]);

  const handleCheckoutFood = async (cart: CartItem[]) => {
    if (!viewingRestaurant || !dropoffVillage) return alert('يرجى اختيار مكان التوصيل');
    setIsSubmitting(true);
    try {
      const dist = calculateDistance(viewingRestaurant.lat, viewingRestaurant.lng, dropoffVillage.center.lat, dropoffVillage.center.lng);
      const deliveryPrice = Math.max(Math.round(DEFAULT_PRICING.basePrice + (dist * DEFAULT_PRICING.pricePerKm)), DEFAULT_PRICING.minPrice);
      const foodTotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
      
      const orderData: Partial<Order> = {
        customerId: user.id, customerPhone: user.phone, category: 'FOOD',
        pickup: { address: viewingRestaurant.name, lat: viewingRestaurant.lat, lng: viewingRestaurant.lng, villageName: viewingRestaurant.address },
        dropoff: { address: dropoffVillage.name, lat: dropoffVillage.center.lat, lng: dropoffVillage.center.lng, villageName: dropoffVillage.name },
        status: OrderStatus.WAITING_FOR_OFFERS, createdAt: Date.now(), requestedVehicleType: 'MOTORCYCLE',
        price: deliveryPrice + foodTotal, distance: dist, operatorId: 'op_monofia_main', zoneId: 'zone_monofia_main',
        paymentMethod: 'CASH', foodItems: cart, restaurantId: viewingRestaurant.id, restaurantName: viewingRestaurant.name,
        pickupNotes: `طلب طعام من مطعم ${viewingRestaurant.name}`
      };
      await addDoc(collection(db, "orders"), orderData);
      setViewingRestaurant(null);
    } catch (e) { alert('خطأ فني'); } finally { setIsSubmitting(false); }
  };

  const handleAcceptOffer = async (offer: Offer) => {
    if (!activeOrder) return;
    try {
      await updateDoc(doc(db, "orders", activeOrder.id), {
        driverId: offer.driverId, driverName: offer.driverName, driverPhone: offer.driverPhone,
        status: OrderStatus.ACCEPTED, acceptedAt: Date.now()
      });
    } catch (e) { alert('فشل قبول العرض'); }
  };

  if (showChat && activeOrder) return <ChatView user={user} order={activeOrder} onBack={() => setShowChat(false)} />;
  if (activeView === 'WALLET') return <WalletView user={user} onBack={() => setActiveView('NEW')} />;
  if (activeView === 'PROFILE') return <ProfileView user={user} onUpdate={() => {}} onBack={() => setActiveView('NEW')} onOpenWallet={() => setActiveView('WALLET')} />;
  if (activeView === 'ACTIVITY') return <ActivityView user={user} onBack={() => setActiveView('NEW')} />;

  return (
    <div className="rh-layout h-full relative overflow-hidden bg-slate-50">
      <AIAssistant isOpen={aiOpen} onClose={() => setAiOpen(false)} />
      {viewingRestaurant && <RestaurantMenu restaurant={viewingRestaurant} onClose={() => setViewingRestaurant(null)} onCheckout={handleCheckoutFood} />}

      <div className="rh-ui-panel no-scrollbar z-[100] translate-y-0 bg-slate-50">
        <div className="bottom-sheet-grabber lg:hidden"></div>
        <div className="p-8 md:p-12 space-y-10 pb-32 max-w-2xl mx-auto h-full overflow-y-auto no-scrollbar text-right">
          {!activeOrder ? (
            <>
              <div className="flex items-center justify-between">
                 <div><h2 className="text-4xl font-black text-slate-950 tracking-tighter">وصـــلــهــا أشمون</h2><p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">خدمة التوصيل الذكية</p></div>
                 <button onClick={() => setAiOpen(true)} className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl active:scale-90 shadow-sm border-none"><Bot className="h-8 w-8" /></button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'TAXI', label: 'مشوار', icon: <Bike /> },
                    { id: 'FOOD', label: 'أكل', icon: <UtensilsCrossed /> },
                    { id: 'PHARMACY', label: 'صيدلية', icon: <Pill /> }
                  ].map(cat => (
                    <button key={cat.id} onClick={() => setSelectedCategory(cat.id as OrderCategory)} className={`py-8 rounded-[2.5rem] flex flex-col items-center gap-3 border-4 transition-all ${selectedCategory === cat.id ? 'bg-white border-emerald-500 text-emerald-600 shadow-2xl scale-105' : 'bg-white border-transparent text-slate-400 opacity-60'}`}>
                       {React.isValidElement(cat.icon) ? React.cloneElement(cat.icon as React.ReactElement<any>, { className: "h-8 w-8" }) : cat.icon}
                       <span className="text-[11px] font-black uppercase tracking-widest">{cat.label}</span>
                    </button>
                  ))}
              </div>

              {selectedCategory === 'FOOD' ? (
                <div className="space-y-8 animate-in zoom-in">
                   <div className="flex justify-between items-center px-2">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">المطاعم المتاحة في أشمون</p>
                      <Building2 className="h-4 w-4 text-slate-300" />
                   </div>
                   <VillageInput label="التوصيل إلى" helper="أين ستستلم طلبك؟" icon={<MapPin />} iconBg="bg-rose-500" selectedVillage={dropoffVillage} onSelect={setDropoffVillage} />
                   <div className="grid grid-cols-1 gap-6">
                      {restaurants.map(rest => (
                        <div key={rest.id} onClick={() => setViewingRestaurant(rest)} className="bg-white p-7 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-row-reverse justify-between items-center hover:border-emerald-500 transition-all cursor-pointer group">
                           <div className="flex items-center gap-5 flex-row-reverse text-right">
                              <div className="w-16 h-16 bg-slate-900 rounded-[1.8rem] flex items-center justify-center overflow-hidden border border-white/10 shadow-lg">
                                 {rest.photoURL ? <img src={rest.photoURL} className="w-full h-full object-cover" /> : <UtensilsCrossed className="h-8 w-8 text-emerald-400" />}
                              </div>
                              <div>
                                 <h4 className="text-xl font-black text-slate-800 leading-tight">{rest.name}</h4>
                                 <p className="text-xs font-bold text-slate-400">{rest.category} • أشمون</p>
                              </div>
                           </div>
                           <ChevronRight className="h-6 w-6 text-slate-300 rotate-180 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-right">
                   <div className="space-y-6 relative">
                     <VillageInput label="نقطة الانطلاق" helper="موقع استلامك" icon={<MapPin />} iconBg="bg-emerald-500" selectedVillage={pickupVillage} onSelect={setPickupVillage} />
                     <VillageInput label="وجهة الوصول" helper="الوجهة النهائية" icon={<Check />} iconBg="bg-rose-500" selectedVillage={dropoffVillage} onSelect={setDropoffVillage} />
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {['TOKTOK', 'MOTORCYCLE', 'CAR'].map(v => (
                        <button key={v} onClick={() => setSelectedVehicle(v as VehicleType)} className={`py-6 rounded-3xl font-black text-[10px] border-2 transition-all ${selectedVehicle === v ? 'bg-emerald-50 border-emerald-500 text-emerald-600 shadow-xl' : 'bg-white border-slate-100 text-slate-300'}`}>{v}</button>
                      ))}
                   </div>
                   <button onClick={async () => {
                     if(!pickupVillage || !dropoffVillage) return;
                     setIsSubmitting(true);
                     const dist = calculateDistance(pickupVillage.center.lat, pickupVillage.center.lng, dropoffVillage.center.lat, dropoffVillage.center.lng);
                     const price = Math.max(Math.round(DEFAULT_PRICING.basePrice + (dist * DEFAULT_PRICING.pricePerKm)), DEFAULT_PRICING.minPrice);
                     await addDoc(collection(db, "orders"), {
                        customerId: user.id, customerPhone: user.phone, category: 'TAXI',
                        pickup: { address: pickupVillage.name, lat: pickupVillage.center.lat, lng: pickupVillage.center.lng, villageName: pickupVillage.name },
                        dropoff: { address: dropoffVillage.name, lat: dropoffVillage.center.lat, lng: dropoffVillage.center.lng, villageName: dropoffVillage.name },
                        status: OrderStatus.WAITING_FOR_OFFERS, createdAt: Date.now(), requestedVehicleType: selectedVehicle,
                        price, distance: dist, operatorId: 'op_monofia_main', zoneId: 'zone_monofia_main', paymentMethod: 'CASH'
                     });
                     setIsSubmitting(false);
                   }} disabled={isSubmitting || !pickupVillage || !dropoffVillage} className="w-full bg-slate-950 text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all">{isSubmitting ? <Loader2 className="animate-spin h-8 w-8" /> : 'اطلب مشوارك الآن'}</button>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-12">
               {activeOrder.status === OrderStatus.WAITING_FOR_OFFERS ? (
                 <div className="animate-in zoom-in space-y-12 text-center">
                    <div className="relative py-10">
                       <div className="bg-white p-12 rounded-full shadow-2xl relative z-10 inline-block"><Navigation2 className="h-24 w-24 text-emerald-600 animate-pulse" /></div>
                    </div>
                    <h2 className="text-4xl font-black text-slate-950 tracking-tighter">{activeOrder.category === 'FOOD' ? 'جاري جلب كابتن لاستلام الطلب...' : 'جاري البحث عن كابتن...'}</h2>
                    <div className="space-y-6 px-2">
                       {incomingOffers.map(offer => (
                         <div key={offer.id} className="bg-white p-8 rounded-[3rem] border-4 border-slate-50 shadow-xl flex justify-between items-center hover:border-emerald-500 transition-all">
                            <div className="text-center space-y-2">
                               <p className="text-3xl font-black text-emerald-700">{offer.price} ج.م</p>
                               <button onClick={() => handleAcceptOffer(offer)} className="bg-emerald-600 text-white px-8 py-2 rounded-2xl font-black text-xs shadow-lg">قبول</button>
                            </div>
                            <div className="flex items-center gap-5 flex-row-reverse text-right">
                               <div className="w-14 h-14 bg-slate-900 text-emerald-400 rounded-2xl flex items-center justify-center overflow-hidden">
                                 {offer.driverPhoto ? <img src={offer.driverPhoto} className="w-full h-full object-cover" /> : (offer.driverName || 'ك')[0]}
                               </div>
                               <div><p className="font-black text-slate-900 text-lg">{offer.driverName}</p><div className="flex items-center gap-2 text-amber-500 font-black text-xs bg-amber-50 px-3 py-1 rounded-full">{offer.driverRating} <Star className="h-3 w-3 fill-amber-400" /></div></div>
                            </div>
                         </div>
                       ))}
                    </div>
                    <button onClick={() => updateDoc(doc(db, "orders", activeOrder.id), { status: OrderStatus.CANCELLED })} className="text-rose-500 font-black text-xs uppercase tracking-widest hover:underline">إلغاء الطلب</button>
                 </div>
               ) : activeOrder.status === OrderStatus.DELIVERED ? (
                 <div className="animate-in zoom-in space-y-8 text-center bg-white p-10 rounded-[4rem] shadow-2xl border-4 border-emerald-500/10">
                    <PartyPopper className="h-20 w-20 text-emerald-500 mx-auto animate-bounce" />
                    <h2 className="text-3xl font-black text-slate-950">وصلت بالسلامة!</h2>
                    <div className="bg-slate-50 p-8 rounded-[3rem] space-y-8">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">قيم تجربة التوصيل</p>
                       <div className="flex justify-center gap-3">
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setRating(s)} className="transition-all active:scale-75 border-none bg-transparent outline-none"><Star className={`h-12 w-12 ${rating >= s ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} /></button>
                          ))}
                       </div>
                       <textarea value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="رأيك يهمنا..." className="w-full bg-white border-2 border-slate-100 rounded-[2rem] p-6 font-bold text-sm outline-none text-right shadow-inner" dir="rtl" />
                    </div>
                    <button onClick={async () => {
                      await updateDoc(doc(db, "orders", activeOrder.id), { status: OrderStatus.DELIVERED_RATED, rating, feedback: feedback.trim(), ratedAt: Date.now() });
                      setFeedback('');
                    }} className="w-full bg-[#10b981] text-white py-8 rounded-[3rem] font-black text-2xl shadow-2xl">تأكيد <ThumbsUp className="h-8 w-8 inline mr-2" /></button>
                 </div>
               ) : (
                 <div className="animate-in zoom-in space-y-12">
                    <div className="bg-emerald-600 p-8 rounded-[3.5rem] text-white flex justify-between items-center shadow-2xl">
                       <div className="text-right"><p className="text-[11px] font-black opacity-60 uppercase mb-2">تتبع الطلب</p><h3 className="text-2xl font-black leading-none">الكابتن في طريقه إليك</h3></div>
                       <div className="bg-white/20 p-5 rounded-full"><Navigation2 className="h-8 w-8 animate-bounce" /></div>
                    </div>
                    <div className="flex flex-col items-center gap-6">
                       <div className="w-32 h-32 bg-slate-100 rounded-[3rem] flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden">
                         {activeOrder.driverPhoto ? <img src={activeOrder.driverPhoto} className="w-full h-full object-cover" /> : <UserIcon className="h-14 w-14 text-slate-300" />}
                       </div>
                       <div className="text-center"><h4 className="text-3xl font-black text-slate-950 tracking-tight">{activeOrder.driverName}</h4><p className="label-strong mt-2 uppercase text-emerald-600 bg-emerald-50 px-6 py-2 rounded-full inline-block">كابتن معتمد</p></div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                       <a href={`tel:${activeOrder.driverPhone}`} className="bg-slate-900 text-white py-8 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-4 shadow-2xl active:scale-95"><PhoneCall className="h-7 w-7" /> اتصال</a>
                       <button onClick={() => setShowChat(true)} className="bg-white border-4 border-slate-100 text-slate-900 py-8 rounded-[2.5rem] font-black text-lg flex items-center justify-center gap-4 active:scale-95"><MessageCircle className="h-7 w-7" /> محادثة</button>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-2xl border-t border-slate-100 px-10 py-6 flex justify-around items-center z-[150] shadow-2xl flex-row-reverse">
         {[
           {id: 'NEW', icon: <Plus className="h-7 w-7" />, label: 'طلب'},
           {id: 'ACTIVITY', icon: <History className="h-7 w-7" />, label: 'نشاطي'},
           {id: 'PROFILE', icon: <UserIcon className="h-7 w-7" />, label: 'حسابي'}
         ].map(tab => (
           <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`flex flex-col items-center gap-2 transition-all border-none bg-transparent ${activeView === tab.id ? 'text-emerald-600 scale-125' : 'text-slate-300'}`}>
              <div className={`p-3.5 rounded-2xl ${activeView === tab.id ? 'bg-emerald-50 shadow-inner' : ''}`}>{tab.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};

export default CustomerDashboard;
