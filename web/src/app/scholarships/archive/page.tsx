"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import { Search, MapPin, ArrowRight, GraduationCap, History, ArrowLeft, CalendarX } from 'lucide-react';

export default function ScholarshipArchivePage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadArchive();
  }, []);

  const loadArchive = async () => {
    setLoading(true);
    const res = await apiService.getScholarships();
    if (res.ok) {
      const data = res.data as unknown as Scholarship[];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expired = data.filter(s => s.deadline && new Date(s.deadline) < today);
      setScholarships(expired);
    }
    setLoading(false);
  };

  const filtered = scholarships.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.title || '').toLowerCase().includes(q) ||
           (s.country || '').toLowerCase().includes(q) ||
           (s.level || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm">
          {/* Top Bar / Back Link */}
          <div className="mb-6">
            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-primary transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Active Scholarships
            </Link>
          </div>

          <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <History className="text-slate-400" size={26} />
                <h1 className="text-3xl font-bold text-slate-900">Scholarship Archive</h1>
              </div>
              <p className="text-slate-500 text-sm font-medium">
                These scholarships have already passed their application deadlines.
              </p>
            </div>
          </header>

          {/* Search Box */}
          <div className="mb-8 relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search archived scholarships..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 bg-slate-50/50 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 border border-slate-100 rounded-2xl animate-pulse bg-slate-50/30"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group border border-slate-100/80 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-slate-300 transition-all bg-slate-50/30 hover:bg-white shadow-sm"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-base sm:text-lg">
                          {item.title}
                        </h4>
                        <span className="text-[9px] bg-red-50 text-red-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-red-100 flex items-center gap-1">
                          <CalendarX size={12} />
                          Expired
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-slate-500 text-xs font-bold uppercase tracking-tight opacity-70">
                        <span className="flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" /> {item.country}</span>
                        <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-slate-400" /> {item.level}</span>
                        <span className="flex items-center gap-1.5 text-red-500 font-bold">
                          Deadline: {item.deadline}
                        </span>
                      </div>
                    </div>
                    <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all self-end sm:self-center">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-20 border border-slate-200 rounded-2xl border-dashed bg-slate-50/30">
                  <History className="mx-auto text-slate-300 mb-3" size={48} />
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                    No archived scholarships found
                  </p>
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
