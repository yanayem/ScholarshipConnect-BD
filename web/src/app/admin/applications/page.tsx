"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowLeft,
  ChevronRight,
  User,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationsAdmin() {
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
      const res = await apiService.getApplications();
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
                    <FileText size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Student Applications</h1>
                    <p className="text-slate-500 text-sm font-medium">Review and track scholarship submissions</p>
                </div>
            </div>

            <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search student or scholarship..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-none text-sm outline-none font-medium"
                    />
                </div>
                <button className="p-3 border border-slate-200 rounded-none hover:bg-slate-50 text-slate-500">
                    <Filter size={20} />
                </button>
            </div>
        </header>

        <div className="bg-white border border-slate-200 rounded-none overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholarship</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied On</th>
                            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium">Fetching applications...</td></tr>
                        ) : apps.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium">No applications found.</td></tr>
                        ) : apps.map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary-light rounded-none flex items-center justify-center text-primary font-bold shadow-sm">
                                            {app.user_name?.[0] || 'U'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{app.user_name || 'Anonymous'}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{app.user_email || 'No email'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <p className="font-bold text-slate-700 text-sm max-w-[250px] truncate">{app.scholarship_title}</p>
                                </td>
                                <td className="p-6">
                                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${
                                        app.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                                        app.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                        app.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                        {app.status === 'submitted' && <Clock size={12} />}
                                        {app.status === 'approved' && <CheckCircle2 size={12} />}
                                        {app.status === 'rejected' && <XCircle size={12} />}
                                        {app.status}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <p className="text-xs font-bold text-slate-500">{new Date(app.created_at).toLocaleDateString()}</p>
                                </td>
                                <td className="p-6 text-right">
                                    <button className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest hover:underline">
                                        Details
                                        <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
