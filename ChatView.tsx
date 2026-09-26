
import React, { useState, useEffect, useRef } from 'react';
import { User, Order } from './types';
import { db } from './firebase';
import { collection, query, where, onSnapshot, addDoc, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { Send, ChevronRight, Image as ImageIcon, Smile } from 'lucide-react';
import { stripFirestore } from './utils';

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

const ChatView: React.FC<{ user: User, order: Order, onBack: () => void }> = ({ user, order, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      where("orderId", "==", order.id),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ 
        id: d.id, 
        ...stripFirestore(d.data()) 
      })) as Message[];
      
      setMessages(docs.sort((a, b) => a.createdAt - b.createdAt));
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [order.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      orderId: order.id,
      senderId: user.id,
      text: newMessage,
      createdAt: Date.now()
    };

    setNewMessage('');
    try {
      await addDoc(collection(db, "messages"), messageData);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-[2000] flex flex-col animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 pt-12 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center font-black text-xl">
            {user.role === 'DRIVER' ? order.customerPhone.slice(-2) : (order.driverName?.[0] || 'ك')}
          </div>
          <div>
            <h3 className="font-black text-sm">{user.role === 'DRIVER' ? 'العميل' : `الكابتن ${order.driverName || ''}`}</h3>
            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">مشوار نشط • أشمون</p>
          </div>
        </div>
        <button onClick={onBack} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-slate-50">
        {loading ? (
          <div className="flex justify-center items-center h-full opacity-20">
             <div className="w-8 h-8 border-4 border-slate-900 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Smile className="h-10 w-10 text-slate-200" />
             </div>
             <p className="text-slate-400 font-black text-xs uppercase tracking-widest">ابدأ المحادثة مع الطرف الآخر</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] p-4 rounded-[1.8rem] text-sm font-bold shadow-sm ${
                msg.senderId === user.id 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-white text-slate-800 rounded-bl-none border border-slate-100'
              }`}>
                {msg.text}
                <p className={`text-[8px] mt-1 opacity-40 ${msg.senderId === user.id ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-slate-100 pb-10">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] py-4 pr-12 pl-6 font-bold text-sm outline-none focus:border-emerald-500 transition-all"
            />
            <ImageIcon className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          </div>
          <button type="submit" className="bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-100 active:scale-90 transition-all">
            <Send className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;
