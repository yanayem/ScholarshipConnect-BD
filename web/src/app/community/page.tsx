"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { MessageSquare, Users, MessageCircle, Heart, Share2, Plus, Search } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiService.getDiscussions();
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Community</h1>
            <p className="text-slate-500 text-sm font-medium">Connect with fellow scholars and share your journey.</p>
          </div>
          <button className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 text-sm">
             <Plus size={20} />
             Start Discussion
          </button>
        </header>

        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Filters */}
          <div className="hidden lg:block space-y-8">
             <section>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Categories</h3>
                <div className="space-y-2">
                   {['All Discussions', 'Application Tips', 'Country Guides', 'Visa Experience', 'General Help'].map(cat => (
                     <button key={cat} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                       cat === 'All Discussions' ? 'bg-slate-50 text-primary' : 'text-slate-500 hover:text-primary'
                     }`}>
                        {cat}
                     </button>
                   ))}
                </div>
             </section>

             <div className="bg-slate-900 rounded-2xl p-6 text-white text-center">
                <Users size={32} className="mx-auto mb-4 opacity-50" />
                <h4 className="font-bold text-sm mb-2">Scholar Leaderboard</h4>
                <p className="text-slate-400 text-[10px] mb-6">See who's leading the community this month.</p>
                <Link href="/community/leaderboard" className="block w-full py-2 bg-white text-slate-900 text-[10px] font-bold rounded-lg hover:bg-slate-100 transition-colors uppercase tracking-widest">
                   View Rankings
                </Link>
             </div>
          </div>

          {/* Feed */}
          <div className="lg:col-span-3 space-y-6">
             {/* Search */}
             <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
                />
             </div>

             {loading ? (
               <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-40 border border-slate-100 rounded-3xl animate-pulse"></div>
                  ))}
               </div>
             ) : (
               <div className="space-y-6">
                  {posts.map((post) => (
                    <div key={post.id} className="border border-slate-200 rounded-3xl p-6 hover:border-primary/30 transition-all bg-white shadow-sm shadow-slate-100/50">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold text-sm uppercase">
                             {post.author_name?.[0] || 'A'}
                          </div>
                          <div>
                             <h4 className="text-sm font-bold text-slate-900">{post.author_name || 'Anonymous'}</h4>
                             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.category || 'General'}</p>
                          </div>
                          <span className="ml-auto text-[10px] font-bold text-slate-300 uppercase tracking-widest">{post.created_at || '2h ago'}</span>
                       </div>

                       <h3 className="font-bold text-slate-900 text-lg mb-2 leading-snug">{post.title}</h3>
                       <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{post.content}</p>

                       <div className="flex items-center gap-6 pt-6 border-t border-slate-50">
                          <button className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                             <MessageCircle size={18} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{post.comments_count || 0} Comments</span>
                          </button>
                          <button className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors">
                             <Heart size={18} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{post.likes_count || 0} Likes</span>
                          </button>
                          <button className="ml-auto text-slate-300 hover:text-primary transition-colors">
                             <Share2 size={16} />
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
