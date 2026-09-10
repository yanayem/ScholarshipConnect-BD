"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Search } from 'lucide-react';
import Link from 'next/link';

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiService.getBlogPosts();
        if (res.ok) {
          setPosts(res.data as any[]);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-16">
          <div className="flex items-center gap-3 mb-4">
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary-light px-3 py-1 rounded">Stories</span>
             <div className="h-px flex-1 bg-slate-100"></div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Scholar Insights</h1>
          <p className="text-slate-500 max-w-2xl font-medium leading-relaxed">
            Success stories, application tips, and guides written by Bangladeshi students who've been there and done that.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Blog Feed */}
          <div className="lg:col-span-2 space-y-16">
             {loading ? (
                <div className="space-y-12">
                   {[1, 2].map(i => (
                     <div key={i} className="space-y-4">
                        <div className="aspect-video w-full bg-slate-50 rounded-3xl animate-pulse"></div>
                        <div className="h-6 w-3/4 bg-slate-50 rounded animate-pulse"></div>
                        <div className="h-4 w-1/2 bg-slate-50 rounded animate-pulse"></div>
                     </div>
                   ))}
                </div>
             ) : (
                <div className="space-y-16">
                   {posts.map((post) => (
                     <article key={post.id} className="group cursor-pointer">
                        <Link href={`/blog/${post.id}`}>
                           <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden mb-8 border border-slate-100 bg-slate-50 relative">
                              <img
                                src={post.image || 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=1200&q=80'}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                alt={post.title}
                              />
                              <div className="absolute top-6 left-6">
                                 <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 border border-slate-200 shadow-sm">
                                    {post.category || 'Success Story'}
                                 </span>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                 <span className="flex items-center gap-2"><Calendar size={14} /> {post.created_at || 'Oct 12, 2024'}</span>
                                 <span className="flex items-center gap-2"><Clock size={14} /> 5 min read</span>
                              </div>

                              <h2 className="text-2xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                 {post.title}
                              </h2>

                              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                 {post.excerpt || post.content}
                              </p>

                              <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-4 transition-all pt-2">
                                 Read Full Story
                                 <ArrowRight size={16} />
                              </div>
                           </div>
                        </Link>
                     </article>
                   ))}
                </div>
             )}
          </div>

          {/* Sidebar */}
          <div className="space-y-12">
             <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Search Articles</h3>
                <div className="relative">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input
                     type="text"
                     placeholder="Search keywords..."
                     className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs font-bold"
                   />
                </div>
             </section>

             <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Popular Tags</h3>
                <div className="flex flex-wrap gap-2">
                   {['USA', 'MEXT', 'Commonwealth', 'SOP Tips', 'IELTS', 'Germany', 'Visa'].map(tag => (
                     <button key={tag} className="px-4 py-2 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all">
                        {tag}
                     </button>
                   ))}
                </div>
             </section>

             <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 space-y-6">
                <h4 className="font-bold text-slate-900">Want to share your story?</h4>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                   Help the next generation of Bangladeshi scholars by sharing your experiences and tips.
                </p>
                <button className="w-full py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                   Submit Article
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
