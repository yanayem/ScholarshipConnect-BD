"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  UserCheck,
  Award,
  Star,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

export default function MentorsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const loadApps = async () => {
    try {
      const res = await apiService.getMentorApplications();
      if (res.ok) {
        setApps(res.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) loadApps();
  }, [user]);

  const handleApprove = async (id: number, status: string) => {
    if (!confirm(`Are you sure you want to ${status} this mentor application?`)) return;
    try {
      const res = await apiService.approveMentor(id, status);
      if (res.ok) {
        loadApps();
      }
    } catch (e) {
      alert("Error processing application");
    }
  };

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} />
          Back to Console
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-50 rounded-none flex items-center justify-center text-blue-600">
                    <UserCheck size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mentor Program</h1>
                    <p className="text-slate-500 text-sm font-medium">Approve and manage system mentors</p>
                </div>
            </div>

            <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search applicants..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-none text-sm outline-none font-medium"
                />
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
                <div className="col-span-full text-center py-20 text-slate-400 font-medium">Loading applications...</div>
            ) : apps.length === 0 ? (
                <div className="col-span-full bg-white border border-slate-200 rounded-none p-20 text-center shadow-sm">
                    <Star size={48} className="text-amber-500 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">All Caught Up</h3>
                    <p className="text-slate-500 font-medium">No pending mentor applications.</p>
                </div>
            ) : apps.map((app) => (
                <div key={app.id} className="bg-white border border-slate-200 rounded-none p-8 shadow-sm hover:border-primary/20 transition-all group">
                    <div className="flex items-start gap-6 mb-8">
                        <div className="w-20 h-20 bg-primary-light rounded-none flex items-center justify-center text-primary text-2xl font-black shadow-sm overflow-hidden shrink-0">
                            {app.avatar_url ? <img src={app.avatar_url} className="w-full h-full object-cover" /> : app.full_name?.[0] || 'M'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-slate-900 truncate">{app.full_name}</h3>
                            <p className="text-slate-500 font-medium text-sm mb-2">{app.email}</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="bg-slate-50 text-slate-500 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border border-slate-100">
                                    {app.university || 'University unknown'}
                                </span>
                                {app.is_pro && (
                                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest border border-amber-100">Pro Tier</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 rounded-none p-6 border border-slate-100 mb-8">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Professional Statement</h4>
                        <p className="text-sm text-slate-700 leading-relaxed italic line-clamp-3">"{app.bio || 'Applicant did not provide a bio.'}"</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <Award className="text-primary" size={20} />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                                <p className="text-xs font-bold text-slate-900">{app.experience_years || '0'} Years</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-emerald-500" size={20} />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expertise</p>
                                <p className="text-xs font-bold text-slate-900">{app.expertise_field || 'General'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleApprove(app.id, 'approved')}
                            className="flex-1 py-4 bg-primary text-white rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20"
                        >
                            Approve
                        </button>
                        <button
                            onClick={() => handleApprove(app.id, 'rejected')}
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-400 rounded-none font-black text-[10px] uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
