"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiService, getAvatarUrl } from '@/lib/api';
import {
  MapPin,
  GraduationCap,
  Trophy,
  Bookmark,
  Send,
  FileText,
  Settings,
  Edit3,
  Camera,
  Loader2,
  Upload,
  Trash2,
  Video,
  X,
  ArrowRight,
  BookOpen,
  Award,
  Star,
  LineChart,
  MessageSquare,
  History,
  ShieldCheck,
  Info,
  Lock,
  Repeat,
  Users,
  Bell,
  Globe,
  Mail,
  Phone,
  Link as LinkIcon
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useMentorMode } from '@/context/MentorModeContext';

export default function ProfilePage() {
  const { user, refreshProfile, loading: authLoading } = useAuth();
  const { isMentorMode, toggleMentorMode } = useMentorMode();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ saved: 0, applied: 0, documents: 0 });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setImageError(false);
  }, [(user as any)?.avatar_url, (user as any)?.profile_picture, (user as any)?.profile_picture_url]);

  const stopWebcam = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleOpenWebcam = async () => {
    setShowPhotoOptions(false);
    setShowWebcamModal(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: "user" },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access failed", err);
      alert("Unable to access camera. Please verify camera permissions or upload an image file.");
      setShowWebcamModal(false);
    }
  };

  const handleCaptureWebcam = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      stopWebcam();
      setShowWebcamModal(false);
      const file = new File([blob], `profile_${Date.now()}.jpg`, { type: "image/jpeg" });
      await uploadProfilePicture(file);
    }, "image/jpeg", 0.9);
  };

  const handleCloseWebcam = () => {
    stopWebcam();
    setShowWebcamModal(false);
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const formData = new FormData();
      formData.append("profile_picture", file);
      const res = await apiService.updateProfile(formData);
      if (res.ok) {
        setImageError(false);
        await refreshProfile();
      } else {
        const errorMsg = (res.data as any)?.profile_picture || (res.data as any)?.error || "Failed to update profile picture";
        alert(Array.isArray(errorMsg) ? errorMsg[0] : errorMsg);
      }
    } catch (err) {
      console.error("Upload error", err);
      alert("Connection error occurred while updating profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setShowPhotoOptions(false);
      await uploadProfilePicture(file);
    }
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm("Are you sure you want to remove your profile photo?")) return;
    setShowPhotoOptions(false);
    try {
      setUploadingPhoto(true);
      const res = await apiService.updateProfile({ profile_picture: null });
      if (res.ok) {
        await refreshProfile();
      } else {
        alert("Failed to remove profile photo");
      }
    } catch (err) {
      alert("Failed to remove photo");
    } finally {
      setUploadingPhoto(false);
    }
  };
  const router = useRouter();
  const pathname = usePathname();

  const handleBecomeMentor = async () => {
    if (window.confirm("Do you want to apply to become a mentor?")) {
      const res = await apiService.updateProfile({ is_mentor: true });
      if (res.ok) {
        alert("You are now a Mentor!");
        window.location.reload();
      }
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setImageError(false);
  }, [user]);

  useEffect(() => {
    const normalizeStatus = (rawStatus: string) => {
      if (!rawStatus) return 'Applied';
      const s = String(rawStatus).trim();
      const lower = s.toLowerCase();
      if (lower === 'submitted' || lower === 'applied') return 'Applied';
      if (lower === 'saved') return 'Saved';
      if (lower === 'processing') return 'Processing';
      if (lower === 'under review' || lower === 'under_review') return 'Under Review';
      if (lower === 'shortlisted') return 'Shortlisted';
      if (lower === 'accepted') return 'Accepted';
      if (lower === 'rejected') return 'Rejected';
      return s.charAt(0).toUpperCase() + s.slice(1);
    };

    const loadStats = async () => {
      try {
        const [savedRes, appRes, docsRes] = await Promise.all([
          apiService.getSavedScholarships(),
          apiService.getApplications(),
          apiService.getDocuments()
        ]);

        let data: any[] = [];

        if (appRes?.ok) {
          const appList = Array.isArray(appRes.data) ? appRes.data : (appRes.data?.results || []);
          data = data.concat(appList.map((item: any) => ({
            id: 'a' + item.id,
            scholarship_id: item.scholarship?.id || item.scholarship,
            title: item.scholarship_title || item.scholarship_details?.title || 'N/A',
            status: normalizeStatus(item.status),
            is_application: true
          })));
        }

        if (savedRes?.ok) {
          const savedList = Array.isArray(savedRes.data) ? savedRes.data : (savedRes.data?.results || []);
          data = data.concat(savedList.map((item: any) => ({
            id: 's' + item.id,
            scholarship_id: item.scholarship_details?.id || item.scholarship,
            title: item.scholarship_details?.title || 'N/A',
            status: 'Saved',
            is_application: false
          })));
        }

        // Group by scholarship to prioritize actual application statuses (Applied, Processing, etc.)
        // while ensuring Saved scholarships without an application explicitly show "Saved" status.
        const scholarshipMap = new Map();

        // 1. Process actual applications first
        data.filter(item => item.is_application).forEach(item => {
          const key = String(item.scholarship_id || item.title).toLowerCase().trim();
          if (key && key !== 'n/a') {
            scholarshipMap.set(key, item);
          } else {
            scholarshipMap.set(item.id, item);
          }
        });

        // 2. Add saved bookmarks ONLY if the user has not submitted an application for it yet
        data.filter(item => !item.is_application).forEach(item => {
          const key = String(item.scholarship_id || item.title).toLowerCase().trim();
          if (key && key !== 'n/a') {
            if (!scholarshipMap.has(key)) {
              scholarshipMap.set(key, item);
            }
          } else {
            scholarshipMap.set(item.id, item);
          }
        });

        const allItems = Array.from(scholarshipMap.values());
        const savedCount = allItems.filter(i => i.status === 'Saved').length;
        const appliedCount = allItems.filter(i => i.status !== 'Saved').length;

        const docsList = Array.isArray(docsRes?.data) ? docsRes.data : (docsRes?.data?.results || []);

        setStats({
          saved: savedCount,
          applied: appliedCount,
          documents: docsList.length
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };

    if (user) loadStats();
  }, [user]);

  if (authLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const initials = user.full_name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const u = user as any;
  const avatarSrc = getAvatarUrl(user);

  const renderTags = (text: string | undefined) => {
    if (!text) return <span className="text-slate-400 text-[10px] font-bold italic uppercase tracking-wider">Not specified</span>;
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {text.split(',').map((tag, idx) => (
          <span key={idx} className="bg-slate-50 text-slate-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-slate-100 uppercase tracking-tighter">
            {tag.trim()}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16 flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 space-y-4">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-primary rounded-xl flex items-center justify-center font-bold text-sm overflow-hidden">
                    {!imageError && avatarSrc ? (
                      <img
                        src={avatarSrc}
                        className="w-full h-full object-cover"
                        alt="Avatar"
                        onError={() => setImageError(true)}
                      />
                    ) : initials}
                 </div>
                 <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-slate-900 truncate">{user.full_name}</p>
                       {user.is_staff && (
                         <span className="bg-slate-900 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-widest">Staff</span>
                       )}
                    </div>
                    {user.is_pro && (
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Scholar Pro Member</p>
                    )}
                 </div>
              </div>

              <nav className="space-y-1">
                 {user.is_mentor ? (
                   <div className="px-4 py-3 flex items-center justify-between bg-primary/5 rounded-xl mb-4 border border-primary/10">
                      <div className="flex items-center gap-3">
                         <Repeat size={18} className="text-primary" />
                         <span className="text-xs font-bold text-slate-700">{isMentorMode ? 'Mentor Mode' : 'Student Mode'}</span>
                      </div>
                      <button
                        onClick={toggleMentorMode}
                        className={`w-10 h-5 rounded-full relative transition-colors ${isMentorMode ? 'bg-primary' : 'bg-slate-300'}`}
                      >
                         <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isMentorMode ? 'right-1' : 'left-1'}`}></div>
                      </button>
                   </div>
                 ) : (
                   <button
                     onClick={handleBecomeMentor}
                     className="w-full flex items-center gap-3 px-4 py-3 mb-4 bg-primary-light text-primary rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary/20 transition-all"
                   >
                      <GraduationCap size={18} />
                      Become a Mentor
                   </button>
                 )}

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
                   { name: 'Account Settings', icon: Settings, href: '/settings' },
                   { name: 'Privacy Policy', icon: Lock, href: '/privacy' },
                 ].map((item) => (
                   <Link
                     key={item.name}
                     href={item.href}
                     className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                       pathname === item.href
                       ? 'bg-primary text-white shadow-md'
                       : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
                     }`}
                   >
                     <item.icon size={16} />
                     <span>{item.name}</span>
                   </Link>
                 ))}
              </nav>

              <button
                onClick={() => apiService.logout().then(() => router.push('/'))}
                className="w-full flex items-center justify-center gap-2 py-2 mt-4 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-red-100 transition-all"
              >
                 Log Out
              </button>
           </div>

           <div className="bg-primary/5 border border-primary/10 rounded-sm p-6 text-center">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-3">Community Rank</p>
              <div className="w-16 h-16 bg-white border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                 <Trophy className="text-yellow-500" size={28} />
              </div>
              <p className="text-xl font-bold text-slate-900">{u.scholar_points || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Scholar Points</p>
           </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 bg-white border border-slate-200 rounded-sm p-4 sm:p-8 md:p-12 shadow-sm">
          {/* Minimal Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-16">
            <div className="relative shrink-0">
               <div className="w-32 h-32 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-primary text-2xl sm:text-4xl font-bold shadow-xl shadow-primary/5 overflow-hidden">
                  {!imageError && avatarSrc ? (
                    <img
                      src={avatarSrc}
                      className="w-full h-full object-cover rounded-lg"
                      alt="Avatar"
                      onError={() => setImageError(true)}
                    />
                  ) : initials}
               </div>
               <input
                 type="file"
                 ref={fileInputRef}
                 accept="image/*"
                 className="hidden"
                 onChange={handleFileChange}
               />
               <div className="relative">
                 <button
                   type="button"
                   onClick={() => setShowPhotoOptions(prev => !prev)}
                   disabled={uploadingPhoto}
                   title="Change profile picture"
                   className="absolute -bottom-2 -right-2 bg-white border border-slate-200 p-2.5 rounded-lg shadow-lg text-slate-500 hover:text-primary hover:border-primary transition-all z-10 disabled:opacity-50"
                 >
                   {uploadingPhoto ? (
                     <Loader2 size={18} className="animate-spin text-primary" />
                   ) : (
                     <Camera size={18} />
                   )}
                 </button>

                 {showPhotoOptions && (
                   <div className="absolute top-full mt-2 left-0 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 overflow-hidden animate-fadeIn text-left">
                     <button
                       type="button"
                       onClick={handleOpenWebcam}
                       className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-primary-light hover:text-primary flex items-center gap-2.5 transition-colors"
                     >
                       <Video size={15} className="text-primary" />
                       Take Photo (Webcam)
                     </button>
                     <button
                       type="button"
                       onClick={() => {
                         setShowPhotoOptions(false);
                         fileInputRef.current?.click();
                       }}
                       className="w-full px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-primary-light hover:text-primary flex items-center gap-2.5 transition-colors"
                     >
                       <Upload size={15} className="text-primary" />
                       Upload from Device
                     </button>
                     {avatarSrc && (
                       <button
                         type="button"
                         onClick={handleRemovePhoto}
                         className="w-full px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors border-t border-slate-100"
                       >
                         <Trash2 size={15} />
                         Remove Photo
                       </button>
                     )}
                   </div>
                 )}
               </div>
            </div>

            <div className="flex-1 text-center md:text-left space-y-4">
               <div className="space-y-1">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                     <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h1 className="text-3xl sm:text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">{user.full_name}</h1>
                          {(user as any).is_pro && (
                            <span title="Verified Pro Account" className="inline-flex items-center text-[#1DA1F2] select-none" aria-label="Verified Pro">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          )}
                          {(user as any).is_mentor && !(user as any).is_pro && (
                            <span title="Verified Mentor" className="inline-flex items-center text-primary select-none" aria-label="Verified Mentor">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 font-medium text-sm tracking-widest mt-1">{user.email}</p>
                     </div>
                     <Link
                       href="/profile/edit"
                       className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-primary/90 transition-all shrink-0"
                     >
                        <Edit3 size={16} />
                        <span>Edit Profile</span>
                     </Link>
                  </div>
                  <p className="text-slate-500 text-base mt-4 max-w-2xl leading-relaxed font-medium">{u.bio || "Passionate scholar looking for global education opportunities and mentorship."}</p>
               </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10 pb-10 border-b border-slate-100">
             {[
               { name: 'LinkedIn', icon: LinkIcon, href: u.linkedin_url, color: '#0077b5' },
               { name: 'GitHub', icon: LinkIcon, href: u.github_url, color: '#333' },
               { name: 'Facebook', icon: LinkIcon, href: u.facebook_url, color: '#1877f2' },
               { name: 'Scholar', icon: GraduationCap, href: u.google_scholar_url, color: '#4285F4' },
             ].map((social) => (
               <a
                 key={social.name}
                 href={social.href || '#'}
                 target="_blank"
                 rel="noopener noreferrer"
                 className={`flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold transition-all ${
                   social.href ? 'hover:border-primary hover:text-primary shadow-sm' : 'opacity-40 cursor-not-allowed'
                 }`}
               >
                  <social.icon size={14} />
                  {social.name}
               </a>
             ))}
          </div>

          <div className="space-y-16">
               <section>
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mb-8">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 bg-slate-50/30 p-8 rounded-lg border border-slate-100 mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 border border-slate-100">
                           <MapPin size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Location</p>
                           <p className="text-sm font-bold text-slate-700">{u.current_location || 'Not set'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 border border-slate-100">
                           <Phone size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Phone</p>
                           <p className="text-sm font-bold text-slate-700">{u.phone_number || 'Not set'}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-slate-400 border border-slate-100">
                           <Mail size={20} />
                        </div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-0.5">Email</p>
                           <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{user.email}</p>
                        </div>
                     </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mb-8">Activity Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                     {[
                       { label: 'Saved', val: stats.saved, icon: Bookmark, color: 'text-blue-600 bg-blue-50 border-blue-100', href: '/scholarships?filter=saved' },
                       { label: 'Applied', val: stats.applied, icon: Send, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', href: '/profile/applications' },
                       { label: 'Docs', val: stats.documents, icon: FileText, color: 'text-amber-600 bg-amber-50 border-amber-100', href: '/profile/documents' },
                     ].map((stat, i) => (
                       <Link key={i} href={stat.href} className={`border border-black/5 rounded-lg p-6 flex items-center gap-5 hover:border-primary transition-all group bg-white shadow-sm ${stat.color}`}>
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0`}>
                             <stat.icon size={24} />
                          </div>
                          <div>
                             <p className="text-2xl font-bold text-slate-900 leading-none">{stat.val}</p>
                             <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1.5">{stat.label}</p>
                          </div>
                       </Link>
                     ))}
                  </div>
               </section>

               <section>
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em]">Academic Profile</h3>
                     <Link href="/profile/edit" className="text-primary text-[10px] font-bold uppercase tracking-[0.2em] hover:underline">Manage</Link>
                  </div>
                  <div className="border border-black/5 rounded-lg p-10 grid grid-cols-1 sm:grid-cols-2 gap-12 bg-gray-50/30">
                     <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><GraduationCap className="text-primary" size={24} /></div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">University</p>
                           <p className="text-base font-bold text-slate-900">{u.university || 'Not Specified'}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><MapPin className="text-primary" size={24} /></div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Location</p>
                           <p className="text-base font-bold text-slate-900">{u.current_location || 'Not Specified'}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><BookOpen className="text-primary" size={24} /></div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">Degree Level</p>
                           <p className="text-base font-bold text-slate-900">{u.current_level || 'Not Specified'}</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-5">
                        <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg flex items-center justify-center shrink-0 shadow-sm"><Award className="text-primary" size={24} /></div>
                        <div>
                           <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-1">CGPA</p>
                           <p className="text-base font-bold text-slate-900">{u.cgpa || 'Not Specified'}</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 mt-12 pt-12 border-t border-slate-100">
                     <div>
                        <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-6">Skills & Expertise</h4>
                        {renderTags(u.skills)}
                     </div>
                     <div>
                        <h4 className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-6">Research Interests</h4>
                        {renderTags(u.research_interests)}
                     </div>
                  </div>
               </section>

               <section>
                  <h3 className="text-xs font-medium text-slate-400 uppercase tracking-[0.2em] mb-8">Test Scores</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                     {[
                       { label: 'IELTS', score: u.ielts_score },
                       { label: 'GRE', score: u.gre_score },
                       { label: 'SAT/Other', score: u.sat_score || '--' }
                     ].map((test, i) => (
                       <div key={i} className="p-8 border border-black/5 rounded-lg bg-white text-center shadow-sm">
                          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] mb-2">{test.label}</p>
                          <p className="text-xl sm:text-3xl font-bold text-primary underline decoration-primary/10 decoration-4 underline-offset-8">{test.score || '--'}</p>
                       </div>
                     ))}
                  </div>
               </section>
          </div>
        </div>
      </main>

      {/* Live Web Camera Capture Modal */}
      {showWebcamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Camera className="text-primary" size={20} />
                <h3 className="font-bold text-sm text-slate-900">Take Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseWebcam}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-72 h-72 rounded-full overflow-hidden border-4 border-primary/20 shadow-inner bg-black flex items-center justify-center relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">
                Center your face and click Capture when you are ready.
              </p>
              <div className="flex gap-3 mt-6 w-full">
                <button
                  type="button"
                  onClick={handleCloseWebcam}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCaptureWebcam}
                  className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-primary hover:bg-primary/90 rounded-xl shadow-md shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Camera size={16} />
                  Capture & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 border-t border-slate-100 text-center">
         <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em]">ScholarshipConnectBD Profile v2.5</p>
      </footer>
    </div>
  );
}
