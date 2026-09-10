"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { GraduationCap, Users, Star, ArrowRight, ShieldCheck, MapPin, Search } from 'lucide-react';
import Link from 'next/link';

export default function MentorshipPage() {
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const res = await apiService.getMentors();
        if (res.ok) {
          setMentors(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="w-16 h-16 bg-purple-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-purple-600/20">
             <Users size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Connect with Mentors</h1>
          <p className="text-slate-500 max-w-lg mx-auto font-medium">
            Get personalized guidance from Bangladeshi scholars who have already secured international scholarships.
          </p>
        </header>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-4xl mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by country, university or specialization..."
              className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            />
          </div>
          <select className="px-6 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 bg-white text-sm font-bold text-slate-700">
             <option>All Countries</option>
             <option>USA</option>
             <option>UK</option>
             <option>Japan</option>
             <option>Canada</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {[1, 2, 3, 4, 5, 6].map(i => (
               <div key={i} className="h-64 border border-slate-100 rounded-3xl animate-pulse"></div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
             {mentors.map((mentor) => (
               <div key={mentor.id} className="group border border-slate-200 rounded-3xl p-6 hover:border-primary/30 transition-all bg-white hover:shadow-xl hover:shadow-slate-100/50 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                     <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                        {mentor.avatar ? <img src={mentor.avatar} className="w-full h-full object-cover rounded-2xl" alt="Avatar" /> : (mentor.full_name || 'M')[0]}
                     </div>
                     <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-yellow-100">
                        <Star size={12} fill="currentColor" />
                        4.9
                     </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{mentor.full_name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <GraduationCap size={14} className="text-primary" />
                     {mentor.university || 'Scholar'}
                  </p>

                  <div className="space-y-2 mb-8">
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <MapPin size={14} className="text-slate-300" />
                        <span>Based in {mentor.country || 'USA'}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <ShieldCheck size={14} className="text-slate-300" />
                        <span>MEXT & Commonwealth Scholar</span>
                     </div>
                  </div>

                  <button className="w-full mt-auto py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                     Book Session
                     <ArrowRight size={14} />
                  </button>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
