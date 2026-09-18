"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import { Calendar, Briefcase, Heart, ArrowLeft, Globe, ShieldCheck, Brain, DollarSign, GraduationCap, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';

export default function ScholarshipDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saveId, setSaveId] = useState<number | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      const res = await apiService.getScholarshipDetail(id as string);
      if (res.ok) {
        setScholarship(res.data);
        setIsSaved(!!res.data.is_saved);
        setSaveId(res.data.save_id || null);
      }
      setLoading(false);
    };
    loadDetail();
  }, [id]);

  const handleApply = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (scholarship?.official_link) {
      window.open(scholarship.official_link, '_blank');
      return;
    }
    window.open('https://www.google.com/search?q=' + encodeURIComponent(scholarship?.title + " application link"), '_blank');
  };

  const handleSave = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (isSaved && saveId) {
      const res = await apiService.unsaveScholarship(saveId);
      if (res.ok) {
        setIsSaved(false);
        setSaveId(null);
      }
    } else {
      const res = await apiService.saveScholarship(scholarship?.id as number);
      if (res.ok) {
        setIsSaved(true);
        setSaveId(res.data.id);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scholarship?.title,
        text: `Check out this scholarship: ${scholarship?.title}`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleAgencyApply = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    router.push(`/scholarships/apply/agency/${id}?title=${encodeURIComponent(scholarship?.title || '')}`);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!scholarship) return <div>Scholarship not found.</div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-12 bg-gray-50 px-4 py-2 rounded-xl border border-black/5 self-start"
          >
            <ArrowLeft size={16} />
            Back to Search
          </button>

          <div className="grid lg:grid-cols-3 gap-16">
            {/* Content */}
            <div className="lg:col-span-2 space-y-12">
              <header>
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-[10px] bg-red-50 text-red-500 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-red-100">Featured</span>
                  <span className="text-[10px] bg-slate-50 text-slate-500 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-slate-100">{scholarship.level}</span>
                  {scholarship.field && (
                    <span className="text-[10px] bg-blue-50 text-blue-500 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-blue-100">{scholarship.field}</span>
                  )}
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">{scholarship.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <p className="text-slate-500 font-medium text-lg">Provided by <span className="text-slate-900 underline decoration-primary/20 underline-offset-4">{scholarship.provider}</span></p>
                  {scholarship.is_applied && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Applied: {scholarship.application_status}
                    </span>
                  )}
                </div>
              </header>

              { (scholarship.image || scholarship.image_url) && (
                <div className="aspect-video w-full rounded-[32px] overflow-hidden border border-black/5 shadow-xl">
                  <img src={scholarship.image || scholarship.image_url} alt={scholarship.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="space-y-10 text-slate-600 leading-relaxed">
                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Overview</h3>
                  <p className="text-base">
                    {scholarship.description || `The ${scholarship.title} is an excellent opportunity for international students to pursue their higher education abroad. It provides substantial financial support and academic resources to high-achieving individuals.`}
                  </p>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">What's Covered</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {['Full Tuition Fees', 'Living Allowance', 'Airfare Coverage', 'Health Insurance'].map(item => (
                       <li key={item} className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-slate-50/50 px-5 py-4 rounded-2xl border border-slate-100">
                         <ShieldCheck size={18} className="text-primary" />
                         {item}
                       </li>
                     ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Requirements</h3>
                  <div className="bg-gray-50 border border-black/5 rounded-lg p-8">
                    <ul className="space-y-4 text-sm font-medium">
                       {scholarship.min_cgpa && (
                         <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Minimum GPA {scholarship.min_cgpa} or equivalent</li>
                       )}
                       {scholarship.eligibility ? (
                         scholarship.eligibility.split('\n').filter(line => line.trim()).map((line, idx) => (
                           <li key={idx} className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> {line}</li>
                         ))
                       ) : (
                         <>
                           <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> English Proficiency (IELTS 6.5+ or TOEFL 90+)</li>
                           <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Statement of Purpose (SOP)</li>
                           <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary"></div> Recommendation Letters</li>
                         </>
                       )}
                    </ul>
                  </div>
                </section>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="border border-black/5 rounded-lg p-8 space-y-8 bg-white sticky top-28 shadow-sm">
                 <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Benefit</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                          <DollarSign size={24} />
                        </div>
                        <span className="font-bold text-slate-900 text-lg">{scholarship.amount || 'Fully Funded'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Deadline</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                          <Calendar size={24} />
                        </div>
                        <span className="font-bold text-slate-900 text-lg">{scholarship.deadline || 'Ongoing'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Location</label>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                          <Globe size={24} />
                        </div>
                        <span className="font-bold text-slate-900 text-lg">{scholarship.country}</span>
                      </div>
                    </div>

                    {scholarship.field && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Field of Study</label>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
                            <Briefcase size={24} />
                          </div>
                          <span className="font-bold text-slate-900 text-lg">{scholarship.field}</span>
                        </div>
                      </div>
                    )}

                    {scholarship.category && (
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Category</label>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                            <GraduationCap size={24} />
                          </div>
                          <span className="font-bold text-slate-900 text-lg">{scholarship.category}</span>
                        </div>
                      </div>
                    )}
                 </div>

                 <div className="pt-8 border-t border-slate-100 space-y-4">
                   <button
                     onClick={handleApply}
                     className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                   >
                     {scholarship.official_link ? <LinkIcon size={16} /> : null}
                     {scholarship.official_link ? 'Apply Officially' : 'Apply Externally'}
                   </button>
                   <button
                     onClick={() => router.push('/ai-tools/matchmaker')}
                     className="w-full border border-slate-200 text-slate-700 py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                   >
                     <Brain size={18} />
                     AI Matchmaker
                   </button>
                   <button
                     onClick={handleAgencyApply}
                     className="w-full bg-primary text-white py-4 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-xl shadow-primary/10 flex items-center justify-center gap-2"
                   >
                     <Briefcase size={16} />
                     Agency Application
                   </button>
                   <button
                     onClick={handleSave}
                     className={`w-full py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border ${
                       isSaved ? 'bg-red-50 text-red-500 border-red-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                     }`}
                   >
                     <Heart size={18} className={isSaved ? 'fill-current' : ''} />
                     {isSaved ? 'Saved to Vault' : 'Save for Later'}
                   </button>
                   <button
                     onClick={handleShare}
                     className="w-full py-4 rounded-lg font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border bg-slate-50 text-slate-400 border-slate-100"
                   >
                     <Globe size={18} />
                     Share Scholarship
                   </button>
                 </div>

                 <div className="bg-primary/5 border border-primary/10 rounded-lg p-6 text-center">
                    <h4 className="font-bold text-sm mb-2 text-slate-900">Need a Mentor?</h4>
                    <p className="text-slate-500 text-[10px] mb-6 uppercase tracking-wider font-bold">Get your application reviewed</p>
                    <Link href="/mentorship" className="block w-full py-3 bg-primary text-white text-xs font-black rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-widest shadow-md">
                      Connect Now
                    </Link>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
