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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
             <Brain size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">ScholarAI Matchmaker</h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            Our AI analyzes your academic profile, location, and goals to find the most compatible scholarship opportunities.
          </p>
        </div>

        {matches.length === 0 && !matching ? (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-10 text-center space-y-8">
             <div className="space-y-4">
                <h3 className="font-bold text-slate-900 text-lg">Ready to find your matches?</h3>
                <p className="text-sm text-slate-500">We'll scan our database of 5,000+ scholarships to find the ones where you have the highest chance of success.</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
                {[
                  { title: 'Academic Profile', icon: GraduationCap },
                  { title: 'Location Compatibility', icon: MapPin },
                  { title: 'Full Benefit Analysis', icon: ShieldCheck }
                ].map((item, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200">
                     <item.icon size={20} className="text-primary mb-2" />
                     <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  </div>
                ))}
             </div>

             <button
               onClick={handleMatch}
               className="bg-primary text-white px-10 py-4 rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
             >
               <Sparkles size={20} />
               Start AI Matching
             </button>
          </div>
        ) : matching ? (
          <div className="text-center py-20 space-y-6">
             <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <Brain className="absolute inset-0 m-auto text-primary" size={32} />
             </div>
             <div className="space-y-2">
                <p className="font-bold text-slate-900 text-lg animate-pulse">Analyzing your profile...</p>
                <p className="text-xs text-slate-500 font-medium">Scanning scholarships in USA, UK, and Germany</p>
             </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top AI Matches for You</h3>
                <button onClick={handleMatch} className="text-primary text-xs font-bold hover:underline">Re-scan</button>
             </div>

             {matches.map((match, i) => (
                <Link
                  key={match.scholarship.id}
                  href={`/scholarships/${match.scholarship.id}`}
                  className="group border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 hover:border-primary/50 transition-all bg-white"
                >
                   <div className="w-16 h-16 bg-slate-50 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-100">
                      <span className="text-xs font-black text-primary">{match.match_score}%</span>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Match</span>
                   </div>

                   <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors mb-1">{match.scholarship.title}</h4>
                      <div className="flex justify-center sm:justify-start gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                         <span className="flex items-center gap-1"><MapPin size={12} /> {match.scholarship.country}</span>
                         <span className="flex items-center gap-1"><GraduationCap size={12} /> {match.scholarship.level}</span>
                      </div>
                   </div>

                   <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                      <ArrowRight size={20} />
                   </div>
                </Link>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
