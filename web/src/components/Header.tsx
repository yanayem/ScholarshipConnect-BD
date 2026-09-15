"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMentorMode } from '@/context/MentorModeContext';
import { usePathname } from 'next/navigation';
import {
  Users,
  GraduationCap,
  MessageSquare,
  LayoutDashboard,
  Calendar,
  Bookmark,
  Bell,
  Zap,
  Briefcase
} from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();
  const { isMentorMode, toggleMentorMode } = useMentorMode();
  const pathname = usePathname();

  const studentNav = [
    { name: 'Home', href: '/home', icon: LayoutDashboard },
    { name: 'Scholarships', href: '/scholarships', icon: GraduationCap },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'My Apps', href: '/profile/applications', icon: Bookmark },
    { name: 'Community', href: '/community', icon: MessageSquare },
  ];

  const mentorNav = [
    { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
    { name: 'Sessions', href: '/mentorship/sessions', icon: Briefcase },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const currentNav = (isMentorMode && user?.is_staff) ? mentorNav : studentNav;

  return (
    <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
      <nav className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={user ? "/home" : "/"} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">S</div>
            <span className="text-base font-black text-slate-900 tracking-tight hidden sm:block">ScholarshipConnect<span className="text-primary">BD</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {user && currentNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[11px] font-bold uppercase tracking-widest transition-colors ${
                  pathname === item.href ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {!loading && user ? (
              <>
                <Link href="/notifications" className="text-slate-400 hover:text-primary transition-colors relative">
                   <Bell size={18} />
                   <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                </Link>

                {user.is_staff && (
                  <button
                    onClick={toggleMentorMode}
                    className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors border-l border-slate-100 pl-4"
                  >
                     {isMentorMode ? 'Student Mode' : 'Mentor Mode'}
                  </button>
                )}

                <Link href="/profile" className="flex items-center gap-2 border-l border-slate-100 pl-4">
                  <div className="w-9 h-9 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-center text-primary text-[10px] font-bold hover:shadow-md transition-all">
                    {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover rounded-xl" /> : user.full_name?.charAt(0)}
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Login</Link>
                <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">Join</Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {user && (
          <div className="lg:hidden flex items-center justify-around py-3 border-t border-slate-50">
            {currentNav.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 ${
                  pathname === item.href ? 'text-primary' : 'text-slate-400'
                }`}
              >
                <item.icon size={18} />
                <span className="text-[8px] font-bold uppercase tracking-tighter">{item.name.split(' ')[0]}</span>
              </Link>
            ))}
            <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-primary' : 'text-slate-400'}`}>
               <Users size={18} />
               <span className="text-[8px] font-bold uppercase tracking-tighter">Profile</span>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
