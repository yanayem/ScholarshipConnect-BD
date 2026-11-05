"use client";

import React, { useState, useEffect } from 'react';

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [expandedSopId, setExpandedSopId] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const loadApps = async () => {
    try {
      const res = await apiService.getApplications(true);
      if (res.ok) {
        const appList = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setApps(appList);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) loadApps();
  }, [user]);

  if (authLoading || !user?.is_staff) return null;

  const normalizeStatus = (status: string) => {
    if (!status) return 'Applied';
    const lower = status.toLowerCase();
    if (lower === 'applied' || lower === 'submitted') return 'Applied';
    if (lower === 'processing') return 'Processing';
    if (lower === 'under review') return 'Under Review';
    if (lower === 'accepted' || lower === 'approved') return 'Accepted';
    if (lower === 'rejected') return 'Rejected';
    return status;
  };

  const filteredApps = apps.filter(app => {
    const rawStatus = (app.status || '').toLowerCase();
    if (rawStatus === 'saved') return false;

    const normStatus = normalizeStatus(app.status).toLowerCase();
    if (statusFilter !== 'ALL' && normStatus !== statusFilter.toLowerCase()) {
      return false;
    }

    const studentName = (app.user_full_name || app.full_name || '').toLowerCase();
    const scholarshipTitle = (app.scholarship_title || '').toLowerCase();
    const studentEmail = (app.email || '').toLowerCase();
    const q = search.toLowerCase();
    return studentName.includes(q) || scholarshipTitle.includes(q) || studentEmail.includes(q);
  });

  return (
    <div className="min-h-screen bg-background">
      

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
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
                    <h1 className="text-xl sm:text-3xl font-bold text-slate-900">Student Applications</h1>
                    <p className="text-slate-500 text-sm font-medium">Review and track scholarship submissions</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student or scholarship..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-none text-sm outline-none font-medium"
                    />
                </div>
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-slate-200 rounded-none text-sm outline-none font-medium text-slate-700 cursor-pointer"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="applied">Applied</option>
                        <option value="processing">Processing</option>
                        <option value="under review">Under Review</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
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
                        ) : filteredApps.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-400 font-medium">No applications found.</td></tr>
                        ) : filteredApps.map((app) => {
                            const name = app.user_full_name || app.full_name || 'Anonymous';
                            const email = app.email || 'No email';
                            const statusLower = (app.status || '').toLowerCase();

                            return (
                              <React.Fragment key={app.id}>
                                  <tr className="hover:bg-slate-50 transition-colors">
                                      <td className="p-6">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 bg-primary-light rounded-none flex items-center justify-center text-primary font-bold shadow-sm">
                                                  {name[0] || 'U'}
                                              </div>
                                              <div>
                                                  <p className="font-bold text-slate-900">{name}</p>
                                                  <p className="text-xs font-medium text-slate-400 lowercase">{email.toLowerCase()}</p>
                                              </div>
                                          </div>
                                      </td>
                                      <td className="p-6">
                                          <p className="font-bold text-slate-700 text-sm max-w-[250px] truncate">{app.scholarship_title}</p>
                                      </td>
                                      <td className="p-6">
                                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-none text-[10px] font-black uppercase tracking-widest ${
                                              statusLower === 'applied' || statusLower === 'submitted' ? 'bg-blue-50 text-blue-600' :
                                              statusLower === 'processing' ? 'bg-amber-50 text-amber-600' :
                                              statusLower === 'under review' ? 'bg-purple-50 text-purple-600' :
                                              statusLower === 'accepted' || statusLower === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                                              statusLower === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'
                                          }`}>
                                              {(statusLower === 'applied' || statusLower === 'submitted' || statusLower === 'processing' || statusLower === 'under review') && <Clock size={12} />}
                                              {(statusLower === 'accepted' || statusLower === 'approved') && <CheckCircle2 size={12} />}
                                              {statusLower === 'rejected' && <XCircle size={12} />}
                                              {app.status}
                                          </span>
                                      </td>
                                      <td className="p-6">
                                          <p className="text-xs font-bold text-slate-500">{app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}</p>
                                      </td>
                                      <td className="p-6 text-right">
                                          <div className="flex items-center justify-end gap-3">
                                              {app.sop && (
                                                  <button
                                                      onClick={() => setExpandedSopId(expandedSopId === app.id ? null : app.id)}
                                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors uppercase tracking-wider"
                                                  >
                                                      <FileText size={12} />
                                                      {expandedSopId === app.id ? 'Hide SOP' : 'SOP'}
                                                  </button>
                                              )}
                                              <Link
                                                  href={`/admin/applications/${app.id}`}
                                                  className="inline-flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest hover:underline cursor-pointer"
                                              >
                                                  Details
                                                  <ChevronRight size={14} />
                                              </Link>
                                          </div>
                                      </td>
                                  </tr>
                                  {expandedSopId === app.id && app.sop && (
                                      <tr key={`sop-${app.id}`} className="bg-slate-50/80 border-b border-slate-100">
                                          <td colSpan={5} className="p-6">
                                              <div className="bg-white p-5 border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-line shadow-inner">
                                                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2 font-sans flex items-center gap-1.5">
                                                      <FileText size={14} />
                                                      Statement of Purpose (SOP) Snippet:
                                                  </p>
                                                  {app.sop}
                                              </div>
                                          </td>
                                      </tr>
                                  )}
                              </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
