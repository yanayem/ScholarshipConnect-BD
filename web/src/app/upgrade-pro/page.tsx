"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'react-router-dom'; // Using router later, for now Link
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Crown,
  CheckCircle2,
  Wallet,
  Trophy
} from 'lucide-react';
import { useRouter as useNextRouter } from 'next/navigation';

const BENEFITS = [
  { title: 'Unlimited AI Tools', desc: 'SOP Helper, CV Reviewer & Live Support without daily limits.', icon: Zap, color: 'text-blue-600 bg-blue-50' },
  { title: 'Priority Matching', desc: 'Be the first to know about scholarships tailored to your profile.', icon: Star, color: 'text-amber-600 bg-amber-50' },
  { title: 'Verified Badge', desc: 'Stand out in the community with a gold ScholarConnect badge.', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  { title: 'Expert Consultations', desc: 'Direct access to premium mentorship sessions.', icon: Users, color: 'text-purple-600 bg-purple-50' },
];

export default function UpgradeProPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useNextRouter();
  const [processing, setProcessing] = useState(false);

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handlePointUpgrade = async () => {
    const cost = 200;
    const userPoints = (user as any).scholar_points || 0;

    if (userPoints < cost) {
      alert(`Insufficient Points. You need ${cost} points. You currently have ${userPoints}.`);
      return;
    }

    if (window.confirm(`Unlock Pro for ${cost} ScholarPoints?`)) {
      setProcessing(true);
      const res = await apiService.upgradeWithPoints();
      if (res.ok) {
        alert('Success! Welcome to ScholarConnect Pro.');
        router.push('/profile');
      } else {
        alert(res.data.error || 'Upgrade failed.');
      }
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-6">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Crown size={14} />
              ScholarConnect Premium
           </div>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">Level up your scholarship journey.</h1>
           <p className="text-slate-500 font-medium">Unlock exclusive tools and priority support to secure your international education dreams.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
           {/* Benefits */}
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {BENEFITS.map((benefit, i) => (
                <div key={i} className="p-8 border border-slate-100 rounded-[2rem] space-y-4 hover:border-primary/20 transition-all">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${benefit.color}`}>
                      <benefit.icon size={24} />
                   </div>
                   <h3 className="font-bold text-slate-900">{benefit.title}</h3>
                   <p className="text-xs text-slate-500 leading-relaxed font-medium">{benefit.desc}</p>
                </div>
              ))}
           </div>

           {/* Pricing/Upgrade Options */}
           <div className="space-y-6">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Choose your plan</h2>

              {/* Option 1: ScholarPoints */}
              <div className={`border-[3px] rounded-[2rem] p-8 transition-all relative overflow-hidden ${((user as any).scholar_points || 0) >= 200 ? 'border-primary/20' : 'border-slate-100 opacity-60'}`}>
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Community Special</p>
                          <h3 className="text-2xl font-black text-slate-900">200 Points</h3>
                          <p className="text-xs text-slate-500 font-bold">7 Days Pro Access</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
                             <CheckCircle2 size={16} className="text-emerald-500" />
                             Balance: {(user as any).scholar_points || 0} pts
                          </p>
                       </div>
                       <button
                         onClick={handlePointUpgrade}
                         disabled={processing || ((user as any).scholar_points || 0) < 200}
                         className="w-full sm:w-auto px-8 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all disabled:bg-slate-200"
                       >
                         Redeem Points
                       </button>
                    </div>
                    <Trophy size={48} className="text-yellow-400" />
                 </div>
                 <Sparkles size={120} className="absolute -bottom-10 -right-10 text-primary/5 pointer-events-none" />
              </div>

              {/* Option 2: Cash Payment */}
              <div className="bg-slate-900 border-none rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
                 <div className="relative z-10 flex justify-between items-start">
                    <div className="space-y-4">
                       <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Instant Access</p>
                          <h3 className="text-2xl font-black text-white">500 BDT</h3>
                          <p className="text-xs text-slate-400 font-bold">30 Days Pro Access</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-200 flex items-center gap-2">
                             <CheckCircle2 size={16} className="text-emerald-500" />
                             bKash / Nagad / Card
                          </p>
                       </div>
                       <Link
                         href="/checkout"
                         className="inline-block px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg"
                       >
                         Upgrade Now
                         <ArrowRight size={16} className="inline ml-2" />
                       </Link>
                    </div>
                    <Wallet size={48} className="text-primary" />
                 </div>
                 <Crown size={150} className="absolute -bottom-16 -right-16 text-white/5 pointer-events-none rotate-12" />
              </div>

              <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest pt-4">
                 All payments are secured by SSLCommerz. Secure 256-bit encryption.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
