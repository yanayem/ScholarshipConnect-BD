"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
  MessageSquare,
  User
} from 'lucide-react';
import Link from 'next/link';

export default function ModerationAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const loadReports = async () => {
    try {
      const res = await apiService.getModerationReports();
      if (res.ok) {
        setReports(res.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) loadReports();
  }, [user]);

  const handleResolve = async (id: number, status: string) => {
    if (!confirm(`Mark this report as ${status}?`)) return;
    try {
      const res = await apiService.resolveReport(id, status);
      if (res.ok) {
        loadReports();
      }
    } catch (e) {
      alert("Failed to update report");
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
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                    <ShieldCheck size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Moderation Hub</h1>
                    <p className="text-slate-500 text-sm font-medium">Review reported content and user behavior</p>
                </div>
            </div>

            <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search reports..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                />
            </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-medium">Loading reports...</div>
            ) : reports.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-[2rem] p-20 text-center shadow-sm">
                    <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">System is Clean</h3>
                    <p className="text-slate-500 font-medium">No pending reports for review.</p>
                </div>
            ) : reports.map((report) => (
                <div key={report.id} className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm hover:border-red-100 transition-all group">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-6">
                            <div className="flex items-center gap-4">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                    report.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                    {report.status}
                                </span>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    Reported {new Date(report.created_at).toLocaleString()}
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="text-red-500 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-slate-900 mb-1">{report.reason}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{report.description}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MessageSquare size={14} className="text-slate-400" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported Content</p>
                                    </div>
                                    <p className="text-sm text-slate-700 italic">"{report.content_snippet || 'Content not available'}"</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-8 pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</p>
                                        <p className="text-xs font-bold text-slate-900">{report.reporter_name || 'System'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target User</p>
                                        <p className="text-xs font-bold text-slate-900">{report.target_user_name || 'Anonymous'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex md:flex-col gap-3 shrink-0">
                            <button
                                onClick={() => handleResolve(report.id, 'resolved')}
                                className="flex-1 md:w-40 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
                            >
                                Dismiss / OK
                            </button>
                            <button
                                onClick={() => handleResolve(report.id, 'deleted')}
                                className="flex-1 md:w-40 py-4 bg-red-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                            >
                                Take Action
                            </button>
                            <button className="flex-1 md:w-40 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200">
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
