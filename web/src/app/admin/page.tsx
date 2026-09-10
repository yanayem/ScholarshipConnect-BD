"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  FileText,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Database,
  CheckCircle2,
  Clock,
  Search,
  Bell,
  Settings,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    users: 0,
    apps: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const [scholarRes, usersRes, appsRes] = await Promise.all([
          apiService.getScholarships(),
          apiService.getMentors(), // Proxy for users list if getUsers not available
          apiService.getApplications()
        ]);

        if (scholarRes.ok) {
           const data = scholarRes.data as any[];
           setStats({
              total: data.length,
              active: data.filter(s => s.is_featured).length,
              pending: 12, // Mock for now
              users: 450, // Mock
              apps: (appsRes.data as any[]).length || 0
           });
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    if (user?.is_staff) loadStats();
  }, [user]);

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Console</h1>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">System Operational</p>
            </div>
          </div>

          <div className="flex gap-3">
             <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2">
                <Database size={16} />
                Backup DB
             </button>
             <button className="p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500">
                <Settings size={20} />
             </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
           {[
             { label: 'Scholarships', val: stats.total, icon: GraduationCap, color: 'text-blue-600 bg-blue-50' },
             { label: 'Active Apps', val: stats.apps, icon: FileText, color: 'text-emerald-600 bg-emerald-50' },
             { label: 'Total Users', val: stats.users, icon: Users, color: 'text-purple-600 bg-purple-50' },
             { label: 'Pending Review', val: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50' },
             { label: 'Live Sites', val: stats.active, icon: Activity, color: 'text-red-600 bg-red-50' }
           ].map((stat, i) => (
             <div key={i} className="border border-slate-100 rounded-2xl p-6 flex flex-col items-center text-center">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                   <stat.icon size={20} />
                </div>
                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
             </div>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
           {/* Recent Activity */}
           <div className="lg:col-span-2 space-y-8">
              <section>
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">System Logs</h3>
                    <button className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</button>
                 </div>

                 <div className="border border-slate-200 rounded-[2rem] overflow-hidden">
                    {[
                      { action: 'New User Registered', user: 'nayem.exe', time: '2m ago', type: 'user' },
                      { action: 'Scholarship Updated', user: 'Admin', time: '15m ago', type: 'system' },
                      { action: 'Payment Verified', user: 'SSLCommerz', time: '1h ago', type: 'billing' },
                      { action: 'SOP Review Request', user: 'rahat.dev', time: '2h ago', type: 'mentorship' }
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0">
                         <div className={`w-2 h-2 rounded-full ${
                           log.type === 'user' ? 'bg-emerald-500' :
                           log.type === 'billing' ? 'bg-blue-500' : 'bg-slate-300'
                         }`}></div>
                         <div className="flex-1">
                            <p className="text-sm font-bold text-slate-900">{log.action}</p>
                            <p className="text-[10px] text-slate-400 font-medium">By {log.user} • {log.time}</p>
                         </div>
                         <ArrowUpRight size={14} className="text-slate-300" />
                      </div>
                    ))}
                 </div>
              </section>

              <section>
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Core Modules</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { name: 'Manage Scholarships', desc: 'Add or edit featured opportunities.', icon: GraduationCap, href: '/admin/scholarships' },
                      { name: 'User Management', desc: 'Track permissions and roles.', icon: Users, href: '/admin/users' },
                      { name: 'Broadcast', desc: 'Send push notifications.', icon: Bell, href: '/admin/broadcast' },
                      { name: 'Analytics', desc: 'System growth metrics.', icon: Activity, href: '/admin/analytics' }
                    ].map((mod, i) => (
                      <Link key={i} href={mod.href} className="p-6 border border-slate-200 rounded-3xl hover:border-primary transition-all group bg-white">
                         <mod.icon className="text-slate-400 group-hover:text-primary mb-4 transition-colors" size={24} />
                         <h4 className="font-bold text-slate-900 mb-1">{mod.name}</h4>
                         <p className="text-xs text-slate-500">{mod.desc}</p>
                      </Link>
                    ))}
                 </div>
              </section>
           </div>

           {/* Quick Actions Sidebar */}
           <div className="space-y-8">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                 <ShieldCheck size={32} className="text-primary mb-6" />
                 <h3 className="text-xl font-bold mb-2">Security Audit</h3>
                 <p className="text-slate-400 text-xs mb-8 leading-relaxed">
                   Last security sweep was performed 14 hours ago. All systems within normal parameters.
                 </p>
                 <button className="w-full py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all">
                    Run New Scan
                 </button>
              </div>

              <section className="border border-slate-200 rounded-[2rem] p-6">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Staff Online</h3>
                 <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold">A</div>
                         <div className="flex-1">
                            <p className="text-xs font-bold text-slate-900">Admin {i}</p>
                            <p className="text-[9px] text-emerald-500 font-bold uppercase">Active</p>
                         </div>
                         <button className="p-1 text-slate-300"><MoreVertical size={14} /></button>
                      </div>
                    ))}
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
}
