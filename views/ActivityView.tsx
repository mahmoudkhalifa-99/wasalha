
import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, VehicleType } from '../types';
import { ASHMOUN_VILLAGES } from '../constants';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { 
  History, MapPin, Bike, Calendar, CheckCircle2, 
  MessageSquare, Star, ChevronRight, Filter, 
  Search, ArrowRightLeft, Car, Tag, Clock, XCircle,
  Loader2
} from 'lucide-react';
import { stripFirestore } from '../utils';

const ActivityView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('الكل');

  useEffect(() => {
    const field = user.role === 'DRIVER' ? 'driverId' : 'customerId';
    const q = query(
      collection(db, "orders"),
      where(field, "==", user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...stripFirestore(d.data()) 
      })) as Order[];
      setOrders(docs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.id, user.role]);

  const getStatusStyle = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.DELIVERED:
      case OrderStatus.DELIVERED_RATED:
        return 'bg-emerald-100 text-emerald-600';
      case OrderStatus.CANCELLED:
        return 'bg-rose-100 text-rose-600';
      case OrderStatus.ACCEPTED:
      case OrderStatus.PICKED_UP:
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-slate-100 text-slate-500';
    }
  };

  const filteredOrders = orders.filter(o => 
    selectedVillageFilter === 'الكل' || 
    o.pickup?.villageName === selectedVillageFilter || 
    o.dropoff?.villageName === selectedVillageFilter
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right duration-500 pb-10">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-black text-slate-800">تاريخ مشاويري</h2>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-50">
            <span className="text-[10px] font-black text-emerald-600">{filteredOrders.length}</span>
            <span className="text-[9px] font-bold text-slate-400 mr-1 uppercase">رحلة</span>
          </div>
          <button onClick={onBack} className="bg-white border border-slate-100 p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 shadow-sm active:scale-90 transition-all"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 px-4">
        <button 
          onClick={() => setSelectedVillageFilter('الكل')} 
          className={`px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all border ${selectedVillageFilter === 'الكل' ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600'}`}
        >
          الكل
        </button>
        {ASHMOUN_VILLAGES.slice(0, 10).map(v => (
          <button 
            key={v.id} 
            onClick={() => setSelectedVillageFilter(v.name)} 
            className={`px-6 py-3 rounded-2xl text-[10px] font-black whitespace-nowrap transition-all border ${selectedVillageFilter === v.name ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:text-slate-600'}`}
          >
            {v.name}
          </button>
        ))}
      </div>

      <div className="grid gap-5 px-4">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-100 shadow-sm animate-in zoom-in">
             <Clock className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-400 font-black text-sm uppercase tracking-widest">لا توجد رحلات مسجلة في هذا النطاق</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white p-7 rounded-[2.8rem] shadow-sm border border-slate-50 space-y-6 hover:shadow-xl hover:border-emerald-100 transition-all group animate-in slide-in-from-bottom">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl text-slate-400 group-hover:bg-slate-900 group-hover:text-emerald-400 transition-all">
                    {order.requestedVehicleType === 'CAR' ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">{new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</p>
                    <p className="text-[9px] font-bold text-slate-300">{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest shadow-sm ${getStatusStyle(order.status)}`}>
                  {order.status === OrderStatus.CANCELLED ? <XCircle className="h-3 w-3 inline ml-1" /> : <CheckCircle2 className="h-3 w-3 inline ml-1" />}
                  {order.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                   <p className="text-sm font-black text-slate-700">{order.pickup?.villageName || 'نقطة الاستلام'}</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                   <p className="text-sm font-black text-slate-700">{order.dropoff?.villageName || 'وجهة التوصيل'}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-50 flex justify-between items-end">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{user.role === 'DRIVER' ? 'العميل' : 'الكابتن'}</p>
                    <p className="text-xs font-black text-slate-800">{user.role === 'DRIVER' ? order.customerPhone : (order.driverName || 'بانتظار كابتن')}</p>
                 </div>
                 <div className="text-left">
                    <p className="text-2xl font-black text-slate-900">{order.price} <span className="text-xs opacity-40 font-bold">ج.م</span></p>
                    {order.rating && (
                      <div className="flex gap-0.5 mt-1 justify-end">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`h-3 w-3 ${i < order.rating! ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />)}
                      </div>
                    )}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] py-8">وصلها أشمون • خدمة التوصيل الذكية</p>
    </div>
  );
};

export default ActivityView;
