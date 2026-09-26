
import React, { useState, useEffect, useRef } from 'react';

// Types
import type { User, Order, Village, Restaurant, MenuItem } from '../types';
import { OrderStatus, UserStatus } from '../types';

// Utils
import { stripFirestore } from '../utils';

// Constants
import { DEFAULT_PRICING, ASHMOUN_VILLAGES as STATIC_VILLAGES, MENOFIA_DATA } from '../config/constants';

// Services
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { 
  collection, query, doc, onSnapshot, orderBy, 
  setDoc, addDoc, deleteDoc, updateDoc, limit, getDoc, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Icons
import { 
  User as UserIcon, DollarSign, Bike, Search, Car, 
  ShieldCheck, Megaphone, Trash2, Save, Loader2, MessageCircle, 
  Calculator, TrendingUp, ChevronRight, MapPin, 
  LayoutDashboard, Send, Users2, Plus, X, Building2, UtensilsCrossed,
  Image as ImageIcon, PlusCircle, Camera, FileText
} from 'lucide-react';

const RestaurantEditor: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [restData, setRestData] = useState({ 
    name: '', 
    category: 'مشويات', 
    photoURL: '', 
    menuImageURL: '' 
  });
  
  const [newItem, setNewItem] = useState({ name: '', price: 0, photoURL: '' });
  const [activeRestId, setActiveRestId] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const menuImgRef = useRef<HTMLInputElement>(null);
  const itemFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubRestaurants = onSnapshot(collection(db, "restaurants"), (snap) => {
      setRestaurants(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Restaurant[]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'restaurants'));
    return () => unsubRestaurants();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'PHOTO' | 'MENU' | 'ITEM') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === 'PHOTO') setRestData(prev => ({ ...prev, photoURL: base64 }));
      if (target === 'MENU') setRestData(prev => ({ ...prev, menuImageURL: base64 }));
      if (target === 'ITEM') setNewItem(prev => ({ ...prev, photoURL: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const saveRestaurant = async () => {
    if (!restData.name) return;
    setLoading(true);
    try {
      const id = `rest_${Date.now()}`;
      await setDoc(doc(db, "restaurants", id), {
        ...restData, id, menu: [], isOpen: true, address: 'أشمون', lat: 30.298, lng: 30.975
      });
      setIsAdding(false);
      setRestData({ name: '', category: 'مشويات', photoURL: '', menuImageURL: '' });
    } catch (e) { alert('خطأ'); } finally { setLoading(false); }
  };

  const addMenuItem = async (rid: string) => {
    if (!newItem.name || newItem.price <= 0) return;
    const rest = restaurants.find(r => r.id === rid);
    if (!rest) return;
    const menu = [...(rest.menu || []), { ...newItem, id: `item_${Date.now()}` }];
    await updateDoc(doc(db, "restaurants", rid), { menu });
    setNewItem({ name: '', price: 0, photoURL: '' });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-top">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-8">
           <button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center gap-2 shadow-xl active:scale-95 transition-all">
              {isAdding ? <X className="h-4 w-4" /> : <PlusCircle className="h-4 w-4" />}
              {isAdding ? 'إلغاء' : 'إضافة مطعم'}
           </button>
           <h3 className="text-xl font-black dark:text-white flex items-center gap-3">إدارة المطاعم <UtensilsCrossed className="text-emerald-500" /></h3>
        </div>

        {isAdding && (
          <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[3rem] mb-10 space-y-8 border-2 border-emerald-500/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4 text-center">
                  <div onClick={() => fileRef.current?.click()} className="w-full h-48 bg-white dark:bg-slate-800 rounded-3xl border-4 border-dashed border-emerald-200 flex items-center justify-center cursor-pointer overflow-hidden relative group">
                     {restData.photoURL ? <img src={restData.photoURL} className="w-full h-full object-cover" /> : <Camera className="h-10 w-10 text-emerald-300" />}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-xs uppercase tracking-widest">صورة الغلاف</div>
                  </div>
                  <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'PHOTO')} />
               </div>
               <div className="space-y-4 text-center">
                  <div onClick={() => menuImgRef.current?.click()} className="w-full h-48 bg-white dark:bg-slate-800 rounded-3xl border-4 border-dashed border-amber-200 flex items-center justify-center cursor-pointer overflow-hidden relative group">
                     {restData.menuImageURL ? <img src={restData.menuImageURL} className="w-full h-full object-cover" /> : <FileText className="h-10 w-10 text-amber-300" />}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-black text-xs uppercase tracking-widest">صورة المنيو الورقي</div>
                  </div>
                  <input type="file" ref={menuImgRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'MENU')} />
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input value={restData.name} onChange={e => setRestData({...restData, name: e.target.value})} placeholder="اسم المطعم" className="bg-white dark:bg-slate-800 p-5 rounded-2xl font-black text-sm outline-none" />
               <input value={restData.category} onChange={e => setRestData({...restData, category: e.target.value})} placeholder="التصنيف (بيتزا، كريب، مشويات)" className="bg-white dark:bg-slate-800 p-5 rounded-2xl font-black text-sm outline-none" />
            </div>
            <button onClick={saveRestaurant} disabled={loading} className="w-full bg-slate-950 text-white py-6 rounded-3xl font-black shadow-2xl active:scale-95 transition-all">حفظ البيانات</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {restaurants.map(rest => (
             <div key={rest.id} className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                   <button onClick={async () => { if(confirm('حذف المطعم؟')) await deleteDoc(doc(db, "restaurants", rest.id)); }} className="bg-rose-50 p-3 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                   <div className="text-right flex items-center gap-5">
                      <div>
                        <h4 className="font-black text-2xl dark:text-white">{rest.name}</h4>
                        <p className="text-xs font-bold text-emerald-600">{rest.category}</p>
                      </div>
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md">
                         {rest.photoURL ? <img src={rest.photoURL} className="w-full h-full object-cover" /> : <Building2 className="p-4 text-slate-200" />}
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">الوجبات ({rest.menu?.length || 0})</h5>
                   <div className="grid gap-3">
                      {rest.menu?.map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl flex justify-between items-center group shadow-sm">
                           <button onClick={async () => {
                             const menu = rest.menu.filter(i => i.id !== item.id);
                             await updateDoc(doc(db, "restaurants", rest.id), { menu });
                           }} className="text-rose-200 hover:text-rose-500 transition-colors"><X className="h-4 w-4" /></button>
                           <div className="flex items-center gap-4 text-right">
                              <div>
                                <p className="font-black text-sm dark:text-white leading-none">{item.name}</p>
                                <p className="text-xs font-bold text-emerald-600 mt-1">{item.price} ج.م</p>
                              </div>
                              <div className="w-12 h-12 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                 {item.photoURL ? <img src={item.photoURL} className="w-full h-full object-cover" /> : <UtensilsCrossed className="p-3 text-slate-200" />}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex gap-4 flex-row-reverse">
                         <div onClick={() => { setActiveRestId(rest.id); itemFileRef.current?.click(); }} className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-emerald-200 flex items-center justify-center cursor-pointer shrink-0 overflow-hidden">
                            {activeRestId === rest.id && newItem.photoURL ? <img src={newItem.photoURL} className="w-full h-full object-cover" /> : <Camera className="h-5 w-5 text-emerald-200" />}
                         </div>
                         <div className="flex-1 space-y-2">
                            <input value={activeRestId === rest.id ? newItem.name : ''} onChange={e => { setActiveRestId(rest.id); setNewItem({...newItem, name: e.target.value}); }} placeholder="اسم الوجبة" className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-black outline-none" />
                            <div className="flex gap-2">
                               <input type="number" value={activeRestId === rest.id ? (newItem.price || '') : ''} onChange={e => { setActiveRestId(rest.id); setNewItem({...newItem, price: Number(e.target.value)}); }} placeholder="السعر" className="flex-1 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-xs font-black outline-none" />
                               <button onClick={() => addMenuItem(rest.id)} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-black text-[10px]">إضافة</button>
                            </div>
                         </div>
                      </div>
                      <input type="file" ref={itemFileRef} className="hidden" accept="image/*" onChange={e => handleImageUpload(e, 'ITEM')} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'USERS' | 'RESTAURANTS' | 'VILLAGES'>('STATS');
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as User[]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));
    
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Order[]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));
    
    return () => { unsubUsers(); unsubOrders(); };
  }, []);

  const handleUpdateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      await updateDoc(doc(db, "users", userId), { status });
      alert('تم تحديث حالة المستخدم بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role });
      alert('تم تحديث رتبة المستخدم بنجاح');
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.phone?.includes(searchTerm));

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-32 p-6 animate-in fade-in transition-colors duration-300">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-[2.8rem] shadow-sm border border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar sticky top-4 z-[400] backdrop-blur-xl">
        {[
          { id: 'STATS', label: 'الإحصائيات', icon: <LayoutDashboard className="h-4 w-4" /> },
          { id: 'USERS', label: 'المستخدمين', icon: <Users2 className="h-4 w-4" /> },
          { id: 'RESTAURANTS', label: 'المطاعم', icon: <UtensilsCrossed className="h-4 w-4" /> },
          { id: 'VILLAGES', label: 'إدارة المنوفية', icon: <MapPin className="h-4 w-4" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-3 px-10 py-5 rounded-[1.8rem] text-[11px] font-black transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-xl dark:bg-white dark:text-slate-950' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'STATS' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in zoom-in">
           <div className="bg-emerald-600 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <TrendingUp className="absolute -bottom-4 -left-4 h-24 w-24 opacity-10" />
              <p className="text-[10px] font-black opacity-60 uppercase mb-2">رصيد المنظومة</p>
              <h3 className="text-4xl font-black">{users.reduce((acc, curr) => acc + (curr.wallet?.balance || 0), 0).toLocaleString()} <span className="text-xs">ج.م</span></h3>
           </div>
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">إجمالي المستخدمين</p>
              <h3 className="text-4xl font-black dark:text-white">{users.length}</h3>
           </div>
           <div className="bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">كباتن المنوفية</p>
              <h3 className="text-4xl font-black text-emerald-600">{users.filter(u => u.role === 'DRIVER').length}</h3>
           </div>
           <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-sm">
              <p className="text-[10px] font-black opacity-40 uppercase mb-2">الرحلات المنفذة</p>
              <h3 className="text-4xl font-black">{orders.length}</h3>
           </div>
        </div>
      )}

      {activeTab === 'RESTAURANTS' && <RestaurantEditor />}
      
      {activeTab === 'USERS' && (
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-10">
           <div className="relative">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 h-5 w-5" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث عن اسم أو موبايل..." className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-3xl p-6 pr-14 font-black text-sm outline-none dark:text-white text-right" dir="rtl" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map(u => (
                <div key={u.id} className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[3rem] border-2 border-transparent hover:border-emerald-500 transition-all cursor-pointer group">
                   <div className="flex items-center gap-5 flex-row-reverse text-right">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-slate-200 text-2xl overflow-hidden shrink-0 shadow-sm">
                        {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover" /> : (u.name || 'ع')[0]}
                      </div>
                      <div className="flex-1 text-right">
                         <p className="font-black text-slate-900 dark:text-white text-lg leading-tight">{u.name}</p>
                         <p className="text-xs font-bold text-slate-400 mt-1">{u.phone}</p>
                         <div className="flex gap-2 mt-4 justify-end flex-wrap">
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${u.role === 'DRIVER' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-600'}`}>{u.role}</span>
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase ${u.status === 'APPROVED' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{u.status}</span>
                         </div>
                         
                         <div className="flex gap-2 mt-4 justify-end">
                            {u.role === 'DRIVER' && u.status !== 'APPROVED' && (
                              <button 
                                onClick={() => handleUpdateUserStatus(u.id, UserStatus.APPROVED)}
                                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[9px] font-black active:scale-95 transition-all"
                              >
                                موافقة
                              </button>
                            )}
                            <button 
                              onClick={() => handleUpdateUserRole(u.id, u.role === 'DRIVER' ? 'CUSTOMER' : 'DRIVER')}
                              className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black active:scale-95 transition-all"
                            >
                              تغيير الرتبة
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;
