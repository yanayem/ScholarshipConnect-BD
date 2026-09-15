"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminScholarshipsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const res = await apiService.getScholarships();
      if (res.ok) {
        setScholarships(res.data as any[]);
      }
      setLoading(false);
    };
    if (user?.is_staff) fetchAll();
  }, [user]);

  if (!user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => router.push('/admin')} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={20} />
           </button>
           <h1 className="text-2xl font-bold text-slate-900">Manage Scholarships</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
           <div className="flex-1 w-full max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search database..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
              />
           </div>

           <div className="flex gap-3 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                 <Filter size={16} />
                 Filters
              </button>
              <button
                onClick={() => router.push('/scholarships/add')}
                className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                 <Plus size={18} />
                 Add New
              </button>
           </div>
        </div>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 border border-slate-50 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-100">
                   <tr>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Scholarship</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Location</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline</th>
                      <th className="px-6 py-4 text-right"></th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                   {scholarships.map(s => (
                     <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-bold text-xs">
                                 {s.title[0]}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-900 line-clamp-1">{s.title}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{s.provider}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-xs font-bold text-slate-600">{s.country}</span>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 w-fit">
                              <CheckCircle2 size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">Active</span>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-xs font-bold text-slate-500">{s.deadline || 'Ongoing'}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                           <div className="flex justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit3 size={16} /></button>
                              <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </main>
    </div>
  );
}
