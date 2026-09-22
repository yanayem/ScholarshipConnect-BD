"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  ArrowLeft,
  MoreVertical,
  ShieldCheck,
  Trophy,
  Mail,
  User,
  Zap,
  Lock,
  Unlock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const res = await apiService.getUsers();
      if (res.ok) {
        setUsers(res.data as any[]);
      }
      setLoading(false);
    };
    if (user?.is_staff) fetchUsers();
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
           <h1 className="text-2xl font-bold text-slate-900">User Directory</h1>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
           <div className="flex-1 w-full max-w-md relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-bold"
              />
           </div>

           <div className="flex gap-4">
              <div className="px-5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                 <span className="text-[10px] font-black uppercase text-slate-400 block tracking-widest">Total Members</span>
                 <span className="text-sm font-bold text-slate-900">{users.length} Active</span>
              </div>
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 border border-slate-100 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {users.map((u) => (
               <div key={u.id} className="border border-slate-100 rounded-3xl p-6 hover:shadow-xl hover:shadow-slate-100/50 transition-all bg-white relative overflow-hidden group">
                  <div className="flex items-start justify-between mb-6">
                     <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center text-primary text-xl font-bold">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover rounded-2xl" /> : u.full_name?.[0] || 'U'}
                     </div>
                     <div className="flex gap-2">
                        {u.is_pro && <div className="p-1.5 bg-amber-50 text-amber-500 rounded-lg"><Zap size={14} fill="currentColor" /></div>}
                        {u.is_staff && <div className="p-1.5 bg-primary-light text-primary rounded-lg"><ShieldCheck size={14} /></div>}
                     </div>
                  </div>

                  <div className="space-y-1 mb-6">
                     <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{u.full_name || u.username}</h3>
                     <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1.5 tracking-widest">
                        <Mail size={12} />
                        {u.email || 'no-email@test.com'}
                     </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                     <div className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-yellow-500" />
                        <span className="text-xs font-black text-slate-900">{u.scholar_points || 0}</span>
                     </div>

                     <div className="flex gap-2">
                        <button className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline">Edit Role</button>
                        <button className="text-[10px] font-black uppercase text-red-500 tracking-widest hover:underline">Suspend</button>
                     </div>
                  </div>

                  {/* Decorative background icon */}
                  <User size={80} className="absolute -bottom-4 -right-4 text-slate-50 -z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
