"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { apiService, getAvatarUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, Heart, MessageCircle, Share2, Star, ShieldCheck,
  Edit, Trash2, Flag, Send, Lock, Image as ImageIcon, Vote as PollIcon, Info, HelpCircle,
  MoreVertical, Check, X
} from 'lucide-react';

export default function DiscussionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const discussionId = params?.id as string;

  const [post, setPost] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'discussion'>('info');

  // Comment states
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | string | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadPost = async () => {
    if (!discussionId) return;
    setLoading(true);
    try {
      const res = await apiService.getDiscussionDetail(discussionId);
      if (res.ok) {
        setPost(res.data);
      } else {
        showToast("Discussion not found", "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error loading discussion", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [discussionId]);

  const handleLike = async () => {
    if (!user) {
      showToast("Please log in to like this discussion.", "error");
      return;
    }
    if (!post) return;

    const wasLiked = post.is_liked;
    setPost({
      ...post,
      is_liked: !wasLiked,
      likes_count: wasLiked ? Math.max(0, post.likes_count - 1) : (post.likes_count || 0) + 1
    });

    const res = await apiService.likeDiscussion(post.id);
    if (!res.ok) {
      loadPost();
    }
  };

  const handleVote = async (optionId: number | string) => {
    if (!user) {
      showToast("Please log in to vote in poll.", "error");
      return;
    }
    const res = await apiService.voteDiscussion(post.id, optionId);
    if (res.ok) {
      showToast("Vote submitted!", "success");
      loadPost();
    } else {
      showToast(res.data?.error || "Failed to submit vote", "error");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to comment.", "error");
      return;
    }
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      let res;
      if (editingCommentId) {
        res = await apiService.updateDiscussionComment(editingCommentId, commentText.trim());
      } else {
        res = await apiService.commentDiscussion(post.id, commentText.trim());
      }

      if (res.ok) {
        setCommentText('');
        setEditingCommentId(null);
        showToast(editingCommentId ? "Comment updated!" : "Comment added!", "success");
        loadPost();
      } else {
        showToast(res.data?.error || "Failed to post comment", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleEditComment = (commentObj: any) => {
    setEditingCommentId(commentObj.id);
    setCommentText(commentObj.content);
    setActiveTab('discussion');
  };

  const handleDeleteComment = async (commentId: number | string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await apiService.deleteDiscussionComment(commentId);
      if (res.ok) {
        showToast("Comment deleted", "success");
        loadPost();
      } else {
        showToast(res.data?.error || "Failed to delete comment", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    }
  };

  const handleToggleSolved = async () => {
    if (!post) return;
    try {
      const newState = !post.is_solved;
      const res = await apiService.updateDiscussion(post.id, { is_solved: newState });
      if (res.ok) {
        setPost({ ...post, is_solved: newState });
        showToast(newState ? "Marked as solved! +50 Scholar Points awarded." : "Discussion reopened", "success");
      } else {
        showToast(res.data?.error || "Failed to update status", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    }
  };

  const handleDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this discussion post?")) return;
    try {
      const res = await apiService.deleteDiscussion(post.id);
      if (res.ok) {
        showToast("Post deleted", "success");
        router.push('/community');
      } else {
        showToast(res.data?.error || "Failed to delete post", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Loading Discussion...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <MessageCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-800">Discussion not found</h2>
          <p className="text-slate-500 text-xs mt-1 mb-6">The discussion you are looking for may have been removed or does not exist.</p>
          <Link href="/community" className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-md">
            Return to Community
          </Link>
        </div>
      </div>
    );
  }

  const isAuthorOrStaff = user && (user.id === post.author || user.id === post.author_id || user.is_staff);
  const totalVotes = post.poll_options?.reduce((acc: number, curr: any) => acc + (curr.votes_count || 0), 0) || 0;
  const avatar = getAvatarUrl(post) || getAvatarUrl(post.author_profile) || getAvatarUrl(post.author);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {toastMessage && (
        <div className={`fixed top-20 right-4 z-[99999] px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-red-500 text-white border-red-600'
            : 'bg-emerald-600 text-white border-emerald-700'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Detail Top Header */}
      <div className="bg-white border-b border-slate-200 py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link
              href="/community"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-primary transition-colors bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200"
            >
              <ArrowLeft size={16} />
              <span>Back to Community</span>
            </Link>

            {isAuthorOrStaff && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleSolved}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
                    post.is_solved
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>{post.is_solved ? 'Solved ✓' : 'Mark Solved'}</span>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-red-100"
                  title="Delete Post"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-md">
            {post.category || 'General'}
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 leading-snug">
            {post.title}
          </h1>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Solved Banner */}
        {post.is_solved && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-center gap-4 text-emerald-800 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h4 className="font-extrabold text-sm text-emerald-900">This Question is Solved!</h4>
              <p className="text-xs text-emerald-700 font-medium">
                The author or staff marked this problem as resolved. Check the solution below or join the discussion.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation: Information vs Discussion */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Info size={16} />
            <span>Information</span>
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all ${
              activeTab === 'discussion'
                ? 'border-primary text-primary bg-white rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageCircle size={16} />
            <span>Discussion ({post.comments?.length || post.comments_count || 0})</span>
          </button>
        </div>

        {activeTab === 'info' ? (
          <div className="space-y-6">
            {/* Author Profile Header Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-slate-600 text-lg uppercase shadow-sm">
                  {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    (post.author_full_name || post.author_name || 'A')[0]
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {post.author_full_name || post.author_name || 'Anonymous'}
                    </h3>
                    {post.is_pro && (
                      <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs font-medium mt-0.5">
                    Posted on {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                  post.is_liked
                    ? 'bg-red-50 text-red-500 border-red-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Heart size={18} className={post.is_liked ? 'fill-red-500 text-red-500' : ''} />
                <span>{post.likes_count || 0} Likes</span>
              </button>
            </div>

            {/* Post Content Body */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="font-black text-slate-400 text-[11px] uppercase tracking-widest">
                Topic Details
              </h3>
              <p className="text-slate-800 text-sm sm:text-base leading-relaxed font-medium whitespace-pre-line">
                {post.content}
              </p>

              {post.image && (
                <div className="pt-2">
                  <img
                    src={post.image}
                    alt="Attached media"
                    className="rounded-2xl max-h-96 w-full object-cover border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Poll Section if present */}
            {post.poll_question && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-extrabold text-xs uppercase tracking-wider">
                  <PollIcon size={18} />
                  <span>Community Poll</span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-base">{post.poll_question}</h4>

                <div className="space-y-3 pt-1">
                  {post.poll_options?.map((opt: any) => {
                    const percentage = totalVotes > 0 ? Math.round(((opt.votes_count || 0) / totalVotes) * 100) : 0;
                    const isSelected = post.user_voted_option_id === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleVote(opt.id)}
                        className={`w-full text-left p-3.5 rounded-xl border relative overflow-hidden transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-primary bg-primary/5 font-bold text-slate-900 ring-2 ring-primary/20'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                        }`}
                      >
                        <div
                          className="absolute left-0 top-0 bottom-0 bg-primary/10 transition-all"
                          style={{ width: `${percentage}%` }}
                        ></div>
                        <span className="relative z-10 text-xs font-semibold">{opt.text}</span>
                        <span className="relative z-10 text-xs font-bold text-slate-500">{percentage}%</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-400 font-medium text-right">{totalVotes} total votes</p>
              </div>
            )}
          </div>
        ) : (
          /* Discussion / Comments Section */
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3 text-primary">
              <HelpCircle size={20} className="shrink-0" />
              <p className="text-xs font-medium leading-relaxed">
                You are in a collaborative community workspace. Please keep comments respectful and relevant.
              </p>
            </div>

            {/* List of Comments */}
            <div className="space-y-4">
              {post.comments && post.comments.length > 0 ? (
                post.comments.map((c: any) => {
                  const cAvatar = getAvatarUrl(c) || getAvatarUrl(c.author_profile) || getAvatarUrl(c.author);
                  const isCommentOwner = user && (user.id === c.user || user.id === c.author_id || user.is_staff);

                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm border-l-4 border-l-primary"
                    >
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600 text-sm uppercase">
                            {cAvatar ? (
                              <img src={cAvatar} className="w-full h-full object-cover" alt="" />
                            ) : (
                              (c.author_full_name || c.author_name || 'U')[0]
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">
                              {c.author_full_name || c.author_name || 'Scholar'}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {new Date(c.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {isCommentOwner && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditComment(c)}
                              className="p-1 text-slate-400 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteComment(c.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-slate-700 text-xs sm:text-sm font-medium leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                  <MessageCircle size={40} className="mx-auto text-slate-300 mb-2" />
                  <h4 className="font-bold text-slate-800 text-sm">No comments yet</h4>
                  <p className="text-slate-500 text-xs mt-1">Be the first to reply and start the conversation!</p>
                </div>
              )}
            </div>

            {/* Comment Form Input Bar */}
            {post.is_solved ? (
              <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
                <Lock size={16} />
                <span>This discussion is closed for new comments because it is marked as solved.</span>
              </div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                {editingCommentId && (
                  <div className="flex items-center justify-between text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg">
                    <span>Editing your comment...</span>
                    <button
                      type="button"
                      onClick={() => { setEditingCommentId(null); setCommentText(''); }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={editingCommentId ? "Edit your contribution..." : "Share your thoughts or answer this question..."}
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || submittingComment}
                    className="px-5 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20 disabled:opacity-50 shrink-0"
                  >
                    <Send size={14} />
                    <span>{submittingComment ? 'Posting...' : editingCommentId ? 'Update' : 'Post'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
