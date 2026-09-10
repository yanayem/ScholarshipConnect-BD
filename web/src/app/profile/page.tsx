"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import {
  User,
  MapPin,
  GraduationCap,
  Mail,
  Trophy,
  Bookmark,
  Send,
  FileText,
  Settings,
  LogOut,
  Edit3,
  Camera,
  ArrowRight
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ saved: 0, applied: 0, documents: 3 });
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [savedRes, appsRes] = await Promise.all([
          apiService.getScholarships('filter=saved'),
          apiService.getScholarships('filter=applied')
        ]);

        setStats({
          saved: (savedRes.data as any)?.length || 0,
          applied: (appsRes.data as any)?.length || 0,
          documents: 3
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadStats();
  }, [user]);

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Minimal Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16 border-b border-slate-100 pb-16">
          <div className="relative shrink-0">
             <div className="w-28 h-28 bg-slate-50 border border-slate-200 rounded-3xl flex items-center justify-center text-primary text-3xl font-bold">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-3xl" alt="Avatar" /> : initials}
             </div>
             <button className="absolute -bottom-2 -right-2 bg-white border border-slate-200 p-2 rounded-xl shadow-sm text-slate-400 hover:text-primary transition-colors">
                <Camera size={16} />
             </button>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
             <div className="space-y-1">
                <h1 className="text-3xl font-bold text-slate-900">{user.full_name}</h1>
                <p className="text-slate-500 font-medium">{user.email}</p>
             </div>

             <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link href="/profile/edit" className="bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2">
                   <Edit3 size={14} />
                   Edit Profile
                </Link>
                <Link href="/profile/documents" className="border border-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                   <FileText size={14} />
                   My Documents
                </Link>
                <button
                  onClick={() => apiService.logout().then(() => router.push('/'))}
                  className="text-slate-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest px-4"
                >
                   Sign Out
                </button>
             </div>
          </div>

          <div className="shrink-0 flex flex-col items-center gap-1 bg-slate-50 border border-slate-100 rounded-2xl p-6">
             <Trophy className="text-yellow-500 mb-1" size={24} />
             <span className="text-2xl font-black text-slate-900">{(user as any).scholar_points || 0}</span>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scholar Points</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Stats & Activity */}
          <div className="lg:col-span-2 space-y-12">
             <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Activity Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {[
                     { label: 'Saved', val: stats.saved, icon: Bookmark, color: 'text-blue-600 bg-blue-50', href: '/scholarships?filter=saved' },
                     { label: 'Applied', val: stats.applied, icon: Send, color: 'text-emerald-600 bg-emerald-50', href: '/profile/applications' },
                     { label: 'Docs', val: stats.documents, icon: FileText, color: 'text-amber-600 bg-amber-50', href: '/profile/documents' },
                   ].map((stat, i) => (
                     <Link key={i} href={stat.href} className="border border-slate-100 rounded-2xl p-6 hover:border-primary/30 transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.color}`}>
                           <stat.icon size={20} />
                        </div>
                        <p className="text-2xl font-black text-slate-900 leading-none">{stat.val}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
                     </Link>
                   ))}
                </div>
             </section>

             <section>
                <div className="flex justify-between items-center mb-6">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Academic Profile</h3>
                   <Link href="/profile/edit" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">Manage</Link>
                </div>
                <div className="border border-slate-100 rounded-2xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                   <div className="flex items-start gap-4">
                      <GraduationCap className="text-primary mt-1" size={18} />
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Level</p>
                         <p className="text-sm font-bold text-slate-900">{(user as any).current_level || 'Undergraduate'}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <MapPin className="text-primary mt-1" size={18} />
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                         <p className="text-sm font-bold text-slate-900">{(user as any).current_location || 'Dhaka, Bangladesh'}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <FileText className="text-primary mt-1" size={18} />
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target GPA</p>
                         <p className="text-sm font-bold text-slate-900">{(user as any).cgpa || '3.80'}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-4">
                      <Trophy className="text-primary mt-1" size={18} />
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Language Proficiency</p>
                         <p className="text-sm font-bold text-slate-900">{(user as any).ielts_score ? `IELTS: ${ (user as any).ielts_score }` : 'Not Set'}</p>
                      </div>
                   </div>
                </div>
             </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             <div className="bg-slate-900 rounded-2xl p-8 text-white text-center">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                   <Settings className="text-white" size={24} />
                </div>
                <h4 className="font-bold mb-2">Account Settings</h4>
                <p className="text-slate-400 text-xs mb-8">Manage your notification preferences and security settings.</p>
                <Link href="/settings" className="block w-full py-2.5 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                   Manage Account
                </Link>
             </div>

             <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Links</h3>
                </div>
                <div className="p-2 space-y-1">
                   {[
                     { name: 'Mentorship Sessions', href: '/mentorship/sessions' },
                     { name: 'Community Posts', href: '/community/my-posts' },
                     { name: 'Saved Opportunities', href: '/scholarships?filter=saved' },
                     { name: 'User Manual', href: '/manual' },
                   ].map((link, i) => (
                     <Link key={i} href={link.href} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-colors group">
                        <span className="text-xs font-bold text-slate-700">{link.name}</span>
                        <ArrowRight size={14} className="text-slate-300 group-hover:text-primary transition-all" />
                     </Link>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-100 bg-white mt-20 text-center">
         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2026 ScholarshipConnectBD Profile System</p>
      </footer>
    </div>
  );
}
