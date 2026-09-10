"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  Search,
  MessageSquare,
  ArrowRight,
  User,
  ShieldCheck,
  Check
} from 'lucide-react';
import Link from 'next/link';

export default function MessagesPage() {
  const [chats] = useState([
    { id: 1, name: 'Sabbir Ahmed', role: 'Mentor', lastMsg: 'I have reviewed your SOP. Let me know when you are free for a call.', time: '10:45 AM', unread: 2, avatar: null },
    { id: 2, name: 'ScholarConnect Support', role: 'System', lastMsg: 'Your document validation for "Passport" is complete.', time: 'Yesterday', unread: 0, avatar: null },
    { id: 3, name: 'Rahat Kabir', role: 'Student', lastMsg: 'Thank you for the session yesterday!', time: 'Mon', unread: 0, avatar: null }
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto flex h-[calc(100vh-80px)] overflow-hidden">
        {/* Sidebar - Chat List */}
        <div className="w-full md:w-96 border-r border-slate-100 flex flex-col">
           <div className="p-6 border-b border-slate-50">
              <h1 className="text-2xl font-bold text-slate-900 mb-6">Messages</h1>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input
                   type="text"
                   placeholder="Search conversations..."
                   className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
                 />
              </div>
           </div>

           <div className="flex-1 overflow-y-auto scrollbar-hide">
              {chats.map(chat => (
                <Link key={chat.id} href={`/messages/${chat.id}`} className="flex items-center gap-4 p-6 hover:bg-slate-50 transition-all border-b border-slate-50 relative group">
                   <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-bold shrink-0 border border-slate-200">
                      {chat.name[0]}
                   </div>

                   <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="font-bold text-slate-900 text-sm truncate flex items-center gap-1.5">
                            {chat.name}
                            {chat.role === 'Mentor' && <ShieldCheck size={14} className="text-primary" />}
                         </h4>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{chat.time}</span>
                      </div>
                      <p className={`text-xs truncate ${chat.unread > 0 ? 'text-slate-900 font-bold' : 'text-slate-500 font-medium'}`}>
                         {chat.lastMsg}
                      </p>
                   </div>

                   {chat.unread > 0 && (
                      <div className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-black absolute top-6 right-4 ring-4 ring-white shadow-lg">
                         {chat.unread}
                      </div>
                   )}
                </Link>
              ))}
           </div>
        </div>

        {/* Chat Placeholder (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50/50">
           <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-white border border-slate-200 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-slate-200/50">
                 <MessageSquare size={32} className="text-slate-300" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-lg font-bold text-slate-900">Your Inbox</h3>
                 <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                   Select a conversation from the left to start messaging with mentors or students.
                 </p>
              </div>
              <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
                 New Message
              </button>
           </div>
        </div>
      </main>
    </div>
  );
}
