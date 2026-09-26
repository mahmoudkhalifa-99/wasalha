
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Sparkles, Send, X, Bot, Loader2 } from 'lucide-react';

const AIAssistant: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'يا أهلاً بيك في أشمون! أنا مساعدك الذكي، أقدر أساعدك تعرف أسعار المشاوير، ترشيحات مطاعم، أو أماكن في أشمون. تحب تسأل عن إيه؟' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // إنشاء مثيل جديد دائماً لضمان استخدام المفتاح الصحيح
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: "أنت 'وصلها'، المساعد الذكي لتطبيق 'وصلها أشمون'. أنت خبير بجغرافيا مركز أشمون وقراها (شما، سمادون، سنتريس، جريس، طهواي، إلخ). هدفك مساعدة المستخدمين في اقتراح مطاعم أو أماكن في أشمون وشرح كيفية استخدام التطبيق. تحدث بلهجة مصرية أشمونية ودودة ومختصرة.",
        },
      });

      const aiText = response.text || 'معلش يا بطل، الشبكة في أشمون مريحة شوية، جرب تسأل تاني.';
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: 'الظاهر الإنترنت واقع، جرب كمان دقيقة.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg h-[80vh] sm:h-[650px] rounded-t-[3.5rem] sm:rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom">
        <div className="bg-slate-900 p-8 text-white flex justify-between items-center shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500 p-3 rounded-2xl"><Sparkles className="h-6 w-6" /></div>
            <div>
              <h3 className="font-black text-sm">مساعد وصلها الذكي</h3>
              <p className="text-[10px] text-emerald-400 font-bold animate-pulse">متصل الآن</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-slate-50/50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] p-5 rounded-[2.2rem] text-sm font-bold shadow-sm ${m.role === 'user' ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && <div className="flex justify-end"><Loader2 className="h-6 w-6 text-emerald-500 animate-spin" /></div>}
          <div ref={scrollRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-100">
          <div className="flex gap-3 relative">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="اسأل أي سؤال عن أشمون..." className="flex-1 bg-slate-50 rounded-[1.8rem] py-5 pr-6 pl-16 font-bold text-sm outline-none focus:border-emerald-500" />
            <button onClick={handleSend} disabled={isTyping} className="absolute left-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white p-4 rounded-2xl shadow-xl active:scale-90"><Send className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
