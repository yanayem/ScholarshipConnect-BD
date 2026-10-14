"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, GraduationCap, Plus, Sparkles, Brain, AlertCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Matchmaker States
  const [matchScores, setMatchScores] = useState<Record<number, number>>({});
  const [isMatching, setIsMatching] = useState(false);
  const [showMatchScores, setShowMatchScores] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const categories = ['All', 'Undergraduate', 'Postgraduate', 'PhD', 'Fully Funded'];

  useEffect(() => {
    loadScholarships();
  }, []);

  const loadScholarships = async (query = '', category = 'All') => {
    setLoading(true);
    let params = query ? `search=${query}` : '';
    if (category !== 'All') {
      params += (params ? '&' : '') + `level=${category}`;
    }

    const res = await apiService.getScholarships(params);
    if (res.ok) {
      setScholarships(res.data as unknown as Scholarship[]);
    }
    setLoading(false);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadScholarships(search, cat);
  };

  const handleRunSmartMatchmaker = async () => {
    setIsMatching(true);
    setProfileIncomplete(false);

    try {
      const [matchRes, profileRes] = await Promise.all([
        apiService.getScholarshipMatches(),
        apiService.getProfile()
      ]);

      const userProfile = profileRes.ok ? profileRes.data : null;
      const hasProfileData = userProfile && (
        userProfile.cgpa ||
        userProfile.target_countries ||
        userProfile.major_course ||
        userProfile.research_interests
      );

      if (!hasProfileData || (matchRes.data && (matchRes.data as any).is_profile_incomplete)) {
        setProfileIncomplete(true);
        setShowMatchScores(false);
        setIsMatching(false);
        return;
      }

      const scoresMap: Record<number, number> = {};

      // Map API AI recommendations
      if (matchRes.ok && matchRes.data) {
        const recs = (matchRes.data as any).recommendations || (matchRes.data as unknown as any[]);
        if (Array.isArray(recs)) {
          recs.forEach((rec: any) => {
            if (rec.scholarship?.id) {
              scoresMap[rec.scholarship.id] = rec.match_score;
            }
          });
        }
      }

      // Compute match score for any remaining scholarships in current list
      scholarships.forEach((s) => {
        if (scoresMap[s.id] === undefined) {
          let score = 0;

          // CGPA Match
          if (userProfile.cgpa && s.min_cgpa) {
            if (userProfile.cgpa >= s.min_cgpa) score += 40;
          } else if (userProfile.cgpa) {
            score += 20;
          }

          // Country Match
          if (userProfile.target_countries && s.country) {
            const targets = String(userProfile.target_countries).toLowerCase().split(',').map(c => c.trim());
            if (targets.some(t => t && s.country.toLowerCase().includes(t))) {
              score += 30;
            }
          }

          // Field/Major Match
          if (userProfile.major_course && s.field) {
            if (s.field.toLowerCase().includes(String(userProfile.major_course).toLowerCase())) {
              score += 30;
            }
          }

          scoresMap[s.id] = Math.min(score, 100);
        }
      });

      setMatchScores(scoresMap);
      setShowMatchScores(true);
    } catch (err) {
      console.error('[SMART MATCHMAKER] Error computing match scores:', err);
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm">
          <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Scholarships</h1>
              <p className="text-slate-500 text-sm font-medium">Find and apply for verified international opportunities.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleRunSmartMatchmaker}
                disabled={isMatching}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                {isMatching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Smart Matchmaker
                  </>
                )}
              </button>

              <Link href="/scholarships/add" className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
                 <Plus size={16} />
                 Add Scholarship
              </Link>
            </div>
          </header>

          {/* Incomplete Profile Alert Banner */}
          {profileIncomplete && (
            <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Your profile is incomplete</h4>
                  <p className="text-xs text-amber-700 mt-0.5">Please update your CGPA, Major, and Target Countries to view AI Match Scores.</p>
                </div>
              </div>
              <Link href="/profile/edit" className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap hover:bg-amber-900 transition-colors shadow-sm">
                Complete Profile
              </Link>
            </div>
          )}

          {/* Minimal Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-6 mb-10">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search for scholarships..."
                className="w-full pl-12 pr-4 py-3.5 border border-slate-200 bg-slate-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadScholarships(search, activeCategory)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shadow-sm ${
                    activeCategory === cat
                      ? 'bg-primary text-white border-primary shadow-primary/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-28 border border-slate-100 rounded-2xl animate-pulse bg-slate-50/30"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {scholarships.length > 0 ? scholarships.map((item) => {
                const score = matchScores[item.id];
                return (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group border border-slate-100/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/30 transition-all bg-slate-50/30 hover:bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                         <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base sm:text-lg">{item.title}</h4>
                         {item.amount && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-emerald-100">{item.amount}</span>}

                         {/* AI Match Score Badge */}
                         {showMatchScores && score !== undefined && (
                           <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                             score >= 70
                               ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                               : score >= 40
                               ? 'bg-amber-50 text-amber-700 border-amber-200'
                               : 'bg-slate-100 text-slate-600 border-slate-200'
                           }`}>
                             <Sparkles size={12} />
                             {score}% Match
                           </span>
                         )}

                         {item.is_applied && (
                           <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-blue-100 flex items-center gap-0.5">
                             Applied
                           </span>
                         )}
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 text-xs font-bold uppercase tracking-tight opacity-70">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.country}</span>
                        <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {item.level}</span>
                        <span className="flex items-center gap-1.5 text-slate-400">Deadline: {item.deadline || 'Ongoing'}</span>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all self-end sm:self-center">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                );
              }) : (
                <div className="text-center py-24 border border-slate-200 rounded-2xl border-dashed bg-slate-50/30">
                   <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scholarships found</p>
                   <button
                     onClick={() => {setSearch(''); handleCategoryChange('All');}}
                     className="mt-6 text-primary font-black text-xs uppercase tracking-[0.2em] hover:underline"
                   >
                     Clear Filters
                   </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 ScholarshipConnectBD</p>
           <div className="flex gap-10">
             <Link href="/privacy" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Privacy</Link>
             <Link href="/terms" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
