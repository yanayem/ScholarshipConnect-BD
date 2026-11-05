"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Users,
  UserCheck,
  Radio,
  ShieldCheck,
  Activity,
  History,
  Settings,
  Menu,
  X
} from 'lucide-react';

const ADMIN_NAV = [
  { name: 'Console', href: '/admin', icon: LayoutDashboard },
  { name: 'Scholarships', href: '/admin/scholarships', icon: GraduationCap },
  { name: 'Applications', href: '/admin/applications', icon: FileText },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Mentors', href: '/admin/mentors', icon: UserCheck },
  { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
  { name: 'Moderation', href: '/admin/moderation', icon: ShieldCheck },
  { name: 'Analytics', href: '/admin/analytics', icon: Activity },
  { name: 'Logs', href: '/admin/logs', icon: History },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar to Toggle Left Sidebar on small screens */}
      <div className="lg:hidden bg-white text-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            aria-label="Open Admin Menu"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center font-black text-xs shadow-sm">
              S
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900">Admin Console</span>
          </div>
        </div>
      </div>

      {/* Mobile Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* The Clean White/Light Left Sidebar for All Devices */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-white text-slate-800 z-50 flex flex-col border-r border-slate-200 shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand / Logo Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center font-black text-base shadow-sm">
              S
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight text-slate-900 leading-none">
                ScholarshipConnect<span className="text-primary">BD</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary mt-1 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                Admin Portal
              </span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-hide">
          {ADMIN_NAV.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <item.icon size={17} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
              </Link>
            );
          })}
        </nav>

        {/* Clean minimal footer */}
        <div className="p-4 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-medium">ScholarshipConnect-BD v1.0</p>
        </div>
      </aside>
    </>
  );
}