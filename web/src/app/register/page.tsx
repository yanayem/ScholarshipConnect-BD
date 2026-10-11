"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiService } from '@/lib/api';
import { Lock, Mail, User, ArrowRight, Loader2, ShieldCheck, Sparkles, Globe, Eye, EyeOff, AlertCircle, AlertTriangle, CheckCircle2, X } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await apiService.getProfile();
      showToast('Account created successfully!', 'success');
      setTimeout(() => {
        router.push('/home');
      }, 800);
    } catch (err: any) {
      console.error('[WEB REGISTER ERROR]', err);
      let errorMsg = 'Failed to create account.';

      if (err.code === 'auth/email-already-in-use') {
        try {
          const methods = await fetchSignInMethodsForEmail(auth, cleanEmail);
          if (methods && methods.includes('google.com')) {
            errorMsg = 'This email is already registered using Google Sign-In. Please log in with Google.';
            showToast(errorMsg, 'warning');
            setLoading(false);
            return;
          } else {
            errorMsg = 'That email is already registered. Please sign in instead.';
          }
        } catch (e) {
          errorMsg = 'That email is already registered. Please sign in instead.';
        }
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else {
        errorMsg = err.message ? err.message.replace(/^Firebase:\s*/i, '').replace(/\s*\(auth\/[^\)]+\)\.?/i, '') : 'Registration failed.';
      }

      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
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

      {/* Left Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-12">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-primary/20">S</div>
              <span className="font-bold text-xl tracking-tight text-slate-900">ScholarshipConnect<span className="text-primary">BD</span></span>
            </Link>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create Account</h2>
            <p className="text-slate-500 mt-2 font-medium">Join thousands of Bangladeshi scholars today.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Yeasin Arafat Nayem"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 8 characters"
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

            <div className="py-4 flex items-start gap-3">
              <div className="mt-0.5"><ShieldCheck size={18} className="text-primary" /></div>
              <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                By creating an account, you agree to our <Link href="/terms" className="text-primary underline">Terms</Link> and <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-12 text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-slate-50/30 border-l border-slate-100">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        <div className="max-w-md space-y-10 text-center">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              <Sparkles size={14} />
              Start Your Journey
           </div>

           <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Unlock <span className="text-primary underline decoration-primary/20 underline-offset-8">Global</span> Opportunities.
           </h1>

           <div className="relative group">
              <div className="absolute -inset-4 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-colors duration-500"></div>
              <img
                src="https://images.unsplash.com/photo-1541339906962-d000263f4797?w=800&q=80"
                alt="Education"
                className="relative w-full aspect-square object-cover rounded-[3rem] shadow-2xl border border-white grayscale group-hover:grayscale-0 transition-all duration-1000"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Globe size={24} />
                 </div>
                 <div className="text-left">
                    <p className="text-xs font-black text-slate-900">5,000+ Students</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Applying this year</p>
                 </div>
              </div>
           </div>

           <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
             Join thousands of Bangladeshi students applying for MEXT, Fulbright, and Chevening scholarships.
           </p>
        </div>
      </div>
    </div>
  );
}
