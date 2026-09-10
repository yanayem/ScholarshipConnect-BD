"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { apiService } from '@/lib/api';
import { Lock, Mail, User, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // After Firebase creates the user, we trigger a profile call to the backend
      // The Django backend middleware will automatically create the profile if it doesn't exist.
      await apiService.getProfile();
      router.push('/home');
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">S</div>
              <span className="font-bold text-xl">ScholarshipConnect<span className="text-primary">BD</span></span>
            </Link>
            <h2 className="text-3xl font-black text-foreground">Create Account</h2>
            <p className="text-text-secondary mt-2">Join thousands of Bangladeshi scholars today.</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold mb-6 border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Yeasin Arafat Nayem"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

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
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="py-4 flex items-start gap-3">
              <div className="mt-0.5"><ShieldCheck size={18} className="text-primary" /></div>
              <p className="text-[10px] text-text-secondary leading-relaxed">
                By creating an account, you agree to our <Link href="/terms" className="text-primary underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary underline">Privacy Policy</Link>.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-lg shadow-primary/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Create Account
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-text-secondary font-bold">
            Already have an account? <Link href="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#F8F2E7] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl"></div>
        <div className="max-w-md text-center">
           <img
             src="https://images.unsplash.com/photo-1541339906962-d000263f4797?w=800&q=80"
             alt="Education"
             className="w-full aspect-square object-cover rounded-[60px] shadow-2xl mb-12 grayscale hover:grayscale-0 transition-all duration-700"
           />
           <h3 className="text-3xl font-black text-foreground mb-4">Start your journey.</h3>
           <p className="text-text-secondary leading-relaxed">
             Join 5,000+ Bangladeshi students applying for MEXT, Fulbright, and Chevening scholarships this year.
           </p>
        </div>
      </div>
    </div>
  );
}
