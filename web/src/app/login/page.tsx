"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Mail, ArrowRight, Loader2, Sparkles, GraduationCap, Eye, EyeOff, AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: 'error' | 'success' | 'warning' = 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, password);
      showToast('Logged in successfully!', 'success');
      setTimeout(() => {
        router.push('/home');
      }, 800);
    } catch (err: any) {
      console.error('[WEB LOGIN ERROR]', err);
      let userFriendlyMsg = 'Failed to login. Please check your credentials.';

      // Check if user was registered via Google Sign-In
      try {
        const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
        if (methods && methods.includes('google.com') && !methods.includes('password')) {
          userFriendlyMsg = 'This account was created using Google Sign-In. Please click the "Google" button below to log in.';
          showToast(userFriendlyMsg, 'warning');
          setLoading(false);
          return;
        }
      } catch (checkErr) {
        console.warn('[WEB LOGIN] Provider check skipped:', checkErr);
      }

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        userFriendlyMsg = 'Incorrect email or password. Please check your credentials.';
      } else if (err.code === 'auth/too-many-requests') {
        userFriendlyMsg = 'Too many failed login attempts. Please wait a few minutes or reset your password.';
      } else if (err.code === 'auth/network-request-failed') {
        userFriendlyMsg = 'Network error. Please check your internet connection.';
      } else {
        userFriendlyMsg = err.message ? err.message.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^\)]+\)\.?/i, '') : 'Login failed.';
      }

      showToast(userFriendlyMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showToast('Logged in with Google!', 'success');
      setTimeout(() => {
        router.push('/home');
      }, 800);
    } catch (err: any) {
      showToast(err.message || 'Google login failed.', 'error');
    }
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* Floating Popup Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3.5 px-5 py-4 rounded-2xl shadow-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-4 bg-white/95 backdrop-blur-md max-w-md w-[90vw] sm:w-auto border-slate-100">
          {toast.type === 'error' && (
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle size={20} />
            </div>
          )}
          {toast.type === 'warning' && (
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
          )}
          {toast.type === 'success' && (
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 size={20} />
            </div>
          )}

          <div className="flex-1 pr-2">
            <p className="text-xs font-bold text-slate-800 leading-relaxed">{toast.message}</p>
          </div>

          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Left Side: Illustration - Now White */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden border-r border-slate-100 bg-slate-50/30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="relative z-10 max-w-md space-y-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Welcome Back
           </div>

           <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Your journey <br/>continues <span className="text-primary underline decoration-primary/20 underline-offset-8">here</span>.
           </h1>

           <p className="text-slate-500 text-lg leading-relaxed font-medium">
              Access your personalized dashboard, track applications, and connect with mentors.
           </p>

           <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
              <p className="italic text-slate-600 text-sm leading-relaxed relative z-10">
                "The ScholarAI matchmaker helped me find the perfect scholarship for my Master's in Germany! The process was so much easier than I expected."
              </p>
              <div className="mt-6 flex items-center gap-3 relative z-10">
                 <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-bold text-xs">A</div>
                 <div>
                    <p className="font-bold text-slate-900 text-xs">— Ahmed</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">MEXT Scholar</p>
                 </div>
              </div>
              <GraduationCap size={120} className="absolute -bottom-8 -right-8 text-slate-50 group-hover:text-primary/5 transition-colors duration-500" />
           </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-8 lg:mb-12">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">S</div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900">ScholarshipConnect<span className="text-primary">BD</span></span>
            </Link>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Sign In</h2>
            <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">Enter your details to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Forgot Password?" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-slate-400"><span className="bg-white px-4">Or continue with</span></div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 text-slate-700"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Google
            </button>
          </div>

          <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
