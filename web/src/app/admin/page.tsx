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
  Clock,
  Bell,
  Settings,
  MoreVertical,
  UserCheck,
  History,
  Globe
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
    apps: 0,
    popularCountries: [] as any[]
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [healthStatus, setHealthStatus] = useState<string>('System Operational');
  const [scanning, setScanning] = useState(false);
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
        const [adminStatsRes, scholarRes, appsRes, logsRes, usersRes] = await Promise.all([
          apiService.getAdminStats(),
          apiService.getScholarships(),
          apiService.getApplications(),
          apiService.getAdminLogs(),
          apiService.getUsers('is_staff=true')
        ]);

        const scholarData = scholarRes.ok
          ? (Array.isArray(scholarRes.data) ? scholarRes.data : (scholarRes.data as any).results || [])
          : [];

        const appsData = appsRes.ok
          ? (Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data as any).results || [])
          : [];

        const logsData = logsRes.ok
          ? (Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data as any).results || [])
          : [];

        const staffData = usersRes.ok
          ? (Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data as any).results || [])
          : [];

        if (adminStatsRes.ok && adminStatsRes.data) {
          setStats({
            total: adminStatsRes.data.total_scholarships ?? scholarData.length,
            active: scholarData.filter((s: any) => s.status === 'active' || !s.status).length,
            pending: scholarData.filter((s: any) => s.status === 'pending').length,
            users: adminStatsRes.data.total_users ?? 0,
            apps: adminStatsRes.data.total_applications ?? appsData.length,
            popularCountries: adminStatsRes.data.popular_countries || []
          });
        } else {
          setStats({
            total: scholarData.length,
            active: scholarData.filter((s: any) => s.status === 'active' || !s.status).length,
            pending: scholarData.filter((s: any) => s.status === 'pending').length,
            users: staffData.length,
            apps: appsData.length,
            popularCountries: []
          });
        }

        setLogs(logsData.slice(0, 5));
        setStaffList(staffData.length > 0 ? staffData : (user ? [user] : []));
      } catch (e) {
        console.error('Failed to fetch admin stats', e);
      } finally {
        setLoading(false);
      }
    };

    if (user?.is_staff && localStorage.getItem('admin_verified') === 'true') {
      loadStats();
    }
  }, [user]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await apiService.getHealth();
      if (res.ok) {
        setHealthStatus('Health Check Passed (200 OK)');
      } else {
        setHealthStatus('Degraded Service');
      }
    } catch (e) {
      setHealthStatus('Check Failed');
    } finally {
      setScanning(false);
    }
  };

  const formatLogTime = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + d.toLocaleDateString();
    } catch (e) {
      return dateStr;
    }
  };

  if (authLoading || !user?.is_staff || (typeof window !== 'undefined' && localStorage.getItem('admin_verified') !== 'true')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-none p-8 md:p-12 shadow-sm">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Console</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{healthStatus}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/profile')}
                className="px-6 py-3 bg-primary/10 text-primary rounded-none font-bold text-xs uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center gap-3"
              >
                <LayoutDashboard size={16} />
                Return to Profile
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('admin_verified');
                  router.push('/profile');
                }}
                className="px-6 py-3 bg-red-50 text-red-500 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-3"
              >
                <ShieldCheck size={16} />
                Secure Logout
              </button>
            </div>
          </header>

          {/* Real Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
            {[
              { label: 'Scholarships', val: loading ? '...' : stats.total, icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-100' },
              { label: 'Live Now', val: loading ? '...' : stats.active, icon: Activity, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
              { label: 'Total Users', val: loading ? '...' : stats.users, icon: Users, color: 'text-purple-600 bg-purple-50 border-purple-100' },
              { label: 'Pending Review', val: loading ? '...' : stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100' },
              { label: 'Total Apps', val: loading ? '...' : stats.apps, icon: FileText, color: 'text-blue-600 bg-blue-50 border-blue-100' }
            ].map((stat, i) => (
              <div key={i} className={`border rounded-none p-8 flex flex-col items-center text-center bg-white shadow-sm ${stat.color}`}>
                <div className={`w-12 h-12 rounded-none flex items-center justify-center mb-6 bg-white shadow-sm`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-3xl font-black text-slate-900 leading-none">{stat.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Recent System Activity Logs */}
            <div className="lg:col-span-2 space-y-12">
              <section>
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Real Activity Logs</h3>
                  <Link href="/admin/logs" className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline">
                    View All Logs
                  </Link>
                </div>

                <div className="border border-slate-100 rounded-none overflow-hidden shadow-sm">
                  {loading ? (
                    <div className="p-10 text-center text-slate-400 font-bold text-xs">Loading activity logs...</div>
                  ) : logs.length === 0 ? (
                    <div className="p-10 text-center text-slate-400 font-bold text-xs uppercase tracking-wider">
                      No administrative actions logged yet.
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div key={log.id || i} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-all border-b border-slate-50 last:border-0 bg-white">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{log.action || log.details || 'System Activity'}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            By {log.admin_name || 'Admin'} • {formatLogTime(log.created_at)}
                          </p>
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300" />
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Popular Scholarship Destinations */}
              {stats.popularCountries.length > 0 && (
                <section>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Popular Destination Breakdown</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.popularCountries.map((c: any, i: number) => (
                      <div key={i} className="p-5 border border-slate-100 rounded-none bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Globe size={18} className="text-primary" />
                          <span className="font-bold text-xs text-slate-900">{c.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-500">{c.count} ({c.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Core Modules Grid */}
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
                    <Link key={i} href={mod.href} className="p-8 border border-slate-100 rounded-none hover:border-primary transition-all group bg-white shadow-sm flex flex-col items-start gap-6">
                      <div className={`w-12 h-12 rounded-none flex items-center justify-center ${mod.color}`}>
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

            {/* System Actions & Real Staff Directory */}
            <div className="space-y-12">
              <div className="border-[3px] border-slate-900 rounded-none p-10 text-slate-900 relative overflow-hidden bg-white">
                <ShieldCheck size={40} className="text-emerald-500 mb-8" />
                <h3 className="text-2xl font-bold mb-4">Security Audit</h3>
                <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">
                  Run health check to verify database connectivity and live API status.
                </p>
                <button
                  onClick={handleRunScan}
                  disabled={scanning}
                  className="w-full py-4 bg-slate-900 text-white rounded-none font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 relative z-10 disabled:opacity-50"
                >
                  {scanning ? "Running Health Scan..." : "Run System Health Check"}
                </button>
              </div>

              <section className="border border-slate-200 rounded-none p-8 bg-white shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">System Staff</h3>
                <div className="space-y-6">
                  {staffList.map((st, i) => (
                    <div key={st.id || i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-none bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-black text-slate-700 shadow-sm overflow-hidden">
                        {(st.avatar || st.avatar_url) ? (
                          <img src={st.avatar || st.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (st.full_name?.[0] || st.username?.[0] || 'A')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{st.full_name || st.username}</p>
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            {st.is_superuser ? 'Super Admin' : 'Staff Member'}
                          </p>
                        </div>
                      </div>
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
