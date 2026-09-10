"use client";

import React from 'react';
import Header from '@/components/Header';
import {
  BookOpen,
  HelpCircle,
  Search,
  Cpu,
  Users,
  CreditCard,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ManualPage() {
  const sections = [
    { title: 'Getting Started', icon: BookOpen, sub: 'Registration and profile setup' },
    { title: 'Scholarship Search', icon: Search, sub: 'How to use filters and search effectively' },
    { title: 'Using AI Tools', icon: Cpu, sub: 'Matchmaker, SOP Helper and Eligibility Checker' },
    { title: 'Mentorship', icon: Users, sub: 'Booking sessions and chatting with mentors' },
    { title: 'Payments & Points', icon: CreditCard, sub: 'Upgrading to Pro and earning ScholarPoints' },
    { title: 'Data Security', icon: ShieldCheck, sub: 'Managing your Doc Vault' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
             <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">User Manual</h1>
          <p className="text-slate-500 max-w-md mx-auto">Everything you need to know about navigating ScholarConnectBD.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
           {sections.map((sec, i) => (
             <div key={i} className="flex items-center justify-between p-6 border border-slate-100 rounded-[1.5rem] hover:bg-slate-50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                      <sec.icon size={20} />
                   </div>
                   <div>
                      <h4 className="font-bold text-sm text-slate-900">{sec.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">{sec.sub}</p>
                   </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
             </div>
           ))}
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-12 text-center text-white relative overflow-hidden">
           <h3 className="text-2xl font-bold mb-4 relative z-10">Still need help?</h3>
           <p className="text-slate-400 text-sm mb-8 relative z-10">Our support team is available 24/7 to answer your specific questions.</p>
           <Link href="/ai-tools/support-bot" className="inline-block px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all relative z-10">
              Chat with Support
           </Link>
           <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </main>
    </div>
  );
}
