"use client";

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Sparkles,
  Wand2,
  Globe2,
  FileText,
  CheckCircle2,
  Copy,
  PlusCircle,
  RefreshCw,
  Globe,
  GraduationCap,
  Briefcase,
  Calendar,
  Award,
  Link as LinkIcon
} from 'lucide-react';

export default function SmartAiAutoFillPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [aiMode, setAiMode] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [rawText, setRawText] = useState('');
  const [aiExtracting, setAiExtracting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const extractingRef = useRef(false);

  if (authLoading) return null;

  const handleUrlExtract = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a valid official scholarship webpage URL.');
      return;
    }
    if (extractingRef.current) return;
    extractingRef.current = true;
    setAiExtracting(true);
    try {
      const res = await apiService.extractScholarshipFromUrl(urlInput.trim());
      if (res.ok && res.data?.scholarship) {
        setExtractedData(res.data.scholarship);
      } else {
        alert(res.data?.error || 'Could not extract scholarship info from this webpage. Please try raw text extract.');
      }
    } catch (err) {
      alert('Network error during webpage scraping.');
    } finally {
      setAiExtracting(false);
      extractingRef.current = false;
    }
  };

  const handleTextExtract = async () => {
    if (!rawText.trim()) {
      alert('Please paste the scholarship circular text or details.');
      return;
    }
    if (extractingRef.current) return;
    extractingRef.current = true;
    setAiExtracting(true);
    try {
      const res = await apiService.aiExtractScholarship(rawText);
      if (res.ok && res.data?.scholarship) {
        setExtractedData(res.data.scholarship);
      } else {
        alert(res.data?.error || 'AI extraction failed. Please try again.');
      }
    } catch (err) {
      alert('Network error occurred during AI extraction.');
    } finally {
      setAiExtracting(false);
      extractingRef.current = false;
    }
  };

  const handleCopyJson = () => {
    if (!extractedData) return;
    navigator.clipboard.writeText(JSON.stringify(extractedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setExtractedData(null);
    setUrlInput('');
    setRawText('');
  };

  const handleProceedToAdd = () => {
    if (extractedData) {
      try {
        localStorage.setItem('autofill_scholarship_data', JSON.stringify(extractedData));
      } catch (e) {
        console.error(e);
      }
    }
    router.push('/scholarships/add');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-8 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Sparkles size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Smart AI Auto-Fill</h1>
              <p className="text-slate-500 text-sm font-medium">Extract structured scholarship details instantly from webpage links or circular text using AI.</p>
            </div>
          </div>
        </header>

        {/* Mode Switcher & Input Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5 mb-6">
            <div className="flex items-center gap-2">
              <Wand2 size={18} className="text-primary" />
              <h2 className="text-sm font-bold text-slate-900">Choose Input Source</h2>
            </div>

            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setAiMode('url')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  aiMode === 'url' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe2 size={14} />
                <span>Website URL</span>
              </button>
              <button
                type="button"
                onClick={() => setAiMode('text')}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                  aiMode === 'text' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText size={14} />
                <span>Notice / Circular Text</span>
              </button>
            </div>
          </div>

          {aiMode === 'url' ? (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 block">Official Scholarship Webpage Link</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="url"
                    placeholder="Paste official webpage link (e.g., https://www.daad.de/...)"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlExtract}
                  disabled={aiExtracting || !urlInput.trim()}
                  className="px-6 py-3.5 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 size={16} />
                  {aiExtracting ? 'Analyzing Page...' : 'Extract Data'}
                </button>
              </div>
              <p className="text-xs text-slate-500">AI will crawl the link and parse requirements, CGPA, funding, and deadline information.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 block">Scholarship Notice / Circular Content</label>
              <textarea
                rows={5}
                placeholder="Paste scholarship circular text, requirements, eligibility criteria, or raw notice here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleTextExtract}
                  disabled={aiExtracting || !rawText.trim()}
                  className="px-6 py-3.5 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 size={16} />
                  {aiExtracting ? 'Extracting with AI...' : 'Extract Data'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading Spinner / State */}
        {aiExtracting && (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm space-y-4 mb-8">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <h3 className="font-bold text-slate-900 text-lg animate-pulse">Analyzing Content with AI...</h3>
            <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">Extracting eligibility, CGPA, target countries, deadlines, and benefits.</p>
          </div>
        )}

        {/* Results Section */}
        {extractedData && !aiExtracting && (
          <div className="bg-white border border-teal-200 rounded-3xl p-6 sm:p-8 shadow-md space-y-8 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={24} className="text-teal-600" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Extracted Scholarship Info</h2>
                  <p className="text-xs text-slate-500">Review structured data extracted by Smart AI Auto-Fill</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
              </div>
            </div>

            {/* Extracted Details Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Scholarship Title</span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.title || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Provider / Organization</span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.provider || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Globe size={12} /> Country
                </span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.country || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Award size={12} /> Benefits / Amount
                </span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.amount || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <GraduationCap size={12} /> Study Level
                </span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.level || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Briefcase size={12} /> Field of Study
                </span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.field || 'N/A'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Min CGPA</span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.min_cgpa || 'None specified'}</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Calendar size={12} /> Deadline
                </span>
                <p className="font-bold text-slate-900 text-sm">{extractedData.deadline || 'Ongoing / Unspecified'}</p>
              </div>
            </div>

            {extractedData.description && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Description Summary</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{extractedData.description}</p>
              </div>
            )}

            {extractedData.eligibility && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400">Eligibility Criteria</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{extractedData.eligibility}</p>
              </div>
            )}

            {extractedData.official_link && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                  <LinkIcon size={12} /> Official Link
                </span>
                <a
                  href={extractedData.official_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary font-bold hover:underline break-all"
                >
                  {extractedData.official_link}
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={handleProceedToAdd}
                className="px-8 py-3.5 bg-primary text-white rounded-2xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <PlusCircle size={16} />
                Submit to Database
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}