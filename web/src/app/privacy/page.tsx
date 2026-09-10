"use client";

import React from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { Shield, Lock, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft size={16} />
          Go Back
        </button>

        <header className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500 font-medium">Last updated: June 20, 2024</p>
        </header>

        <div className="space-y-12 text-slate-700 leading-relaxed">
           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Shield className="text-primary" size={24} />
                 1. Information We Collect
              </h2>
              <p className="text-sm">
                We collect information you provide directly to us when you create an account, fill out your profile, or use our AI tools. This includes your name, email address, academic history, and any documents you upload to your Vault.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Eye className="text-primary" size={24} />
                 2. How We Use Information
              </h2>
              <p className="text-sm">
                We use the information to provide, maintain, and improve our services, including our ScholarAI matching algorithms. We do not sell your personal data to third parties. Your data is used solely to help you find and apply for scholarships.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <Lock className="text-primary" size={24} />
                 3. Data Security
              </h2>
              <p className="text-sm">
                We implement industry-standard security measures, including end-to-end encryption for document storage and secure authentication via Firebase. However, no method of transmission over the Internet is 100% secure.
              </p>
           </section>

           <section className="p-8 bg-slate-50 border border-slate-100 rounded-3xl">
              <h3 className="font-bold text-slate-900 mb-2">Questions about your data?</h3>
              <p className="text-sm text-slate-500 mb-6">If you have any questions about this Privacy Policy, please contact us at privacy@scholarshipconnectbd.com</p>
              <Link href="/ai-tools/support-bot" className="text-primary font-bold text-sm hover:underline">Chat with Support →</Link>
           </section>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-100 bg-white mt-20 text-center">
         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2026 ScholarshipConnectBD</p>
      </footer>
    </div>
  );
}
