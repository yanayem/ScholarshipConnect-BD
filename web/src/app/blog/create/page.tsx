"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  ImageIcon,
  Send,
  Tag,
  Upload,
  X
} from 'lucide-react';

export default function CreateBlogPostPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [university, setUniversity] = useState('');
  const [tags, setTags] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (authLoading) return null;
  if (!user) {
    router.push('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImageUrl('');
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a story title.');
      return;
    }
    if (!content.trim()) {
      setErrorMsg('Please enter the content for your story or guide.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      let payload: FormData | Record<string, any>;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('university', university.trim());
        formData.append('tags', tags.trim());
        formData.append('content', content.trim());
        formData.append('post_type', 'blog');
        formData.append('image', selectedFile);
        if (imageUrl.trim()) formData.append('image_url', imageUrl.trim());
        payload = formData;
      } else {
        payload = {
          title: title.trim(),
          university: university.trim(),
          tags: tags.trim(),
          image_url: imageUrl.trim(),
          content: content.trim(),
          post_type: 'blog',
        };
      }

      const res = await apiService.createBlogPost(payload);
      if (res.ok && res.data?.id) {
        alert('Your story has been published successfully!');
        router.push(`/blog/${res.data.id}`);
      } else {
        setErrorMsg(res.data?.error || 'Failed to publish story. Please check your inputs.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('An unexpected error occurred while connecting to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickTagAdd = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags(tags ? `${tags}, ${tag}` : tag);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-medium uppercase tracking-wider mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Insights
          </button>

          <header className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <BookOpen size={20} />
              </div>
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary">
                Share Experience
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
              Publish Your Success Story
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-normal leading-relaxed">
              Inspire thousands of Bangladeshi students by sharing your application journey, interview tips, or scholarship guidance.
            </p>
          </header>

          {errorMsg && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-normal text-red-600">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 ml-1">
                Story Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How I Secured the MEXT Scholarship in Japan with a 3.2 CGPA"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 ml-1">
                  University / Institution (Optional)
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. University of Tokyo, Japan"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 ml-1">
                  Cover Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors border-dashed">
                    <Upload size={15} className="text-slate-400" />
                    <span>{selectedFile ? selectedFile.name : 'Choose File / Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {selectedFile && (
                    <button
                      type="button"
                      onClick={removeSelectedFile}
                      className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      title="Remove file"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {!selectedFile && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 ml-1">
                  Or Cover Image URL (Optional)
                </label>
                <div className="relative">
                  <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 ml-1">
                Tags (Comma Separated)
              </label>
              <div className="relative">
                <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. MEXT, SOP Tips, Japan, IELTS"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-normal text-slate-400 self-center mr-1">Quick Add:</span>
                {['MEXT', 'USA', 'Commonwealth', 'SOP Tips', 'IELTS', 'Germany', 'Visa'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleQuickTagAdd(tag)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md text-[10px] font-normal transition-all cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 ml-1">
                Story Content & Guidance *
              </label>
              <textarea
                required
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your detailed story, step-by-step application experience, documents needed, key tips, and advice for prospective applicants..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-y leading-relaxed"
              />
            </div>

            {(previewUrl || imageUrl) && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 ml-1">Cover Image Preview</label>
                <div className="aspect-[16/9] max-h-56 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img src={previewUrl || imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <Send size={14} />
                {submitting ? 'Publishing...' : 'Publish Story'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
