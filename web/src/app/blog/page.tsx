"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Calendar, Clock, ArrowRight, Tag, Search, Plus, MessageCircle, Heart, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BlogPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await apiService.getBlogPosts();
        if (res.ok && Array.isArray(res.data)) {
          setPosts(res.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const popularTags = ['MEXT', 'USA', 'Commonwealth', 'SOP Tips', 'IELTS', 'Germany', 'Visa'];

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title?.toLowerCase().includes(q) ||
        post.content?.toLowerCase().includes(q) ||
        post.university?.toLowerCase().includes(q) ||
        post.tags?.toLowerCase().includes(q) ||
        post.author_full_name?.toLowerCase().includes(q) ||
        post.author_name?.toLowerCase().includes(q);

      const matchesTag =
        !selectedTag ||
        post.tags?.toLowerCase().includes(selectedTag.toLowerCase()) ||
        post.category?.toLowerCase().includes(selectedTag.toLowerCase());

      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTag]);

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
    }
  };

  const handleCreateClick = () => {
    if (!user) {
      router.push('/login');
    } else {
      router.push('/blog/create');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const calculateReadTime = (content: string = '') => {
    const words = content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm">
          {/* Top Header */}
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[10px] font-medium text-primary uppercase tracking-widest bg-primary-light px-3.5 py-1 rounded-lg border border-primary/10">
                  Scholar Insights
                </span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                Scholar Stories & Guides
              </h1>
              <p className="text-slate-500 max-w-2xl text-xs sm:text-sm leading-relaxed font-normal">
                Success stories, SOP breakdowns, and application tips written by Bangladeshi students who have secured prestigious global scholarships.
              </p>
            </div>

            <button
              onClick={handleCreateClick}
              className="px-5 py-3 bg-primary text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-xs shrink-0 cursor-pointer w-full sm:w-auto"
            >
              <Plus size={16} />
              Share Your Story
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Blog Feed */}
            <div className="lg:col-span-2 space-y-12">
              {loading ? (
                <div className="space-y-10">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <div className="aspect-[16/9] w-full bg-slate-100 rounded-2xl animate-pulse border border-slate-100"></div>
                      <div className="h-6 w-3/4 bg-slate-100 rounded-lg animate-pulse"></div>
                      <div className="h-4 w-1/2 bg-slate-100 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl p-6 sm:p-8">
                  <BookOpen size={44} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">No Stories Found</h3>
                  <p className="text-slate-500 text-xs font-normal max-w-md mx-auto mb-6 leading-relaxed">
                    {searchQuery || selectedTag
                      ? 'No posts matched your current search or tag filter. Try clearing your filters or search terms.'
                      : 'Be the first scholar to share your journey and inspire future applicants!'}
                  </p>
                  {(searchQuery || selectedTag) ? (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedTag(null);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-slate-800 transition-all"
                    >
                      Reset Filters
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateClick}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-primary/90 transition-all"
                    >
                      Publish First Story
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-12">
                  {filteredPosts.map((post) => {
                    const coverImg = post.image_url || post.image;
                    const authorDisplayName = post.author_full_name || post.author_name || 'Scholar';

                    return (
                      <article key={post.id} className="group cursor-pointer">
                        <Link href={`/blog/${post.id}`}>
                          {coverImg && (
                            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-5 border border-slate-100 bg-slate-50 relative shadow-xs">
                              <img
                                src={coverImg}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                alt={post.title}
                              />
                              <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-2">
                                <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-medium uppercase tracking-wider text-slate-900 border border-slate-200 shadow-xs">
                                  {post.university || post.category || 'Success Story'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-normal text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Calendar size={13} className="text-primary" />
                                {formatDate(post.created_at)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <Clock size={13} className="text-primary" />
                                {calculateReadTime(post.content)}
                              </span>
                              <span className="flex items-center gap-1.5 text-slate-600">
                                <User size={13} className="text-slate-400" />
                                {authorDisplayName}
                              </span>
                              {post.university && !coverImg && (
                                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[9px] font-normal">
                                  {post.university}
                                </span>
                              )}
                            </div>

                            <h2 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-primary transition-colors leading-snug tracking-tight">
                              {post.title}
                            </h2>

                            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-normal">
                              {post.content}
                            </p>

                            {post.tags && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {post.tags.split(',').map((t: string) => (
                                  <span
                                    key={t.trim()}
                                    className="text-[10px] font-normal text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md"
                                  >
                                    #{t.trim()}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                              <div className="flex items-center gap-4 text-xs font-normal text-slate-400">
                                <span className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                                  <Heart size={14} />
                                  {post.reactions_count || 0}
                                </span>
                                <span className="flex items-center gap-1.5 hover:text-primary transition-colors">
                                  <MessageCircle size={14} />
                                  {post.comments_count || 0}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-primary font-medium text-xs uppercase tracking-wider group-hover:gap-3 transition-all">
                                Read Story
                                <ArrowRight size={15} />
                              </div>
                            </div>
                          </div>
                        </Link>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Search Articles
                </h3>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, tags, universities..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-xs font-normal transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-normal text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </section>

              <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Filter by Tag
                  </h3>
                  {selectedTag && (
                    <button
                      onClick={() => setSelectedTag(null)}
                      className="text-[10px] font-normal text-primary hover:underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => {
                    const isActive = selectedTag?.toLowerCase() === tag.toLowerCase();
                    return (
                      <button
                        key={tag}
                        onClick={() => handleTagClick(tag)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-medium uppercase tracking-wider transition-all cursor-pointer ${
                          isActive
                            ? 'bg-primary text-white shadow-xs'
                            : 'border border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </section>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-lg">
                    <BookOpen size={12} /> Community Driven
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">Share your story</h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-normal">
                    Help future applicants by detailing your scholarship application experience, interview questions, and SOP strategy.
                  </p>
                  <button
                    onClick={handleCreateClick}
                    className="w-full py-2.5 bg-primary text-white rounded-xl font-medium text-[10px] uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs cursor-pointer mt-1"
                  >
                    Write a Story
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-100 text-center">
        <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
          © 2026 ScholarshipConnectBD Blog
        </p>
      </footer>
    </div>
  );
}
