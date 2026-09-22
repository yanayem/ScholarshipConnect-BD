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
    if (!authLoading) {
      if (!user || !user.is_staff) {
        router.push('/home');
      } else if (localStorage.getItem('admin_verified') !== 'true') {
        router.push('/admin/login');
      }
    }
  }, [user, authLoading, router]);

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
           const scholarData = Array.isArray(scholarRes.data) ? scholarRes.data : (scholarRes.data as any).results || [];
           setStats({
              total: scholarData.length,
              active: scholarData.filter((s: any) => s.status === 'active').length,
              pending: scholarData.filter((s: any) => s.status === 'pending').length,
              users: 450, // Mock
              apps: (appsRes.data as any[]).length || 0
           });
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    if (user?.is_staff && localStorage.getItem('admin_verified') === 'true') loadStats();
  }, [user]);

  if (authLoading || !user?.is_staff || (typeof window !== 'undefined' && localStorage.getItem('admin_verified') !== 'true')) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Console</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">System Operational</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-3"
              >
                  <LayoutDashboard size={16} />
                  Return to Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_verified');
                  router.push('/profile');
                }}
                className="px-6 py-3 bg-red-50 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3"
              >
                  <ShieldCheck size={16} />
                  Secure Logout
              </button>
              <button className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 shadow-xl shadow-slate-200">
                  <Database size={16} />
                  Backup DB
              </button>
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {[
              { label: 'Scholarships', val: stats.total, icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { label: 'Live Now', val: stats.active, icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Total Users', val: stats.users, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
              { label: 'Waiting', val: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Total Apps', val: stats.apps, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' }
            ].map((stat, i) => (
              <div key={i} className={`border rounded-[1.5rem] p-8 flex flex-col items-center text-center bg-white shadow-sm ${stat.color}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 bg-white shadow-sm`}>
                    <stat.icon size={24} />
                  </div>
                  <p className="text-3xl font-black text-slate-900 leading-none">{stat.val}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Recent Activity */}
            <div className="lg:col-span-2 space-y-12">
                <section>
                  <div className="flex justify-between items-center mb-8">
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Logs</h3>
                      <button className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline">View All</button>
                  </div>

                  <div className="border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                      {[
                        { action: 'New User Registered', user: 'nayem.exe', time: '2m ago', type: 'user' },
                        { action: 'Scholarship Updated', user: 'Admin', time: '15m ago', type: 'system' },
                        { action: 'Payment Verified', user: 'SSLCommerz', time: '1h ago', type: 'billing' },
                        { action: 'SOP Review Request', user: 'rahat.dev', time: '2h ago', type: 'mentorship' }
                      ].map((log, i) => (
                        <div key={i} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 bg-white">
                          <div className={`w-2 h-2 rounded-full ${
                            log.type === 'user' ? 'bg-emerald-500' :
                            log.type === 'billing' ? 'bg-blue-500' : 'bg-slate-300'
                          }`}></div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">{log.action}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">By {log.user} • {log.time}</p>
                          </div>
                          <ArrowUpRight size={16} className="text-slate-300" />
                        </div>
                      ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Core Modules</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {[
                        { name: 'Manage Scholarships', desc: 'Add or edit featured opportunities.', icon: GraduationCap, href: '/admin/scholarships', color: 'text-blue-600 bg-blue-50' },
                        { name: 'Student Applications', desc: 'Review and manage scholarship submissions.', icon: FileText, href: '/admin/applications', color: 'text-emerald-600 bg-emerald-50' },
                        { name: 'User Directory', desc: 'Track permissions and roles.', icon: Users, href: '/admin/users', color: 'text-purple-600 bg-purple-50' },
                        { name: 'Mentor Program', desc: 'Manage mentors and coaching requests.', icon: UserCheck, href: '/admin/mentors', color: 'text-indigo-600 bg-indigo-50' },
                        { name: 'Push Broadcast', desc: 'Send notifications to all users.', icon: Bell, href: '/admin/broadcast', color: 'text-amber-600 bg-amber-50' },
                        { name: 'Moderation', desc: 'Monitor community content and logs.', icon: ShieldCheck, href: '/admin/moderation', color: 'text-red-600 bg-red-50' },
                        { name: 'Analytics', desc: 'System growth and performance metrics.', icon: Activity, href: '/admin/analytics', color: 'text-emerald-600 bg-emerald-50' },
                        { name: 'History Logs', desc: 'View system-wide activity history.', icon: History, href: '/admin/logs', color: 'text-slate-600 bg-slate-50' },
                        { name: 'Admin Settings', desc: 'Configure console and global variables.', icon: Settings, href: '/admin/settings', color: 'text-slate-900 bg-slate-100' }
                      ].map((mod, i) => (
                        <Link key={i} href={mod.href} className="p-8 border border-slate-100 rounded-[2rem] hover:border-primary transition-all group bg-white shadow-sm flex flex-col items-start gap-6">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${mod.color}`}>
                             <mod.icon size={24} />
                          </div>
                          <div>
                             <h4 className="font-bold text-slate-900 mb-1">{mod.name}</h4>
                             <p className="text-xs text-slate-500 font-medium leading-relaxed">{mod.desc}</p>
                          </div>
                        </Link>
                      ))}
                  </div>
                </section>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-12">
                <div className="border-[3px] border-slate-900 rounded-[2.5rem] p-10 text-slate-900 relative overflow-hidden bg-white">
                  <ShieldCheck size={40} className="text-emerald-500 mb-8" />
                  <h3 className="text-2xl font-bold mb-4">Security Audit</h3>
                  <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                    Last security sweep was performed 14 hours ago. All systems within normal parameters.
                  </p>
                  <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 relative z-10">
                      Run New Scan
                  </button>
                  <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-slate-50 rounded-full opacity-50"></div>
                </div>

                <section className="border border-slate-200 rounded-[2.5rem] p-8 bg-white shadow-sm">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Staff Online</h3>
                  <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-4 group">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500 shadow-sm group-hover:border-emerald-200 transition-colors">A</div>
                          <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">Admin {i}</p>
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Now</p>
                              </div>
                          </div>
                          <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors"><MoreVertical size={18} /></button>
                        </div>
                      ))}
                  </div>
                </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
