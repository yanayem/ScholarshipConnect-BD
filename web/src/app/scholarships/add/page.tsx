"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Globe,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  ImageIcon,
  Sparkles,
  Wand2,
  Globe2,
  FileText
} from 'lucide-react';

export default function AddScholarshipPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiMode, setAiMode] = useState<'url' | 'text'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isOngoing, setIsOngoing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    country: '',
    amount: '',
    category: '',
    level: '',
    field: '',
    min_cgpa: '',
    deadline: '',
    description: '',
    eligibility: '',
    official_link: '',
    image_url: '',
  });

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  // 1-Click URL Scraping & AI Extraction
  const handleUrlExtract = async () => {
    if (!urlInput.trim()) {
      alert('Please enter a valid official scholarship webpage URL.');
      return;
    }
    setAiExtracting(true);
    try {
      const res = await apiService.extractScholarshipFromUrl(urlInput.trim());
      if (res.ok && res.data?.scholarship) {
        const s = res.data.scholarship;
        setFormData(prev => ({
          ...prev,
          title: s.title || prev.title,
          provider: s.provider || prev.provider,
          country: s.country || prev.country,
          amount: s.amount || prev.amount,
          category: s.category || prev.category,
          level: s.level || prev.level,
          field: s.field || prev.field,
          min_cgpa: s.min_cgpa ? String(s.min_cgpa) : prev.min_cgpa,
          deadline: s.deadline || prev.deadline,
          description: s.description || prev.description,
          eligibility: s.eligibility || prev.eligibility,
          official_link: s.official_link || urlInput.trim(),
        }));
        if (s.deadline) setIsOngoing(false);
        alert('Webpage analyzed & form auto-filled successfully! Review the details below.');
      } else {
        alert(res.data?.error || 'Could not extract scholarship info from this webpage. Please try raw text extract.');
      }
    } catch (err) {
      alert('Network error during webpage scraping.');
    } finally {
      setAiExtracting(false);
    }
  };

  // Text/Circular Auto-Fill
  const handleAiExtract = async () => {
    if (!rawText.trim()) {
      alert('Please paste the scholarship circular text or details.');
      return;
    }
    setAiExtracting(true);
    try {
      const res = await apiService.aiExtractScholarship(rawText);
      if (res.ok && res.data?.scholarship) {
        const s = res.data.scholarship;
        setFormData(prev => ({
          ...prev,
          title: s.title || prev.title,
          provider: s.provider || prev.provider,
          country: s.country || prev.country,
          amount: s.amount || prev.amount,
          category: s.category || prev.category,
          level: s.level || prev.level,
          field: s.field || prev.field,
          min_cgpa: s.min_cgpa ? String(s.min_cgpa) : prev.min_cgpa,
          deadline: s.deadline || prev.deadline,
          description: s.description || prev.description,
          eligibility: s.eligibility || prev.eligibility,
          official_link: s.official_link || prev.official_link,
          image_url: s.image_url || prev.image_url,
        }));
        if (s.deadline) setIsOngoing(false);
        alert('Scholarship details extracted & auto-filled by AI! You can review or edit the fields below.');
      } else {
        alert(res.data?.error || 'AI extraction failed. Please try again.');
      }
    } catch (err) {
      alert('Network error occurred during AI extraction.');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please enter a scholarship title.');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        let value = (formData as any)[key];

        // If it's ongoing, don't send the deadline field at all
        if (key === 'deadline' && isOngoing) return;

        if (value !== '' && value !== null) data.append(key, value);
      });

      if (selectedImage) {
        data.append('image', selectedImage);
      }

      const res = await apiService.addScholarship(data);
      if (res.ok) {
        alert('Scholarship submitted for admin review! It will appear once approved by an admin.');
        router.push('/scholarships');
      } else {
        alert('Failed to submit scholarship. Please check all fields.');
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-12 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <header className="mb-8">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Submit Scholarship</h1>
            <p className="text-slate-500 text-sm font-medium">Add a new opportunity manually, paste a website link, or auto-fill with AI.</p>
          </header>

          {/* Smart AI Auto-Fill Container (1-Click URL + Raw Notice) */}
          <div className="mb-10 bg-gradient-to-r from-teal-50/80 via-emerald-50/80 to-cyan-50/80 border border-teal-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary text-white rounded-xl shadow-xs">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Smart AI Auto-Fill</h3>
                  <p className="text-xs text-slate-600 font-medium">Extract details from an official website link or paste circular text</p>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 bg-white/80 border border-teal-200/80 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAiMode('url')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    aiMode === 'url' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe2 size={13} />
                  <span>Website URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAiMode('text')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                    aiMode === 'text' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText size={13} />
                  <span>Notice Text</span>
                </button>
              </div>
            </div>

            {aiMode === 'url' ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Globe2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="url"
                      placeholder="Paste official scholarship webpage link (e.g. https://www.daad.de/...)"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleUrlExtract}
                    disabled={aiExtracting || !urlInput.trim()}
                    className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Wand2 size={14} />
                    {aiExtracting ? 'Analyzing Page...' : '1-Click Auto-Fill'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">AI will scrape the official page, parse requirements, eligibility, deadlines, and populate the form.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={3}
                  placeholder="Paste scholarship circular text, notice details, or official post here..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3.5 bg-white border border-teal-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAiExtract}
                    disabled={aiExtracting || !rawText.trim()}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Wand2 size={14} />
                    {aiExtracting ? 'Extracting with AI...' : 'Auto-Fill Form'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Basic Info */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Basic Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Scholarship Title *</label>
                     <input
                       type="text"
                       name="title"
                       required
                       value={formData.title}
                       onChange={handleInputChange}
                       placeholder="e.g. MEXT Japanese Government Scholarship"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Provider / Organization</label>
                     <input
                       type="text"
                       name="provider"
                       value={formData.provider}
                       onChange={handleInputChange}
                       placeholder="e.g. Ministry of Education, Japan"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Country / Region</label>
                     <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          placeholder="e.g. Japan, Germany, USA"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Funding Amount / Benefits</label>
                     <input
                       type="text"
                       name="amount"
                       value={formData.amount}
                       onChange={handleInputChange}
                       placeholder="e.g. Fully Funded, 100% Tuition Waiver"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>
               </div>
            </div>

            {/* Academic Classification */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Academic Classification</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Study Level</label>
                     <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          name="level"
                          value={formData.level}
                          onChange={handleInputChange}
                          placeholder="e.g. Bachelors, Masters, PhD"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Field of Study</label>
                     <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          name="field"
                          value={formData.field}
                          onChange={handleInputChange}
                          placeholder="e.g. Engineering, Arts, Any"
                          className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Category</label>
                     <input
                       type="text"
                       name="category"
                       value={formData.category}
                       onChange={handleInputChange}
                       placeholder="e.g. Government, University"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>
               </div>
            </div>

            {/* Criteria & Deadlines */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Criteria & Deadlines</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 ml-1">Minimum CGPA</label>
                     <input
                       type="text"
                       name="min_cgpa"
                       value={formData.min_cgpa}
                       onChange={handleInputChange}
                       placeholder="e.g. 3.00 (Leave empty if none)"
                       className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>

                  <div className="space-y-2">
                     <div className="flex justify-between items-center ml-1">
                        <label className="text-xs font-bold text-slate-700">Application Deadline</label>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-primary">
                           <input
                             type="checkbox"
                             checked={isOngoing}
                             onChange={(e) => setIsOngoing(e.target.checked)}
                             className="rounded text-primary focus:ring-primary"
                           />
                           Ongoing
                        </label>
                     </div>
                     <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="date"
                          name="deadline"
                          disabled={isOngoing}
                          value={isOngoing ? '' : formData.deadline}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isOngoing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Detailed Info */}
            <div className="space-y-6">
               <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Detailed Information</h3>
               
               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Description</label>
                  <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Provide a comprehensive summary of the scholarship..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Eligibility Criteria</label>
                  <textarea
                    name="eligibility"
                    rows={4}
                    value={formData.eligibility}
                    onChange={handleInputChange}
                    placeholder="List specific eligibility requirements..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Official Circular / Application Link</label>
                  <div className="relative">
                     <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input
                       type="url"
                       name="official_link"
                       value={formData.official_link}
                       onChange={handleInputChange}
                       placeholder="https://..."
                       className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 ml-1">Banner Image (Optional)</label>
                  <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors">
                        <ImageIcon size={16} />
                        Choose File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                     </label>
                     {previewUrl && (
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200">
                           <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                     )}
                  </div>
               </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
               <button
                 type="submit"
                 disabled={loading}
                 className="px-8 py-3.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
               >
                  {loading ? 'Submitting...' : 'Submit for Review'}
               </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
