"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Scholarship, Recommendation } from '@/types';
import Link from 'next/link';
import { Brain, Sparkles, ArrowRight, ShieldCheck, MapPin, GraduationCap } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function MatchmakerPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [matching, setMatching] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleMatch = async () => {
    setMatching(true);
    // Artificial delay for "matching" feel
    await new Promise(r => setTimeout(r, 2000));

    try {
      const res = await apiService.getScholarshipMatches();
      if (res.ok) {
        setMatches(res.data as unknown as Recommendation[]);
      }
    } catch (error) {
      console.error('Failed to get matches', error);
    } finally {
      setMatching(false);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <div className="text-center mb-16">
            <div className="w-16 h-16 bg-primary-light text-primary rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-sm">
               <Brain size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">ScholarAI Matchmaker</h1>
            <p className="text-slate-500 max-w-lg mx-auto font-medium">
              Our AI analyzes your academic profile, location, and goals to find the most compatible scholarship opportunities.
            </p>
          </div>

          {matches.length === 0 && !matching ? (
            <div className="bg-slate-50/50 border border-slate-100 rounded-[2rem] p-10 text-center space-y-10">
               <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-xl">Ready to find your matches?</h3>
                  <p className="text-sm text-slate-500 font-medium">We'll scan our database of 5,000+ scholarships to find the ones where you have the highest chance of success.</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-left">
                  {[
                    { title: 'Academic Profile', icon: GraduationCap },
                    { title: 'Location Compatibility', icon: MapPin },
                    { title: 'Full Benefit Analysis', icon: ShieldCheck }
                  ].map((item, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <item.icon size={24} className="text-primary mb-3" />
                       <p className="text-xs font-black text-slate-900 uppercase tracking-widest leading-tight">{item.title}</p>
                    </div>
                  ))}
               </div>

               <button
                 onClick={handleMatch}
                 className="bg-primary text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 mx-auto"
               >
                 <Sparkles size={20} />
                 Start AI Matching
               </button>
            </div>
          ) : matching ? (
            <div className="text-center py-24 space-y-8">
               <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Brain className="absolute inset-0 m-auto text-primary" size={40} />
               </div>
               <div className="space-y-3">
                  <p className="font-bold text-slate-900 text-xl animate-pulse tracking-tight">Analyzing your profile...</p>
                  <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Scanning scholarships in USA, UK, and Germany</p>
               </div>
            </div>
          ) : (
            <div className="space-y-8">
               <div className="flex justify-between items-center mb-8 pb-8 border-b border-slate-100">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Top AI Matches for You</h3>
                  <button onClick={handleMatch} className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Re-scan database</button>
               </div>

               {matches.map((match, i) => (
                  <Link
                    key={match.scholarship.id}
                    href={`/scholarships/${match.scholarship.id}`}
                    className="group border border-slate-100 rounded-[1.5rem] p-6 flex flex-col sm:flex-row items-center gap-8 hover:border-primary/50 transition-all bg-slate-50/20"
                  >
                     <div className="w-20 h-20 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                        <span className="text-xl font-black text-primary">{match.match_score}%</span>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                     </div>

                     <div className="flex-1 text-center sm:text-left">
                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-2 text-lg">{match.scholarship.title}</h4>
                        <div className="flex justify-center sm:justify-start gap-6 text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">
                           <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {match.scholarship.country}</span>
                           <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {match.scholarship.level}</span>
                        </div>
                     </div>

                     <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                        <ArrowRight size={24} />
                     </div>
                  </Link>
               ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
