"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { apiService } from '@/lib/api';
import { Scholarship } from '@/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, MapPin, ArrowRight, GraduationCap, Plus, Sparkles, AlertCircle, Loader2, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import Header from '@/components/Header';

function ScholarshipListContent() {
  const searchParams = useSearchParams();
  const countryParam = searchParams.get('country') || '';

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryParam);
  const [activeCategory, setActiveCategory] = useState('All');
  const [minCgpa, setMinCgpa] = useState('');
  const [filterError, setFilterError] = useState('');

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Matchmaker States
  const [matchScores, setMatchScores] = useState<Record<number, number>>({});
  const [showMatchScores, setShowMatchScores] = useState(false);
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  // Module 4: Category Filter options
  const categories = ['All', 'Undergraduate', 'Postgraduate', 'Ph.D.', 'Postdoc'];

  useEffect(() => {
    setSelectedCountry(countryParam);
    loadScholarships(search, activeCategory, countryParam, minCgpa);
  }, [countryParam]);

  const loadScholarships = async (
    query = search,
    category = activeCategory,
    country = selectedCountry,
    cgpa = minCgpa
  ) => {
    setLoading(true);
    setFilterError('');

    let params = query ? `search=${encodeURIComponent(query)}` : '';
    if (category !== 'All') {
      params += (params ? '&' : '') + `category=${encodeURIComponent(category)}`;
    }
    if (country && country.toLowerCase() !== 'all') {
      params += (params ? '&' : '') + `country=${encodeURIComponent(country)}`;
    }
    if (cgpa !== '') {
      params += (params ? '&' : '') + `min_cgpa=${encodeURIComponent(cgpa)}`;
    }

    try {
      const res = await apiService.getScholarships(params);
      if (res.ok) {
        const all = (res.data as any)?.results ? (res.data as any).results : (res.data as unknown as Scholarship[]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const active = (Array.isArray(all) ? all : []).filter(s => !s.deadline || new Date(s.deadline) >= today);
        setScholarships(active);
      } else {
        if (res.status === 400 && res.data?.min_cgpa) {
          setFilterError('Min CGPA must be a valid number between 0.00 and 4.00.');
        } else {
          setFilterError(res.data?.error || res.data?.message || 'Failed to load scholarships.');
        }
        setScholarships([]);
      }
    } catch (err: any) {
      setFilterError('Network error while searching scholarships.');
      setScholarships([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    loadScholarships(search, cat, selectedCountry, minCgpa);
  };

  const handleClearCountry = () => {
    setSelectedCountry('');
    loadScholarships(search, activeCategory, '', minCgpa);
  };

  const handleApplyFilters = () => {
    loadScholarships(search, activeCategory, selectedCountry, minCgpa);
    setSidebarOpen(false); // Close on mobile after applying
  };

  const handleClearAll = () => {
    setSearch('');
    setMinCgpa('');
    setSelectedCountry('');
    setFilterError('');
    setActiveCategory('All');
    loadScholarships('', 'All', '', '');
  };

  // Count active filters for the badge
  const activeFilterCount = [
    search,
    activeCategory !== 'All' ? activeCategory : '',
    selectedCountry,
    minCgpa,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-12">
        {/* Page Header */}
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-slate-900 mb-1">Scholarships</h1>
            <p className="text-slate-500 text-sm font-medium">Find and apply for verified international opportunities.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Mobile filter toggle button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden bg-white text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-slate-200 hover:border-primary/30 transition-all flex items-center gap-2 shadow-sm"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <Link href="/scholarships/add" className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200">
               <Plus size={16} />
               Add Scholarship
            </Link>
          </div>
        </header>

        {/* Incomplete Profile Alert Banner */}
        {profileIncomplete && (
          <div className="mb-6 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <AlertCircle size={22} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-900">Your profile is incomplete</h4>
                <p className="text-xs text-amber-700 mt-0.5">Please update your CGPA, Major, and Target Countries to view AI Match Scores.</p>
              </div>
            </div>
            <Link href="/profile/edit" className="px-5 py-2.5 bg-amber-800 text-white rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap hover:bg-amber-900 transition-colors shadow-sm">
              Complete Profile
            </Link>
          </div>
        )}

        {/* Two-column layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* ============ SIDEBAR FILTERS ============ */}
          {/* Mobile overlay backdrop */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:translate-x-0
              fixed lg:static
              top-0 left-0
              h-full lg:h-auto
              w-80 lg:w-72
              z-50 lg:z-auto
              bg-white lg:bg-white
              border-r lg:border
              border-slate-200
              lg:rounded-2xl
              p-6 lg:p-5
              overflow-y-auto
              transition-transform duration-300 ease-in-out
              lg:transition-none
              flex-shrink-0
              shadow-xl lg:shadow-sm
              lg:sticky lg:top-6 lg:self-start
            `}
          >
            {/* Sidebar header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-primary" />
                Filters
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Search Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="e.g., DAAD, Germany..."
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Category
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Min CGPA */}
            <div className="mb-5">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Min CGPA
              </label>
              <input
                type="text"
                placeholder="0.00 - 4.00"
                className="w-full px-3 py-2.5 border border-slate-200 bg-slate-50/50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                value={minCgpa}
                onChange={(e) => setMinCgpa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyFilters()}
              />
            </div>

            {/* Country Filter */}
            <div className="mb-6">
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Country
              </label>
              {selectedCountry ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-teal-50 text-teal-800 border border-teal-200 rounded-xl text-sm font-bold">
                  <MapPin size={14} className="text-teal-600" />
                  {selectedCountry}
                  <button
                    onClick={handleClearCountry}
                    className="hover:bg-teal-200 p-0.5 rounded-full transition-colors ml-1"
                    title="Remove country filter"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No country selected. Use country links from home page.</p>
              )}
            </div>

            {/* Filter Error */}
            {filterError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-600 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{filterError}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleApplyFilters}
                className="w-full py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearAll}
                className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={13} />
                Clear All
              </button>
            </div>
          </aside>

          {/* ============ MAIN SCHOLARSHIP LIST ============ */}
          <div className="flex-1 min-w-0">
            {/* Active filter tags summary */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Active:</span>
                {search && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold">
                    &ldquo;{search}&rdquo;
                    <button onClick={() => { setSearch(''); loadScholarships('', activeCategory, selectedCountry, minCgpa); }} className="hover:bg-blue-200 p-0.5 rounded-full ml-0.5"><X size={11} /></button>
                  </span>
                )}
                {activeCategory !== 'All' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[11px] font-bold">
                    {activeCategory}
                    <button onClick={() => handleCategoryChange('All')} className="hover:bg-purple-200 p-0.5 rounded-full ml-0.5"><X size={11} /></button>
                  </span>
                )}
                {selectedCountry && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-[11px] font-bold">
                    <MapPin size={11} /> {selectedCountry}
                    <button onClick={handleClearCountry} className="hover:bg-teal-200 p-0.5 rounded-full ml-0.5"><X size={11} /></button>
                  </span>
                )}
                {minCgpa && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg text-[11px] font-bold">
                    CGPA ≥ {minCgpa}
                    <button onClick={() => { setMinCgpa(''); loadScholarships(search, activeCategory, selectedCountry, ''); }} className="hover:bg-orange-200 p-0.5 rounded-full ml-0.5"><X size={11} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            {!loading && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                {scholarships.length} scholarship{scholarships.length !== 1 ? 's' : ''} found
              </p>
            )}

            {/* Scholarship Cards */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 border border-slate-100 rounded-2xl animate-pulse bg-slate-50/30"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {scholarships.length > 0 ? scholarships.map((item) => {
                  const score = matchScores[item.id];
                  return (
                    <Link
                      key={item.id}
                      href={`/scholarships/${item.id}`}
                      className="group border border-slate-100/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-primary/30 transition-all bg-white hover:bg-slate-50/50 shadow-sm hover:shadow-md w-full max-w-full overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                           <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-base sm:text-lg truncate">{item.title}</h4>
                           {item.amount && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-emerald-100">{item.amount}</span>}

                           {/* AI Match Score Badge */}
                           {showMatchScores && score !== undefined && (
                             <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl border uppercase tracking-wider flex items-center gap-1 shadow-sm ${
                               score >= 70
                                 ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                 : score >= 40
                                 ? 'bg-amber-50 text-amber-700 border-amber-200'
                                 : 'bg-slate-100 text-slate-600 border-slate-200'
                             }`}>
                               <Sparkles size={12} />
                               {score}% Match
                             </span>
                           )}

                           {item.is_applied && (
                             <span className="text-[9px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg font-black uppercase tracking-widest border border-blue-100 flex items-center gap-0.5">
                               Applied
                             </span>
                           )}
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-slate-500 text-xs font-bold uppercase tracking-tight opacity-70">
                          <span className="flex items-center gap-1.5"><MapPin size={14} className="text-primary" /> {item.country}</span>
                          <span className="flex items-center gap-1.5"><GraduationCap size={14} className="text-primary" /> {item.level}</span>
                          <span className="flex items-center gap-1.5 text-slate-400">Deadline: {item.deadline || 'Ongoing'}</span>
                        </div>
                      </div>
                      <div className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all self-end sm:self-center">
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  );
                }) : (
                  <div className="text-center py-24 border border-slate-200 rounded-2xl border-dashed bg-slate-50/30">
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No scholarships found</p>
                     <button
                       onClick={handleClearAll}
                       className="mt-6 text-primary font-black text-xs uppercase tracking-[0.2em] hover:underline"
                     >
                       Clear Filters
                     </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="py-12 border-t border-slate-200 mb-20 lg:mb-0">
        <div className="max-w-6xl mx-auto px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">© 2026 ScholarshipConnectBD</p>
           <div className="flex gap-10">
             <Link href="/privacy" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Privacy</Link>
             <Link href="/terms" className="text-slate-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Terms</Link>
           </div>
        </div>
      </footer>
    </div>
  );
}

export default function ScholarshipList() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      </div>
    }>
      <ScholarshipListContent />
    </Suspense>
  );
}
