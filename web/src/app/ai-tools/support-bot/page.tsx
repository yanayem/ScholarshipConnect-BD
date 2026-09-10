"use client";

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import { MessageSquare, Send, User, Bot, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SupportBotPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your ScholarAI assistant. How can I help you with your scholarship journey today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    // Simulated AI response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `I've analyzed your question about "${userMessage}". For Bangladeshi students, I recommend focusing on the Commonwealth and MEXT programs, as they have high acceptance rates for our region. Would you like me to find the specific eligibility requirements for those?`
      }]);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
           <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
              <MessageSquare size={24} />
           </div>
           <div>
              <h1 className="text-xl font-bold text-slate-900">ScholarAI Live Support</h1>
              <p className="text-xs text-slate-500 font-medium">Powered by Gemini AI • Active Now</p>
           </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 border border-slate-200 rounded-3xl flex flex-col overflow-hidden bg-slate-50/30">
           <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                        msg.role === 'user' ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                         {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                      </div>
                      <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                        ? 'bg-primary text-white font-medium rounded-tr-none shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                      }`}>
                         {msg.content}
                      </div>
                   </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                   <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                         <Bot size={16} />
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                         <Loader2 className="animate-spin text-primary" size={16} />
                         <span className="text-xs font-bold text-slate-400">AI is thinking...</span>
                      </div>
                   </div>
                </div>
              )}
           </div>

           {/* Input Area */}
           <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleSend} className="relative">
                 <input
                   type="text"
                   placeholder="Ask anything about scholarships..."
                   className="w-full pl-6 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                 />
                 <button
                   type="submit"
                   disabled={!input.trim() || loading}
                   className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50"
                 >
                    <Send size={18} />
                 </button>
              </form>
              <p className="text-[10px] text-center text-slate-400 mt-3 font-bold uppercase tracking-widest">
                AI can make mistakes. Verify important info.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
