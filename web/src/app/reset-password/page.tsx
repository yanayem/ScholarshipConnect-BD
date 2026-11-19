"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiService } from '@/lib/api';
import { Lock, Eye, EyeOff, KeyRound, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oobCode = searchParams.get('oobCode');

  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [verifying, setVerifying] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function checkCode() {
      if (!oobCode) {
        setErrorMsg('Invalid or missing password reset token. Please request a new link.');
        setVerifying(false);
        return;
      }

      try {
        const userEmail = await verifyPasswordResetCode(auth, oobCode);
        setEmail(userEmail);
      } catch (err: any) {
        console.error('[VERIFY RESET CODE ERROR]', err);
        if (err.code === 'auth/invalid-action-code') {
          setErrorMsg('The reset link is invalid or has expired. Please request a new password reset link.');
        } else if (err.code === 'auth/expired-action-code') {
          setErrorMsg('The reset link has expired. Please request a new password reset link.');
        } else {
          setErrorMsg(err.message || 'Failed to verify reset code.');
        }
      } finally {
        setVerifying(false);
      }
    }

    checkCode();
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!oobCode) {
      setErrorMsg('Missing reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Confirm password does not match new password.');
      return;
    }

    setLoading(true);
    try {
      // 1. Confirm and save new password in Firebase Auth (replaces old password)
      await confirmPasswordReset(auth, oobCode, newPassword);

      // 2. Perform auto-logout for any active session
      await apiService.logout();

      setSuccessMsg('Your password has been reset successfully! Redirecting to login...');

      setTimeout(() => {
        router.push('/login?reset=success');
      }, 2000);
    } catch (err: any) {
      console.error('[CONFIRM RESET ERROR]', err);
      if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 8 characters.');
      } else if (err.code === 'auth/invalid-action-code' || err.code === 'auth/expired-action-code') {
        setErrorMsg('This reset link has expired or has already been used.');
      } else {
        setErrorMsg(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <Loader2 className="animate-spin text-primary mb-3" size={36} />
        <p className="text-slate-600 text-xs font-bold">Verifying reset link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm relative">
        <Link
          href="/login"
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20 shadow-sm">
            <KeyRound size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-slate-500 text-xs font-medium mt-2 leading-relaxed">
            {email ? `Create a new password for ${email}` : 'Enter your new password below to reset your credentials.'}
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

        {!errorMsg || email ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>New Password</span>
                <span className="text-[10px] text-slate-400 font-normal">(Min. 8 characters)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  <span>Saving New Password...</span>
                </>
              ) : (
                <span>Save New Password & Sign In</span>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center pt-2">
            <Link
              href="/forgot-password"
              className="inline-block bg-primary text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider"
            >
              Request New Reset Link
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
