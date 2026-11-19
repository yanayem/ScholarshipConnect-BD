"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiService } from '@/lib/api';
import { Mail, ArrowLeft, Send, Loader2, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.forgotPassword(cleanEmail);
      if (res.ok) {
        setSuccessMsg(`A unique temporary password has been sent to ${cleanEmail}. Please check your inbox or spam folder to get your temporary password and log in.`);
      } else {
        await sendPasswordResetEmail(auth, cleanEmail);
        setSuccessMsg(`Password reset link sent to ${cleanEmail}. Please check your inbox or spam folder.`);
      }
      setEmail('');
    } catch (err: any) {
      console.error('[FORGOT PASSWORD ERROR]', err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMsg('Too many attempts. Please try again later.');
      } else {
        setErrorMsg(err.message || 'Failed to send password reset email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative">
        <button
          onClick={() => router.push('/login')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Forgot Password?</h1>
          <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
            Enter your registered email address and we'll send you a password reset link.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-3">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center gap-3">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium text-slate-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-slate-100 pt-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
