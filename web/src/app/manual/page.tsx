"use client";

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import {
  BookOpen,
  HelpCircle,
  Search,
  Cpu,
  Users,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  FileText,
  Zap,
  Bot,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Mail
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QAItem {
  q: string;
  a: string;
}

interface ManualSection {
  id: string;
  category: string;
  icon: React.ElementType;
  description: string;
  items: QAItem[];
}

const MANUAL_SECTIONS: ManualSection[] = [
  {
    id: 'start',
    category: 'Getting Started',
    icon: BookOpen,
    description: 'Account creation, profile setup, and platform basics',
    items: [
      {
        q: 'What is ScholarshipConnect BD?',
        a: 'ScholarshipConnect BD is a specialized platform built for Bangladeshi students seeking higher education abroad. It offers data-driven scholarship matching, AI-powered SOP writing assistance, document vault storage, and peer mentorship.'
      },
      {
        q: 'How do I start searching for scholarships?',
        a: 'Complete your profile details such as academic level (HSC, Bachelors, Masters, PhD), CGPA, department, and target countries. The platform automatically filters and ranks global scholarships matched to your profile.'
      },
      {
        q: 'Is ScholarshipConnect BD free to use?',
        a: 'Yes! Core features including scholarship searches, profile management, document vault, community discussions, and daily free AI generations are 100% free. Pro Membership unlocks unlimited AI tools and priority matching.'
      }
    ]
  },
  {
    id: 'profile',
    category: 'Profile & Document Vault',
    icon: FileText,
    description: 'Academic details, CGPA tracking, and document storage',
    items: [
      {
        q: 'Why is keeping my CGPA updated crucial?',
        a: 'Our Eligibility Checker uses your CGPA, IELTS, and GRE scores to calculate admission probability. Keeping these accurate ensures maximum matching precision.'
      },
      {
        q: 'What is the Document Vault?',
        a: 'The Document Vault allows you to securely store your Statement of Purpose (SOP), CV/Resume, academic transcripts, and recommendation letters for quick one-click application attachments.'
      },
      {
        q: 'What file formats and sizes are supported?',
        a: 'The Document Vault supports PDF, JPG, and PNG files up to 5MB each to ensure fast document rendering and bank-level encryption.'
      }
    ]
  },
  {
    id: 'ai',
    category: 'AI Tools & Matchmaker',
    icon: Cpu,
    description: 'SOP Generator, Eligibility Checker, and AI Assistant',
    items: [
      {
        q: 'How does the AI SOP Helper work?',
        a: 'Select any target scholarship or university, then click "AI SOP Assistant". The AI synthesizes your profile skills, academic history, and university requirements to draft a customized statement of purpose.'
      },
      {
        q: 'What are the daily AI usage limits?',
        a: 'Free accounts receive 5 AI operations per day (resetting every 24 hours). Pro members enjoy unlimited AI SOP drafting, bio generation, and eligibility checks.'
      },
      {
        q: 'How does the Scholarship Matchmaker score eligibility?',
        a: 'The Matchmaker compares your CGPA, standardized test scores (IELTS/GRE), current education level, and target destination against official university admission prerequisites.'
      }
    ]
  },
  {
    id: 'community',
    category: 'Community & Mentorship',
    icon: Users,
    description: 'Discussion forums, mentor sessions, and peer assistance',
    items: [
      {
        q: 'How do I connect with a Mentor?',
        a: 'Navigate to the Mentorship section to browse verified mentors who have successfully secured fully-funded scholarships in USA, UK, Canada, Europe, and Asia.'
      },
      {
        q: 'Can I edit or unsend messages in Community Chat?',
        a: 'Yes! Hover or long-press your sent messages to edit text or choose "Unsend" to delete them for all participants in real time.'
      },
      {
        q: 'How do ScholarPoints work?',
        a: 'You earn ScholarPoints by answering peer questions in community discussions, sharing application tips, or helping other applicants. Points can be redeemed for Pro status!'
      }
    ]
  },
  {
    id: 'pro',
    category: 'Scholar Pro & Payments',
    icon: Zap,
    description: 'Pro membership, bKash, Nagad, and points redemption',
    items: [
      {
        q: 'What are the benefits of Scholar Pro?',
        a: 'Pro members get unlimited AI SOP generation, priority scholarship matching (up to 10 top matches), early deadline alerts, and a verified gold scholar badge.'
      },
      {
        q: 'How can I pay for Scholar Pro in Bangladesh?',
        a: 'We support local payment options including bKash, Nagad, Bangla QR, and local credit/debit cards, as well as ScholarPoints redemption (200 points).'
      }
    ]
  },
  {
    id: 'help',
    category: 'Troubleshooting & Security',
    icon: HelpCircle,
    description: 'Account recovery, password reset, and technical support',
    items: [
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'Go to Settings > Account & Security to request a password reset link sent to your email, or use the "Forgot Password" link on the Login page.'
      },
      {
        q: 'What should I do if I get a connection error?',
        a: 'Ensure your internet connection is active. If the issue persists, clear your browser cache or refresh the page.'
      },
      {
        q: 'How do I contact official platform support?',
        a: 'You can chat directly with our 24/7 AI Support Bot or email our support team at support@scholarshipconnect.bd.'
      }
    ]
  }
];

