"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Recommendation } from '@/types';
import Header from '@/components/Header';
import { ArrowLeft, MapPin, GraduationCap, ChevronRight } from 'lucide-react';

export default function MatchmakerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      try {
        const res = await apiService.getScholarshipMatches();
        if (res.ok && res.data) {
          const recs = (res.data as any).recommendations || (Array.isArray(res.data) ? res.data : []);
          setRecommendations(recs as Recommendation[]);
        }
      } catch (e) {
        console.error('[MATCHMAKER] Error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-3" />
          <p className="text-slate-600 text-sm">Loading matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Top Header */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => router.back()}
            className="p-2 bg-white rounded-xl border border-black/5 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Scholarship Matches</h1>
            <p className="text-xs text-slate-600">
              {recommendations.length} recommendations matched with your profile
            </p>
          </div>
        </div>

        {/* Single Combined Sheet / Page Card */}
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
          {recommendations.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recommendations.map((item, index) => {
                const score = Math.round(item.match_score || 0);

                return (
                  <div
                    key={item.scholarship.id}
                    onClick={() => router.push(`/scholarships/${item.scholarship.id}`)}
                    className="p-4 sm:p-5 hover:bg-slate-50/70 cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Left Side: Scholarship details */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {item.scholarship.title}
                      </h2>

                      {item.scholarship.provider && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {item.scholarship.provider}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                        {item.scholarship.country && (
                          <span className="flex items-center gap-1">
                            <MapPin size={13} className="text-primary" />
                            {item.scholarship.country}
                          </span>
                        )}
                        {item.scholarship.level && (
                          <span className="flex items-center gap-1">
                            <GraduationCap size={13} className="text-primary" />
                            {item.scholarship.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Side: Badges & Arrow */}
                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 self-start sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-transparent w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {score}% Match
                        </span>
                        {index === 0 && score >= 70 && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#E6F4F1] text-[#2A9D8F] tracking-wide">
                            BEST FIT
                          </span>
                        )}
                      </div>

                      <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all">
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-base font-semibold text-slate-800 mb-1">No matches found</p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
                Complete your profile details to see personalized scholarship recommendations.
              </p>
              <button
                onClick={() => router.push('/profile')}
                className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                Update Profile
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
