"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
  GraduationCap,
  Calendar,
  MessageCircle,
  MoreVertical,
  ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: any = {
  Saved:        { color: 'text-slate-500', bg: 'bg-slate-50', icon: Bookmark },
  Applied:      { color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
  Processing:   { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  'Under Review': { color: 'text-purple-600', bg: 'bg-purple-50', icon: Clock },
  Shortlisted:  { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Star },
  Accepted:     { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
  Rejected:     { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const TABS = ['All', 'Saved', 'Applied', 'Processing', 'Under Review', 'Accepted', 'Rejected'];
const STEPS = ['Saved', 'Applied', 'Processing', 'Under Review', 'Accepted'];

const normalizeStatus = (rawStatus: string) => {
  if (!rawStatus) return 'Applied';
  const s = String(rawStatus).trim();
  const lower = s.toLowerCase();
  if (lower === 'submitted' || lower === 'applied') return 'Applied';
  if (lower === 'saved') return 'Saved';
  if (lower === 'processing') return 'Processing';
  if (lower === 'under review' || lower === 'under_review') return 'Under Review';
  if (lower === 'shortlisted') return 'Shortlisted';
  if (lower === 'accepted') return 'Accepted';
  if (lower === 'rejected') return 'Rejected';
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export default function ApplicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [savedRes, appRes] = await Promise.all([
          apiService.getSavedScholarships(),
          apiService.getApplications()
        ]);
        let data: any[] = [];

        if (appRes?.ok) {
          const appList = Array.isArray(appRes.data) ? appRes.data : (appRes.data?.results || []);
          data = data.concat(appList.map((item: any) => ({
            id: 'a' + item.id,
            scholarship_id: item.scholarship?.id || item.scholarship,
            title: item.scholarship_title || item.scholarship_details?.title || 'N/A',
            country: item.scholarship_country || item.scholarship_details?.country || 'N/A',
            level: item.scholarship_level || item.scholarship_details?.level || 'N/A',
            deadline: item.scholarship_deadline || item.scholarship_details?.deadline || 'N/A',
            status: normalizeStatus(item.status),
            type: item.application_type || 'Self',
            created_at: item.created_at || null,
            is_application: true
          })));
        }

        if (savedRes?.ok) {
          const savedList = Array.isArray(savedRes.data) ? savedRes.data : (savedRes.data?.results || []);
          data = data.concat(savedList.map((item: any) => ({
            id: 's' + item.id,
            scholarship_id: item.scholarship_details?.id || item.scholarship,
            title: item.scholarship_details?.title || 'N/A',
            country: item.scholarship_details?.country || 'N/A',
            level: item.scholarship_details?.level || 'N/A',
            deadline: item.scholarship_details?.deadline || 'N/A',
            status: 'Saved',
            type: 'Self',
            created_at: item.created_at || null,
            is_application: false
          })));
        }

        // Group by scholarship to prioritize actual application statuses (Applied, Processing, Under Review, etc.)
        // while ensuring Saved scholarships without an application explicitly show "Saved" status.
        const scholarshipMap = new Map();

        // 1. First process all actual applications (Applied, Processing, Under Review, Accepted, Rejected, etc.)
        data.filter(item => item.is_application).forEach(item => {
          const key = String(item.scholarship_id || item.title).toLowerCase().trim();
          if (key && key !== 'n/a') {
            scholarshipMap.set(key, item);
          } else {
            scholarshipMap.set(item.id, item);
          }
        });

        // 2. Then add saved bookmarks ONLY if the user has not submitted an application for it yet
        data.filter(item => !item.is_application).forEach(item => {
          const key = String(item.scholarship_id || item.title).toLowerCase().trim();
          if (key && key !== 'n/a') {
            if (!scholarshipMap.has(key)) {
              scholarshipMap.set(key, item);
            }
          } else {
            scholarshipMap.set(item.id, item);
          }
        });

                const sortedList = Array.from(scholarshipMap.values()).sort((a: any, b: any) => {
          const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return timeB - timeA; // Newest first
        });

        setApplications(sortedList);
      } catch (error) {
        console.error('Failed to load applications', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) loadData();
  }, [user]);

  const filtered = activeTab === 'All'
    ? applications
    : applications.filter(a => (a.status || '').toLowerCase() === activeTab.toLowerCase());

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-4 sm:p-8 md:p-12 shadow-sm">
          <header className="mb-12">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">My Applications</h1>
            <p className="text-slate-500 text-sm font-medium">Track your progress and manage your scholarship journey.</p>
          </header>

          {/* Tab Filters */}
          <div className="flex gap-2 overflow-x-auto pb-6 mb-10 border-b border-slate-100 scrollbar-hide">
            {TABS.map(tab => {
               const count = tab === 'All' ? applications.length : applications.filter(a => a.status === tab).length;
               return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap border shadow-sm ${
                    activeTab === tab
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30 hover:text-primary'
                  }`}
                >
                  {tab} {count > 0 ? `(${count})` : ''}
                </button>
               );
            })}
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 border border-slate-100 rounded-lg animate-pulse bg-slate-50/30"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 border border-slate-200 border-dashed rounded-lg bg-slate-50/20">
               <div className="w-20 h-20 bg-white border border-slate-100 rounded-lg flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Bookmark className="text-slate-300" size={32} />
               </div>
               <h3 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-widest">No results</h3>
               <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium leading-relaxed">
                 {activeTab === 'All' ? "You haven't saved or started any applications yet." : `No applications currently in "${activeTab}" status.`}
               </p>
               <Link href="/scholarships" className="mt-8 inline-block text-primary font-black text-xs uppercase tracking-widest hover:underline">
                  Browse Now →
               </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filtered.map(item => {
                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Saved;
                const StatusIcon = cfg.icon;

                return (
                  <div key={item.id} className="group border border-slate-100 rounded-lg p-5 hover:border-primary/30 transition-all bg-slate-50/20 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div className="flex-1 space-y-3">
                         <div className="flex flex-wrap items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.color}`}>
                               <StatusIcon size={14} />
                               {item.status}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-2.5 py-1 rounded-md bg-white">
                               {item.status === 'Saved' ? 'Bookmarked' : (item.type === 'Self' ? 'Self-Guided' : 'Expert-Assisted')}
                            </span>
                         </div>

                         <Link href={`/scholarships/${item.scholarship_id}`} className="block group/link">
                            <h3 className="text-lg font-bold text-slate-900 group-hover/link:text-primary transition-colors tracking-tight leading-tight">{item.title}</h3>
                         </Link>

                         <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                            <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.country}</span>
                            <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {item.level}</span>
                            <span className="flex items-center gap-1.5 text-red-500"><Calendar size={14} /> Deadline: {item.deadline}</span>
                            {item.created_at && (
                              <span className="flex items-center gap-1.5 text-teal-700 bg-teal-50/70 border border-teal-100 px-2 py-0.5 rounded text-[10px] font-black">
                                <Clock size={12} className="text-teal-600" />
                                {item.status === 'Saved' ? 'Saved On' : 'Applied On'}: {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>
                            )}
                         </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                         {item.type !== 'Self' && (
                           <Link
                             href="/messages"
                             title="Contact Support / Mentor"
                             className="flex-1 md:flex-none p-2.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:text-primary transition-all shadow-sm flex items-center justify-center"
                           >
                              <MessageCircle size={18} />
                           </Link>
                         )}
                         <Link
                            href={item.scholarship_id ? `/scholarships/${item.scholarship_id}` : '/scholarships'}
                            className="flex-1 md:flex-none px-5 py-2.5 bg-slate-900 text-white rounded-md font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-md shadow-slate-100 flex items-center justify-center gap-1.5"
                         >
                            <span>{item.status === 'Saved' ? 'Apply Now' : 'View Details'}</span>
                            <ArrowUpRight size={14} />
                         </Link>
                      </div>
                    </div>

                    {/* Progress Line */}
                    {item.status !== 'Rejected' && item.status !== 'Saved' && (
                      <div className="mt-8 pt-6 border-t border-slate-200 overflow-x-auto scrollbar-hide">
                         <div className="flex min-w-[500px] justify-between relative px-2">
                            <div className="absolute top-1.5 left-0 right-0 h-0.5 bg-slate-200 rounded-full -z-0"></div>
                            {STEPS.map((step, i) => {
                               const currentIdx = STEPS.indexOf(item.status);
                               const isActive = i <= currentIdx;
                               return (
                                 <div key={step} className="flex flex-col items-center gap-2 relative z-10 bg-slate-50/20 px-2">
                                    <div className={`w-3.5 h-3.5 rounded-full border-[2px] border-white shadow-sm ${isActive ? 'bg-primary ring-2 ring-primary/10' : 'bg-slate-300'}`}></div>
                                    <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                       {step === 'Under Review' ? 'Review' : step}
                                    </span>
                                 </div>
                               );
                            })}
                         </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
