"use client";

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, GraduationCap } from 'lucide-react';
import Header from '@/components/Header';

export default function ScholarshipList() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Scholarships</h1>
          <p className="text-slate-500 text-sm">Find and apply for verified international opportunities.</p>
        </header>

        {/* Minimal Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search for scholarships, countries, or universities..."
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadScholarships(search, activeCategory)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
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
              <div key={i} className="h-28 border border-slate-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {scholarships.length > 0 ? scholarships.map((item) => (
              <Link
                key={item.id}
                href={`/scholarships/${item.id}`}
                className="group border border-slate-200 rounded-xl p-6 flex justify-between items-center hover:border-primary/50 transition-all bg-white"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">{item.title}</h4>
                     {item.amount && <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-black uppercase tracking-widest">{item.amount}</span>}
                  </div>
                  <div className="flex gap-5 text-slate-500 text-xs font-medium">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.country}</span>
                    <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {item.level}</span>
                    <span className="flex items-center gap-1.5 text-slate-400 font-bold">Deadline: {item.deadline || 'Ongoing'}</span>
                  </div>
                </div>
                <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all">
                  <ArrowRight size={20} />
                </div>
              </Link>
            )) : (
              <div className="text-center py-20 border border-slate-200 rounded-xl border-dashed">
                 <p className="text-slate-400 text-sm font-bold">No scholarships found matching your criteria.</p>
                 <button
                   onClick={() => {setSearch(''); handleCategoryChange('All');}}
                   className="mt-4 text-primary font-bold text-xs hover:underline"
                 >
                   Clear Filters
                 </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-10 border-t border-slate-100 bg-white mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2026 ScholarshipConnectBD</p>
           <div className="flex gap-6">
             <Link href="/privacy" className="text-slate-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest">Privacy</Link>
             <Link href="/terms" className="text-slate-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
