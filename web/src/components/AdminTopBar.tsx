"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ArrowRight, ShieldCheck, User } from 'lucide-react';

export default function AdminTopBar() {
  const { user } = useAuth();

  const getRoleLabel = () => {
    if ((user as any)?.is_superuser) return 'Super Admin';
    if (user?.is_staff) return 'Staff Admin';
    return 'Admin';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 h-16 px-4 sm:px-8 flex items-center justify-between">
      {/* Left side info (desktop) */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Console Active
        </span>
      </div>

      <div className="sm:hidden">
        {/* Placeholder for mobile spacing */}
        <span className="text-xs font-bold text-slate-400">Portal</span>
      </div>

      {/* Right side Profile Icon with Role */}
      <div className="flex items-center gap-4">
        <Link
          href="/home"
          className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors"
        >
          <ArrowRight size={13} className="rotate-180 text-slate-400" />
          <span>Exit to App</span>
        </Link>

        {user && (
          <Link
            href="/profile"
            className="flex items-center gap-3 pl-3 sm:border-l border-slate-200 hover:opacity-85 transition-opacity"
            title="View Admin Profile"
          >
            {/* User Details & Role */}
            <div className="text-right flex flex-col items-end">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.full_name || (user as any)?.username || 'Admin User'}
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-0.5">
                <ShieldCheck size={10} className="text-primary" />
                {getRoleLabel()}
              </span>
            </div>

            {/* Profile Avatar Icon */}
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-primary font-bold text-sm overflow-hidden shadow-xs shrink-0">
              {(user.avatar || (user as any).avatar_url) ? (
                <img
                  src={user.avatar || (user as any).avatar_url}
                  className="w-full h-full object-cover"
                  alt="Admin Avatar"
                />
              ) : (
                user.full_name?.charAt(0) || <User size={18} />
              )}
            </div>
          </Link>
        )}
      </div>
    </header>
  );
}