"use client";

import React from 'react';
import Header from '@/components/Header';
import { FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500 font-medium">Agreement for users of ScholarshipConnectBD</p>
        </header>

        <div className="space-y-12 text-slate-700 leading-relaxed">
           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <CheckCircle className="text-primary" size={24} />
                 1. Acceptance of Terms
              </h2>
              <p className="text-sm">
                By accessing or using ScholarshipConnectBD, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <FileText className="text-primary" size={24} />
                 2. User Responsibilities
              </h2>
              <p className="text-sm">
                You are responsible for maintaining the confidentiality of your account and password. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate.
              </p>
           </section>

           <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                 <AlertCircle className="text-primary" size={24} />
                 3. Limitation of Liability
              </h2>
              <p className="text-sm">
                ScholarshipConnectBD provides information about scholarships but does not guarantee the success of any application. We are not responsible for the accuracy of scholarship information provided by third-party institutions.
              </p>
           </section>

           <div className="border border-slate-200 rounded-3xl p-8 text-center space-y-4">
              <h3 className="font-bold text-slate-900">Need further clarification?</h3>
              <p className="text-sm text-slate-500">Our team is here to help you understand your rights and responsibilities.</p>
              <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all text-sm shadow-lg shadow-primary/20">
                 Contact Legal Team
              </button>
           </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-100 bg-white mt-20 text-center">
         <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">© 2026 ScholarshipConnectBD</p>
      </footer>
    </div>
  );
}
