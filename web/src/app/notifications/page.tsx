"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Mail,
  Calendar,
  Trophy,
  Info,
  ArrowRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await apiService.getNotifications();
        if (res.ok) {
          setNotifications(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchNotifications();
  }, [user]);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, is_read: true })));
  };

  const clearNotifications = () => {
    if (window.confirm('Clear all notifications?')) {
      setNotifications([]);
    }
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Notifications</h1>
            <p className="text-slate-500 text-sm font-medium">Stay updated with your scholarship activity.</p>
          </div>

          <div className="flex gap-4">
             <button
               onClick={markAllRead}
               className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:underline"
             >
                Mark all read
             </button>
             <button
               onClick={clearNotifications}
               className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline"
             >
                Clear
             </button>
          </div>
        </header>

        {loading ? (
          <div className="space-y-4">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="h-20 border border-slate-100 rounded-2xl animate-pulse"></div>
             ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-24 space-y-6">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bell className="text-slate-200" size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
             <p className="text-slate-500 text-sm">No new notifications for you right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {notifications.map((n) => (
               <div
                 key={n.id}
                 className={`group flex items-start gap-4 p-5 border rounded-3xl transition-all ${
                   n.is_read ? 'bg-white border-slate-100' : 'bg-slate-50 border-primary/20 ring-1 ring-primary/5'
                 }`}
               >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    n.type === 'message' ? 'bg-blue-50 text-blue-600' :
                    n.type === 'deadline' ? 'bg-red-50 text-red-600' :
                    n.type === 'achievement' ? 'bg-yellow-50 text-yellow-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                     {n.type === 'message' ? <Mail size={20} /> :
                      n.type === 'deadline' ? <Calendar size={20} /> :
                      n.type === 'achievement' ? <Trophy size={20} /> :
                      <Info size={20} />}
                  </div>

                  <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start mb-1">
                        <h4 className={`text-sm font-bold truncate ${n.is_read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</h4>
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">{n.created_at || '2m ago'}</span>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">{n.message}</p>

                     {n.action_url && (
                        <Link href={n.action_url} className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] group-hover:gap-3 transition-all">
                           View Details
                           <ArrowRight size={14} />
                        </Link>
                     )}
                  </div>
               </div>
             ))}
          </div>
        )}
      </main>
    </div>
  );
}
