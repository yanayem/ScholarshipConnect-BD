"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Settings,
  ShieldCheck,
  Lock,
  Globe,
  Bell,
  Database,
  ArrowLeft,
  Save,
  Server,
  Zap
} from 'lucide-react';
import Link from 'next/link';

export default function SettingsAdmin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert("System settings updated successfully!");
    }, 1500);
  };

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-10 lg:py-16">
        <Link href="/admin" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} />
          Back to Console
        </Link>

        <header className="flex items-center gap-6 mb-12">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <Settings size={32} />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Admin Settings</h1>
                <p className="text-slate-500 text-sm font-medium">Global configuration and system parameters</p>
            </div>
        </header>

        <div className="space-y-8">
            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <ShieldCheck className="text-primary" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Security & Access</h3>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                            <p className="font-bold text-slate-900">Maintenance Mode</p>
                            <p className="text-xs text-slate-500 font-medium">Restrict access to staff only during updates</p>
                        </div>
                        <button className="w-12 h-6 bg-slate-200 rounded-full relative transition-all">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                            <p className="font-bold text-slate-900">Two-Factor Authentication</p>
                            <p className="text-xs text-slate-500 font-medium">Require 2FA for all staff accounts</p>
                        </div>
                        <button className="w-12 h-6 bg-primary rounded-full relative transition-all">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </button>
                    </div>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <Server className="text-emerald-500" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">System Parameters</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Max Attachment Size (MB)</label>
                        <input type="number" defaultValue={10} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Default Scholar Points Reward</label>
                        <input type="number" defaultValue={50} className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Support Email Address</label>
                        <input type="email" defaultValue="support@scholarshipconnect.bd" className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                    </div>
                </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <Zap className="text-amber-500" size={24} />
                    <h3 className="text-xl font-bold text-slate-900">Integrations</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-blue-600">F</div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">Firebase Authentication</p>
                            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Connected</p>
                        </div>
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Configure</button>
                    </div>
                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-indigo-600">S</div>
                        <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">Stripe Payments</p>
                            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Sandbox Mode</p>
                        </div>
                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">Configure</button>
                    </div>
                </div>
            </section>

            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-50"
            >
                {saving ? "Saving Changes..." : (
                    <>
                        Save All Settings
                        <Save size={20} />
                    </>
                )}
            </button>
        </div>
      </main>
    </div>
  );
}
