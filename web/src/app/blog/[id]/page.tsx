"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Heart,
  MessageCircle,
  Tag
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      // Proxy: fetch all and filter for now
      const res = await apiService.getBlogPosts();
      if (res.ok) {
        const found = (res.data as any[]).find(p => String(p.id) === id);
        setPost(found);
      }
      setLoading(false);
    };
    loadPost();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!post) return <div className="p-20 text-center font-bold">Story not found.</div>;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-bold uppercase tracking-widest mb-10"
        >
          <ArrowLeft size={16} />
          Back to Insights
        </button>

        <article className="space-y-10">
           <header className="space-y-6">
              <div className="flex items-center gap-4">
                 <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg">
                    {post.category || 'Success Story'}
                 </span>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <Calendar size={14} /> {post.created_at || 'Oct 12, 2024'}
                 </div>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight tracking-tight">
                 {post.title}
              </h1>

              <div className="flex items-center justify-between py-6 border-y border-slate-100">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold uppercase">
                       {post.author_name?.[0] || 'S'}
                    </div>
                    <div>
                       <p className="text-sm font-bold text-slate-900">{post.author_name || 'Scholar'}</p>
                       <p className="text-[10px] text-slate-400 font-bold uppercase">Featured Author</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button className="p-2.5 text-slate-400 hover:text-primary transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"><Share2 size={18} /></button>
                    <button className="p-2.5 text-slate-400 hover:text-red-500 transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"><Heart size={18} /></button>
                 </div>
              </div>
           </header>

           <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden border border-slate-100 bg-slate-50">
              <img
                src={post.image || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80'}
                className="w-full h-full object-cover"
                alt={post.title}
              />
           </div>

           <div className="prose prose-slate max-w-none">
              <div className="text-slate-600 text-lg leading-relaxed space-y-6">
                 {post.content.split('\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                 ))}
                 {!post.content && (
                   <p>
                     This is a featured success story about how a Bangladeshi student successfully applied for the MEXT scholarship in Japan.
                     The journey involved meticulous preparation of the Statement of Purpose, gathering strong recommendation letters,
                     and performing well in the interview process at the Japanese Embassy in Dhaka.
                   </p>
                 )}
              </div>
           </div>

           <div className="pt-10 border-t border-slate-100 flex flex-wrap gap-2">
              {['Scholarship', 'Application', 'Tips', 'Education'].map(tag => (
                <span key={tag} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100">
                   <Tag size={12} />
                   {tag}
                </span>
              ))}
           </div>

           <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center space-y-6 relative overflow-hidden">
              <h3 className="text-2xl font-bold relative z-10">Inspired by this story?</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto relative z-10">Start your own journey today with our AI Matchmaker and find scholarships that fit your profile.</p>
              <button
                onClick={() => router.push('/ai-tools/matchmaker')}
                className="px-10 py-4 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all relative z-10"
              >
                 Find My Matches
              </button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
           </div>
        </article>
      </main>
    </div>
  );
}
