
import React, { useState, useEffect } from 'react';

// Types
import type { User, Order } from '../types';
import { OrderStatus } from '../types';
import { MENOFIA_DATA } from '../config/constants';

// Services
import { db, handleFirestoreError, OperationType } from '../services/firebase';
import { collection, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Utils
import { stripFirestore } from '../utils';

// Icons
import { 
  Clock, Loader2, ChevronRight, CheckCircle2, 
  XCircle, Bike, Car, MapPin, Building2, Filter 
} from 'lucide-react';

const ActivityView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('الكل');

  useEffect(() => {
    const field = user.role === 'DRIVER' ? 'driverId' : 'customerId';
    const q = query(collection(db, "orders"), where(field, "==", user.id));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Order[];
      setOrders(docs.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));
  }, [user.id, user.role]);

  const getDistrictName = (villageName?: string) => {
    return MENOFIA_DATA.find(d => d.villages.some(v => v.name === villageName))?.name || 'المنوفية';
  };

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case OrderStatus.CANCELLED:
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      case OrderStatus.ASSIGNED:
      case OrderStatus.PICKED:
      case OrderStatus.IN_DELIVERY:
        return 'bg-blue-50 text-blue-700 border border-blue-200/60';
      default:
        return 'bg-slate-100 text-slate-600 border border-slate-200';
    }
  };

  const filteredOrders = orders.filter(o => {
    if (selectedDistrict === 'الكل') return true;
    const pickupDist = getDistrictName(o.pickup?.villageName);
    const dropoffDist = getDistrictName(o.dropoff?.villageName);
    return pickupDist === selectedDistrict || dropoffDist === selectedDistrict;
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 p-5 md:p-6 animate-in slide-in-from-right duration-500 h-full overflow-y-auto no-scrollbar" dir="rtl">
      <div className="flex justify-between items-center px-1">
        <div className="text-right">
           <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">سجل طلباتي ورحلاتي</h2>
           <p className="text-xs font-medium text-slate-500 mt-0.5">تتبع طلباتك السابقة وتفاصيل كل مشوار</p>
        </div>
        <button onClick={onBack} className="p-3 bg-white border border-slate-200/70 rounded-2xl shadow-xs active:scale-90 hover:bg-slate-50 transition-all text-slate-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
         <button 
           onClick={() => setSelectedDistrict('الكل')}
           className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
             selectedDistrict === 'الكل' 
               ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
               : 'glass-card border-slate-200/70 text-slate-600 hover:text-emerald-700'
           }`}
         >
           جميع المراكز
         </button>
         {MENOFIA_DATA.map(d => (
           <button 
             key={d.id}
             onClick={() => setSelectedDistrict(d.name)}
             className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
               selectedDistrict === d.name 
                 ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm shadow-emerald-600/20' 
                 : 'glass-card border-slate-200/70 text-slate-600 hover:text-emerald-700'
             }`}
           >
             مركز {d.name}
           </button>
         ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-24 text-center text-slate-400 font-medium border-2 border-dashed border-slate-200/70 rounded-3xl bg-white/40 p-6 space-y-3">
            <Filter className="h-10 w-10 mx-auto opacity-30 text-emerald-600" />
            <p className="text-sm font-bold text-slate-600">لا توجد طلبات مسجلة في هذا المركز حتى الآن</p>
            <p className="text-xs text-slate-400">ابدأ بطلب مشوارك الأول الآن بضغطة زر</p>
          </div>
        ) : filteredOrders.map(order => (
          <div key={order.id} className="glass-card p-5 md:p-6 rounded-3xl border border-slate-200/60 shadow-xs hover:shadow-md transition-all space-y-4">
            <div className="flex justify-between items-start">
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    {order.requestedVehicleType === 'CAR' ? <Car className="h-5 w-5" /> : <Bike className="h-5 w-5" />}
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-slate-400">{new Date(order.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold ${getStatusStyle(order.status)}`}>
                      {order.status === OrderStatus.DELIVERED ? 'تم التوصيل بنجاح' : order.status === OrderStatus.CANCELLED ? 'تم الإلغاء' : order.status}
                    </span>
                  </div>
               </div>
               <div className="text-left" dir="ltr">
                  <span className="text-xl font-black text-slate-900">{order.price}</span>
                  <span className="text-xs font-bold text-slate-400 ml-1">ج.م</span>
               </div>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-2xl space-y-2 border border-slate-100 text-xs">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="text-slate-500">من:</span>
                  <span className="font-bold text-slate-800">{order.pickup?.villageName || 'غير محدد'} ({getDistrictName(order.pickup?.villageName)})</span>
               </div>
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                  <span className="text-slate-500">إلى:</span>
                  <span className="font-bold text-slate-800">{order.dropoff?.villageName || 'غير محدد'} ({getDistrictName(order.dropoff?.villageName)})</span>
               </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11px] text-slate-400 font-medium">
               <span>رقم الطلب: #{order.id.slice(-6).toUpperCase()}</span>
               <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold">{user.role === 'DRIVER' ? 'العميل:' : 'الكابتن:'}</span>
                  <span className="text-emerald-700 font-extrabold">{user.role === 'DRIVER' ? order.customerPhone : (order.driverName || 'كابتن معتمد')}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-[10px] font-bold text-slate-400 py-4">وصـــلــهــا • أمان وسرعة في كل مكان بالمنوفية</p>
    </div>
  );
};

export default ActivityView;
