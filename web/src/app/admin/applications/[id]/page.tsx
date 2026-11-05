"use client";

import React, { useState, useEffect } from 'react';

import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  GraduationCap,
  Award,
  BookOpen,
  FileText,
  Calendar,
  Globe,
  Download,
  ExternalLink,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  MessageSquare,
  Sparkles,
  Send
} from 'lucide-react';
import Link from 'next/link';

export default function ApplicationDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.is_staff)) {
      router.push('/home');
    }
  }, [user, authLoading, router]);

  const loadDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await apiService.getApplicationDetail(id);
      if (res.ok) {
        setApp(res.data);
      } else {
        setStatusMessage({ text: 'Failed to fetch application details.', type: 'error' });
      }
    } catch (err) {
      console.error('[Admin App Detail] Load error:', err);
      setStatusMessage({ text: 'Error loading application.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.is_staff && id) {
      loadDetail();
    }
  }, [user, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!id || updating) return;
    try {
      setUpdating(true);
      setStatusMessage(null);
      const res = await apiService.updateApplicationStatus(id, newStatus);
      if (res.ok) {
        setApp(res.data);
        setStatusMessage({ text: `Application status updated to "${newStatus}"!`, type: 'success' });
      } else {
        setStatusMessage({ text: res.data?.error || 'Failed to update status', type: 'error' });
      }
    } catch (err) {
      setStatusMessage({ text: 'Network error updating status.', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || !user?.is_staff) return null;

  const statusOptions = ['Applied', 'Processing', 'Under Review', 'Accepted', 'Rejected'];

  const getStatusBadgeStyle = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'accepted' || s === 'approved') return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    if (s === 'rejected') return 'bg-red-50 text-red-600 border-red-200';
    if (s === 'processing' || s === 'under review') return 'bg-purple-50 text-purple-600 border-purple-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-16">
        {/* Top Back Link */}
        <Link
          href="/admin/applications"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary mb-8 font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Applications List
        </Link>

        {loading ? (
          <div className="bg-white border border-slate-200 p-16 text-center text-slate-400 font-medium rounded-none animate-pulse">
            Loading student application details...
          </div>
        ) : !app ? (
          <div className="bg-white border border-slate-200 p-16 text-center rounded-none">
            <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Application Not Found</h2>
            <p className="text-slate-500 text-sm mb-6">The requested application could not be located in the database.</p>
            <Link href="/admin/applications" className="px-6 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest">
              Return to List
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Notification alert */}
            {statusMessage && (
              <div
                className={`p-4 text-xs font-bold uppercase tracking-widest border ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            {/* Header / Summary Card */}
            <div className="bg-white border border-slate-200 p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/10 text-primary font-black text-2xl flex items-center justify-center rounded-none shadow-sm">
                  {(app.user_full_name || app.full_name || 'U')[0]}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {app.user_full_name || app.full_name || 'Anonymous Student'}
                    </h1>
                    <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${getStatusBadgeStyle(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">
                    Applied for <span className="font-bold text-slate-800">{app.scholarship_title}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Submitted on: {app.created_at ? new Date(app.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {/* Status Update Control */}
              <div className="w-full md:w-auto bg-slate-50 p-4 border border-slate-200">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Update Processing Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((st) => (
                    <button
                      key={st}
                      disabled={updating}
                      onClick={() => handleStatusChange(st)}
                      className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest border transition-all ${
                        app.status === st
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grid Layout: Student Profile & Scholarship Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Student Academic & Contact Profile */}
              <div className="lg:col-span-2 space-y-8">
                {/* Academic Information */}
                <div className="bg-white border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    Student Profile Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
                      <p className="font-bold text-slate-900 text-sm">{app.full_name || app.user_full_name || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                      <p className="font-bold text-slate-900 text-sm lowercase">{app.email || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                      <p className="font-bold text-slate-900 text-sm">{app.phone || 'Not provided'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current University</span>
                      <p className="font-bold text-slate-900 text-sm">{app.university || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CGPA / Grade</span>
                      <p className="font-bold text-slate-900 text-sm">{app.cgpa ? `${app.cgpa} / 4.00` : 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">IELTS Score</span>
                      <p className="font-bold text-slate-900 text-sm">{app.ielts_score ? `${app.ielts_score} Bands` : 'Not submitted'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Academic Level</span>
                      <p className="font-bold text-slate-900 text-sm">{app.academic_level || 'N/A'}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Application Mode</span>
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                        app.application_type === 'Agency' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {app.application_type === 'Agency' ? 'Agency Processing Request' : 'Self Application'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Statement of Purpose (SOP) */}
                <div className="bg-white border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    Statement of Purpose (SOP)
                  </h2>

                  {app.sop ? (
                    <div className="bg-slate-50 border border-slate-100 p-6 text-slate-800 text-sm font-medium leading-relaxed whitespace-pre-line font-sans">
                      {app.sop}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm italic">No SOP was submitted with this application.</p>
                  )}
                </div>

                {/* Submitted Supporting Documents */}
                <div className="bg-white border border-slate-200 p-8 shadow-sm">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BookOpen size={16} className="text-primary" />
                    Uploaded Supporting Documents
                  </h2>

                  {app.user_documents && app.user_documents.length > 0 ? (
                    <div className="space-y-3">
                      {app.user_documents.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 hover:bg-slate-100/80 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                              DOC
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                Type: {doc.doc_type || 'General'} | Status: {doc.status || 'Valid'}
                              </p>
                            </div>
                          </div>

                          {doc.file && (
                            <a
                              href={doc.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                            >
                              Open Document
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm italic">No documents are attached to this application vault.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Scholarship Quick Info & Actions */}
              <div className="space-y-8">
                {/* Scholarship Overview */}
                <div className="bg-white border border-slate-200 p-8 shadow-sm space-y-6">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary" />
                    Target Scholarship
                  </h2>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-snug mb-2">{app.scholarship_title}</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{app.scholarship_country || 'International'}</p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Academic Level</span>
                      <span className="font-bold text-slate-800">{app.scholarship_level || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400 font-bold uppercase tracking-wider">Deadline</span>
                      <span className="font-bold text-slate-800">{app.scholarship_deadline || 'Ongoing'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/scholarships/${app.scholarship}`}
                    target="_blank"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 border border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    View Scholarship Page
                    <ExternalLink size={14} />
                  </Link>
                </div>

                {/* Direct Action Card */}
                <div className="bg-slate-900 text-white p-8 shadow-sm space-y-6">
                  <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Admin Quick Actions</h2>

                  <p className="text-xs text-slate-300 font-medium leading-relaxed">
                    You can contact the student directly or review their full documents.
                  </p>

                  <a
                    href={`mailto:${app.email}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-colors"
                  >
                    <Mail size={16} />
                    Email Student
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
