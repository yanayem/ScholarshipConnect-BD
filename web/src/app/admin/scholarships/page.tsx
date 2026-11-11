"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Trash2,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Eye,
  Check,
  X,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminScholarshipsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'active' | 'rejected'>('all');
  const [search, setSearch] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Reject Modal
  const [rejectingItem, setRejectingItem] = useState<any | null>(null);
  const [rejectionNote, setRejectionNote] = useState('');

  // Confirmation Modal for Approval or Deletion
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    actionType: 'approve' | 'delete' | '';
    targetId: number | null;
  }>({
    visible: false,
    title: '',
    message: '',
    actionType: '',
    targetId: null,
  });

  const fetchScholarships = useCallback(async () => {
    setLoading(true);
    let params = '';
    if (filterStatus !== 'all') {
      params = `status=${filterStatus}`;
    }
    if (search.trim()) {
      params += (params ? '&' : '') + `search=${encodeURIComponent(search.trim())}`;
    }

    const res = await apiService.getScholarships(params);
    if (res.ok) {
      const data = Array.isArray(res.data) ? res.data : (res.data as any)?.results || [];
      setScholarships(data);
    } else {
      console.error('Failed to load scholarships', res.data);
    }
    setLoading(false);
  }, [filterStatus, search]);

  useEffect(() => {
    if (user?.is_staff) {
      fetchScholarships();
    }
  }, [user, fetchScholarships]);

  const handleApproveClick = (item: any) => {
    setConfirmModal({
      visible: true,
      title: 'Approve Scholarship',
      message: `Are you sure you want to approve "${item.title}"? It will become visible to all students immediately, and 200 points will be awarded to the submitter.`,
      actionType: 'approve',
      targetId: item.id,
    });
  };

  const handleDeleteClick = (item: any) => {
    setConfirmModal({
      visible: true,
      title: 'Delete Scholarship',
      message: `Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`,
      actionType: 'delete',
      targetId: item.id,
    });
  };

  const handleExecuteConfirm = async () => {
    const { actionType, targetId } = confirmModal;
    if (!targetId) return;

    setProcessingId(targetId);
    setConfirmModal(prev => ({ ...prev, visible: false }));

    try {
      if (actionType === 'approve') {
        const res = await apiService.approveScholarship(targetId, 'approve');
        if (res.ok) {
          fetchScholarships();
        } else {
          alert((res.data as any)?.error || 'Failed to approve scholarship.');
        }
      } else if (actionType === 'delete') {
        const res = await apiService.deleteScholarship(targetId);
        if (res.ok) {
          setScholarships(prev => prev.filter(s => s.id !== targetId));
        } else {
          alert('Failed to delete scholarship.');
        }
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectingItem) return;
    setProcessingId(rejectingItem.id);

    try {
      const res = await apiService.approveScholarship(rejectingItem.id, 'reject', rejectionNote);
      if (res.ok) {
        setRejectingItem(null);
        setRejectionNote('');
        fetchScholarships();
      } else {
        alert((res.data as any)?.error || 'Failed to reject scholarship.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error occurred.');
    } finally {
      setProcessingId(null);
    }
  };

  if (!user?.is_staff) return null;

  const pendingCount = scholarships.filter(s => s.status === 'pending').length;

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-xl hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Manage & Verify Scholarships</h1>
              <p className="text-xs text-slate-500 font-medium">Review submitted scholarships, approve, or reject with notes.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchScholarships()}
              className="p-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link
              href="/scholarships/add"
              className="flex-1 sm:flex-none px-5 py-2.5 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus size={16} />
              Add Scholarship
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending Review', badge: filterStatus === 'all' && pendingCount > 0 ? pendingCount : undefined },
              { id: 'active', label: 'Active (Approved)' },
              { id: 'rejected', label: 'Rejected' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  filterStatus === tab.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search title, country, provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-medium text-slate-900"
            />
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />
            ))}
          </div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <AlertCircle size={40} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-900">No scholarships found</h3>
            <p className="text-xs text-slate-500 mt-1">There are no scholarships matching the current filter criteria.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Scholarship</th>
                    <th className="px-6 py-4">Category & Country</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Submitted By</th>
                    <th className="px-6 py-4">Deadline</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {scholarships.map(s => {
                    const isPending = s.status === 'pending';
                    const isActive = s.status === 'active';
                    const isRejected = s.status === 'rejected';

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 max-w-xs">
                          <div className="font-bold text-slate-900 line-clamp-1">{s.title}</div>
                          <div className="text-[11px] text-slate-500 font-medium line-clamp-1">{s.provider || 'No provider'}</div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-700">{s.country || 'Global'}</span>
                          <span className="text-slate-400 block text-[10px]">{s.level || s.category}</span>
                        </td>

                        <td className="px-6 py-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 font-bold text-[10px] uppercase">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                          {isActive && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-bold text-[10px] uppercase">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200/60 font-bold text-[10px] uppercase">
                              <XCircle size={12} />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {s.submitted_by_name || s.submitted_by_username || (s.submitted_by ? `User #${s.submitted_by}` : 'Official / Admin')}
                        </td>

                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {s.deadline || 'Ongoing'}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Live */}
                            <Link
                              href={`/scholarships/${s.id}`}
                              target="_blank"
                              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Preview Detail"
                            >
                              <Eye size={15} />
                            </Link>

                            {/* Approve Button */}
                            {s.status !== 'active' && (
                              <button
                                onClick={() => handleApproveClick(s)}
                                disabled={processingId === s.id}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                                title="Approve this scholarship"
                              >
                                <Check size={13} />
                                Approve
                              </button>
                            )}

                            {/* Reject Button */}
                            {s.status === 'pending' && (
                              <button
                                onClick={() => {
                                  setRejectingItem(s);
                                  setRejectionNote('');
                                }}
                                disabled={processingId === s.id}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                                title="Reject this scholarship"
                              >
                                <X size={13} />
                                Reject
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteClick(s)}
                              disabled={processingId === s.id}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete permanently"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reject Scholarship</h3>
            <p className="text-xs text-slate-500 mb-4">
              Provide a reason or feedback for rejecting <span className="font-semibold text-slate-800">"{rejectingItem.title}"</span>. The submitter will receive a notification.
            </p>

            <textarea
              rows={4}
              value={rejectionNote}
              onChange={(e) => setRejectionNote(e.target.value)}
              placeholder="e.g. Incomplete circular information, duplicate entry, or invalid official link..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-4 resize-none"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingItem(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectSubmit}
                disabled={processingId === rejectingItem.id}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer disabled:opacity-50"
              >
                {processingId === rejectingItem.id ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.visible && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">{confirmModal.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{confirmModal.message}</p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, visible: false }))}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConfirm}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  confirmModal.actionType === 'delete' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmModal.actionType === 'delete' ? 'Confirm Delete' : 'Confirm Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
