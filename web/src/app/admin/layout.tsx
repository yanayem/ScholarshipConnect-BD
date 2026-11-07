"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/AdminSidebar';
import AdminTopBar from '@/components/AdminTopBar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.is_staff) {
        router.push('/home');
        return;
      }

      const verified = localStorage.getItem('admin_verified') === 'true';
      setIsVerified(verified);

      if (!verified && pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [user, authLoading, router, pathname]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Allow the login page to render without sidebar or topbar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // If not staff, don't show anything while redirecting
  if (!user?.is_staff) {
    return null;
  }

  // If not verified, don't show children while redirecting (except login page)
  if (!isVerified) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F2E7]/60 flex flex-col lg:flex-row">
      {/* Permanent Left-Side Navigation Bar for All Devices */}
      <AdminSidebar />

      {/* Main Content Area with Top Bar */}
      <div className="flex-1 w-full lg:pl-64 min-w-0 flex flex-col">
        {/* Top Bar with Profile Icon and Role Badge */}
        <AdminTopBar />

        {/* Admin Content */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}