export default function ManualPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    start: true,
    profile: true,
    ai: true,
    community: true,
    pro: true,
    help: true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = useMemo(() => {
    return ['all', ...MANUAL_SECTIONS.map(s => s.id)];
  }, []);

  const filteredSections = useMemo(() => {
    let result = MANUAL_SECTIONS;

    if (selectedCategory !== 'all') {
      result = result.filter(s => s.id === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.map(sec => {
        const matchingItems = sec.items.filter(
          item => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
        );
        return { ...sec, items: matchingItems };
      }).filter(sec => sec.items.length > 0);
    }

    return result;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-xs font-bold uppercase tracking-wider mb-6"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Page Banner */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm mb-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
            <BookOpen size={30} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">User Manual & Help Center</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl mx-auto mb-6">
            Find detailed answers, platform rules, and step-by-step guides on using ScholarshipConnect BD features.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user manual (e.g. SOP, CGPA, bKash, password)..."
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Topics
          </button>
          {MANUAL_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedCategory(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === sec.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <sec.icon size={15} />
              <span>{sec.category}</span>
            </button>
          ))}
        </div>

        {/* Manual Accordion Sections */}
        {filteredSections.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <HelpCircle size={40} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No results found for "{searchQuery}"</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with different keywords like SOP, CGPA, bKash, or Mentor.</p>
          </div>
        ) : (
          <div className="space-y-4 mb-12">
            {filteredSections.map((section) => {
              const Icon = section.icon;
              const isOpen = !!expandedSections[section.id];
              return (
                <div key={section.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{section.category}</h3>
                        <p className="text-xs text-slate-400 font-medium">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2.5 py-1 rounded-full border border-slate-200">
                        {section.items.length} {section.items.length === 1 ? 'Guide' : 'Guides'}
                      </span>
                      {isOpen ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100 bg-slate-50/30 divide-y divide-slate-100 p-2 sm:p-4">
                      {section.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-white rounded-xl my-1 border border-slate-200/60 space-y-2">
                          <h4 className="text-xs font-bold text-slate-900 flex items-start gap-2">
                            <Sparkles size={14} className="text-primary shrink-0 mt-0.5" />
                            <span>{item.q}</span>
                          </h4>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed pl-6">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Support Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <Bot size={36} className="text-primary mx-auto" />
            <h3 className="text-xl sm:text-2xl font-bold">Still have questions or facing technical issues?</h3>
            <p className="text-slate-400 text-xs font-medium">
              Our 24/7 AI Support Bot and community members are ready to assist with your specific application questions.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/ai-tools/support-bot"
                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
              >
                <Bot size={16} />
                <span>Chat with AI Support Bot</span>
              </Link>
              <Link
                href="/community"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <MessageSquare size={16} />
                <span>Ask Community</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
