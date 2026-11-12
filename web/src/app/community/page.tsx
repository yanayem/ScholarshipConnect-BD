"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { apiService, getAvatarUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import {
  MessageSquare, Users, MessageCircle, Heart, Share2, Plus, Search,
  CheckCircle2, Sparkles, Star, Award, ShieldCheck, Image as ImageIcon,
  MoreVertical, Flag, Edit, Trash2, X, Vote as PollIcon, Trophy, Video, Smile,
  ChevronRight, ArrowRight, UserCheck, HelpCircle, Check, UploadCloud, FileText, Paperclip
} from 'lucide-react';

const CATEGORIES = ['All', 'Open Problems', 'Scholarships', 'SOP/CV', 'Visa', 'Test Prep', 'Life Abroad'];

export default function CommunityPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'mentors'>('feed');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [discussions, setDiscussions] = useState<any[]>([]);
  const [mentors, setMentors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  // File Upload state for PC (Image / Media / Document)
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string>('');

  // Create / Edit form fields
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('General');
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState('');
  const [hasPoll, setHasPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Report Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<any | null>(null);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDescription, setReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Mentor Review Modal state
  const [selectedMentor, setSelectedMentor] = useState<any | null>(null);
  const [mentorReviews, setMentorReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Active post options menu dropdown
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [mentorsRes, discussionsRes] = await Promise.all([
        apiService.getMentors(),
        apiService.getDiscussions()
      ]);

      if (mentorsRes.ok) {
        setMentors(Array.isArray(mentorsRes.data) ? mentorsRes.data : []);
      }
      if (discussionsRes.ok) {
        setDiscussions(Array.isArray(discussionsRes.data) ? discussionsRes.data : []);
      }
    } catch (e) {
      console.error("Failed to load community data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLike = async (id: number | string) => {
    if (!user) {
      showToast("Please log in to like discussions.", "error");
      return;
    }

    setDiscussions(prev => prev.map(post => {
      if (post.id === id) {
        const isLiked = post.is_liked;
        const currentLikes = post.likes_count || 0;
        return {
          ...post,
          is_liked: !isLiked,
          likes_count: isLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1
        };
      }
      return post;
    }));

    const res = await apiService.likeDiscussion(id);
    if (!res.ok) {
      loadData();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(file.name);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleOpenCreateModal = (postToEdit?: any, triggerPickFile: boolean = false) => {
    if (!user) {
      showToast("Please log in to start a community discussion.", "error");
      return;
    }
    setSelectedFile(null);
    setFilePreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    if (postToEdit) {
      setEditingPost(postToEdit);
      setPostTitle(postToEdit.title || '');
      setPostCategory(postToEdit.category || 'General');
      setPostContent(postToEdit.content || '');
      setPostImage(postToEdit.image || '');
      setHasPoll(!!postToEdit.poll_question);
      setPollQuestion(postToEdit.poll_question || '');
      setPollOptions(postToEdit.poll_options?.map((o: any) => o.text) || ['', '']);
    } else {
      setEditingPost(null);
      setPostTitle('');
      setPostCategory('Scholarships');
      setPostContent('');
      setPostImage('');
      setHasPoll(false);
      setPollQuestion('');
      setPollOptions(['', '']);
    }
    setCreateModalOpen(true);

    if (triggerPickFile) {
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 150);
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showToast("Title and content are required.", "error");
      return;
    }

    setSubmittingPost(true);
    try {
      let bodyData: any;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('title', postTitle.trim());
        formData.append('category', postCategory);
        formData.append('content', postContent.trim());
        formData.append('image', selectedFile);

        if (hasPoll && pollQuestion.trim()) {
          formData.append('poll_question', pollQuestion.trim());
          const cleanOpts = pollOptions.filter(o => o.trim().length > 0);
          formData.append('poll_options', JSON.stringify(cleanOpts));
        }
        bodyData = formData;
      } else {
        const payload: any = {
          title: postTitle.trim(),
          category: postCategory,
          content: postContent.trim(),
          image: postImage.trim() || undefined
        };
        if (hasPoll && pollQuestion.trim()) {
          payload.poll_question = pollQuestion.trim();
          payload.poll_options = pollOptions.filter(o => o.trim().length > 0);
        }
        bodyData = payload;
      }

      let res;
      if (editingPost) {
        res = await apiService.updateDiscussion(editingPost.id, bodyData);
      } else {
        res = await apiService.createDiscussion(bodyData);
      }

      if (res.ok) {
        showToast(editingPost ? "Discussion updated!" : "Discussion posted successfully!", "success");
        setCreateModalOpen(false);
        handleRemoveFile();
        loadData();
      } else {
        showToast(res.data?.error || "Failed to save discussion", "error");
      }
    } catch (err) {
      showToast("Network error occurred", "error");
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleToggleSolved = async (post: any) => {
    try {
      const newState = !post.is_solved;
      const res = await apiService.updateDiscussion(post.id, { is_solved: newState });
      if (res.ok) {
        showToast(newState ? "Marked as solved! +50 points awarded." : "Discussion reopened", "success");
        loadData();
      } else {
        showToast(res.data?.error || "Failed to update solved status", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    }
  };

  const handleDeletePost = async (id: number | string) => {
    if (!confirm("Are you sure you want to delete this discussion?")) return;
    try {
      const res = await apiService.deleteDiscussion(id);
      if (res.ok) {
        showToast("Discussion deleted", "success");
        loadData();
      } else {
        showToast(res.data?.error || "Failed to delete discussion", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    }
  };

  const handleOpenReportModal = (target: any) => {
    if (!user) {
      showToast("Please log in to report content", "error");
      return;
    }
    setReportTarget(target);
    setReportReason('Spam');
    setReportDescription('');
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTarget) return;

    setSubmittingReport(true);
    try {
      const res = await apiService.createReport({
        reported_user: reportTarget.author || reportTarget.author_id || reportTarget.user,
        content_type: 'Discussion',
        content_id: reportTarget.id,
        reason: reportReason,
        description: reportDescription || `User reported discussion: ${reportTarget.title}`
      });

      if (res.ok) {
        showToast("Report received. Our moderation team will review it.", "success");
        setReportModalOpen(false);
      } else {
        showToast(res.data?.error || "Failed to submit report", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleOpenMentorReviews = async (mentor: any) => {
    setSelectedMentor(mentor);
    setMentorReviews([]);
    setNewRating(5);
    setNewComment('');
    setLoadingReviews(true);
    try {
      const targetId = mentor.user_id || mentor.user || mentor.id;
      const res = await apiService.getMentorReviews(targetId);
      if (res.ok) {
        setMentorReviews(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitMentorReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to leave a comment/review for this mentor.", "error");
      return;
    }
    if (!newComment.trim() || submittingReview) return;

    setSubmittingReview(true);
    try {
      const targetId = selectedMentor.user_id || selectedMentor.user || selectedMentor.id;
      const res = await apiService.submitMentorReview(targetId, newRating, newComment.trim());
      if (res.ok) {
        showToast("Review & comment posted successfully!", "success");
        setNewComment('');
        const reviewsRes = await apiService.getMentorReviews(targetId);
        if (reviewsRes.ok) {
          setMentorReviews(Array.isArray(reviewsRes.data) ? reviewsRes.data : []);
        }
      } else {
        showToast(res.data?.error || "Failed to submit review", "error");
      }
    } catch (e) {
      showToast("Connection error", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredDiscussions = discussions.filter(post => {
    let matchesCategory = activeCategory === 'All';
    if (activeCategory === 'Open Problems') {
      matchesCategory = !post.is_solved;
    } else if (activeCategory !== 'All') {
      matchesCategory = post.category && post.category.toLowerCase().includes(activeCategory.toLowerCase());
    }
    const matchesSearch = (post.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (post.content || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Toast notification */}
      {toastMessage && (
        <div className={`fixed top-20 right-4 z-[99999] px-5 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border animate-bounce ${
          toastMessage.type === 'error'
            ? 'bg-red-500 text-white border-red-600'
            : 'bg-emerald-600 text-white border-emerald-700'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Hero Banner Section */}
      <section className="bg-white border-b border-slate-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary mb-2">
              <Sparkles size={16} />
              <span>Scholar Community</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Community Hub
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Connect with fellow scholars, share guidance, ask questions, and learn from verified mentors.
            </p>
          </div>

          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenCreateModal()}
              className="bg-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 text-xs uppercase tracking-wider"
            >
              <Plus size={18} />
              Start Discussion
            </button>
            <Link
              href="/community/leaderboard"
              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-5 py-3 rounded-2xl font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-wider border border-slate-200"
            >
              <Trophy size={16} className="text-amber-500" />
              Leaderboard
            </Link>
          </div> */}
        </div>

        {/* Main Tab Switcher */}
        <div className="max-w-6xl mx-auto mt-8 flex items-center gap-2 border-b border-slate-100 pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2.5 px-6 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'feed'
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <MessageSquare size={18} />
            <span>Feed & Discussions</span>
          </button>

          {/* <button
            onClick={() => setActiveTab('mentors')}
            className={`flex items-center gap-2.5 px-6 py-3 font-extrabold text-xs tracking-wider uppercase border-b-2 transition-all ${
              activeTab === 'mentors'
                ? 'border-primary text-primary bg-primary/5 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
            }`}
          >
            <Users size={18} />
            <span>Verified Mentors</span>
            {mentors.length > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                {mentors.length}
              </span>
            )}
          </button> */}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'feed' ? (
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar / Left Column */}
            <div className="hidden lg:block space-y-6">
              {/* Categories Navigation */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">
                  Categories
                </h3>
                <div className="space-y-1">
                  {CATEGORIES.map(cat => {
                    const isActive = activeCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                          isActive
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                        }`}
                      >
                        <span>{cat}</span>
                        {cat === 'Open Problems' && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          }`}>
                            Unsolved
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Leaderboard Callout Card */}
              {/* <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-primary/20 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                <Trophy size={40} className="mx-auto mb-3 text-amber-400 opacity-90 group-hover:scale-110 transition-transform" />
                <h4 className="font-extrabold text-sm mb-1">Scholar Leaderboard</h4>
                <p className="text-slate-300 text-xs mb-6 font-medium leading-relaxed">
                  Help answer open questions to earn Scholar Points and unlock Pro perks!
                </p>
                <Link
                  href="/community/leaderboard"
                  className="block w-full py-2.5 bg-primary hover:bg-primary/90 text-white text-xs font-black rounded-xl transition-all uppercase tracking-wider shadow-md shadow-primary/30"
                >
                  View Rankings
                </Link>
              </div> */}
            </div>

            {/* Main Feed Content Column */}
            <div className="lg:col-span-3 space-y-6">

              {/* Compose Discussion Card ("What's on your mind?") */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600 text-sm">
                    {user && getAvatarUrl(user) ? (
                      <img src={getAvatarUrl(user)!} className="w-full h-full object-cover" alt="" />
                    ) : (
                      user?.full_name?.[0] || user?.username?.[0] || 'U'
                    )}
                  </div>
                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="flex-1 text-left px-5 py-3 bg-slate-100/70 hover:bg-slate-100 rounded-full border border-slate-200 text-slate-500 text-xs font-medium transition-all"
                  >
                    What's on your mind{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : user?.username ? `, ${user.username}` : ''}?
                  </button>
                </div>

                <div className="flex items-center justify-around pt-4 mt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                  <button
                    onClick={() => handleOpenCreateModal(null, true)}
                    className="flex items-center gap-2 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors text-emerald-600"
                  >
                    <ImageIcon size={18} />
                    <span>Photo/Media</span>
                  </button>
                  <button
                    onClick={() => handleOpenCreateModal(null, false)}
                    className="flex items-center gap-2 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors text-amber-500"
                  >
                    <PollIcon size={18} />
                    <span>Create Poll</span>
                  </button>
                </div>
              </div>

              {/* 3. Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search discussions, topics, questions..."
                    className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium text-slate-900"
                  />
                </div>

                {/* Mobile Categories Scroll */}
                <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                        activeCategory === cat
                          ? 'bg-primary text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Discussions Feed List */}
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-44 bg-white border border-slate-200 rounded-2xl animate-pulse p-6"></div>
                  ))}
                </div>
              ) : filteredDiscussions.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                  <MessageSquare size={48} className="mx-auto text-slate-300 mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">No discussions found</h3>
                  <p className="text-slate-500 text-xs mt-1">Be the first to ask a question or start a conversation!</p>
                  <button
                    onClick={() => handleOpenCreateModal()}
                    className="mt-4 px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={16} /> Start Discussion
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredDiscussions.map((post) => {
                    const avatar = getAvatarUrl(post) || getAvatarUrl(post.author_profile) || getAvatarUrl(post.author);
                    const isAuthorOrStaff = user && (user.id === post.author || user.id === post.author_id || user.is_staff);

                    return (
                      <div
                        key={post.id}
                        className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm transition-all relative group"
                      >
                        {/* Header Author Info */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center font-bold text-slate-600 text-base uppercase shrink-0 overflow-hidden shadow-sm">
                              {avatar ? (
                                <img src={avatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                (post.author_full_name || post.author_name || 'A')[0]
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-slate-900">
                                  {post.author_full_name || post.author_name || 'Anonymous'}
                                </h4>
                                {post.is_pro && (
                                  <span className="flex items-center gap-0.5 bg-amber-50 text-amber-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                                    <Star size={10} className="fill-amber-400 text-amber-500" /> PRO
                                  </span>
                                )}
                                {post.author_role === 'Staff' && (
                                  <span className="flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md border border-primary/20">
                                    <ShieldCheck size={10} /> Staff
                                  </span>
                                )}
                                {post.is_solved && (
                                  <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-0.5 rounded-md border border-emerald-200">
                                    <CheckCircle2 size={12} /> Solved
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-medium">
                                <span className="text-primary font-bold">{post.category || 'General'}</span>
                                <span>•</span>
                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Options Menu Button */}
                          <div className="relative">
                            <button
                              onClick={() => setActiveMenuId(activeMenuId === post.id ? null : post.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenuId === post.id && (
                              <div
                                className="absolute right-0 top-8 z-20 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-xs font-bold text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                                onMouseLeave={() => setActiveMenuId(null)}
                              >
                                {isAuthorOrStaff ? (
                                  <>
                                    <button
                                      onClick={() => { setActiveMenuId(null); handleOpenCreateModal(post); }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                    >
                                      <Edit size={14} className="text-primary" /> Edit Post
                                    </button>
                                    <button
                                      onClick={() => { setActiveMenuId(null); handleToggleSolved(post); }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-emerald-600"
                                    >
                                      <CheckCircle2 size={14} /> {post.is_solved ? 'Reopen Question' : 'Mark as Solved'}
                                    </button>
                                    <button
                                      onClick={() => { setActiveMenuId(null); handleDeletePost(post.id); }}
                                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-600 border-t border-slate-100"
                                    >
                                      <Trash2 size={14} /> Delete Post
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => { setActiveMenuId(null); handleOpenReportModal(post); }}
                                    className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-red-600"
                                  >
                                    <Flag size={14} /> Report Content
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Discussion Body */}
                        <Link href={`/community/${post.id}`} className="block group-hover:text-primary transition-colors">
                          <h3 className="font-bold text-slate-900 text-base sm:text-lg mb-2 leading-snug">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-slate-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed font-medium">
                          {post.content}
                        </p>

                        {/* Image Preview on Feed */}
                        {post.image && (
                          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 max-h-64 bg-slate-50">
                            <img src={post.image} alt="Attached Media" className="w-full max-h-64 object-cover" />
                          </div>
                        )}

                        {/* Attachment Badges */}
                        {(post.image || post.poll_question) && (
                          <div className="flex items-center gap-2 mb-4">
                            {post.image && (
                              <span className="flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                <ImageIcon size={12} /> Image attached
                              </span>
                            )}
                            {post.poll_question && (
                              <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                                <PollIcon size={12} /> Poll question
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer Engagement Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                          <div className="flex items-center gap-6">
                            <button
                              onClick={() => handleLike(post.id)}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all ${
                                post.is_liked
                                  ? 'text-red-500 bg-red-50'
                                  : 'hover:text-red-500 hover:bg-slate-50'
                              }`}
                            >
                              <Heart size={18} className={post.is_liked ? 'fill-red-500 text-red-500' : ''} />
                              <span>{post.likes_count || 0} Likes</span>
                            </button>

                            <Link
                              href={`/community/${post.id}`}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:text-primary hover:bg-slate-50 transition-all"
                            >
                              <MessageCircle size={18} />
                              <span>{post.comments_count || 0} Comments</span>
                            </Link>
                          </div>

                          <Link
                            href={`/community/${post.id}`}
                            className="text-primary hover:underline flex items-center gap-1 font-extrabold text-xs"
                          >
                            <span>View Discussion</span>
                            <ChevronRight size={16} />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-900 via-primary to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
              <div className="max-w-2xl relative z-10">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full w-fit text-xs font-black uppercase tracking-widest mb-4 border border-white/20">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  <span>Verified Mentors</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-3">
                  Connect with Verified Mentors
                </h2>
                <p className="text-white/80 text-xs sm:text-sm leading-relaxed font-medium mb-6">
                  Get 1-on-1 guidance for your scholarship journey from top students and graduates who have successfully navigated the process.
                </p>
                <Link
                  href="/mentorship"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 font-extrabold text-xs uppercase tracking-wider rounded-2xl hover:bg-slate-100 transition-all shadow-lg"
                >
                  Browse All Mentors
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {mentors.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
                <Users size={48} className="mx-auto text-slate-300 mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No mentors listed yet</h3>
                <p className="text-slate-500 text-xs mt-1">Check back soon for available mentors!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mentors.map((mentor) => {
                  const avatar = getAvatarUrl(mentor) || getAvatarUrl(mentor.user);
                  return (
                    <div
                      key={mentor.id || mentor.user_id}
                      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-primary/20 overflow-hidden flex items-center justify-center font-black text-slate-600 text-xl shadow-sm">
                              {avatar ? (
                                <img src={avatar} className="w-full h-full object-cover" alt="" />
                              ) : (
                                (mentor.full_name || mentor.username || 'M')[0]
                              )}
                            </div>
                            {mentor.is_pro && (
                              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 border-2 border-white shadow-sm" title="Pro Mentor">
                                <Star size={10} className="fill-slate-900" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-base">
                              {mentor.full_name || mentor.username}
                            </h4>
                            <span className="inline-block bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md mt-1">
                              {mentor.university || 'Verified Mentor'}
                            </span>
                          </div>
                        </div>

                        <p className="text-slate-600 text-xs font-medium line-clamp-2 mb-4 leading-relaxed">
                          {mentor.expertise_areas || mentor.major_course || mentor.bio || 'Higher Education & Scholarship Guidance'}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenMentorReviews(mentor)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-200"
                        >
                          <MessageCircle size={14} className="text-primary" />
                          <span>Comments</span>
                        </button>
                        <Link
                          href={`/mentorship/${mentor.user_id || mentor.id}`}
                          className="px-4 py-1.5 bg-primary text-white text-xs font-extrabold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE / EDIT DISCUSSION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">
              {editingPost ? 'Edit Discussion' : 'Start Community Discussion'}
            </h2>
            <p className="text-slate-500 text-xs mb-6 font-medium">
              Share your question or thoughts with thousands of scholars across Bangladesh.
            </p>

            <form onSubmit={handleSavePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. What are the best strategies for DAAD scholarship SOP?"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900"
                >
                  <option value="General">General</option>
                  <option value="Scholarships">Scholarships</option>
                  <option value="SOP/CV">SOP/CV</option>
                  <option value="Visa">Visa</option>
                  <option value="Test Prep">Test Prep</option>
                  <option value="Life Abroad">Life Abroad</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Content</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={4}
                  placeholder="Describe your query in detail..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900"
                  required
                />
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />

              {/* File / Media Upload from PC */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Upload Photo, Media or Document (from PC)
                </label>
                {selectedFile ? (
                  <div className="relative p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {selectedFile.type.startsWith('image/') ? (
                        <img src={filePreview} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                          <FileText size={20} />
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-primary/50 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 transition-all group"
                  >
                    <UploadCloud size={18} className="text-slate-400 group-hover:text-primary transition-colors" />
                    <span>Choose Photo, Media or Document from PC</span>
                  </button>
                )}
              </div>

              <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">OR Image URL</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div>
                <input
                  type="url"
                  value={postImage}
                  onChange={(e) => setPostImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-medium text-slate-900 disabled:opacity-50"
                  disabled={!!selectedFile}
                />
              </div>

              {/* Poll option toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasPoll}
                    onChange={(e) => setHasPoll(e.target.checked)}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <span>Attach a Poll</span>
                </label>
              </div>

              {hasPoll && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Poll Question?"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                  />
                  {pollOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...pollOptions];
                          updated[idx] = e.target.value;
                          setPollOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, ''])}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    + Add Option
                  </button>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPost}
                  className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  {submittingPost ? 'Publishing...' : editingPost ? 'Update Post' : 'Post Discussion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT CONTENT MODAL */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReportModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Report Content</h3>
            <p className="text-slate-500 text-xs mb-4">
              Help us keep the community safe and supportive.
            </p>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="Spam">Spam / Misleading</option>
                  <option value="Abusive Content">Abusive Content</option>
                  <option value="Harassment">Harassment</option>
                  <option value="Other">Other Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  placeholder="Provide additional context..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReportModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors"
                >
                  {submittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENTOR REVIEWS & COMMENTS MODAL */}
      {selectedMentor && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Mentor Info Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center font-black text-slate-600 text-lg shrink-0">
                {getAvatarUrl(selectedMentor) ? (
                  <img src={getAvatarUrl(selectedMentor)!} className="w-full h-full object-cover" alt="" />
                ) : (
                  (selectedMentor.full_name || selectedMentor.username || 'M')[0]
                )}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  {selectedMentor.full_name || selectedMentor.username}
                </h3>
                <span className="inline-block bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-md mt-0.5">
                  {selectedMentor.university || 'Verified Mentor'}
                </span>
                <p className="text-slate-400 text-xs font-medium mt-1">Student Comments & Feedback</p>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4 max-h-64 overflow-y-auto pr-1 mb-6 scrollbar-thin">
              {loadingReviews ? (
                <div className="py-8 text-center text-slate-400 text-xs font-bold animate-pulse">
                  Loading comments...
                </div>
              ) : mentorReviews.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs font-medium">
                  No comments or reviews yet for this mentor. Be the first student to leave feedback!
                </div>
              ) : (
                mentorReviews.map((rev) => (
                  <div key={rev.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">
                          {rev.user_avatar ? (
                            <img src={rev.user_avatar} className="w-full h-full object-cover" alt="" />
                          ) : (
                            (rev.user_name || 'U')[0]
                          )}
                        </div>
                        <span className="font-bold text-slate-800 text-xs">{rev.user_name || 'Student'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span>{rev.rating || 5}</span>
                      </div>
                    </div>
                    <p className="text-slate-700 text-xs font-medium leading-relaxed pl-8">
                      {rev.comment}
                    </p>
                    <span className="text-[10px] text-slate-400 font-medium pl-8 block">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Leave a Comment & Rating Form */}
            <form onSubmit={handleSubmitMentorReview} className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">Leave a Comment / Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 focus:outline-none"
                    >
                      <Star
                        size={16}
                        className={star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
                placeholder="Write your feedback or comment about this mentor..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 text-slate-900"
                required
              />

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedMentor(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submittingReview}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {submittingReview ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
