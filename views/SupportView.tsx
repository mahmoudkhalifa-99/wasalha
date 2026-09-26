
import React, { useState } from 'react';
import { 
  MessageSquare, ChevronRight, Star,
  Send, Loader2, Heart, Sparkles, ExternalLink,
  MapPin, Clock
} from 'lucide-react';
import { User } from '../types';
import { db } from '../firebase';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const SupportView: React.FC<{ user: User, onBack: () => void }> = ({ user, onBack }) => {
  const supportPhone = "01065019364";
  const [rating, setRating] = useState(5);
  const [opinion, setOpinion] = useState('');
  const [developmentComment, setDevelopmentComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opinion.trim() && !developmentComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "feedback"), {
        userId: user.id,
        userName: user.name,
        userPhone: user.phone,
        userRole: user.role,
        rating,
        opinion, // رأيك في البرنامج
        suggestion: developmentComment, // تعليقك للتطوير
        createdAt: Date.now()
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
      setOpinion('');
      setDevelopmentComment('');
      setRating(5);
    } catch (e) {
      alert('عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    window.open(`https://wa.me/${supportPhone}`, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">صوتك مسموع</h2>
        <button 
          onClick={onBack}
          className="bg-white border border-slate-100 p-2.5 rounded-xl text-slate-400 hover:text-emerald-600 shadow-sm active:scale-90 transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="bg-[#2D9469] rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 space-y-6">
          <div className="bg-white/20 p-4 rounded-2xl inline-block backdrop-blur-md">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black mb-2 tracking-tight">تواصل مباشر مع الإدارة</h3>
            <p className="text-xs font-bold text-emerald-50 opacity-90 leading-relaxed">يمكنك التحدث معنا مباشرة عبر الواتساب لحل أي مشكلة تقنية أو استفسار عاجل.</p>
          </div>
          <button 
            onClick={openWhatsApp}
            className="w-full bg-white text-[#2D9469] py-5 rounded-[2rem] font-black text-sm shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            تحدث معنا عبر واتساب <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-sm space-y-8">
        <div className="text-center space-y-3 px-4">
           <div className="bg-emerald-50 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mx-auto text-emerald-600">
              <Sparkles className="h-8 w-8" />
           </div>
           <h3 className="text-xl font-black text-slate-800">رأيك يهمنا لتطوير خدمتنا</h3>
           <p className="text-xs font-bold text-slate-400 leading-relaxed">رسالتك تصل مباشرة للإدارة العليا، رأيك هو الدافع لتطوير "وصلها أشمون".</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100 text-center animate-in zoom-in">
             <Heart className="h-12 w-12 text-emerald-500 mx-auto mb-4 fill-emerald-500" />
             <h4 className="font-black text-emerald-700 text-lg mb-2">شكراً لرسالتك!</h4>
             <p className="text-xs font-bold text-emerald-600 leading-relaxed">تم استلام تعليقك بنجاح، وسنقوم بمراجعته وتطبيقه في التحديثات القادمة.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitFeedback} className="space-y-6">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block text-center">تقييمك العام للتطبيق</label>
                <div className="flex justify-center gap-3 bg-slate-50 p-6 rounded-[2rem]">
                   {[1, 2, 3, 4, 5].map(star => (
                     <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none transition-transform active:scale-90">
                        <Star className={`h-8 w-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                     </button>
                   ))}
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">رأيك في البرنامج</label>
                <textarea 
                  value={opinion}
                  onChange={e => setOpinion(e.target.value)}
                  placeholder="أخبرنا عن تجربتك الشخصية مع التطبيق..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-sm outline-none focus:border-emerald-500 min-h-[100px] transition-all"
                />
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 block">تعليقك للتطوير</label>
                <textarea 
                  value={developmentComment}
                  onChange={e => setDevelopmentComment(e.target.value)}
                  placeholder="ما هي الميزات التي تود إضافتها أو تحسينها؟"
                  className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-bold text-sm outline-none focus:border-emerald-500 min-h-[100px] transition-all"
                />
             </div>

             <button 
               type="submit" 
               disabled={isSubmitting || (!opinion.trim() && !developmentComment.trim())}
               className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black text-md shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-20"
             >
               {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Send className="h-5 w-5" /> إرسال مقترحاتك للإدارة</>}
             </button>
          </form>
        )}
      </div>

      <div className="flex items-center justify-center gap-6 py-4 opacity-30 grayscale">
         <div className="flex flex-col items-center gap-1">
           <MapPin className="h-4 w-4" />
           <span className="text-[8px] font-black uppercase">أشمون - المنوفية</span>
         </div>
         <div className="flex flex-col items-center gap-1">
           <Clock className="h-4 w-4" />
           <span className="text-[8px] font-black uppercase">دعم 24/7</span>
         </div>
      </div>
    </div>
  );
};

export default SupportView;
