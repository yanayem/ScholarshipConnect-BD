"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Phone,
  BookOpen,
  GraduationCap,
  MapPin,
  Globe,
  Award,
  Sparkles,
  Link as LinkIcon,
  Calendar,
  Share2,
  CheckCircle2,
  Bot,
  Mail,
  Code,
  Building,
  Brain
} from 'lucide-react';

interface AutocompleteInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  icon?: React.ReactNode;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  multiline = false,
  rows = 1,
  icon
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (val: string) => {
    onChange(name, val);

    const items = val.split(',');
    const query = items[items.length - 1].trim();

    if (query.length > 0) {
      setLoading(true);
      apiService.getAutocomplete(type, query).then(res => {
        if (res.ok && Array.isArray(res.data)) {
          setSuggestions(res.data);
          setShowDropdown(res.data.length > 0);
        } else {
          setSuggestions([]);
          setShowDropdown(false);
        }
      }).catch(() => {
        setSuggestions([]);
        setShowDropdown(false);
      }).finally(() => {
        setLoading(false);
      });
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    const isMulti = ['skills', 'country', 'interests'].includes(type) || value.includes(',');
    if (isMulti && value.includes(',')) {
      const items = value.split(',').map(s => s.trim());
      items[items.length - 1] = suggestion;
      onChange(name, items.join(', ') + ', ');
    } else {
      onChange(name, suggestion);
    }
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {multiline ? (
        <textarea
          name={name}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium resize-none text-foreground"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        />
      ) : (
        <input
          type="text"
          name={name}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-foreground"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        />
      )}

      {showDropdown && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto py-1">
          {loading ? (
            <div className="px-4 py-2 text-xs text-text-secondary font-medium flex items-center gap-2">
              <Loader2 size={12} className="animate-spin text-primary" /> Fetching suggestions...
            </div>
          ) : (
            suggestions.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="w-full text-left px-4 py-2.5 hover:bg-primary-light text-xs font-bold text-foreground transition-colors flex items-center justify-between border-b border-slate-50 last:border-none"
              >
                <span>{item}</span>
                <Sparkles size={12} className="text-primary opacity-60" />
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const SECTIONS = [
  { key: 'personal', title: 'Personal', icon: User },
  { key: 'academic', title: 'Academic', icon: GraduationCap },
  { key: 'skills', title: 'Skills & Goals', icon: Sparkles },
  { key: 'preferences', title: 'Preferences', icon: Globe },
  { key: 'social', title: 'Social Links', icon: Share2 },
];

export default function EditProfilePage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    bio: '',
    university: '',
    department: '',
    cgpa: '',
    academic_level: 'Bachelors',
    current_location: 'Bangladesh',
    ielts_score: '',
    gre_score: '',
    skills: '',
    achievements: '',
    major_course: '',
    target_countries: '',
    research_interests: '',
    linkedin_url: '',
    github_url: '',
    facebook_url: '',
    google_scholar_url: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      const p = user as any;
      setFormData({
        username: p.username || '',
        full_name: user.full_name || p.full_name || '',
        email: user.email || p.email || '',
        phone_number: p.phone_number || p.phone || '',
        date_of_birth: p.date_of_birth || '',
        bio: p.bio || '',
        university: p.university || '',
        department: p.department || '',
        cgpa: p.cgpa !== null && p.cgpa !== undefined ? p.cgpa.toString() : '',
        academic_level: p.academic_level || p.current_level || 'Bachelors',
        current_location: p.current_location || 'Bangladesh',
        ielts_score: p.ielts_score !== null && p.ielts_score !== undefined ? p.ielts_score.toString() : '',
        gre_score: p.gre_score !== null && p.gre_score !== undefined ? p.gre_score.toString() : '',
        skills: p.skills || '',
        achievements: p.achievements || '',
        major_course: p.major_course || '',
        target_countries: p.target_countries || '',
        research_interests: p.research_interests || '',
        linkedin_url: p.linkedin_url || '',
        github_url: p.github_url || '',
        facebook_url: p.facebook_url || '',
        google_scholar_url: p.google_scholar_url || '',
      });
    }
  }, [user, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateCompletion = () => {
    const values = Object.values(formData);
    if (!values.length) return 0;
    const filled = values.filter(v => v && v.toString().trim() !== '').length;
    return Math.round((filled / values.length) * 100);
  };

  const handleAIBio = async () => {
    setGeneratingBio(true);
    try {
      const res = await apiService.aiGenerateBio();
      if (res.ok && res.data?.bio) {
        setFormData(prev => ({ ...prev, bio: res.data.bio }));
        setMessage({ type: 'success', text: 'AI generated crisp profile bio!' });
      } else {
        setMessage({ type: 'error', text: 'AI Bio generation failed. Try again.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'AI service unavailable.' });
    } finally {
      setGeneratingBio(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = { ...formData };
      if (payload.date_of_birth && payload.date_of_birth.trim() === '') {
        (payload as any).date_of_birth = null;
      }
      const res = await apiService.updateProfile(payload);
      if (res.ok) {
        await refreshProfile();
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => router.push('/profile'), 1200);
      } else {
        let errStr = res.data?.message || res.data?.error;
        if (!errStr && res.data && typeof res.data === 'object') {
          const firstKey = Object.keys(res.data)[0];
          if (firstKey) {
            const val = res.data[firstKey];
            const detail = Array.isArray(val) ? val[0] : val;
            errStr = `${firstKey.replace(/_/g, ' ')}: ${detail}`;
          }
        }
        setMessage({ type: 'error', text: errStr || 'Failed to update profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected connection error occurred.' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const completion = calculateCompletion();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6 font-bold text-xs uppercase tracking-widest"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>

        {/* Readiness Completion Banner */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-primary"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 relative z-10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary block mb-1">
                Scholar Profile Readiness
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground">Edit Your Profile</h1>
            </div>
            <div className="text-right shrink-0">
              <span className="text-3xl sm:text-4xl font-black text-primary">{completion}%</span>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 mb-3 relative z-10">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="text-xs text-text-secondary font-medium italic relative z-10">
            {completion < 50
              ? 'Complete your profile to unlock high accuracy scholarship matching!'
              : completion < 80
              ? 'High accuracy matching is almost ready!'
              : 'Your profile is elite! Ready for automatic applications.'}
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm mb-8 scrollbar-none">
          {SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.key;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setActiveSection(sec.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-secondary hover:bg-slate-100 hover:text-foreground'
                }`}
              >
                <Icon size={16} />
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Form Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-bold border flex items-center justify-between ${
                message.type === 'success' ? 'bg-primary-light text-primary border-primary/20' : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                <span>{message.text}</span>
                {message.type === 'success' && <CheckCircle2 size={18} className="text-primary" />}
              </div>
            )}

            {/* SECTION 1: Personal Information */}
            {activeSection === 'personal' && (
              <section className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <User size={18} /> Personal Details
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">Basic contact and identity parameters.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <User size={14} className="text-primary" /> Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      required
                      placeholder="e.g. jondoe"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <User size={14} className="text-primary" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.full_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Mail size={14} className="text-primary" /> Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="yourname@example.com"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Phone size={14} className="text-primary" /> Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone_number"
                      placeholder="e.g. +8801712345678"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.phone_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Calendar size={14} className="text-primary" /> Date of Birth
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary" /> Location (City)
                    </label>
                    <input
                      type="text"
                      name="current_location"
                      placeholder="e.g. Dhaka, Bangladesh"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.current_location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                        <Bot size={14} className="text-primary" /> Short Bio
                      </label>
                      <button
                        type="button"
                        onClick={handleAIBio}
                        disabled={generatingBio}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-light text-primary hover:bg-primary/20 rounded-lg text-xs font-bold transition-all border border-primary/20 disabled:opacity-50"
                      >
                        {generatingBio ? (
                          <>
                            <Loader2 size={12} className="animate-spin text-primary" />
                            AI Writing...
                          </>
                        ) : (
                          <>
                            <Sparkles size={12} className="text-primary" />
                            AI Write
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      name="bio"
                      rows={4}
                      placeholder="Briefly describe your academic background, research interests, and career goals."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none text-foreground"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 2: Academic Background */}
            {activeSection === 'academic' && (
              <section className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <GraduationCap size={18} /> Academic History & Scores
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">Education details for threshold and GPA evaluation.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <AutocompleteInput
                    label="University / Institution"
                    name="university"
                    value={formData.university}
                    onChange={handleFieldChange}
                    type="university"
                    placeholder="Search or enter institution name"
                    icon={<Building size={14} className="text-primary" />}
                  />

                  <AutocompleteInput
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleFieldChange}
                    type="department"
                    placeholder="e.g. Computer Science & Engineering"
                    icon={<BookOpen size={14} className="text-primary" />}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-primary" /> Academic Degree Level
                    </label>
                    <select
                      name="academic_level"
                      value={formData.academic_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                    >
                      <option value="HSC">HSC / A-Level / High School</option>
                      <option value="Bachelors">Bachelors (Undergraduate)</option>
                      <option value="Masters">Masters (Graduate)</option>
                      <option value="PhD">PhD (Doctorate)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Award size={14} className="text-primary" /> Current CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      name="cgpa"
                      placeholder="e.g. 3.85"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.cgpa}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Award size={14} className="text-primary" /> IELTS Score
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="9.0"
                      name="ielts_score"
                      placeholder="e.g. 7.5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.ielts_score}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Award size={14} className="text-primary" /> GRE Score
                    </label>
                    <input
                      type="number"
                      name="gre_score"
                      placeholder="e.g. 320"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-foreground"
                      value={formData.gre_score}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 3: Skills & Achievements */}
            {activeSection === 'skills' && (
              <section className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Sparkles size={18} /> Skills & Achievements
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">Skills and honors that highlight your profile capability.</p>
                </div>

                <div className="space-y-6">
                  <AutocompleteInput
                    label="Skills (comma separated)"
                    name="skills"
                    value={formData.skills}
                    onChange={handleFieldChange}
                    type="skills"
                    placeholder="e.g. Python, Public Speaking, Academic Writing, Machine Learning"
                    multiline
                    rows={2}
                    icon={<Code size={14} className="text-primary" />}
                  />

                  <AutocompleteInput
                    label="Major / Course Program"
                    name="major_course"
                    value={formData.major_course}
                    onChange={handleFieldChange}
                    type="field"
                    placeholder="e.g. Computer Science, Software Engineering"
                    icon={<GraduationCap size={14} className="text-primary" />}
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Award size={14} className="text-primary" /> Key Achievements & Publications
                    </label>
                    <textarea
                      name="achievements"
                      rows={4}
                      placeholder="List awards, research papers, Olympiad prizes, or leadership roles."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium resize-none text-foreground"
                      value={formData.achievements}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 4: Preferences */}
            {activeSection === 'preferences' && (
              <section className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Globe size={18} /> Matchmaker Preferences
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">Configure target destinations and study domains.</p>
                </div>

                <div className="space-y-6">
                  <AutocompleteInput
                    label="Target Countries (comma separated)"
                    name="target_countries"
                    value={formData.target_countries}
                    onChange={handleFieldChange}
                    type="country"
                    placeholder="e.g. USA, Canada, Germany, UK, Australia"
                    multiline
                    rows={2}
                    icon={<Globe size={14} className="text-primary" />}
                  />

                  <AutocompleteInput
                    label="Research Interests / Sub-fields"
                    name="research_interests"
                    value={formData.research_interests}
                    onChange={handleFieldChange}
                    type="interests"
                    placeholder="e.g. Artificial Intelligence, Renewable Energy, Robotics, Public Health"
                    multiline
                    rows={3}
                    icon={<Brain size={14} className="text-primary" />}
                  />
                </div>
              </section>
            )}

            {/* SECTION 5: Social Links */}
            {activeSection === 'social' && (
              <section className="space-y-6 animate-fadeIn">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                    <Share2 size={18} /> Social & Portfolio Links
                  </h3>
                  <p className="text-xs text-text-secondary font-medium mt-1">Provide external portfolio and citation handles.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <LinkIcon size={14} className="text-primary" /> LinkedIn URL
                    </label>
                    <input
                      type="url"
                      name="linkedin_url"
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-foreground"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Code size={14} className="text-primary" /> GitHub URL
                    </label>
                    <input
                      type="url"
                      name="github_url"
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-foreground"
                      value={formData.github_url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <Share2 size={14} className="text-primary" /> Facebook URL
                    </label>
                    <input
                      type="url"
                      name="facebook_url"
                      placeholder="https://facebook.com/username"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-foreground"
                      value={formData.facebook_url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-secondary uppercase ml-1 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-primary" /> Google Scholar URL
                    </label>
                    <input
                      type="url"
                      name="google_scholar_url"
                      placeholder="https://scholar.google.com/citations?user=..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium text-foreground"
                      value={formData.google_scholar_url}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Bottom Actions Bar */}
            <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Save All Changes
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="px-8 py-4 bg-slate-100 text-text-secondary hover:bg-slate-200 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
