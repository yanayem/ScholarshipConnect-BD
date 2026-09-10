"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Google login failed.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side: Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="relative z-10 text-white max-w-md">
           <h1 className="text-5xl font-black mb-6">Welcome Back!</h1>
           <p className="text-white/80 text-lg leading-relaxed mb-8">
              Access your personalized scholarship dashboard, track applications, and connect with mentors.
           </p>
           <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
              <p className="italic text-sm">"The ScholarAI matchmaker helped me find the perfect scholarship for my Master's in Germany!"</p>
              <p className="mt-4 font-bold text-xs">— Ahmed, MEXT Scholar</p>
           </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-bold text-xl">ScholarshipConnect<span className="text-primary">BD</span></span>
            </Link>
            <h2 className="text-3xl font-black text-foreground">Sign In</h2>
            <p className="text-text-secondary mt-2">Enter your details to access your account.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full"></div>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Password</label>
                <Link href="/forgot-password" title="Forgot Password?" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold text-text-secondary"><span className="bg-background px-4">Or continue with</span></div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center gap-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all active:scale-95"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-text-secondary font-bold">
            Don't have an account? <Link href="/register" className="text-primary hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
