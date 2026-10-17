"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { BookOpen, FileText, Upload, Trash2, ShieldCheck, Plus, Search, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function DocVaultPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('CV');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DOCUMENT_TYPES = [
    { label: 'CV / Resume', value: 'CV' },
    { label: 'Transcript', value: 'Transcript' },
    { label: 'Passport', value: 'Passport' },
    { label: 'IELTS / TOEFL', value: 'Language Test' },
    { label: 'Recommendation', value: 'Recommendation' },
    { label: 'Certificate', value: 'Certificate' },
    { label: 'Other', value: 'Other' },
  ];

  const fetchDocs = async () => {
    try {
      const res = await apiService.getDocuments();
      if (res.ok) {
        setDocs(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchDocs();
    }
  }, [user, authLoading]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('doc_type', selectedType);
      formData.append('file', file);

      const res = await apiService.uploadDocument(formData);
      if (res.ok) {
        await fetchDocs();
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        alert(res.data?.error || 'Failed to upload document.');
      }
    } catch (err) {
      alert('Network error while uploading.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number | string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await apiService.deleteDocument(id);
      if (res.ok) {
        setDocs(prev => prev.filter(d => d.id !== id));
      } else {
        alert('Failed to delete document.');
      }
    } catch (e) {
      alert('Network error.');
    }
  };

  if (authLoading) return null;
  if (!user) return null;

  const filteredDocs = docs.filter(d => {
    const matchSearch = (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
                        (d.doc_type || '').toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-white border border-slate-200 rounded-sm p-8 md:p-12 shadow-sm">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Document Vault</h1>
            <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
               <ShieldCheck size={16} className="text-emerald-500" />
               Your documents are encrypted and secure.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg px-3 py-3 outline-none focus:ring-2 focus:ring-primary/20"
            >
              {DOCUMENT_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 text-sm disabled:opacity-50"
            >
               {uploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={20} />}
               <span>{uploading ? 'Uploading...' : 'Upload New'}</span>
            </button>
          </div>
        </header>

        {/* Stats & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-10">
           <div className="sm:col-span-3 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search documents by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium bg-slate-50/50"
              />
           </div>
           <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col items-center justify-center">
              <span className="text-slate-900 font-bold text-lg">{docs.length} / 20</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Used</span>
           </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 size={32} className="animate-spin text-primary mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">Accessing Secure Vault...</p>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <FileText size={48} className="mx-auto text-slate-300 mb-4" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-1">No Documents in Vault</h4>
            <p className="text-xs text-slate-500 mb-6">Upload your CV, Transcript, and Passport to unlock Agency processing.</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-lg shadow-md hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
              <Upload size={16} />
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredDocs.map((doc) => (
               <div key={doc.id} className="group border border-slate-200 rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-sm bg-white relative">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                     <FileText size={24} className="text-slate-400 group-hover:text-primary" />
                  </div>

                  <h4 className="font-bold text-slate-900 truncate mb-1" title={doc.name}>{doc.name}</h4>
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">{doc.doc_type || 'Document'}</p>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                     <div className="text-[10px] font-bold text-slate-500">
                        <p>{doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}</p>
                        {doc.size && <p className="opacity-60">{doc.size}</p>}
                     </div>
                     <button
                        onClick={() => handleDelete(doc.id, doc.name)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Delete document"
                     >
                        <Trash2 size={16} />
                     </button>
                  </div>
               </div>
             ))}

             {/* Upload Placeholder */}
             <button
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-3 hover:bg-slate-50 hover:border-primary/30 transition-all text-slate-400 hover:text-primary group"
             >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-slate-200 group-hover:border-primary/30">
                   <Upload size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Add Document</span>
             </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-20 p-8 border border-slate-100 rounded-lg bg-slate-50 flex items-start gap-6">
           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
              <ShieldCheck size={24} className="text-emerald-500" />
           </div>
           <div>
              <h4 className="font-bold text-slate-900 mb-1">Privacy First Storage</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                 All documents uploaded to the Vault are encrypted using AES-256. ScholarshipConnectBD employees cannot access your private files. They are only shared with institutions when you explicitly click "Apply".
              </p>
           </div>
        </div>
      </div>
      </main>
    </div>
  );
}
