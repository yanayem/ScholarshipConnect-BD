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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20">
             <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Eligibility Checker</h1>
          <p className="text-slate-500 max-w-md mx-auto">Verify your profile against scholarship requirements instantly.</p>
        </div>

        {!result && !checking ? (
          <div className="max-w-2xl mx-auto border border-slate-200 rounded-3xl p-8 space-y-8">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Scholarship</label>
              <select className="w-full p-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-bold bg-slate-50">
                 <option>Commonwealth Scholarship (UK)</option>
                 <option>MEXT Scholarship (Japan)</option>
                 <option>Fulbright Program (USA)</option>
                 <option>DAAD Scholarship (Germany)</option>
              </select>
            </div>

            <button
              onClick={handleCheck}
              className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              Run Instant Analysis
              <ArrowRight size={20} />
            </button>
          </div>
        ) : checking ? (
          <div className="text-center py-20 space-y-4">
             <Loader2 className="animate-spin text-emerald-500 mx-auto" size={48} />
             <p className="font-bold text-slate-900">Validating your profile data...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-8">
             <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 text-center">
                <p className="text-emerald-600 font-black text-4xl mb-2">{result.score}%</p>
                <h3 className="text-emerald-900 font-bold text-lg mb-2">High Eligibility</h3>
                <p className="text-emerald-600/80 text-sm font-medium">You meet almost all the primary requirements for this scholarship.</p>
             </div>

             <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Detailed Breakdown</h3>
                {result.criteria.map((item: any, i: number) => (
                  <div key={i} className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl">
                     {item.status === 'pass' ? <CheckCircle2 className="text-emerald-500 shrink-0" size={20} /> : <XCircle className="text-red-500 shrink-0" size={20} />}
                     <div>
                        <p className="text-sm font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{item.detail}</p>
                     </div>
                  </div>
                ))}
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  onClick={() => setResult(null)}
                  className="flex-1 border border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold hover:bg-slate-50 transition-all text-sm"
                >
                  Check Another
                </button>
                <button className="flex-1 bg-primary text-white py-3.5 rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm">
                  Proceed to Application
                </button>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
