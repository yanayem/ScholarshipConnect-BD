"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowLeft,
  TrendingUp,
  Users,
  GraduationCap,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

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
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Analytics</h1>
                    <p className="text-slate-500 text-sm font-medium">Real-time performance and growth metrics</p>
                </div>
            </div>

            <div className="flex gap-4">
                <button className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Calendar size={16} />
                    Last 30 Days
                </button>
                <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200">
                    <Download size={16} />
                    Export PDF
                </button>
            </div>
        </header>

        {/* Charts and Data (Placeholder) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm min-h-[400px] flex flex-col justify-center items-center text-center">
                <Activity size={48} className="text-emerald-500 mb-6 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Growth Analytics</h3>
                <p className="text-slate-500 font-medium">Detailed usage graphs are being generated.</p>
                <div className="mt-10 flex gap-2 w-full max-w-sm">
                    {[30, 60, 45, 90, 70, 100, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-emerald-100 rounded-t-lg transition-all hover:bg-emerald-500" style={{ height: `${h}px` }}></div>
                    ))}
                </div>
            </div>

            <div className="space-y-8">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">User Demographics</h4>
                    <div className="space-y-4">
                        {[
                            { label: 'Bangladesh', pct: 85, color: 'bg-emerald-500' },
                            { label: 'USA', pct: 8, color: 'bg-blue-500' },
                            { label: 'Germany', pct: 4, color: 'bg-amber-500' },
                            { label: 'Others', pct: 3, color: 'bg-slate-300' }
                        ].map((d, i) => (
                            <div key={i} className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-slate-700">
                                    <span>{d.label}</span>
                                    <span>{d.pct}%</span>
                                </div>
                                <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden">
                                    <div className={`h-full ${d.color}`} style={{ width: `${d.pct}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl shadow-slate-200">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                        <Users size={24} className="text-emerald-400" />
                    </div>
                    <h4 className="text-2xl font-bold mb-2">450+</h4>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Active Mentors</p>
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <p className="text-emerald-400 text-xs font-bold">+12% from last week</p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
