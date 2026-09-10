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
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Applications</h1>
          <p className="text-slate-500 text-sm">Track your progress and manage your scholarship journey.</p>
        </header>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide">
          {TABS.map(tab => {
             const count = tab === 'All' ? applications.length : applications.filter(a => a.status === tab).length;
             return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
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
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 border border-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border border-slate-200 border-dashed rounded-[2rem]">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bookmark className="text-slate-300" size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">No applications found</h3>
             <p className="text-slate-500 text-sm max-w-xs mx-auto">
               {activeTab === 'All' ? "You haven't saved or started any applications yet." : `No applications currently in "${activeTab}" status.`}
             </p>
             <Link href="/scholarships" className="mt-8 inline-block text-primary font-bold text-sm hover:underline">
                Browse Scholarships →
             </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filtered.map(item => {
              const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.Saved;
              const StatusIcon = cfg.icon;

              return (
                <div key={item.id} className="group border border-slate-200 rounded-[2rem] p-8 hover:border-primary/30 transition-all bg-white shadow-sm shadow-slate-100/50">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-4">
                       <div className="flex flex-wrap items-center gap-3">
                          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.color}`}>
                             <StatusIcon size={14} />
                             {item.status}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-2 py-1 rounded-lg">
                             {item.type === 'Self' ? 'Self-Guided' : 'Expert-Assisted'}
                          </span>
                       </div>

                       <Link href={`/scholarships/${item.scholarship_id}`} className="block group/link">
                          <h3 className="text-xl font-bold text-slate-900 group-hover/link:text-primary transition-colors">{item.title}</h3>
                       </Link>

                       <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-500">
                          <span className="flex items-center gap-2"><MapPin size={16} className="text-primary" /> {item.country}</span>
                          <span className="flex items-center gap-2"><GraduationCap size={16} className="text-primary" /> {item.level}</span>
                          <span className="flex items-center gap-2 text-red-500"><Calendar size={16} /> Deadline: {item.deadline}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                       {item.type !== 'Self' && (
                         <button className="flex-1 md:flex-none p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-primary-light hover:text-primary transition-all">
                            <MessageCircle size={20} />
                         </button>
                       )}
                       <button className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-colors">
                          Update Status
                       </button>
                    </div>
                  </div>

                  {/* Progress Line */}
                  {item.status !== 'Rejected' && item.type !== 'Self' && (
                    <div className="mt-10 pt-8 border-t border-slate-50 overflow-x-auto scrollbar-hide">
                       <div className="flex min-w-[600px] justify-between relative px-2">
                          <div className="absolute top-2 left-0 right-0 h-0.5 bg-slate-100 -z-0"></div>
                          {STEPS.map((step, i) => {
                             const currentIdx = STEPS.indexOf(item.status);
                             const isActive = i <= currentIdx;
                             return (
                               <div key={step} className="flex flex-col items-center gap-3 relative z-10 bg-white px-2">
                                  <div className={`w-4 h-4 rounded-full border-2 border-white ring-2 ${isActive ? 'bg-primary ring-primary' : 'bg-slate-200 ring-slate-100'}`}></div>
                                  <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-400'}`}>
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
      </main>
    </div>
  );
}
