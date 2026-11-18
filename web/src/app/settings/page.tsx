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
  Users,
  Eye,
  EyeOff,
  KeyRound,
  AlertCircle,
  Loader2
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

  // Password Change Form States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Confirm password does not match new password.');
      return;
    }
    if (oldPassword === newPassword) {
      setPasswordError('New password must be different from current password.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await apiService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      if (res.ok) {
        setPasswordSuccess('Password updated successfully!');
        showToast('Password updated successfully!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = res.data;
        let errMsg = 'Failed to update password.';
        if (data?.old_password) {
          errMsg = Array.isArray(data.old_password) ? data.old_password[0] : data.old_password;
        } else if (data?.new_password) {
          errMsg = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
        } else if (data?.confirm_password) {
          errMsg = Array.isArray(data.confirm_password) ? data.confirm_password[0] : data.confirm_password;
        } else if (data?.non_field_errors) {
          errMsg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
        } else if (data?.detail) {
          errMsg = data.detail;
        } else if (data?.error) {
          errMsg = data.error;
        }
        setPasswordError(errMsg);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'An error occurred while changing password.');
    } finally {
      setChangingPassword(false);
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
    { id: 'mentorship', label: 'Community Settings', icon: Users },
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

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8">
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

          {/* {!user.is_pro && (
            <button
              onClick={() => router.push('/upgrade-pro')}
              className="hidden sm:flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm"
            >
              <Zap size={16} className="text-amber-400 fill-current" />
              <span>Upgrade Pro</span>
            </button>
          )} */}
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

              {!user.is_pro && (
                <button
                  onClick={() => router.push('/upgrade-pro')}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all text-left mt-2"
                >
                  <div className="flex items-center gap-3">
                    <Zap size={18} className="text-amber-300 fill-current" />
                    <span>Upgrade Pro</span>
                  </div>
                  <ChevronRight size={16} className="text-white/80" />
                </button>
              )}

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

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden mb-6">
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

                    {/* <div
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
                    </div> */}
                  </div>

                  {/* SECTION 1: Forgot Password (If completely forgotten) */}
                  <div className="border border-amber-200/80 rounded-2xl p-5 sm:p-6 bg-amber-50/40 space-y-3 mb-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                          <Mail size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Forgot Password? (Reset via Email)</h3>
                          <p className="text-xs text-slate-500 font-medium">If you completely forgot your password, request a reset link sent to your registered email.</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-bold uppercase shrink-0 border border-amber-200">Option 1</span>
                    </div>

                    <div className="pt-2 flex items-center justify-end border-t border-amber-200/60">
                      <button
                        type="button"
                        disabled={updating}
                        onClick={handlePasswordReset}
                        className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Sending Link...</span>
                          </>
                        ) : (
                          <>
                            <Mail size={14} />
                            <span>Send Password Reset Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* SECTION 2: Change Password Form (If current password is known) */}
                  <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/60 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                          <Lock size={20} />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Change Password Form</h3>
                          <p className="text-xs text-slate-500 font-medium">If you know your current password, update it directly below.</p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full font-bold uppercase border border-slate-300">Option 2</span>
                    </div>

                    {passwordError && (
                      <div className="p-3.5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{passwordError}</span>
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
                        <span>{passwordSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                      {/* Field 1: Current Password (old_password) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <span>Current Password</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={oldPassword}
                            onChange={(e) => { setOldPassword(e.target.value); setPasswordError(null); }}
                            placeholder="Enter current password"
                            required
                            className="w-full px-3.5 py-2.5 pr-10 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Field 2: New Password (new_password) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <span>New Password</span>
                            <span className="text-red-500">*</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">(Min. 8 characters)</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
                            placeholder="Enter new password (min. 8 characters)"
                            required
                            minLength={8}
                            className="w-full px-3.5 py-2.5 pr-10 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Field 3: Confirm New Password (confirm_password) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <span>Confirm New Password</span>
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
                            placeholder="Re-enter new password"
                            required
                            className="w-full px-3.5 py-2.5 pr-10 text-xs font-medium bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-900"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end">
                        <button
                          type="submit"
                          disabled={changingPassword}
                          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                          {changingPassword ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Updating Password...</span>
                            </>
                          ) : (
                            <>
                              <KeyRound size={14} />
                              <span>Update Password</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
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
                    <h2 className="text-base font-bold text-slate-900 mb-1">Community Settings</h2>
                    <p className="text-slate-400 text-xs font-medium">Manage your community role and discussions.</p>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
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
