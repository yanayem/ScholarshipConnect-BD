"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Bell,
  Send,
  History,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function BroadcastAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const loadBroadcasts = async () => {
    try {
      const res = await apiService.getAdminBroadcasts();
      if (res.ok) {
        setBroadcasts(res.data);
      }
    } catch (e) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff) loadBroadcasts();
  }, [user]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill all fields");

    setSending(true);
    try {
      const res = await apiService.sendBroadcast(title, message);
      if (res.ok) {
        alert("Broadcast sent successfully!");
        setTitle('');
        setMessage('');
        loadBroadcasts();
      } else {
        alert(res.data?.error || "Failed to send broadcast");
      }
    } catch (err) {
      alert("Network error occurred");
    } finally {
      setSending(false);
    }
  };

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} />
          Back to Console
        </Link>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm mb-12">
          <div className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <Bell size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Global Broadcast</h1>
              <p className="text-slate-500 text-sm font-medium">Send push notifications to all registered students</p>
            </div>
          </div>

          <form onSubmit={handleSend} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Broadcast Title</label>
              <input
                type="text"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="e.g., MEXT Scholarship is Live!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Message Content</label>
              <textarea
                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none"
                placeholder="Type your announcement here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {sending ? "Sending..." : (
                <>
                  Send Broadcast
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <History size={20} className="text-slate-400" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Broadcasts</h3>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-10 text-slate-400 font-medium">Loading history...</div>
            ) : broadcasts.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-8 text-center text-slate-400 font-medium border border-slate-100">
                No broadcasts sent yet.
              </div>
            ) : broadcasts.map((b) => (
              <div key={b.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-bold text-slate-900">{b.title}</h4>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(b.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">{b.message}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent to all users by {b.sender_name || 'Admin'}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
