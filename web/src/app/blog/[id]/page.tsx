"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Heart,
  MessageCircle,
  Tag,
  Send,
  Sparkles,
  Check
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

const REACTION_EMOJIS: Record<string, { label: string; icon: string }> = {
  love: { label: 'Love', icon: '❤️' },
  celebrate: { label: 'Celebrate', icon: '👏' },
  support: { label: 'Support', icon: '🤝' },
  insightful: { label: 'Insightful', icon: '💡' },
  inspiring: { label: 'Inspiring', icon: '✨' },
};

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Reactions & Comments state
  const [reacting, setReacting] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const loadPost = async () => {
    try {
      const res = await apiService.getBlogPostDetail(id as string);
      if (res.ok && res.data) {
        setPost(res.data);
      } else {
        // Fallback: search in getBlogPosts list
        const listRes = await apiService.getBlogPosts();
        if (listRes.ok && Array.isArray(listRes.data)) {
          const found = listRes.data.find((p: any) => String(p.id) === String(id));
          if (found) setPost(found);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadPost();
    }
  }, [id]);

  const handleReact = async (reactionType = 'love') => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (reacting) return;
    setReacting(true);
    setShowReactionPicker(false);
    try {
      const res = await apiService.reactBlogPost(id as string, reactionType);
      if (res.ok) {
        await loadPost();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReacting(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }
    if (!commentText.trim()) return;

    setCommenting(true);
    try {
      const res = await apiService.addBlogComment(id as string, commentText.trim());
      if (res.ok) {
        setCommentText('');
        await loadPost();
      } else {
        alert(res.data?.error || 'Failed to post comment.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommenting(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Story Not Found</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 font-normal">The story you are looking for may have been removed or does not exist.</p>
          <button
            onClick={() => router.push('/blog')}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-medium uppercase tracking-wider"
          >
            Back to Insights
          </button>
        </div>
      </div>
    );
  }

  const coverImg = post.image_url || post.image;
  const authorDisplayName = post.author_full_name || post.author_name || 'Scholar';
  const authorAvatar = post.author_avatar_url;
  const userReaction = post.user_reaction;

  const parsedTags = post.tags
    ? post.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
    : ['Scholarship', 'Application', 'Tips', 'Education'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 lg:py-14">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-8 md:p-10 shadow-sm">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-xs font-medium uppercase tracking-wider mb-8 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Insights
          </button>

          <article className="max-w-3xl mx-auto space-y-10">
            <header className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-primary text-white text-[10px] font-medium uppercase tracking-wider px-3 py-1 rounded-lg shadow-xs">
                  {post.university || post.category || 'Success Story'}
                </span>
                <div className="flex items-center gap-4 text-[10px] sm:text-xs font-normal text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-primary" />
                    {formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={13} className="text-primary" />
                    {calculateReadTime(post.content)}
                  </span>
                </div>
              </div>

              {/* Title - Bold */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 leading-snug tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-medium text-base uppercase border border-slate-200 shadow-xs overflow-hidden shrink-0">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      authorDisplayName[0]
                    )}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-slate-900">{authorDisplayName}</p>
                    <p className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                      {post.author_role || 'Featured Author'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 relative self-end sm:self-auto">
                  <button
                    onClick={handleShare}
                    className="p-2.5 text-slate-500 hover:text-primary transition-all border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs flex items-center gap-1.5 cursor-pointer"
                    title="Share story"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
                    {copied && <span className="text-[10px] font-medium text-emerald-600">Copied!</span>}
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => handleReact(userReaction || 'love')}
                      onMouseEnter={() => setShowReactionPicker(true)}
                      className={`p-2.5 transition-all border rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer ${
                        userReaction
                          ? 'border-red-200 bg-red-50 text-red-500'
                          : 'border-slate-200 text-slate-500 hover:text-red-500 hover:bg-slate-50'
                      }`}
                    >
                      <Heart size={16} className={userReaction ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-xs font-normal">{post.reactions_count || 0}</span>
                    </button>

                    {/* Reaction Picker Popup */}
                    {showReactionPicker && (
                      <div
                        onMouseLeave={() => setShowReactionPicker(false)}
                        className="absolute bottom-full right-0 mb-2 p-1.5 bg-white border border-slate-200 rounded-xl shadow-lg flex items-center gap-1 z-30 animate-in fade-in duration-200"
                      >
                        {Object.entries(REACTION_EMOJIS).map(([key, item]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleReact(key)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-all text-lg cursor-pointer"
                            title={item.label}
                          >
                            {item.icon}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Cover Image (Only rendered if an image exists) */}
            {coverImg && (
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-xs">
                <img src={coverImg} className="w-full h-full object-cover" alt={post.title} />
              </div>
            )}

            {/* Article Content - Normal/Medium readable text */}
            <div className="prose prose-slate max-w-none">
              <div className="text-slate-700 text-sm sm:text-base leading-relaxed space-y-5 font-normal">
                {post.content ? (
                  post.content.split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))
                ) : (
                  <p>No content provided for this story.</p>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-2">
              {parsedTags.map((tag: string) => (
                <span
                  key={tag}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] sm:text-xs font-normal border border-slate-200/80 shadow-xs"
                >
                  <Tag size={12} className="text-primary" />
                  {tag}
                </span>
              ))}
            </div>

            {/* Comments Section */}
            <section className="pt-8 border-t border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageCircle size={18} className="text-primary" />
                  Comments ({post.comments?.length || 0})
                </h3>
              </div>

              {/* Add Comment Input */}
              {user ? (
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts or ask a question about this story..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={commenting || !commentText.trim()}
                      className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-medium uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      <Send size={13} />
                      {commenting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <p className="text-xs font-normal text-slate-600">
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Log in
                    </Link>{' '}
                    to join the discussion and ask questions.
                  </p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-3">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className="p-3.5 bg-slate-50/80 border border-slate-100 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center text-slate-700 font-medium text-xs uppercase overflow-hidden">
                            {comment.author_avatar_url ? (
                              <img src={comment.author_avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              (comment.author_full_name || comment.author_name || 'U')[0]
                            )}
                          </div>
                          <span className="text-xs font-medium text-slate-900">
                            {comment.author_full_name || comment.author_name}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-normal leading-relaxed pl-9">
                        {comment.content}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 font-normal text-center py-4">
                    No comments yet. Be the first to start the discussion!
                  </p>
                )}
              </div>
            </section>

            {/* AI Eligibility CTA */}
            <div className="bg-gradient-to-r from-teal-50/80 via-emerald-50/80 to-cyan-50/80 border border-teal-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-3 relative overflow-hidden shadow-xs">
              <div className="relative z-10 space-y-2">
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[10px] font-medium uppercase tracking-wider px-3 py-0.5 rounded-lg border border-primary/20">
                  <Sparkles size={12} /> AI Powered
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">Inspired by this story?</h3>
                <p className="text-slate-600 text-xs sm:text-sm max-w-lg mx-auto font-normal leading-relaxed">
                  Check your eligibility for thousands of global scholarships with ScholarAI.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => router.push('/ai-tools/eligibility')}
                    className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                  >
                    Check Eligibility
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </main>

      <footer className="py-10 border-t border-slate-100 text-center">
        <p className="text-[10px] font-normal text-slate-400 uppercase tracking-widest">
          ScholarshipConnectBD Insights
        </p>
      </footer>
    </div>
  );
}
