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
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: any = {
  Saved:        { color: 'text-slate-500', bg: 'bg-slate-50', icon: Bookmark },
  Preparing:    { color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
  Submitted:    { color: 'text-blue-600', bg: 'bg-blue-50', icon: Send },
  'Under Review': { color: 'text-purple-600', bg: 'bg-purple-50', icon: Clock },
  Shortlisted:  { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Star },
  Accepted:     { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle2 },
  Rejected:     { color: 'text-red-600', bg: 'bg-red-50', icon: XCircle },
};

const TABS = ['All', 'Saved', 'Preparing', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'];
const STEPS = ['Saved', 'Preparing', 'Submitted', 'Under Review', 'Shortlisted', 'Accepted'];

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

        if (savedRes.ok) {
          data = data.concat((savedRes.data as any[]).map(item => ({
            id: 's' + item.id,
            scholarship_id: item.scholarship_details?.id,
            title: item.scholarship_details?.title || 'N/A',
            country: item.scholarship_details?.country || 'N/A',
            level: item.scholarship_details?.level || 'N/A',
            deadline: item.scholarship_details?.deadline || 'N/A',
            status: 'Saved',
            type: 'Self'
          })));
        }

        if (appRes.ok) {
          data = data.concat((appRes.data as any[]).map(item => ({
            id: 'a' + item.id,
            scholarship_id: item.scholarship_id,
            title: item.scholarship_title || 'N/A',
            country: item.scholarship_country || 'N/A',
            level: item.scholarship_level || 'N/A',
            deadline: item.scholarship_deadline || 'N/A',
            status: item.application_type === 'Self' ? 'Saved' : item.status,
            type: item.application_type
          })));
        }

        setApplications(data);
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
    : applications.filter(a => a.status === activeTab);

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <header className="mb-12">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">My Applications</h1>
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
                  <div key={item.id} className="group border border-slate-100 rounded-lg p-8 hover:border-primary/30 transition-all bg-slate-50/20 shadow-sm">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                      <div className="flex-1 space-y-5">
                         <div className="flex flex-wrap items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${cfg.bg} ${cfg.color}`}>
                               <StatusIcon size={16} />
                               {item.status}
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-3 py-1.5 rounded-lg bg-white">
                               {item.type === 'Self' ? 'Self-Guided' : 'Expert-Assisted'}
                            </span>
                         </div>

                         <Link href={`/scholarships/${item.scholarship_id}`} className="block group/link">
                            <h3 className="text-2xl font-bold text-slate-900 group-hover/link:text-primary transition-colors tracking-tight">{item.title}</h3>
                         </Link>

                         <div className="flex flex-wrap gap-8 text-xs font-bold text-slate-500 uppercase tracking-tight opacity-70">
                            <span className="flex items-center gap-2"><MapPin size={18} className="text-primary" /> {item.country}</span>
                            <span className="flex items-center gap-2"><GraduationCap size={18} className="text-primary" /> {item.level}</span>
                            <span className="flex items-center gap-2 text-red-500"><Calendar size={18} /> Deadline: {item.deadline}</span>
                         </div>
                      </div>

                      <div className="flex items-center gap-4 w-full md:w-auto">
                         {item.type !== 'Self' && (
                           <button className="flex-1 md:flex-none p-4 bg-white border border-slate-200 text-slate-600 rounded-lg hover:text-primary transition-all shadow-sm">
                              <MessageCircle size={22} />
                           </button>
                         )}
                         <button className="flex-1 md:flex-none px-10 py-4 bg-slate-900 text-white rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                            Update
                         </button>
                      </div>
                    </div>

                    {/* Progress Line */}
                    {item.status !== 'Rejected' && item.type !== 'Self' && (
                      <div className="mt-12 pt-10 border-t border-slate-200 overflow-x-auto scrollbar-hide">
                         <div className="flex min-w-[700px] justify-between relative px-4">
                            <div className="absolute top-2.5 left-0 right-0 h-1 bg-slate-200 rounded-full -z-0"></div>
                            {STEPS.map((step, i) => {
                               const currentIdx = STEPS.indexOf(item.status);
                               const isActive = i <= currentIdx;
                               return (
                                 <div key={step} className="flex flex-col items-center gap-4 relative z-10 bg-slate-50/20 px-3">
                                    <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-md ${isActive ? 'bg-primary ring-2 ring-primary/20' : 'bg-slate-300'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-400'}`}>
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
