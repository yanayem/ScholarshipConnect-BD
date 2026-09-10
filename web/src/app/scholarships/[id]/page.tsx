"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import { Calendar, Briefcase, Heart, ArrowLeft, Globe, ShieldCheck, Brain } from 'lucide-react';
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

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setLoading(true);
      const res = await apiService.getScholarshipDetail(id as string);
      if (res.ok) {
        setScholarship(res.data);
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
    window.open('https://www.google.com/search?q=' + encodeURIComponent(scholarship?.title + " application link"), '_blank');
  };

  const handleSave = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setIsSaved(!isSaved);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!scholarship) return <div>Scholarship not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Content */}
          <div className="lg:col-span-2 space-y-10">
            <header>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">Featured</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-black uppercase tracking-widest">{scholarship.level}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{scholarship.title}</h1>
              <p className="text-slate-500 font-medium">Provided by <span className="text-slate-900 underline decoration-primary/30">{scholarship.provider}</span></p>
            </header>

            {scholarship.image && (
              <div className="aspect-video w-full rounded-2xl overflow-hidden border border-slate-100">
                <img src={scholarship.image} alt={scholarship.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-8 text-slate-600 leading-relaxed">
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Overview</h3>
                <p className="text-sm">
                  {scholarship.description || `The ${scholarship.title} is an excellent opportunity for international students to pursue their higher education abroad. It provides substantial financial support and academic resources to high-achieving individuals.`}
                </p>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">What's Covered</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {['Full Tuition Fees', 'Living Allowance', 'Airfare Coverage', 'Health Insurance'].map(item => (
                     <li key={item} className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                       <ShieldCheck size={16} className="text-primary" />
                       {item}
                     </li>
                   ))}
                </ul>
              </section>

              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Requirements</h3>
                <ul className="list-disc list-inside space-y-2 text-sm ml-2">
                   <li>Minimum GPA 3.5 or equivalent</li>
                   <li>English Proficiency (IELTS 6.5+ or TOEFL 90+)</li>
                   <li>Statement of Purpose (SOP)</li>
                   <li>Recommendation Letters</li>
                </ul>
              </section>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="border border-slate-200 rounded-2xl p-6 space-y-6">
               <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Benefit</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                        <DollarSign size={20} />
                      </div>
                      <span className="font-bold text-slate-900">{scholarship.amount || 'Fully Funded'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Deadline</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center shrink-0">
                        <Calendar size={20} />
                      </div>
                      <span className="font-bold text-slate-900">{scholarship.deadline || 'Ongoing'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Location</label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Globe size={20} />
                      </div>
                      <span className="font-bold text-slate-900">{scholarship.country}</span>
                    </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-100 space-y-3">
                 <button
                   onClick={handleApply}
                   className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all text-sm"
                 >
                   Apply Externally
                 </button>
                 <button
                   onClick={() => router.push('/ai-tools/matchmaker')}
                   className="w-full border border-slate-200 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm flex items-center justify-center gap-2"
                 >
                   <Brain size={16} />
                   AI Matchmaker
                 </button>
                 <button
                   onClick={handleSave}
                   className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                     isSaved ? 'bg-red-50 text-red-500 border-red-100 border' : 'bg-slate-50 text-slate-500 border-slate-100 border'
                   }`}
                 >
                   <Heart size={16} className={isSaved ? 'fill-current' : ''} />
                   {isSaved ? 'Saved to Vault' : 'Save for Later'}
                 </button>
               </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
               <h4 className="font-bold text-sm mb-2">Need a Mentor?</h4>
               <p className="text-slate-400 text-[10px] mb-6">Get your application reviewed by successful scholars.</p>
               <Link href="/mentorship" className="block w-full py-2 bg-white text-slate-900 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                 Connect Now
               </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const DollarSign = ({ size }: { size: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
