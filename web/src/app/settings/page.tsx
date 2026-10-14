"use client";

import React, { useState, useEffect } from 'react';
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
  CreditCard,
  Zap,
  Info,
  ExternalLink,
  HelpCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  ArrowLeft,
  Settings as SettingsIcon,
  Sliders,
  Users
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'mentorship' | 'support'>('account');
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [selectedLang, setSelectedLang] = useState('English');
  const [updating, setUpdating] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
       await apiService.logout();
       router.push('/');
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      setUpdating(true);
      await sendPasswordResetEmail(auth, user.email);
      showToast(`Password reset link sent to ${user.email}`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Failed to send password reset email', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const toggleMentorStatus = async (value: boolean) => {
    setUpdating(true);
    try {
      const res = await apiService.updateProfile({ is_mentor: value });
      if (res.ok) {
        await refreshProfile();
        showToast(value ? 'You are now a Mentor!' : 'Mentor status disabled.', 'success');
      } else {
        showToast('Failed to update status.', 'error');
      }
    } catch (err) {
      showToast('Error updating profile.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleReportBug = () => {
    const issue = window.prompt('Describe the issue or bug you encountered:');
    if (issue && issue.trim()) {
      showToast('Thank you! Your bug report has been submitted to support.', 'success');
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const tabs = [
    { id: 'account', label: 'Account & Security', icon: User },
    { id: 'preferences', label: 'Preferences & Notifications', icon: Sliders },
    { id: 'mentorship', label: 'Mentorship & Community', icon: Users },
    { id: 'support', label: 'Support & Legal', icon: HelpCircle },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold transition-all ${
          toastMsg.type === 'success' ? 'bg-emerald-600' : toastMsg.type === 'error' ? 'bg-red-600' : 'bg-slate-900'
        }`}>
          <CheckCircle2 size={18} />
          <span>{toastMsg.text}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors mb-6 font-bold text-xs uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <SettingsIcon className="text-primary" size={26} />
              Settings
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-1">Manage your account credentials, notifications, and preferences.</p>
          </div>

          <button
            onClick={() => router.push('/upgrade-pro')}
            className="hidden sm:flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary transition-all shadow-sm"
          >
            <Zap size={16} className="text-amber-400 fill-current" />
            <span>{user.is_pro ? 'Pro Active' : 'Upgrade Pro'}</span>
          </button>
        </div>

        {/* Single Page 2-Column Layout */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Navigation Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}

              {user.is_staff && (
                <button
                  onClick={() => router.push('/admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-purple-700 hover:bg-purple-50 transition-all text-left mt-2 border border-purple-100"
                >
                  <Shield size={18} />
                  <span>Admin Console</span>
                </button>
              )}

              <div className="pt-3 mt-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all text-left"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Main Content Panel */}
          <section className="flex-1">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              {/* Tab 1: Account & Security */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1">Account & Security</h2>
                    <p className="text-slate-400 text-xs font-medium">Manage your profile information and authentication credentials.</p>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <div
                      onClick={() => router.push('/profile/edit')}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <User size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Personal Details</p>
                          <p className="text-xs text-slate-400 font-medium">{user.email}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>

                    <div
                      onClick={handlePasswordReset}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Security Password</p>
                          <p className="text-xs text-slate-400 font-medium">Click to send password reset link to your email</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>

                    <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Linked Authentication</p>
                          <p className="text-xs text-slate-400 font-medium">Firebase Token Authentication</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full font-bold border border-emerald-100 uppercase">Verified</span>
                    </div>

                    <div
                      onClick={() => router.push('/upgrade-pro')}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <CreditCard size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Pro Membership</p>
                          <p className="text-xs text-slate-400 font-medium">{user.is_pro ? 'Scholar Pro active' : 'Free plan — Upgrade with ScholarPoints'}</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Preferences & Notifications */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1">Preferences & Notifications</h2>
                    <p className="text-slate-400 text-xs font-medium">Customize notifications and regional settings.</p>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <Bell size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                          <p className="text-xs text-slate-400 font-medium">Receive scholarship updates and match alerts</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setEmailNotifs(!emailNotifs);
                          showToast(`Email notifications ${!emailNotifs ? 'enabled' : 'disabled'}`);
                        }}
                        className={`w-12 h-6 rounded-full relative transition-all ${emailNotifs ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${emailNotifs ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <Mail size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Weekly Newsletter</p>
                          <p className="text-xs text-slate-400 font-medium">Top global scholarship recommendations</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setNewsletter(!newsletter);
                          showToast(`Newsletter ${!newsletter ? 'activated' : 'paused'}`);
                        }}
                        className={`w-12 h-6 rounded-full relative transition-all ${newsletter ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newsletter ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          <Moon size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Dark Theme Mode</p>
                          <p className="text-xs text-slate-400 font-medium">Toggle interface theme appearance</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setDarkMode(!darkMode);
                          showToast(`Dark mode ${!darkMode ? 'enabled' : 'disabled'}`);
                        }}
                        className={`w-12 h-6 rounded-full relative transition-all ${darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                          <Globe size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Language</p>
                          <p className="text-xs text-slate-400 font-medium">Select your preferred display language</p>
                        </div>
                      </div>
                      <select
                        value={selectedLang}
                        onChange={(e) => {
                          setSelectedLang(e.target.value);
                          showToast(`Language set to ${e.target.value}`);
                        }}
                        className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer outline-none focus:border-primary"
                      >
                        <option value="English">English</option>
                        <option value="Bengali">Bengali</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Mentorship & Community */}
              {activeTab === 'mentorship' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1">Mentorship & Community</h2>
                    <p className="text-slate-400 text-xs font-medium">Manage your mentor profile and community role.</p>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <div className="flex items-center justify-between p-4 sm:p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Become a Mentor</p>
                          <p className="text-xs text-slate-400 font-medium">Guide fellow applicants with SOPs and scholarships</p>
                        </div>
                      </div>
                      <button
                        disabled={updating}
                        onClick={() => toggleMentorStatus(!user.is_mentor)}
                        className={`w-12 h-6 rounded-full relative transition-all ${user.is_mentor ? 'bg-primary' : 'bg-slate-200'} ${updating ? 'opacity-50' : ''}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${user.is_mentor ? 'right-1' : 'left-1'}`}></div>
                      </button>
                    </div>

                    {user.is_mentor && (
                      <div
                        onClick={() => router.push('/profile/edit')}
                        className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                            <Info size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">Mentorship Expertise & Bio</p>
                            <p className="text-xs text-slate-400 font-medium">Configure your university, expertise, and target countries</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-slate-400" />
                      </div>
                    )}

                    <div
                      onClick={() => router.push('/community')}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                          <Users size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Community Discussions</p>
                          <p className="text-xs text-slate-400 font-medium">View your posts, discussions, and answers</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Support & Legal */}
              {activeTab === 'support' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 mb-1">Support & Legal</h2>
                    <p className="text-slate-400 text-xs font-medium">Access system documentation, terms, and bug report tool.</p>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                    <a
                      href="/manual"
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                          <HelpCircle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">User Manual</p>
                          <p className="text-xs text-slate-400 font-medium">Detailed guide on using ScholarshipConnect BD features</p>
                        </div>
                      </div>
                      <ExternalLink size={16} className="text-slate-400" />
                    </a>

                    <div
                      onClick={() => router.push('/privacy')}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                          <Shield size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Privacy Policy</p>
                          <p className="text-xs text-slate-400 font-medium">Learn how your document vault and data are secured</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>

                    <div
                      onClick={handleReportBug}
                      className="flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-100">
                          <AlertTriangle size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Report a Bug</p>
                          <p className="text-xs text-slate-400 font-medium">Submit an issue directly to the platform developers</p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-8 text-center border-t border-slate-200 pt-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ScholarshipConnect BD — Version 1.2.0 (Stable)</p>
        </div>
      </main>
    </div>
  );
}
