"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import {
  Bell,
  Lock,
  User,
  Globe,
  Shield,
  Moon,
  ChevronRight,
  LogOut,
  Mail,
  Smartphone,
  CreditCard
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
       await apiService.logout();
       router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 text-sm font-medium">Manage your account preferences and security.</p>
        </header>

        <div className="space-y-12">
           {/* Profile Settings */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Account & Security</h3>
              <div className="border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-50">
                 {[
                   { label: 'Security Password', sub: 'Change your login credentials', icon: Lock },
                   { label: 'Push Notifications', sub: 'Manage browser alerts', icon: Bell, toggle: true },
                   { label: 'Linked Accounts', sub: 'Firebase & Social login', icon: Smartphone },
                   { label: 'Billing & Subscriptions', sub: 'Manage Pro access', icon: CreditCard, href: '/upgrade-pro' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <item.icon size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                         </div>
                      </div>
                      {item.toggle ? (
                        <button className="w-10 h-5 bg-primary rounded-full relative">
                           <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                        </button>
                      ) : (
                        <ChevronRight size={18} className="text-slate-300" />
                      )}
                   </div>
                 ))}
              </div>
           </section>

           {/* Preferences */}
           <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Preferences</h3>
              <div className="border border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-50">
                 {[
                   { label: 'Language', sub: 'English (US)', icon: Globe },
                   { label: 'Dark Mode', sub: 'Appearance settings', icon: Moon, toggle: true, val: darkMode, onToggle: () => setDarkMode(!darkMode) },
                   { label: 'Privacy Policy', sub: 'How we handle your data', icon: Shield, href: '/privacy' }
                 ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-all cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <item.icon size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-slate-900">{item.label}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.sub}</p>
                         </div>
                      </div>
                      {item.toggle ? (
                        <button
                          onClick={item.onToggle}
                          className={`w-10 h-5 rounded-full relative transition-all ${item.val ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                           <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.val ? 'right-1' : 'left-1'}`}></div>
                        </button>
                      ) : (
                        <ChevronRight size={18} className="text-slate-300" />
                      )}
                   </div>
                 ))}
              </div>
           </section>

           {/* Danger Zone */}
           <section className="pt-6 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-6 border border-red-100 bg-red-50/50 rounded-3xl text-red-600 hover:bg-red-50 transition-all group"
              >
                 <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <LogOut size={20} />
                 </div>
                 <div className="text-left">
                    <p className="text-sm font-black uppercase tracking-widest">Sign Out</p>
                    <p className="text-[10px] font-bold opacity-70">Exit your session securely</p>
                 </div>
              </button>
           </section>
        </div>
      </main>
    </div>
  );
}
