"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import {
  MapPin,
  GraduationCap,
  Trophy,
  Bookmark,
  Send,
  FileText,
  Settings,
  Edit3,
  Camera,
  ArrowRight,
  BookOpen,
  Award
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
  const u = user as any;

  const renderTags = (text: string | undefined) => {
    if (!text) return <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">Not specified</span>;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {text.split(',').map((tag, idx) => (
          <span key={idx} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-black border border-slate-100 uppercase tracking-tighter">
            {tag.trim()}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-black/5 rounded-[40px] p-8 md:p-12 shadow-sm">
          {/* Minimal Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16 border-b border-slate-100 pb-16">
            <div className="relative shrink-0">
               <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-[32px] flex items-center justify-center text-primary text-4xl font-bold shadow-xl shadow-primary/5">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-[32px]" alt="Avatar" /> : initials}
               </div>
               <button className="absolute -bottom-2 -right-2 bg-white border border-slate-200 p-2.5 rounded-xl shadow-lg text-slate-400 hover:text-primary transition-colors">
                  <Camera size={18} />
               </button>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
               <div className="space-y-1">
                  <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{user.full_name}</h1>
                  <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{user.email}</p>
                  <p className="text-slate-500 text-base mt-4 max-w-2xl leading-relaxed font-medium">{u.bio || "Passionate scholar looking for global education opportunities and mentorship."}</p>
               </div>

               <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-4">
                  <Link href="/profile/edit" className="bg-primary text-white px-8 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                     <Edit3 size={16} />
                     Edit Profile
                  </Link>
                  <Link href="/profile/documents" className="border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                     <FileText size={16} />
                     My Documents
                  </Link>
                  <button
                    onClick={() => apiService.logout().then(() => router.push('/'))}
                    className="text-slate-400 hover:text-red-500 transition-colors text-xs font-black uppercase tracking-[0.2em] px-6"
                  >
                     Sign Out
                  </button>
               </div>
            </div>

               <div className="shrink-0 flex flex-col items-center gap-1 bg-gray-50 border border-black/5 rounded-[32px] p-8 shadow-sm">
                  <Trophy className="text-yellow-500 mb-2" size={32} />
                  <span className="text-3xl font-black text-slate-900">{u.scholar_points || 0}</span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Points</span>
               </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-16">
              <div className="lg:col-span-2 space-y-16">
                 <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Activity Overview</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       {[
                         { label: 'Saved', val: stats.saved, icon: Bookmark, color: 'text-blue-600 bg-blue-50 border-blue-100', href: '/scholarships?filter=saved' },
                         { label: 'Applied', val: stats.applied, icon: Send, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', href: '/profile/applications' },
                         { label: 'Docs', val: stats.documents, icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-100', href: '/profile/documents' },
                       ].map((stat, i) => (
                         <Link key={i} href={stat.href} className={`border border-black/5 rounded-3xl p-6 flex items-center gap-5 hover:border-primary transition-all group bg-white shadow-sm ${stat.color}`}>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-white shadow-sm shrink-0`}>
                               <stat.icon size={24} />
                            </div>
                            <div>
                               <p className="text-2xl font-black text-slate-900 leading-none">{stat.val}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                            </div>
                         </Link>
                       ))}
                    </div>
                 </section>

                 <section>
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Academic Profile</h3>
                       <Link href="/profile/edit" className="text-primary text-[10px] font-black uppercase tracking-[0.2em] hover:underline">Manage</Link>
                    </div>
                    <div className="border border-black/5 rounded-[32px] p-10 grid grid-cols-1 sm:grid-cols-2 gap-12 bg-gray-50/30">
                       <div className="flex items-start gap-5">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><GraduationCap className="text-primary" size={24} /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">University</p>
                             <p className="text-base font-bold text-slate-900">{u.university || 'Not Specified'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-5">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><MapPin className="text-primary" size={24} /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                             <p className="text-base font-bold text-slate-900">{u.current_location || 'Not Specified'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-5">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><BookOpen className="text-primary" size={24} /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Degree Level</p>
                             <p className="text-base font-bold text-slate-900">{u.current_level || 'Not Specified'}</p>
                          </div>
                       </div>
                       <div className="flex items-start gap-5">
                          <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Award className="text-primary" size={24} /></div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CGPA</p>
                             <p className="text-base font-bold text-slate-900">{u.cgpa || 'Not Specified'}</p>
                          </div>
                       </div>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-100">
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Skills & Expertise</h4>
                        {renderTags(u.skills)}
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Research Interests</h4>
                        {renderTags(u.research_interests)}
                     </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Test Scores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {[
                       { label: 'IELTS', score: u.ielts_score },
                       { label: 'GRE', score: u.gre_score },
                       { label: 'SAT/Other', score: u.sat_score || '--' }
                     ].map((test, i) => (
                       <div key={i} className="p-8 border border-black/5 rounded-[32px] bg-white text-center shadow-sm">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{test.label}</p>
                          <p className="text-3xl font-black text-primary underline decoration-primary/10 decoration-4 underline-offset-8">{test.score || '--'}</p>
                       </div>
                     ))}
                  </div>
               </section>
            </div>

            <div className="space-y-10">
               <div className="border border-black/5 rounded-[32px] p-10 text-center bg-gray-50/50 shadow-inner">
                  <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                     <Settings className="text-slate-400" size={32} />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-slate-900 leading-tight">Account Settings</h4>
                  <p className="text-slate-500 text-sm mb-10 leading-relaxed font-medium">Manage your privacy, security, and notification preferences.</p>
                  <Link href="/settings" className="block w-full py-4 bg-white border border-black/5 text-slate-700 text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-md transition-all">
                     Manage Account
                  </Link>
               </div>

               <div className="border border-black/5 rounded-[32px] overflow-hidden bg-white shadow-sm">
                  <div className="p-8 border-b border-slate-100 bg-gray-50/30">
                     <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Links</h3>
                  </div>
                  <div className="p-4 space-y-1">
                     {[
                       { name: 'Mentorship Sessions', href: '/mentorship/sessions' },
                       { name: 'Community Posts', href: '/community/my-posts' },
                       { name: 'Saved Opportunities', href: '/scholarships?filter=saved' },
                       { name: 'User Manual', href: '/manual' },
                     ].map((link, i) => (
                       <Link key={i} href={link.href} className="flex justify-between items-center p-5 hover:bg-slate-50 rounded-2xl transition-all group">
                          <span className="text-sm font-bold text-slate-700 group-hover:text-primary">{link.name}</span>
                          <ArrowRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </Link>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD Profile v2.5</p>
      </footer>
    </div>
  );
}
