
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { 
  Wallet, TrendingUp, ArrowDownRight, ArrowUpLeft, 
  CreditCard, PlusCircle, Smartphone, Info, Copy, 
  ChevronRight, Loader2, Receipt, Send,
  Banknote, History
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stripFirestore } from '../utils';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: number;
}

const WalletView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDriver = user.role === 'DRIVER';
  const cashNumber = "01065019364";

  useEffect(() => {
    const q = query(collection(db, "transactions"), where("userId", "==", user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...stripFirestore(d.data()) 
      })) as Transaction[];
      setTransactions(docs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 20));
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user.id]);

  const handleWithdrawRequest = async () => {
    if (withdrawAmount <= 0 || withdrawAmount > (user.wallet?.balance || 0)) {
      alert('المبلغ غير متاح في رصيدك.');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "withdraw_requests"), {
        userId: user.id, userName: user.name, userPhone: user.phone,
        amount: withdrawAmount, status: 'PENDING', createdAt: Date.now()
      });
      setShowWithdraw(false);
      alert('تم إرسال طلب السحب للإدارة، سيتم التواصل معك قريباً.');
    } catch (e) { alert('فشل إرسال الطلب'); } finally { setIsSubmitting(false); }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('تم النسخ بنجاح');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-bottom duration-500 pb-20">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">رصيد أشمون</h2>
        <div className="flex items-center gap-2">
          {isDriver ? (
             <button onClick={() => setShowWithdraw(!showWithdraw)} className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all">
               <Banknote className="h-4 w-4 text-emerald-400" /> سحب الأرباح
             </button>
          ) : (
            <button onClick={() => setShowTopUp(!showTopUp)} className="bg-emerald-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black flex items-center gap-2 shadow-xl active:scale-95 transition-all">
              <PlusCircle className="h-4 w-4" /> شحن الرصيد
            </button>
          )}
          <button onClick={onBack} className="bg-white border border-slate-100 p-3 rounded-2xl text-slate-400 hover:text-emerald-600 shadow-sm active:scale-90 transition-all">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {showWithdraw && (
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 animate-in zoom-in shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
           <h3 className="text-xl font-black flex items-center gap-3"><Send className="h-5 w-5 text-emerald-400" /> طلب سحب أرباح</h3>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 block">المبلغ المراد سحبه</label>
              <div className="relative">
                 <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] p-6 text-2xl font-black outline-none focus:border-emerald-500 transition-all" placeholder="0.00" />
                 <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-black">ج.م</span>
              </div>
              <button onClick={handleWithdrawRequest} disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-5 rounded-[1.8rem] font-black text-sm shadow-xl active:scale-95 transition-all">
                 {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'تأكيد طلب السحب'}
              </button>
           </div>
        </div>
      )}

      {showTopUp && (
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] space-y-8 animate-in zoom-in shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 flex items-center gap-3"><PlusCircle className="text-emerald-400" /> شحن محفظة وصلها</h3>
            <p className="text-[10px] font-bold opacity-60 mb-8 leading-relaxed">حوّل المبلغ المطلوب لرقم الإدارة (فودافون كاش) وسيتم إضافة الرصيد لحسابك فور المراجعة.</p>
            <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center group mb-6">
              <div className="text-right">
                <p className="text-[9px] font-black text-emerald-400 uppercase mb-1 tracking-widest">فودافون كاش</p>
                <span className="text-2xl font-black tracking-widest">{cashNumber}</span>
              </div>
              <button onClick={() => copyToClipboard(cashNumber)} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors"><Copy className="h-5 w-5 text-slate-400" /></button>
            </div>
            <button onClick={() => window.open(`https://wa.me/201065019364?text=${encodeURIComponent('لقد قمت بتحويل مبلغ لشحن المحفظة.')}`)} className="w-full bg-emerald-600 text-white py-5 rounded-[1.8rem] font-black text-sm active:scale-95 transition-all shadow-xl">لقد قمت بالتحويل، تأكيد الآن</button>
          </div>
        </div>
      )}

      <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white relative overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 blur-[120px]"></div>
        <div className="relative z-10 flex flex-col gap-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-3">إجمالي رصيدك في أشمون</p>
              <h3 className="text-7xl font-black tracking-tighter">{(user.wallet?.balance || 0).toFixed(1)} <span className="text-sm text-white/40 font-bold uppercase">ج.م</span></h3>
            </div>
            <div className="bg-emerald-500/20 p-5 rounded-[2rem] backdrop-blur-xl border border-emerald-500/20 shadow-inner">
               <Wallet className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-10 border-t border-white/5">
            <div className="space-y-1">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">صافي الأرباح</p>
              <div className="flex items-center gap-2">
                 <div className="bg-emerald-500/10 p-1.5 rounded-lg"><TrendingUp className="h-3 w-3 text-emerald-500" /></div>
                 <p className="text-2xl font-black text-emerald-400">{(user.wallet?.totalEarnings || 0).toFixed(0)} <span className="text-[10px] opacity-40">ج.م</span></p>
              </div>
            </div>
            <div className="space-y-1 text-left">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">المسحوبات</p>
              <div className="flex items-center gap-2 justify-end">
                 <p className="text-2xl font-black text-rose-400">{(user.wallet?.withdrawn || 0).toFixed(0)} <span className="text-[10px] opacity-40">ج.م</span></p>
                 <div className="bg-rose-500/10 p-1.5 rounded-lg"><ArrowUpLeft className="h-3 w-3 text-rose-500" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm space-y-8">
        <div className="flex justify-between items-center mb-2 px-2">
          <h4 className="font-black text-slate-800 text-lg flex items-center gap-3">
            <History className="h-5 w-5 text-emerald-600" /> كشف العمليات
          </h4>
          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">تحديث لحظي</span>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="py-20 text-center"><Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" /></div>
          ) : transactions.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[2.5rem] bg-slate-50/50">
               <Receipt className="h-10 w-10 text-slate-200 mx-auto mb-4 opacity-30" />
               <p className="text-slate-300 font-black text-[10px] uppercase tracking-widest">سجلك المالي فارغ تماماً</p>
            </div>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-[2.2rem] border border-transparent hover:border-emerald-100 transition-all group">
                <div className="flex items-center gap-5">
                  <div className={`p-4 rounded-2xl shadow-sm ${t.type === 'CREDIT' ? 'bg-white text-emerald-500' : 'bg-white text-rose-500'} group-hover:bg-slate-900 group-hover:text-white transition-all`}>
                    {t.type === 'CREDIT' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpLeft className="h-5 w-5" />}
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-800 text-sm leading-none mb-1.5">{t.description}</p>
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                      {new Date(t.createdAt).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-xl font-black ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}{t.amount.toFixed(1)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
