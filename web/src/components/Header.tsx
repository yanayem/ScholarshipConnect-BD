"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useMentorMode } from '@/context/MentorModeContext';
import { usePathname } from 'next/navigation';
import {
  Users,
  GraduationCap,
  MessageSquare,
  Home as HomeIcon,
  Calendar,
  Bookmark,
  Bell,
  Menu,
  X,
  Briefcase,
  Search,
  Grid,
  Settings,
  ShieldCheck,
  Send,
  FileText,
  Star,
  LineChart,
  History,
  Info,
  Lock,
  ArrowRight,
  Trophy
} from 'lucide-react';

export default function Header() {
  const { user, loading } = useAuth();
  const { isMentorMode, toggleMentorMode } = useMentorMode();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentNav = [
    { name: 'Scholarships', href: '/scholarships', icon: GraduationCap },
    { name: 'Deadlines', href: '/calendar', icon: Calendar },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Application', href: '/profile/applications', icon: Bookmark },
    { name: 'Community', href: '/community', icon: MessageSquare },
  ];

  const mentorNav = [
    { name: 'Sessions', href: '/mentorship/sessions', icon: Briefcase },
    { name: 'Messages', href: '/messages', icon: MessageSquare },
    { name: 'Home', href: '/home', icon: HomeIcon },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const currentNav = (isMentorMode && user?.is_mentor && user?.is_staff) ? mentorNav : studentNav;

  return (
    <>
      <header className="bg-white sticky top-0 z-50 border-b border-slate-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md mr-4">
              <Link href={user ? "/home" : "/"} className="flex items-center gap-2 shrink-0">
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                  <img src="/logo.png" className="w-full h-full object-cover" alt="ScholarshipConnectBD Logo" onError={(e) => {
                    // Fallback to text if image not found yet
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }} />
                  <div style={{ display: 'none' }} className="w-full h-full bg-primary flex items-center justify-center text-white font-bold">S</div>
                </div>
                <span className="text-base font-black text-slate-900 tracking-tight hidden md:block">ScholarshipConnect<span className="text-primary">BD</span></span>
              </Link>

              {user && (
                <div className="hidden sm:block relative w-full max-w-[280px]">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-slate-100 border border-transparent rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              )}
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center h-full gap-1">
              {user && currentNav.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`h-full flex flex-col items-center justify-center px-4 relative min-w-[85px] transition-all border-b-2 ${
                      isActive
                        ? 'border-primary text-primary font-semibold'
                        : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                    <span className="text-[11px] mt-1 font-medium tracking-wide">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Actions & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-4">
              {user && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all mr-1"
                  title="Menu"
                >
                  <Grid size={22} strokeWidth={1.8} />
                </button>
              )}

              {!loading && user ? (
                <>
                  <Link href="/notifications" className="text-slate-400 hover:text-primary transition-colors relative p-1">
                     <Bell size={20} />
                     <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
                  </Link>

                  {user.is_mentor && user.is_staff && (
                    <button
                      onClick={toggleMentorMode}
                      className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors border-l border-slate-100 pl-4"
                    >
                       {isMentorMode ? 'Student Mode' : 'Mentor Mode'}
                    </button>
                  )}

                  <Link href="/profile" className="flex items-center gap-2 border-l border-slate-100 pl-2 sm:pl-4">
                    <div className="w-9 h-9 bg-gray-50 border border-black/5 rounded-xl flex items-center justify-center text-primary text-sm font-bold hover:shadow-md transition-all overflow-hidden">
                      {(user.avatar || (user as any).avatar_url || (user as any).profile_picture_url) ? (
                        <img src={user.avatar || (user as any).avatar_url || (user as any).profile_picture_url} className="w-full h-full object-cover rounded-xl" alt="avatar" />
                      ) : user.full_name?.charAt(0)}
                    </div>
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/login" className="text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors">Login</Link>
                  <Link href="/register" className="bg-primary text-white px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 transition-all">Join</Link>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Apps Dropdown Menu (LinkedIn Style Profile Sidebar) */}
        {mobileMenuOpen && user && (
          <div className="absolute top-16 right-4 sm:right-8 w-[300px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-100 border border-slate-200 text-primary rounded-lg flex items-center justify-center font-bold text-xs overflow-hidden">
                  {(user as any).avatar || (user as any).avatar_url || (user as any).profile_picture_url ? (
                    <img src={(user as any).avatar || (user as any).avatar_url || (user as any).profile_picture_url} className="w-full h-full object-cover" alt="" />
                  ) : user.full_name?.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{user.full_name}</h4>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-wider">Scholar Pro</p>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto p-2 space-y-0.5">
              {[
                { name: 'Dashboard', icon: Trophy, href: '/profile' },
                ...((user as any).is_staff ? [{ name: 'Admin Console', icon: ShieldCheck, href: '/admin' }] : []),
                { name: 'My Applications', icon: Send, href: '/profile/applications' },
                { name: 'Document Vault', icon: FileText, href: '/profile/documents' },
                { name: 'Saved Scholarships', icon: Bookmark, href: '/scholarships?filter=saved' },
                { name: 'Leaderboard', icon: Star, href: '/community/leaderboard' },
                { name: 'My Insights', icon: LineChart, href: '/profile/progress' },
                { name: 'History & Activity', icon: History, href: '/profile/activity' },
                { name: 'Find Mentors', icon: Users, href: '/mentorship' },
                { name: 'Notifications', icon: Bell, href: '/notifications' },
                { name: 'Account Settings', icon: Settings, href: '/profile/settings' },
                { name: 'Privacy Policy', icon: Lock, href: '/privacy' },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="p-2 bg-slate-50 border-t border-slate-100 flex gap-2">
              {user.is_mentor && (
                <button
                  onClick={() => {
                     toggleMentorMode();
                     setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-all"
                >
                  {isMentorMode ? 'Student' : 'Mentor'} Mode
                </button>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.location.href = '/';
                }}
                className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Bottom Navigation Bar - Fixed at the very bottom, always visible on mobile */}
      {user && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 z-[100] px-2 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] flex justify-around items-center h-20">
          {currentNav.map((item) => {
            const isActive = pathname === item.href;
            const isCenterHome = item.name === 'Home';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 transition-all relative ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`}
              >
                <div className={`flex items-center justify-center transition-all ${
                  isCenterHome
                    ? 'w-14 h-14 bg-white rounded-full border border-slate-100 -mt-10 shadow-lg text-slate-700'
                    : 'w-7 h-7'
                } ${isActive && !isCenterHome ? 'scale-110' : ''} ${isActive && isCenterHome ? 'text-teal-600 border-teal-100' : ''}`}>
                  <item.icon size={isCenterHome ? 26 : 22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-bold tracking-tight mt-1.5 transition-colors ${
                  isActive ? 'text-teal-600' : 'text-slate-400'
                }`}>
                  {item.name}
                </span>
                {isActive && !isCenterHome && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-teal-600 rounded-full"></div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

