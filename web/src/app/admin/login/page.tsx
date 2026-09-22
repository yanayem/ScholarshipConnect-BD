"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiService } from '@/lib/api';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Key, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLogin() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // If user is not staff, they shouldn't even be here
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/profile');
    }

    // If already verified, go to dashboard
    if (typeof window !== 'undefined' && localStorage.getItem('admin_verified') === 'true') {
      router.push('/admin');
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Please enter both username/email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.adminLogin(username.trim(), password.trim());
      if (res.ok) {
        localStorage.setItem('admin_verified', 'true');
        router.push('/admin');
      } else {
        setError(res.data?.detail || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('A connection error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user?.is_staff) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-primary/20">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Security</h1>
          <p className="text-slate-500 font-medium">Verify your staff identity to continue</p>
        </div>

        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200 border border-slate-100">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold uppercase tracking-widest text-center border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Admin Username</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter email or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-12 py-4 text-slate-900 font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
            >
              {loading ? "Authenticating..." : (
                <>
                  Unlock Dashboard
                  <Key size={18} />
                </>
              )}
            </button>

            <Link href="/profile" className="flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 transition-colors font-bold text-xs uppercase tracking-widest mt-6">
              <ArrowLeft size={16} />
              Back to Profile
            </Link>
          </form>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Secure Admin Access v2.5</p>
        </div>
      </div>
    </div>
  );
}
