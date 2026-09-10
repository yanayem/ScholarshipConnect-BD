"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { ArrowRight, MapPin, GraduationCap, Sparkles, Brain, Users, Globe, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [featured, setFeatured] = useState<Scholarship[]>([]);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/home');
    }
  }, [user, loading, router]);

  useEffect(() => {
    apiService.getScholarships('limit=3').then(res => {
      if (res.ok) setFeatured(res.data as unknown as Scholarship[]);
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
              <Sparkles size={14} />
              Empowering Bangladeshi Scholars
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight">
              Unlock Your <span className="text-primary underline decoration-primary/20 underline-offset-8">International</span> Journey.
            </h1>

            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Discover, track, and apply for world-class scholarships with AI-powered guidance tailored for students in Bangladesh.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/scholarships" className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2">
                Browse Scholarships
                <ArrowRight size={20} />
              </Link>
              <Link href="/ai-tools/matchmaker" className="w-full sm:w-auto px-10 py-4 border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Brain size={20} />
                AI Matchmaker
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Featured Scholarships */}
      <section className="py-24 border-t border-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">Recently Added</h2>
              <p className="text-slate-500 font-medium">Explore the latest opportunities verified for you.</p>
            </div>
            <Link href="/scholarships" className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2 group">
              View All Opportunities
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map(s => (
              <Link
                key={s.id}
                href={`/scholarships/${s.id}`}
                className="group border border-slate-200 rounded-3xl p-6 hover:border-primary/50 transition-all bg-white hover:shadow-xl hover:shadow-slate-100/50"
              >
                 <div className="flex items-center gap-2 mb-4">
                    <span className="bg-slate-50 text-slate-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-slate-100">{s.level}</span>
                    <div className="h-px flex-1 bg-slate-50"></div>
                 </div>

                 <h3 className="font-bold text-lg text-slate-900 mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                   {s.title}
                 </h3>

                 <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-wider mb-6">
                    <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {s.country}</span>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Deadline: {s.deadline || 'Ongoing'}</span>
                    <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={18} />
                    </div>
                 </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50/50 border-y border-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { title: 'Verified Only', sub: 'All scholarships are manually checked by our team.', icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
            { title: 'AI Matchmaker', sub: 'Get matched with scholarships that fit your profile.', icon: Brain, color: 'text-primary bg-primary-light' },
            { title: 'Mentor Support', sub: 'Connect with successful scholars for guidance.', icon: Users, color: 'text-purple-600 bg-purple-50' }
          ].map((feat, i) => (
            <div key={i} className="space-y-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${feat.color}`}>
                <feat.icon size={24} />
              </div>
              <h4 className="font-bold text-lg text-slate-900">{feat.title}</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{feat.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
         <div className="max-w-6xl mx-auto px-6">
            <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
               <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to start your application?</h2>
                  <p className="text-slate-400 font-medium text-lg">Join 10,000+ Bangladeshi students using ScholarAI to secure their future.</p>
                  <Link href="/register" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-slate-100 transition-all">
                     Create Free Account
                     <ArrowRight size={20} />
                  </Link>
               </div>

               <Globe size={300} className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none" />
               <Sparkles size={100} className="absolute top-10 left-10 text-white/5 pointer-events-none rotate-12" />
            </div>
         </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-bold text-sm tracking-tight text-slate-900">ScholarshipConnect<span className="text-primary">BD</span></span>
           </div>

           <div className="flex gap-8 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
             <Link href="/scholarships" className="hover:text-primary">Browse</Link>
             <Link href="/mentorship" className="hover:text-primary">Mentors</Link>
             <Link href="/privacy" className="hover:text-primary">Privacy</Link>
             <Link href="/terms" className="hover:text-primary">Terms</Link>
           </div>

           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2026 Bangladesh</p>
        </div>
      </footer>
    </div>
  );
}
