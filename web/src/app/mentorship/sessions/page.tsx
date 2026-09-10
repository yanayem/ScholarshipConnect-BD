"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  MessageCircle,
  ArrowRight,
  Video
} from 'lucide-react';
import Link from 'next/link';

export default function MentorSessionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (!authLoading && user && !user.is_staff) router.push('/home');
  }, [user, authLoading]);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await apiService.getMentorships();
        if (res.ok) {
          setSessions(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSessions();
  }, [user]);

  const handleUpdateStatus = async (id: number, status: string) => {
    if (window.confirm(`Are you sure you want to ${status} this session?`)) {
       const res = await apiService.updateMentorshipStatus(id, status);
       if (res.ok) {
          setSessions(sessions.map(s => s.id === id ? { ...s, status } : s));
       }
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mentorship Sessions</h1>
            <p className="text-slate-500 text-sm font-medium">Manage your student consultations and requests.</p>
          </div>

          <div className="flex gap-2">
             <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Accepting Requests</span>
             </div>
          </div>
        </header>

        {loading ? (
          <div className="space-y-6">
             {[1, 2, 3].map(i => <div key={i} className="h-40 border border-slate-100 rounded-[2rem] animate-pulse"></div>)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-24 border border-slate-200 border-dashed rounded-[2rem]">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Calendar className="text-slate-300" size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">No sessions yet</h3>
             <p className="text-slate-500 text-sm">Your student requests will appear here once they book you.</p>
          </div>
        ) : (
          <div className="space-y-6">
             {sessions.map(session => (
                <div key={session.id} className="border border-slate-200 rounded-[2rem] p-8 hover:border-primary/30 transition-all bg-white shadow-sm shadow-slate-100/50">
                   <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
                      <div className="flex-1 space-y-6">
                         <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                               session.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                               session.status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                               'bg-slate-100 text-slate-500'
                            }`}>{session.status}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Topic: {session.topic}</span>
                         </div>

                         <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-xl font-bold text-slate-500">
                               {session.mentee_name?.[0]}
                            </div>
                            <div>
                               <h3 className="text-lg font-bold text-slate-900">{session.mentee_name}</h3>
                               <p className="text-xs text-slate-500 font-medium">Wants to study in {session.target_country || 'USA'}</p>
                            </div>
                         </div>

                         <div className="flex flex-wrap gap-6 text-xs font-bold text-slate-500">
                            <span className="flex items-center gap-2"><Calendar size={16} className="text-primary" /> {session.scheduled_date || 'To be set'}</span>
                            <span className="flex items-center gap-2"><Clock size={16} className="text-primary" /> {session.scheduled_time || 'To be set'}</span>
                         </div>

                         <div className="bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed italic">
                            "{session.message || 'No message provided.'}"
                         </div>
                      </div>

                      <div className="w-full lg:w-auto flex flex-col gap-3">
                         {session.status === 'pending' && (
                            <>
                               <button
                                 onClick={() => handleUpdateStatus(session.id, 'approved')}
                                 className="w-full px-8 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                               >
                                  <CheckCircle size={16} />
                                  Accept Session
                               </button>
                               <button
                                 onClick={() => handleUpdateStatus(session.id, 'rejected')}
                                 className="w-full px-8 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                               >
                                  <XCircle size={16} />
                                  Decline
                               </button>
                            </>
                         )}
                         {session.status === 'approved' && (
                            <>
                               <button className="w-full px-8 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200">
                                  <Video size={16} />
                                  Start Video Call
                               </button>
                               <button className="w-full px-8 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                                  <MessageCircle size={16} />
                                  Chat with Mentee
                               </button>
                            </>
                         )}
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
