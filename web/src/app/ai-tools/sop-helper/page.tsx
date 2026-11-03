"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  Brain,
  FileText,
  Sparkles,
  Loader2,
  Copy,
  CheckCircle2,
  ExternalLink,
  Briefcase,
  AlertCircle,
  Wand2,
  GraduationCap,
  Crown,
  ArrowLeft,
  Send,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';

function SOPHelperContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramScholarshipId = searchParams.get('scholarshipId');
  const paramScholarshipTitle = searchParams.get('scholarshipTitle');

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [selectedScholarshipId, setSelectedScholarshipId] = useState<string>(paramScholarshipId || '');
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);

  const [mode, setMode] = useState<'write' | 'review'>('write');
  const [sopText, setSopText] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    loadScholarships();
  }, [user, authLoading]);

  useEffect(() => {
    if (paramScholarshipId) {
      setSelectedScholarshipId(paramScholarshipId);
      fetchScholarshipDetail(paramScholarshipId);
    }
  }, [paramScholarshipId]);

  const loadScholarships = async () => {
    const res = await apiService.getScholarships();
    if (res.ok && Array.isArray(res.data)) {
      setScholarships(res.data);
      if (!paramScholarshipId && res.data.length > 0) {
        setSelectedScholarshipId(res.data[0].id.toString());
        setSelectedScholarship(res.data[0]);
      }
    }
  };

  const fetchScholarshipDetail = async (id: string) => {
    const res = await apiService.getScholarshipDetail(id);
    if (res.ok && res.data) {
      setSelectedScholarship(res.data);
    }
  };

  const handleScholarshipSelect = (idStr: string) => {
    setSelectedScholarshipId(idStr);
    const found = scholarships.find(s => s.id.toString() === idStr);
    if (found) {
      setSelectedScholarship(found);
    } else if (idStr) {
      fetchScholarshipDetail(idStr);
    }
  };

  const handleGenerateSOP = async () => {
    if (!selectedScholarshipId) {
      alert('Please select a target scholarship first.');
      return;
    }

    setGenerating(true);
    setFeedback(null);
    try {
      const res = await apiService.aiWriteSOP(parseInt(selectedScholarshipId, 10));
      if (res.ok && res.data) {
        const generatedText = res.data.sop || res.data.text || '';
        setSopText(generatedText);
      } else {
        alert(res.data?.error || 'Failed to generate SOP draft. Please try again.');
      }
    } catch (err) {
      console.error('SOP generation error:', err);
      alert('Error connecting to AI service.');
    } finally {
      setGenerating(false);
    }
  };

  const handleReviewSOP = async () => {
    if (!sopText || sopText.trim().length < 40) {
      alert('Please provide at least 40 characters of SOP text for AI review.');
      return;
    }

    setReviewing(true);
    setFeedback(null);
    try {
      const res = await apiService.aiReviewSOP(sopText);
      if (res.ok && res.data) {
        setFeedback(res.data.feedback || res.data.review || 'No specific feedback returned.');
      } else {
        alert(res.data?.error || 'Failed to review SOP. Please try again.');
      }
    } catch (err) {
      console.error('SOP review error:', err);
      alert('Error submitting SOP for review.');
    } finally {
      setReviewing(false);
    }
  };

  const handleCopy = () => {
    if (!sopText) return;
    navigator.clipboard.writeText(sopText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading AI SOP Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Top Banner Header */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
                <Brain size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                    ScholarAI SOP Engine
                  </span>
                  {user?.is_pro ? (
                    <span className="bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Crown size={10} /> PRO UNLIMITED
                    </span>
                  ) : (
                    <Link href="/upgrade-pro" className="bg-amber-400 hover:bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full transition-all">
                      Upgrade to PRO
                    </Link>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI SOP Helper & Draft Writer</h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                  Generate tailored Statements of Purpose for specific scholarships or get instant AI feedback to refine your draft.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200 shadow-sm shrink-0"
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </div>
        </div>

        {/* Selected Target Banner if passed via URL */}
        {(selectedScholarship || paramScholarshipTitle) && (
          <div className="bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-teal-500/10 border border-teal-200/80 rounded-2xl p-4 sm:p-5 mb-8 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Target Scholarship</p>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedScholarship?.title || paramScholarshipTitle}
                </h3>
                {selectedScholarship?.country && (
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedScholarship.country} {selectedScholarship.level ? `• ${selectedScholarship.level}` : ''}
                  </p>
                )}
              </div>
            </div>

            {selectedScholarship && (
              <Link
                href={`/scholarships/${selectedScholarship.id}`}
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 bg-white/80 px-3 py-1.5 rounded-xl border border-teal-200"
              >
                View Details <ExternalLink size={12} />
              </Link>
            )}
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Controls */}
          <div className="lg:col-span-1 space-y-6">

            {/* AI Action Options */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Wand2 size={14} className="text-purple-600" />
                SOP Generator Mode
              </h3>

              <button
                onClick={() => setMode('write')}
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  mode === 'write'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mode === 'write' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Generate Draft</p>
                  <p className="text-[11px] opacity-80 font-normal">AI creates a tailored SOP for target scholarship</p>
                </div>
              </button>

              <button
                onClick={() => setMode('review')}
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  mode === 'review'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mode === 'review' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Review & Fix</p>
                  <p className="text-[11px] opacity-80 font-normal">Paste your existing SOP and get AI feedback</p>
                </div>
              </button>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-purple-400 flex items-center gap-2">
                <Sparkles size={14} /> SOP Tips for Success
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 font-medium leading-relaxed">
                <li>• Clearly articulate your academic background & research interests.</li>
                <li>• Connect your career goals directly with the scholarship offering.</li>
                <li>• Keep the tone professional, concise, and impact-driven.</li>
              </ul>
            </div>
          </div>

          {/* Right Editor & Result Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {mode === 'write' ? 'Statement of Purpose Draft' : 'Paste / Edit Your SOP'}
                  </span>
                  {sopText && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {sopText.length} characters ({sopText.trim().split(/\s+/).filter(Boolean).length} words)
                    </span>
                  )}
                </div>

                {sopText.length > 0 && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                  >
                    {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy Text'}
                  </button>
                )}
              </div>

              {/* SOP Editor Input */}
              <div className="relative mb-6">
                <textarea
                  rows={14}
                  placeholder={
                    mode === 'write'
                      ? 'Click "Generate AI SOP Draft" below to automatically draft a tailored SOP based on your profile and selected scholarship...'
                      : 'Paste your Statement of Purpose (SOP) here to get comprehensive AI feedback and suggestions...'
                  }
                  value={sopText}
                  onChange={(e) => setSopText(e.target.value)}
                  className="w-full p-5 bg-slate-50/70 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm leading-relaxed text-slate-900 font-medium resize-y"
                />
              </div>

              {/* Mode Action Button */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                {mode === 'write' ? (
                  <button
                    onClick={handleGenerateSOP}
                    disabled={generating || !selectedScholarshipId}
                    className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        AI is Writing Draft...
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} />
                        Generate AI SOP Draft
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleReviewSOP}
                    disabled={reviewing || !sopText}
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-50"
                  >
                    {reviewing ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-purple-400" />
                        Analyzing SOP...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-purple-400" />
                        Get AI Feedback
                      </>
                    )}
                  </button>
                )}

                {sopText.length > 0 && selectedScholarshipId && (
                  <Link
                    href={`/scholarships/apply/agency/${selectedScholarshipId}?prefilledSop=${encodeURIComponent(sopText)}`}
                    className="w-full sm:w-auto border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Briefcase size={16} className="text-purple-700" />
                    Use in Agency Application
                  </Link>
                )}
              </div>
            </div>

            {/* AI Review Feedback Display */}
            {feedback && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI SOP Review & Feedback</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ScholarAI Assessment</p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {feedback}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

export default function SOPHelperPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={40} />
      </div>
    }>
      <SOPHelperContent />
    </Suspense>
  );
}
