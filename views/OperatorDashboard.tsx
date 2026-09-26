
import React, { useState, useEffect, useRef } from 'react';
import { User, Order, OrderStatus } from '../types';
import { db } from '../firebase';
import { 
  collection, query, onSnapshot, orderBy, doc, 
  updateDoc, where, getDocs, limit 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stripFirestore } from '../utils';
import { 
  Activity, Bike, X, MapPin, 
  Phone, ChevronRight, Clock, 
  Zap, Loader2, XCircle, StickyNote, Map as MapIcon,
  Search, ShieldCheck, TrendingUp, AlertCircle
} from 'lucide-react';

const ManualAssignModal: React.FC<{ order: Order, onClose: () => void }> = ({ order, onClose }) => {
  const [drivers, setDrivers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "DRIVER"), where("status", "==", "APPROVED"), limit(30));
    getDocs(q).then(snap => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as User[]);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const assignDriver = async (driver: User) => {
    try {
      await updateDoc(doc(db, "orders", order.id), {
        driverId: driver.id,
        driverName: driver.name || 'كابتن',
        driverPhone: driver.phone || '',
        status: OrderStatus.ACCEPTED,
        acceptedAt: Date.now()
      });
      onClose();
    } catch (e) { alert('فشل التوجيه'); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[11000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 space-y-8 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center px-2">
           <h3 className="text-xl font-black text-slate-800">توجيه كابتن يدوياً</h3>
           <button onClick={onClose} className="p-3 bg-slate-100 rounded-2xl transition-all hover:bg-slate-200"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 px-2">
          {drivers.map(d => (
            <div key={d.id} onClick={() => assignDriver(d)} className="p-5 bg-slate-50 rounded-[2.5rem] border border-transparent hover:border-emerald-500 cursor-pointer flex justify-between items-center transition-all group">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black group-hover:bg-slate-900 group-hover:text-emerald-400 shadow-sm transition-all">{(d.name || 'ك')[0]}</div>
                 <div><p className="text-sm font-black text-slate-800">{d.name || 'كابتن'}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{d.vehicleType || 'توكتوك'}</p></div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </div>
          ))}
          {drivers.length === 0 && !loading && (
            <p className="text-center text-slate-400 py-10 font-bold">لا يوجد كباتن متاحين حالياً</p>
          )}
          {loading && <div className="py-10 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" /></div>}
        </div>
      </div>
    </div>
  );
};

const OperatorDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'LIVE' | 'DRIVERS' | 'HISTORY'>('LIVE');
  const [assignTarget, setAssignTarget] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubOrders = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(100)), (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Order[]);
    });
    const unsubDrivers = onSnapshot(query(collection(db, "users"), where("role", "==", "DRIVER")), (snap) => {
      setDrivers(snap.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as User[]);
    });
    return () => { unsubOrders(); unsubDrivers(); };
  }, []);

  const liveOrders = orders.filter(o => ![OrderStatus.DELIVERED, OrderStatus.DELIVERED_RATED, OrderStatus.CANCELLED].includes(o.status));

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 p-6 animate-in fade-in transition-all">
      {assignTarget && <ManualAssignModal order={assignTarget} onClose={() => setAssignTarget(null)} />}
      
      <div className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
         <div className="flex items-center gap-6">
            <div className="bg-slate-900 p-5 rounded-[2.5rem] text-emerald-400 shadow-xl shadow-slate-200">
               <Activity className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">تحكم أشمون</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">تغطية مباشرة لمركز ومدينة أشمون</p>
            </div>
         </div>
         <div className="flex gap-2 bg-slate-50 p-2 rounded-[2rem] overflow-x-auto no-scrollbar shadow-inner">
            {[
              {id: 'LIVE', label: 'النشاط الحالي', icon: <Zap className="h-4 w-4" />},
              {id: 'DRIVERS', label: 'الكباتن', icon: <Bike className="h-4 w-4" />},
              {id: 'HISTORY', label: 'السجل العام', icon: <Clock className="h-4 w-4" />}
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-10 py-4 rounded-[1.8rem] text-[10px] font-black transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
         </div>
      </div>

      {activeTab === 'LIVE' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-500">
           {liveOrders.map(order => (
             <div key={order.id} className="bg-white rounded-[3.5rem] border border-slate-50 shadow-xl overflow-hidden group hover:border-emerald-500 transition-all">
                <div className="bg-slate-50 p-7 flex justify-between items-center group-hover:bg-slate-900 group-hover:text-white transition-all">
                   <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${order.driverId ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{order.status}</span>
                   </div>
                   <p className="text-2xl font-black">{order.price} <span className="text-xs opacity-40 font-bold uppercase">ج.م</span></p>
                </div>
                <div className="p-8 space-y-8">
                   <div className="space-y-6 text-right">
                      <div className="flex gap-5 items-start">
                         <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><MapPin className="h-5 w-5" /></div>
                         <div className="flex-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">المسار</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">{order.pickup?.villageName} ← {order.dropoff?.villageName}</p>
                         </div>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-4 shadow-inner">
                          {order.pickupNotes && (
                            <div>
                              <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">موقع الاستلام:</p>
                              <p className="text-xs font-bold text-slate-600 leading-relaxed">{order.pickupNotes}</p>
                            </div>
                          )}
                          {order.dropoffNotes && (
                            <div className="pt-3 border-t border-slate-200">
                              <p className="text-[9px] font-black text-rose-600 uppercase mb-1">وجهة الوصول:</p>
                              <p className="text-xs font-bold text-slate-600 leading-relaxed">{order.dropoffNotes}</p>
                            </div>
                          )}
                       </div>
                   </div>
                   
                   <div className="flex gap-2">
                     {!order.driverId ? (
                        <button onClick={() => setAssignTarget(order)} className="flex-1 bg-amber-500 text-white py-5 rounded-[2rem] font-black text-[11px] shadow-xl shadow-amber-50 active:scale-95 transition-all">توجيه كابتن فوراً</button>
                     ) : (
                        <a href={`tel:${order.driverPhone}`} className="flex-1 bg-slate-950 text-white py-5 rounded-[2rem] font-black text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl"><Phone className="h-4 w-4" /> اتصال بالكابتن</a>
                     )}
                     <button onClick={() => { if(window.confirm('إلغاء الطلب؟')) updateDoc(doc(db, "orders", order.id), { status: OrderStatus.CANCELLED }); }} className="p-5 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-all active:scale-90"><XCircle className="h-6 w-6" /></button>
                   </div>
                </div>
             </div>
           ))}
           {liveOrders.length === 0 && (
             <div className="col-span-full py-32 text-center text-slate-300 font-black border-4 border-dashed border-slate-50 rounded-[4rem] bg-slate-50/20">
                <AlertCircle className="h-16 w-16 mx-auto mb-6 opacity-20" />
                <p className="tracking-widest uppercase">لا توجد رحلات نشطة في أشمون حالياً</p>
             </div>
           )}
        </div>
      )}

      {activeTab === 'DRIVERS' && (
        <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-sm animate-in slide-in-from-right duration-500">
           <div className="relative mb-10">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="بحث عن كابتن..." className="w-full bg-slate-50 border-none rounded-[2rem] py-6 pr-14 pl-8 font-black text-sm outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all" />
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.filter(d => d.name.includes(searchTerm)).map(d => (
                <div key={d.id} className="p-8 bg-slate-50 rounded-[3rem] flex items-center gap-6 border-2 border-transparent hover:border-emerald-500 hover:bg-white hover:shadow-2xl transition-all group">
                   <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center font-black text-slate-300 text-3xl group-hover:bg-slate-950 group-hover:text-emerald-400 transition-all shadow-sm">
                      {(d.name || 'ك')[0]}
                   </div>
                   <div className="flex-1">
                      <p className="font-black text-slate-900 text-lg leading-none mb-2">{d.name}</p>
                      <p className="text-xs font-bold text-slate-400" dir="ltr">{d.phone}</p>
                      <div className="flex items-center gap-2 mt-3">
                         <div className={`w-2.5 h-2.5 rounded-full ${d.status === 'APPROVED' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{d.status}</span>
                      </div>
                   </div>
                   <button onClick={() => window.open(`tel:${d.phone}`)} className="p-5 bg-white rounded-2xl shadow-sm text-slate-400 hover:text-emerald-600 transition-all active:scale-90"><Phone className="h-5 w-5" /></button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;
