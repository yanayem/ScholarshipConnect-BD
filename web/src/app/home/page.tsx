"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useMentorMode } from '@/context/MentorModeContext';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Header from '@/components/Header';
import {
  MapPin,
  GraduationCap,
  ArrowRight,
  BookOpen,
  Globe,
  Search,
  MessageSquare,
  ShieldCheck,
  Brain,
  Calendar,
  DollarSign,
  Trophy,
  LayoutDashboard,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

function StudentHome({ user, scholarships, leaderboard, loading, search, setSearch, router, initials }: any) {
  const countries = ['USA', 'UK', 'Canada', 'Germany', 'Japan', 'Australia'];
  const aiTools = [
    { name: 'Live Support', sub: 'Instant AI Chat', icon: MessageSquare, color: 'text-orange-600 border-orange-100 bg-orange-50/30', href: '/ai-tools/support-bot' },
    { name: 'Eligibility', sub: 'Instant Analysis', icon: ShieldCheck, color: 'text-emerald-600 border-emerald-100 bg-emerald-50/30', href: '/ai-tools/eligibility' },
    { name: 'Doc Vault', sub: 'Store Safely', icon: BookOpen, color: 'text-amber-600 border-amber-100 bg-amber-50/30', href: '/profile/documents' },
  ];

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hello, {user.full_name?.split(' ')[0]}</h1>
          <p className="text-slate-500 text-sm">Find your next scholarship opportunity today.</p>
        </div>
        <div className="flex items-center gap-4 lg:hidden">
           <Link href="/profile" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-primary font-bold text-sm">
              {initials}
           </Link>
        </div>
      </div>

      <div className="mb-10 relative max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Search for scholarships, countries, or levels..."
          className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && router.push(`/scholarships?search=${search}`)}
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-12">
          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Quick AI Tools</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {aiTools.map((tool) => (
                <Link
                  key={tool.name}
                  href={tool.href}
                  className={`border rounded-xl p-5 flex items-center gap-4 hover:shadow-sm transition-all group ${tool.color}`}
                >
                  <div className="p-2 rounded-lg bg-white shadow-sm group-hover:scale-110 transition-transform">
                     <tool.icon size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{tool.name}</h4>
                    <p className="text-[11px] opacity-70 font-medium">{tool.sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5">Explore Countries</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {countries.map((country) => (
                <Link
                  key={country}
                  href={`/scholarships?country=${country}`}
                  className="flex-shrink-0 px-5 py-2.5 border border-slate-200 rounded-full text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-colors flex items-center gap-2"
                >
                  <Globe size={14} />
                  {country}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Featured Opportunities</h3>
              <Link href="/scholarships" className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 border border-slate-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {scholarships.length > 0 ? scholarships.map((item: any) => (
                  <Link
                    key={item.id}
                    href={`/scholarships/${item.id}`}
                    className="group border border-slate-200 rounded-xl p-5 flex justify-between items-center hover:border-primary/50 transition-all"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{item.title}</h4>
                         <span className="text-[9px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">Hot</span>
                      </div>
                      <div className="flex gap-4 text-slate-500 text-xs font-medium">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {item.country}</span>
                        <span className="flex items-center gap-1"><GraduationCap size={12} /> {item.level}</span>
                        <span className="flex items-center gap-1 text-slate-400"><Calendar size={12} /> {item.deadline || 'Ongoing'}</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      {item.amount && (
                         <span className="text-xs font-bold text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                           {item.amount}
                         </span>
                      )}
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                )) : (
                  <div className="text-center py-10 border border-slate-200 rounded-xl border-dashed">
                     <p className="text-slate-400 text-xs font-bold">No featured scholarships right now.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
             <h4 className="font-bold text-lg mb-2 relative z-10">Student Stories</h4>
             <p className="text-slate-400 text-xs leading-relaxed mb-6 relative z-10">
               Read how fellow Bangladeshi students secured their dreams abroad.
             </p>
             <Link href="/blog" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors relative z-10">
               Read Now
               <ArrowRight size={14} />
             </Link>
             <BookOpen size={80} className="absolute -bottom-4 -right-4 text-white/5" />
          </div>

          <section className="border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-50">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Top Scholars</h3>
            </div>
            <div className="p-4 space-y-1">
              {loading ? (
                [1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse mb-2"></div>)
              ) : (
                leaderboard.map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <span className="text-[10px] font-black text-slate-300 w-4">{index + 1}</span>
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                      {(item.full_name || item.username || 'A')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.full_name || item.username}</p>
                      <p className="text-[10px] text-primary font-bold">{item.scholar_points || 0} PTS</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Link href="/community/leaderboard" className="block text-center py-3 bg-slate-50 text-[10px] font-bold text-slate-500 hover:text-primary transition-colors border-t border-slate-100">
              FULL LEADERBOARD
            </Link>
          </section>

          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 text-center">
             <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                <Brain size={20} />
             </div>
             <h4 className="text-sm font-bold text-slate-900 mb-1">ScholarAI Match</h4>
             <p className="text-[11px] text-slate-500 mb-5">
                Tailored matches based on your academic profile.
             </p>
             <Link href="/ai-tools/matchmaker" className="block w-full py-2.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
               Match Me
             </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function MentorHome({ user, initials }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [impact, setImpact] = useState({ scholarships: 0, discussions: 0, solved: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mentorshipRes, scholarRes] = await Promise.all([
          apiService.getMentorships(),
          apiService.getScholarships()
        ]);
        if (mentorshipRes.ok) setSessions(mentorshipRes.data);
        if (scholarRes.ok) {
           const myScholars = (scholarRes.data as any[]).filter(s => s.submitted_by === user.id);
           setImpact(prev => ({ ...prev, scholarships: myScholars.length }));
        }
      } catch (e) {} finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-primary rounded-[2rem] p-8 md:p-12 text-white mb-10 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div>
               <p className="text-white/70 text-sm font-medium mb-1">Welcome back,</p>
               <h1 className="text-3xl font-bold mb-4">{user.full_name}</h1>
               <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} />
                  Verified Mentor
               </div>
            </div>
            <div className="text-center">
               <div className="w-20 h-20 rounded-full border-4 border-white/20 flex flex-col items-center justify-center bg-white/10 backdrop-blur-md">
                  <span className="text-2xl font-black leading-none">{user.scholar_points || 0}</span>
                  <span className="text-[8px] font-black uppercase">Points</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10 relative z-10">
            <div className="text-center">
               <p className="text-2xl font-black">{sessions.length}</p>
               <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Sessions</p>
            </div>
            <div className="text-center">
               <p className="text-2xl font-black text-amber-400">{sessions.filter(s => s.status === 'pending').length}</p>
               <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Pending</p>
            </div>
            <div className="text-center">
               <p className="text-2xl font-black text-emerald-400">98%</p>
               <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Success</p>
            </div>
         </div>

         <LayoutDashboard size={200} className="absolute -bottom-20 -right-20 text-white/5 pointer-events-none" />
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
         <div className="lg:col-span-2 space-y-10">
            <section>
               <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Recent Requests</h3>
                  <Link href="/mentorship/sessions" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">View All</Link>
               </div>

               {loading ? (
                  <div className="space-y-4">
                     {[1, 2].map(i => <div key={i} className="h-32 border border-slate-100 rounded-[2rem] animate-pulse"></div>)}
                  </div>
               ) : sessions.length === 0 ? (
                  <div className="text-center py-20 border border-slate-200 border-dashed rounded-[2rem]">
                     <p className="text-slate-400 text-xs font-bold">No mentorship requests yet.</p>
                  </div>
               ) : (
                  <div className="space-y-4">
                     {sessions.slice(0, 3).map(session => (
                        <div key={session.id} className="border border-slate-200 rounded-[2rem] p-6 hover:border-primary/30 transition-all bg-white shadow-sm shadow-slate-100/50">
                           <div className="flex justify-between items-start mb-4">
                              <h4 className="font-bold text-slate-900">{session.topic}</h4>
                              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                                 session.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>{session.status}</span>
                           </div>
                           <div className="flex gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-6">
                              <span className="flex items-center gap-1.5"><Calendar size={14} /> {session.scheduled_date || 'TBD'}</span>
                              <span className="flex items-center gap-1.5"><Clock size={14} /> {session.scheduled_time || 'TBD'}</span>
                           </div>
                           <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-2">
                                 <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">{session.mentee_name?.[0]}</div>
                                 <span className="text-[10px] font-bold text-slate-700">{session.mentee_name}</span>
                              </div>
                              <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Manage Request</button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>
         </div>

         <div className="space-y-8">
            <section className="border border-slate-200 rounded-[2rem] p-6">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Community Impact</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><GraduationCap size={20} /></div>
                     <div>
                        <p className="text-lg font-black text-slate-900 leading-none">{impact.scholarships}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Scholarships Added</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><MessageSquare size={20} /></div>
                     <div>
                        <p className="text-lg font-black text-slate-900 leading-none">{impact.discussions}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Discussions Joined</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center"><CheckCircle size={20} /></div>
                     <div>
                        <p className="text-lg font-black text-slate-900 leading-none">{impact.solved}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Issues Solved</p>
                     </div>
                  </div>
               </div>
            </section>

            <div className="bg-slate-50 rounded-[2rem] p-8 text-center border border-slate-100">
               <Users size={32} className="text-primary mx-auto mb-4" />
               <h4 className="font-bold text-sm mb-2">Mentor Profile</h4>
               <p className="text-[10px] text-slate-500 mb-6 font-medium">Keep your university and scholarship details updated to attract more students.</p>
               <Link href="/profile/edit" className="block w-full py-2.5 bg-slate-900 text-white text-[10px] font-bold rounded-xl hover:bg-slate-800 transition-colors uppercase tracking-widest">
                  Update Profile
               </Link>
            </div>
         </div>
      </div>
    </main>
  );
}

export default function UserHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { isMentorMode } = useMentorMode();
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scholarRes, leaderRes] = await Promise.all([
          apiService.getScholarships('limit=3&featured=true'),
          apiService.getLeaderboard()
        ]);

        if (scholarRes.ok) {
          setScholarships(scholarRes.data as unknown as Scholarship[]);
        }
        if (leaderRes.ok) {
          setLeaderboard((leaderRes.data as any[]).slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (user.email.substring(0, 2).toUpperCase() || 'S');

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {isMentorMode && user.is_staff ? ( // Using is_staff as a proxy for mentor role in this simple implementation
         <MentorHome user={user} initials={initials} />
      ) : (
         <StudentHome
           user={user}
           scholarships={scholarships}
           leaderboard={leaderboard}
           loading={loading}
           search={search}
           setSearch={setSearch}
           router={router}
           initials={initials}
         />
      )}

      <footer className="py-10 border-t border-slate-100 mt-20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2026 ScholarshipConnectBD</p>
           <div className="flex gap-6">
             <Link href="/privacy" className="text-slate-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest">Privacy</Link>
             <Link href="/terms" className="text-slate-400 hover:text-primary text-[10px] font-bold uppercase tracking-widest">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}
