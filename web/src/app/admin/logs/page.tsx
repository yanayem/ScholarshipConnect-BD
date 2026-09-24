"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  History,
  Search,
  ArrowLeft,
  Database,
  Terminal,
  Activity,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function LogsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const loadLogs = async () => {
    try {
      const res = await apiService.getAdminLogs();
      if (res.ok) {
        setLogs(res.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) loadLogs();
  }, [user]);

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10 lg:py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} />
          Back to Console
        </Link>

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-slate-100 rounded-none flex items-center justify-center text-slate-900">
                    <Terminal size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">System Logs</h1>
                    <p className="text-slate-500 text-sm font-medium">Audit trail of all administrative actions</p>
                </div>
            </div>

            <div className="relative w-full md:w-72">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search logs..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-none text-sm outline-none font-medium"
                />
            </div>
        </header>

        <div className="bg-slate-900 rounded-none overflow-hidden shadow-2xl border border-slate-800">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">system@scholarshipconnect-bd:~/logs</p>
            </div>

            <div className="p-8 font-mono text-sm space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <p className="text-emerald-500 animate-pulse">$ Loading system audit trail...</p>
                ) : logs.length === 0 ? (
                    <p className="text-slate-500 italic"># No logs recorded in the current session.</p>
                ) : logs.map((log, i) => (
                    <div key={i} className="flex gap-4 group">
                        <span className="text-slate-600 shrink-0">[{new Date(log.created_at).toLocaleTimeString()}]</span>
                        <div className="flex-1">
                            <span className="text-emerald-400 font-bold">{log.user_name || 'System'}:</span>
                            <span className="text-slate-300 ml-2">{log.action}</span>
                            {log.details && <p className="text-slate-500 text-xs mt-1 border-l border-slate-700 pl-4 py-1">{log.details}</p>}
                        </div>
                    </div>
                ))}
                <p className="text-emerald-500 animate-pulse mt-4 cursor-default">$ _</p>
            </div>
        </div>
      </main>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #334155;
        }
      `}</style>
    </div>
  );
}
