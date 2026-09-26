
import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { stripFirestore } from '../utils';
import { 
  Wallet, TrendingUp, ArrowDownRight, ArrowUpLeft, 
  PlusCircle, ChevronRight, Loader2, Receipt, Send, 
  Banknote, History, Copy, ExternalLink, Smartphone
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  createdAt: number;
}

const WalletView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTopUp, setShowTopUp] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cashNumber = "01065019364"; // رقم الإدارة المعتمد

  useEffect(() => {
    const q = query(collection(db, "transactions"), where("userId", "==", user.id));
    return onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...stripFirestore(d.data()) })) as Transaction[];
      setTransactions(docs.sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    });
  }, [user.id]);

  const handleAction = async (action: 'TOPUP' | 'WITHDRAW') => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return alert('يرجى إدخال مبلغ صحيح');
    
    if (action === 'WITHDRAW' && numAmount > (user.wallet?.balance || 0)) {
      return alert('المبلغ المطلوب أكبر من رصيدك الحالي');
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "payment_requests"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        type: action,
        amount: numAmount,
        status: 'PENDING',
        createdAt: Date.now()
      });
      
      const whatsappMsg = action === 'TOPUP' 
        ? `طلب شحن محفظة وصلها: ${numAmount} ج.م\nالاسم: ${user.name}` 
        : `طلب سحب أرباح من وصلها: ${numAmount} ج.م\nالاسم: ${user.name}`;
      
      window.open(`https://wa.me/${cashNumber}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
      
      setShowTopUp(false);
      setShowWithdraw(false);
      setAmount('');
      alert('تم إرسال طلبك بنجاح، سيتم تنفيذه بعد المراجعة.');
    } catch (e) {
      alert('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-32 p-5 md:p-6 animate-in slide-in-from-bottom duration-500" dir="rtl">
      <div className="flex justify-between items-center px-1">
        <div className="text-right">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">محفظتي الرقمية</h2>
          <p className="text-xs font-medium text-slate-500 mt-0.5">رصيدك الحالي، شحن فودافون كاش، وسجل المعاملات</p>
        </div>
        <button onClick={onBack} className="p-3 bg-white border border-slate-200/70 rounded-2xl shadow-xs active:scale-90 hover:bg-slate-50 transition-all text-slate-700">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Hero Balance Card */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/15 blur-[90px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-500/10 blur-[70px] pointer-events-none"></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              الرصيد المتاح للاستخدام
            </span>
            <Wallet className="h-6 w-6 text-emerald-400/80" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl md:text-6xl font-black tracking-tight text-white">
                {(user.wallet?.balance || 0).toFixed(1)}
              </h3>
              <span className="text-lg font-extrabold text-emerald-400">جنيه مصري</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">يمكنك استخدام رصيدك لدفع المشاوير والطلبات بدون كاش</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button 
              onClick={() => { setShowTopUp(true); setShowWithdraw(false); }} 
              className="brand-gradient text-white py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 active:scale-95"
            >
              <PlusCircle className="h-4 w-4" /> شحن رصيد كاش
            </button>
            <button 
              onClick={() => { setShowWithdraw(true); setShowTopUp(false); }} 
              className="bg-white/10 hover:bg-white/15 text-white py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all border border-white/10 active:scale-95"
            >
              <Banknote className="h-4 w-4" /> سحب أرباح
            </button>
          </div>
        </div>
      </div>

      {/* TopUp / Withdraw Modal/Card */}
      {(showTopUp || showWithdraw) && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-emerald-500/30 shadow-xl space-y-6 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3.5 flex-row-reverse text-right">
             <div className={`p-3 rounded-2xl text-white shadow-md flex items-center justify-center ${showTopUp ? 'bg-emerald-600' : 'bg-amber-600'}`}>
                {showTopUp ? <PlusCircle className="h-6 w-6" /> : <Banknote className="h-6 w-6" />}
             </div>
             <div>
                <h4 className="text-lg font-black text-slate-900">{showTopUp ? 'شحن المحفظة فورياً' : 'طلب سحب رصيد'}</h4>
                <p className="text-xs font-medium text-slate-500">عبر محفظة فودافون كاش أو المقر المعتمد</p>
             </div>
          </div>
          
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-600 block text-right">المبلغ المطلوب (ج.م)</label>
             <input 
               type="number" 
               value={amount} 
               onChange={e => setAmount(e.target.value)} 
               placeholder="0.00" 
               className="w-full bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-emerald-500 rounded-2xl p-4 text-3xl font-black outline-none focus:ring-2 focus:ring-emerald-500/20 text-center transition-all" 
             />
          </div>

          {showTopUp && (
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60 flex justify-between items-center">
               <button onClick={() => { navigator.clipboard.writeText(cashNumber); alert('تم نسخ الرقم بنجاح'); }} className="p-2.5 bg-white rounded-xl shadow-xs text-emerald-700 hover:bg-emerald-50 transition-all active:scale-90 flex items-center gap-1.5 text-xs font-bold">
                  <Copy className="h-4 w-4" /> نسخ الرقم
               </button>
               <div className="text-right">
                  <p className="text-[11px] font-bold text-emerald-800 mb-0.5">رقم فودافون كاش الرسمي للإدارة</p>
                  <span className="text-lg font-black tracking-wider text-slate-900" dir="ltr">{cashNumber}</span>
               </div>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              disabled={isSubmitting} 
              onClick={() => handleAction(showTopUp ? 'TOPUP' : 'WITHDRAW')} 
              className={`flex-[2] py-4 rounded-2xl font-black text-sm text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 ${showTopUp ? 'brand-gradient shadow-emerald-600/25' : 'bg-slate-900'}`}
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : 'تأكيد وإرسال الطلب'}
            </button>
            <button onClick={() => { setShowTopUp(false); setShowWithdraw(false); setAmount(''); }} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold text-sm text-slate-600 transition-colors">إلغاء</button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="glass-card rounded-3xl p-6 md:p-8 border border-slate-200/60 shadow-xs space-y-6">
        <div className="flex justify-between items-center">
           <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <History className="h-5 w-5 text-emerald-600" /> سجل المعاملات المالية
           </h4>
           <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">تحديث فوري</span>
        </div>

        <div className="space-y-3">
          {loading ? (
             <div className="py-16 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
          ) : transactions.length === 0 ? (
             <div className="py-16 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200/70 rounded-2xl p-6">
                لا توجد معاملات مسجلة في محفظتك حتى الآن
             </div>
          ) : transactions.map(t => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all">
               <div className="flex items-center gap-3.5">
                  <div className={`p-2.5 rounded-xl ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                     {t.type === 'CREDIT' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpLeft className="h-4 w-4" />}
                  </div>
                  <div className="text-right">
                     <p className="font-extrabold text-slate-800 text-sm">{t.description}</p>
                     <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(t.createdAt).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })} • {new Date(t.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
               </div>
               <div className="text-left" dir="ltr">
                  <span className={`text-base font-black ${t.type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {t.type === 'CREDIT' ? '+' : '-'}{t.amount.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 ml-1">ج.م</span>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WalletView;
