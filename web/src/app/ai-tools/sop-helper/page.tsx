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
  RefreshCw,
  Sliders,
  Download,
  FileDown
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

  const [mode, setMode] = useState<'write' | 'review' | 'paraphrase'>('write');
  const [paraphraseStyle, setParaphraseStyle] = useState<string>('academic');
  const [sopText, setSopText] = useState<string>('');
  const [paraphrasedText, setParaphrasedText] = useState<string>('');
  const [generating, setGenerating] = useState<boolean>(false);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const [paraphrasing, setParaphrasing] = useState<boolean>(false);
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

  const handleParaphraseSOP = async () => {
    if (!sopText || sopText.trim().length < 20) {
      alert('Please provide at least 20 characters of SOP text for paraphrasing.');
      return;
    }

    setParaphrasing(true);
    setParaphrasedText('');
    try {
      const res = await apiService.aiParaphraseSOP(sopText, paraphraseStyle);
      if (res.ok && res.data) {
        setParaphrasedText(res.data.paraphrased_sop || res.data.sop || '');
      } else {
        alert(res.data?.error || 'Failed to paraphrase SOP. Please try again.');
      }
    } catch (err) {
      console.error('SOP paraphrase error:', err);
      alert('Error submitting SOP for paraphrasing.');
    } finally {
      setParaphrasing(false);
    }
  };

  const handleApplyParaphrasedText = () => {
    if (paraphrasedText) {
      setSopText(paraphrasedText);
      setParaphrasedText('');
    }
  };

  const handleCopy = () => {
    if (!sopText) return;
    navigator.clipboard.writeText(sopText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPdf = (textToExport: string) => {
    if (!textToExport) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site to download/print PDF.');
      return;
    }

    const title = selectedScholarship?.title || paramScholarshipTitle || 'Scholarship Application';
    const paragraphs = textToExport
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p style="text-indent: 30px; margin-bottom: 16px; text-align: justify; line-height: 1.8;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Statement of Purpose - ${title.replace(/"/g, '&quot;')}</title>
          <style>
            @page { size: A4; margin: 25mm 20mm 25mm 20mm; }
            body {
              font-family: 'Georgia', 'Times New Roman', serif;
              font-size: 12pt;
              color: #111111;
              margin: 40px;
              line-height: 1.8;
            }
            .header-box {
              text-align: center;
              border-bottom: 2px dashed #0f172a;
              padding-bottom: 15px;
              margin-bottom: 30px;
            }
            .main-title {
              font-size: 18pt;
              font-weight: bold;
              letter-spacing: 2px;
              text-transform: uppercase;
              margin: 0;
              color: #0f172a;
            }
            .sub-title {
              font-size: 10pt;
              color: #475569;
              margin-top: 6px;
              font-style: italic;
            }
            .footer-note {
              margin-top: 40px;
              border-top: 1px solid #cbd5e1;
              padding-top: 10px;
              text-align: center;
              font-size: 8.5pt;
              color: #94a3b8;
              font-family: sans-serif;
            }
          </style>
        </head>
        <body>
          <div class="header-box">
            <h1 class="main-title">Statement of Purpose</h1>
            <div class="sub-title">Target Program / Scholarship: ${title}</div>
          </div>
          ${paragraphs}
          <div class="footer-note">
            Generated with ScholarAI • ScholarshipConnect BD
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const downloadDoc = (textToExport: string) => {
    if (!textToExport) return;
    const titleClean = (selectedScholarship?.title || paramScholarshipTitle || 'Scholarship_Application').replace(/[^a-zA-Z0-9]/g, '_');
    const title = selectedScholarship?.title || paramScholarshipTitle || 'Scholarship Application';

    const paragraphs = textToExport
      .split('\n\n')
      .filter(p => p.trim())
      .map(p => `<p style="font-family: Arial, sans-serif; font-size: 12pt; line-height: 1.6; text-align: justify; margin-bottom: 14pt;">${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');

    const htmlDoc = `
      <html xmlns:o='urn:schemas-microsoft-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>Statement of Purpose</title>
      </head>
      <body style="padding: 40px;">
        <h1 style="text-align: center; font-family: Arial, sans-serif; font-size: 18pt; color: #0f172a; text-transform: uppercase; margin-bottom: 5pt;">STATEMENT OF PURPOSE</h1>
        <p style="text-align: center; font-family: Arial, sans-serif; font-size: 10pt; color: #64748b; margin-bottom: 25pt;">Target: ${title}</p>
        <hr style="border: 0; border-top: 1.5pt solid #0f172a; margin-bottom: 20pt;" />
        ${paragraphs}
        <br/>
        <hr style="border: 0; border-top: 1pt solid #cbd5e1; margin-top: 30pt; margin-bottom: 10pt;" />
        <p style="text-align: center; font-family: Arial, sans-serif; font-size: 8.5pt; color: #94a3b8;">ScholarshipConnect BD — ScholarAI SOP Generator</p>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlDoc], {
      type: 'application/msword;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${titleClean}_SOP.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

      <main className="max-w-5xl mx-auto px-4 sm:px-3 sm:px-6 py-5 sm:py-8 sm:py-12">
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
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">AI SOP Helper & Paraphraser</h1>
                <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
                  Generate tailored Statements of Purpose, review written SOPs, or paraphrase text with academic precision.
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

          {/* Left Controls & Scholarship Selector */}
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

              <button
                onClick={() => setMode('paraphrase')}
                className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                  mode === 'paraphrase'
                    ? 'bg-purple-50 border-purple-300 text-purple-900 font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${mode === 'paraphrase' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <RefreshCw size={20} />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider">Paraphrase & Polish</p>
                  <p className="text-[11px] opacity-80 font-normal">Rephrase written SOP into academic tone</p>
                </div>
              </button>
            </div>

            {/* Paraphrase Style Options if mode is paraphrase */}
            {mode === 'paraphrase' && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 flex items-center gap-2">
                  <Sliders size={14} className="text-purple-600" /> Paraphrase Tone & Style
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {['academic', 'professional', 'persuasive', 'concise'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setParaphraseStyle(style)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all border ${
                        paraphraseStyle === style
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tips */}
            <div className="bg-purple-50/60 border border-purple-100 rounded-2xl p-6 shadow-sm space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-purple-700 flex items-center gap-2">
                <Sparkles size={14} /> Academic SOP Best Practices
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 font-medium leading-relaxed">
                <li>• <strong>Context & Impact:</strong> Don't repeat your CV; show the impact of your research & project experiences.</li>
                <li>• <strong>Target Word Count:</strong> Standard SOPs range from 500–1,000 words (1–2 pages) based on university requirements.</li>
                <li>• <strong>Program & Faculty Fit:</strong> Explicitly align your goals with target program specialization and faculty interests.</li>
              </ul>
            </div>
          </div>

          {/* Right Editor & Result Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                    {mode === 'write' ? 'Statement of Purpose Draft' : mode === 'review' ? 'Paste / Edit Your SOP' : 'Original SOP Text'}
                  </span>
                  {sopText && (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {sopText.length} characters ({sopText.trim().split(/\s+/).filter(Boolean).length} words)
                    </span>
                  )}
                </div>

                {sopText.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => downloadPdf(sopText)}
                      title="Download PDF Document"
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors border border-rose-200 shadow-sm"
                    >
                      <FileDown size={14} />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => downloadDoc(sopText)}
                      title="Download Word Document"
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors border border-blue-200 shadow-sm"
                    >
                      <Download size={14} />
                      <span>Download DOC</span>
                    </button>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-purple-600 bg-slate-100 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors border border-slate-200"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                )}
              </div>

              {/* SOP Editor Input */}
              <div className="relative mb-6">
                <textarea
                  rows={14}
                  placeholder={
                    mode === 'write'
                      ? 'Click "Generate AI SOP Draft" below to automatically draft a tailored SOP based on your profile and selected scholarship...'
                      : mode === 'review'
                      ? 'Paste your Statement of Purpose (SOP) here to get comprehensive AI feedback and suggestions...'
                      : 'Paste your written SOP text here to paraphrase and polish into high-impact academic prose...'
                  }
                  value={sopText}
                  onChange={(e) => setSopText(e.target.value)}
                  className="w-full p-5 bg-slate-50/70 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm leading-relaxed text-slate-900 font-medium resize-y"
                />
              </div>

              {/* Mode Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {mode === 'write' ? (
                  <button
                    onClick={handleGenerateSOP}
                    disabled={generating || !selectedScholarshipId}
                    className="w-full sm:flex-1 min-h-[50px] bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 disabled:opacity-50 text-center leading-snug"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white shrink-0" />
                        <span>AI is Writing Draft...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 size={16} className="shrink-0" />
                        <span>Generate AI SOP Draft</span>
                      </>
                    )}
                  </button>
                ) : mode === 'review' ? (
                  <button
                    onClick={handleReviewSOP}
                    disabled={reviewing || !sopText}
                    className="w-full sm:flex-1 min-h-[50px] bg-slate-900 hover:bg-slate-800 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md shadow-slate-900/10 disabled:opacity-50 text-center leading-snug"
                  >
                    {reviewing ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-purple-400 shrink-0" />
                        <span>Analyzing SOP...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-purple-400 shrink-0" />
                        <span>Get AI Feedback</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleParaphraseSOP}
                    disabled={paraphrasing || !sopText}
                    className="w-full sm:flex-1 min-h-[50px] bg-purple-600 hover:bg-purple-700 text-white px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 shadow-md shadow-purple-600/20 disabled:opacity-50 text-center leading-snug"
                  >
                    {paraphrasing ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white shrink-0" />
                        <span>Paraphrasing SOP...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="shrink-0" />
                        <span>Paraphrase & Polish SOP</span>
                      </>
                    )}
                  </button>
                )}

                {sopText.length > 0 && selectedScholarshipId && (
                  <Link
                    href={`/scholarships/apply/agency/${selectedScholarshipId}?prefilledSop=${encodeURIComponent(sopText)}`}
                    className="w-full sm:flex-1 min-h-[50px] border border-purple-300 bg-purple-50/80 hover:bg-purple-100 text-purple-900 px-6 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2.5 text-center leading-snug"
                  >
                    <Briefcase size={16} className="text-purple-700 shrink-0" />
                    <span>Use in Agency Application</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Paraphrased Result Output Display */}
            {paraphrasedText && (
              <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                      <RefreshCw size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Paraphrased SOP Output</h3>
                      <p className="text-[10px] text-purple-700 font-black uppercase tracking-widest">
                        Tone: {paraphraseStyle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => downloadPdf(paraphrasedText)}
                      className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl transition-all border border-rose-200"
                    >
                      <FileDown size={14} /> PDF
                    </button>
                    <button
                      onClick={() => downloadDoc(paraphrasedText)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-all border border-blue-200"
                    >
                      <Download size={14} /> DOC
                    </button>
                    <button
                      onClick={handleApplyParaphrasedText}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                    >
                      Use Paraphrased Text
                    </button>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-line bg-purple-50/40 p-5 rounded-2xl border border-purple-100">
                  {paraphrasedText}
                </div>
              </div>
            )}

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
