"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function EligibilityPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleCheck = () => {
    setChecking(true);
    setTimeout(() => {
      setResult({
        score: 85,
        criteria: [
          { name: 'Academic Background', status: 'pass', detail: 'Your GPA meets the minimum requirement.' },
          { name: 'Language Proficiency', status: 'pass', detail: 'Your IELTS score is within the accepted range.' },
          { name: 'Citizenship', status: 'pass', detail: 'Bangladeshi students are eligible for this program.' },
          { name: 'Age Limit', status: 'pass', detail: 'You are within the preferred age group.' }
        ]
      });
      setChecking(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-sm">
               <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Eligibility Checker</h1>
            <p className="text-slate-500 max-w-md mx-auto font-medium">Verify your profile against scholarship requirements instantly.</p>
          </div>

          {!result && !checking ? (
            <div className="max-w-2xl mx-auto border border-slate-100 rounded-[2rem] p-10 space-y-10 bg-slate-50/20">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Scholarship</label>
                <select className="w-full p-5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold bg-white shadow-sm">
                   <option>Commonwealth Scholarship (UK)</option>
                   <option>MEXT Scholarship (Japan)</option>
                   <option>Fulbright Program (USA)</option>
                   <option>DAAD Scholarship (Germany)</option>
                </select>
              </div>

              <button
                onClick={handleCheck}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-slate-200"
              >
                Run Analysis
                <ArrowRight size={20} />
              </button>
            </div>
          ) : checking ? (
            <div className="text-center py-24 space-y-6">
               <Loader2 className="animate-spin text-primary mx-auto" size={48} />
               <p className="font-bold text-slate-900 text-lg tracking-tight">Validating your profile data...</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12">
               <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-10 text-center relative overflow-hidden">
                  <p className="text-emerald-600 font-black text-6xl mb-4 relative z-10">{result.score}%</p>
                  <h3 className="text-emerald-900 font-bold text-xl mb-2 relative z-10">Strong Match</h3>
                  <p className="text-emerald-600/80 text-sm font-bold uppercase tracking-wider relative z-10">You meet the primary requirements</p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-100 pb-4">Detailed Criteria</h3>
                  {result.criteria.map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-5 p-6 border border-slate-100 rounded-2xl bg-white hover:border-emerald-200 transition-all">
                       {item.status === 'pass' ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} /> : <XCircle className="text-red-500 shrink-0" size={24} />}
                       <div>
                          <p className="text-base font-bold text-slate-900">{item.name}</p>
                          <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed">{item.detail}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="flex flex-col sm:flex-row gap-4 pt-8">
                  <button
                    onClick={() => setResult(null)}
                    className="flex-1 border border-slate-200 text-slate-700 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    Check Another
                  </button>
                  <button className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                    Proceed to Application
                  </button>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
