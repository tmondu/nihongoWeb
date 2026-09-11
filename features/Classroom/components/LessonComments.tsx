'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  Trash2,
  RefreshCw,
  Clock,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  CornerDownRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/shared/utils';

export interface CommentItem {
  id: number;
  lesson_id: number;
  user_id: number;
  parent_id?: number | null;
  content: string;
  created_at: string;
  user: {
    email: string;
    display_name?: string | null;
    level: string;
    is_admin: boolean;
  };
  replies?: CommentItem[];
}

interface CurrentUser {
  id?: number;
  email?: string;
  display_name?: string | null;
  level?: string;
  is_admin?: boolean;
}

interface LessonCommentsProps {
  lessonId: number;
  currentUser?: CurrentUser | null;
  className?: string;
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

function getAvatarColor(email: string): string {
  const colors = [
    'from-blue-600 to-indigo-600 text-white',
    'from-emerald-600 to-teal-600 text-white',
    'from-purple-600 to-pink-600 text-white',
    'from-amber-500 to-orange-600 text-white',
    'from-rose-600 to-red-600 text-white',
    'from-cyan-600 to-blue-600 text-white',
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function formatUserDisplayName(
  email?: string,
  displayName?: string | null,
): string {
  if (displayName && displayName.trim()) return displayName.trim();
  if (!email) return 'Học viên';
  const prefix = email.split('@')[0];
  return prefix;
}

export default function LessonComments({
  lessonId,
  currentUser,
  className,
}: LessonCommentsProps) {
  const [activeUser, setActiveUser] = useState<CurrentUser | null>(
    currentUser || null,
  );
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reply state
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyTargetUser, setReplyTargetUser] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<
    Record<number, boolean>
  >({});

  // Synchronize currentUser and fetch fresh display_name if missing
  useEffect(() => {
    if (currentUser) {
      setActiveUser(prev => ({
        ...currentUser,
        display_name: currentUser.display_name || prev?.display_name,
      }));
    }
  }, [currentUser]);

  useEffect(() => {
    // If activeUser doesn't have display_name, fetch fresh profile from /api/auth/me
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) {
          setActiveUser(prev => ({
            ...prev,
            id: data.id,
            email: data.email,
            display_name: data.display_name || prev?.display_name,
            level: (data.level || 'n5').toUpperCase(),
            is_admin: Boolean(data.is_admin),
          }));
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ displayName: string }>;
      if (customEvent.detail?.displayName) {
        setActiveUser(prev =>
          prev
            ? { ...prev, display_name: customEvent.detail.displayName }
            : null,
        );
      }
    };

    window.addEventListener('display-name-updated', handleUpdate);
    return () => {
      window.removeEventListener('display-name-updated', handleUpdate);
    };
  }, []);

  const fetchComments = useCallback(
    async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        const res = await fetch(`/api/lessons/${lessonId}/comments`);
        const data = await res.json();
        if (data.success && Array.isArray(data.comments)) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    },
    [lessonId],
  );

  useEffect(() => {
    fetchComments(true);
  }, [fetchComments]);

  // Main comment submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const trimmed = content.trim();
    if (!trimmed) {
      setErrorMsg('Vui lòng nhập nội dung bình luận.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi bình luận.');
      }

      setComments(prev => [data.comment, ...prev]);
      setContent('');
      setSuccessMsg('Đã gửi bình luận!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Lỗi khi gửi bình luận.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reply submission
  const handleReplySubmit = async (rootCommentId: number) => {
    const trimmed = replyContent.trim();
    if (!trimmed) return;

    setReplySubmitting(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          parentId: rootCommentId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Không thể gửi phản hồi.');
      }

      // Add reply into parent comment's replies array
      setComments(prev =>
        prev.map(c => {
          if (c.id === rootCommentId) {
            return {
              ...c,
              replies: [...(c.replies || []), data.comment],
            };
          }
          return c;
        }),
      );

      setReplyContent('');
      setReplyingToId(null);
      setExpandedReplies(prev => ({ ...prev, [rootCommentId]: true }));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Lỗi khi gửi phản hồi.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Delete comment or reply
  const handleDelete = async (commentId: number, parentId?: number | null) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;

    setDeletingId(commentId);
    try {
      const res = await fetch(
        `/api/lessons/${lessonId}/comments?commentId=${commentId}`,
        { method: 'DELETE' },
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi xóa bình luận.');
      }

      if (parentId) {
        // Remove reply from parent's replies list
        setComments(prev =>
          prev.map(c => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter(r => r.id !== commentId),
              };
            }
            return c;
          }),
        );
      } else {
        // Remove root comment
        setComments(prev => prev.filter(c => c.id !== commentId));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể xóa bình luận.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleReplies = (commentId: number) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const totalCommentsCount = comments.reduce(
    (acc, c) => acc + 1 + (c.replies?.length || 0),
    0,
  );

  return (
    <div
      className={cn(
        'bg-card border-border/60 flex flex-col rounded-2xl border shadow-sm',
        className,
      )}
    >
      {/* Header */}
      <div className='border-border/40 flex items-center justify-between border-b p-4 pb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400'>
            <MessageSquare className='h-4 w-4' />
          </div>
          <div>
            <h2 className='text-foreground text-sm font-bold'>
              Hỏi đáp & Thảo luận
            </h2>
            <p className='text-muted-foreground text-[11px]'>
              Bình luận cùng cô giáo và các bạn học viên
            </p>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-400'>
            {totalCommentsCount}
          </span>
          <button
            type='button'
            onClick={() => fetchComments(false)}
            title='Làm mới bình luận'
            className='hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer rounded-lg p-1.5 transition-colors'
          >
            <RefreshCw className='h-3.5 w-3.5' />
          </button>
        </div>
      </div>

      {/* Main Comment Input Box */}
      <div className='border-border/40 border-b p-4'>
        <form onSubmit={handleSubmit} className='space-y-2.5'>
          {activeUser?.email && (
            <div className='flex items-center justify-between text-[11px]'>
              <span className='text-muted-foreground flex items-center gap-1.5'>
                <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                Đang bình luận với tư cách:
                <strong className='text-foreground font-semibold'>
                  &apos;
                  {formatUserDisplayName(
                    activeUser.email,
                    activeUser.display_name,
                  )}
                  &apos;
                </strong>
              </span>
              <span className='bg-muted text-muted-foreground rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase'>
                {activeUser.level || 'N5'}
              </span>
            </div>
          )}

          <div className='relative'>
            <textarea
              ref={textareaRef}
              rows={3}
              value={content}
              onChange={e => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder=''
              maxLength={1500}
              className='bg-muted/30 border-border/60 text-foreground focus:bg-background/80 w-full resize-none rounded-xl border p-3 text-xs leading-relaxed transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
            />
          </div>

          {errorMsg && (
            <div className='flex items-center gap-1.5 text-xs text-rose-400'>
              <AlertCircle className='h-3.5 w-3.5 shrink-0' />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className='flex items-center gap-1.5 text-xs text-emerald-400'>
              <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
              <span>{successMsg}</span>
            </div>
          )}

          <div className='flex items-center justify-between pt-1'>
            <span className='text-muted-foreground/60 text-[10px]'>
              {content.length}/1500 ký tự
            </span>

            <button
              type='submit'
              disabled={submitting || !content.trim()}
              className='inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {submitting ? (
                <>
                  <RefreshCw className='h-3.5 w-3.5 animate-spin' />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className='h-3.5 w-3.5' />
                  <span>Gửi bình luận</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className='flex max-h-[600px] min-h-[300px] flex-col gap-3.5 overflow-y-auto p-4 pr-2'>
        {loading ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-2 py-12 text-slate-400'>
            <RefreshCw className='h-5 w-5 animate-spin text-blue-400' />
            <span className='text-xs'>Đang tải bình luận...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className='flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center'>
            <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400'>
              <Sparkles className='h-6 w-6' />
            </div>
            <div>
              <p className='text-foreground text-xs font-semibold'>
                Chưa có bình luận nào
              </p>
              <p className='text-muted-foreground mt-1 max-w-[240px] text-[11px] leading-relaxed'>
                Hãy là người đầu tiên đặt câu hỏi hoặc chia sẻ cảm nghĩ về bài
                giảng này nhé!
              </p>
            </div>
          </div>
        ) : (
          comments.map(c => {
            const isOwner = activeUser?.id && c.user_id === activeUser.id;
            const canDelete = isOwner || activeUser?.is_admin;
            const displayName = formatUserDisplayName(
              c.user.email,
              c.user.display_name,
            );
            const avatarInitial = (
              displayName[0] ||
              c.user.email[0] ||
              'U'
            ).toUpperCase();
            const avatarBg = getAvatarColor(c.user.email);
            const repliesCount = c.replies?.length || 0;
            const isRepliesExpanded = expandedReplies[c.id];

            return (
              <div
                key={c.id}
                className='bg-muted/20 hover:bg-muted/30 border-border/40 group relative flex flex-col gap-2.5 rounded-xl border p-3.5 transition-all'
              >
                {/* Root Comment Header */}
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex items-center gap-2.5'>
                    <div
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold shadow-sm',
                        avatarBg,
                      )}
                    >
                      {avatarInitial}
                    </div>

                    <div className='flex flex-wrap items-center gap-1.5'>
                      <span className='text-foreground text-xs font-semibold'>
                        {displayName}
                      </span>

                      {c.user.is_admin ? (
                        <span className='inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-amber-300'>
                          <ShieldCheck className='h-2.5 w-2.5' />
                          Giáo viên
                        </span>
                      ) : (
                        <span className='text-muted-foreground inline-flex items-center gap-0.5 rounded-full border border-slate-700 bg-slate-800/60 px-1.5 py-0.5 text-[9px] font-medium'>
                          <GraduationCap className='h-2.5 w-2.5 text-blue-400' />
                          {c.user.level}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <span className='text-muted-foreground/70 flex items-center gap-1 text-[10px]'>
                      <Clock className='h-2.5 w-2.5' />
                      {formatRelativeTime(c.created_at)}
                    </span>

                    {canDelete && (
                      <button
                        type='button'
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className='text-muted-foreground/40 cursor-pointer p-1 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-400 disabled:opacity-50'
                        title='Xóa bình luận này'
                      >
                        <Trash2 className='h-3 w-3' />
                      </button>
                    )}
                  </div>
                </div>

                {/* Root Comment Content */}
                <p className='text-foreground/90 pl-9.5 text-xs leading-relaxed break-words whitespace-pre-wrap'>
                  {c.content}
                </p>

                {/* Root Comment Actions: Reply button */}
                <div className='flex items-center gap-3 pt-0.5 pl-9.5'>
                  <button
                    type='button'
                    onClick={() => {
                      if (replyingToId === c.id) {
                        setReplyingToId(null);
                        setReplyContent('');
                      } else {
                        setReplyingToId(c.id);
                        setReplyTargetUser(displayName);
                        setReplyContent('');
                      }
                    }}
                    className='text-muted-foreground inline-flex cursor-pointer items-center gap-1 text-[11px] font-semibold transition-colors hover:text-blue-400'
                  >
                    <CornerDownRight className='h-3 w-3' />
                    <span>Phản hồi</span>
                  </button>
                </div>

                {/* Inline Reply Composer (YouTube style) */}
                {replyingToId === c.id && (
                  <div className='mt-2 ml-9.5 rounded-xl border border-blue-500/30 bg-blue-950/20 p-3'>
                    <div className='text-muted-foreground mb-2 flex items-center justify-between text-[11px]'>
                      <span className='flex items-center gap-1.5'>
                        <CornerDownRight className='h-3.5 w-3.5 text-blue-400' />
                        <span>
                          Trả lời{' '}
                          <strong className='text-foreground font-semibold'>
                            @{replyTargetUser}
                          </strong>
                          :
                        </span>
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={replyContent}
                      onChange={e => setReplyContent(e.target.value)}
                      placeholder=''
                      maxLength={1500}
                      className='bg-muted/40 border-border/60 text-foreground w-full resize-none rounded-lg border p-2.5 text-xs leading-relaxed transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                      autoFocus
                    />
                    <div className='mt-2 flex items-center justify-end gap-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setReplyingToId(null);
                          setReplyContent('');
                        }}
                        className='cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800'
                      >
                        Hủy
                      </button>
                      <button
                        type='button'
                        disabled={replySubmitting || !replyContent.trim()}
                        onClick={() => handleReplySubmit(c.id)}
                        className='inline-flex cursor-pointer items-center gap-1 rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50'
                      >
                        {replySubmitting ? (
                          <RefreshCw className='h-3 w-3 animate-spin' />
                        ) : (
                          <Send className='h-3 w-3' />
                        )}
                        <span>Phản hồi</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* YouTube Style Expandable Replies Toggle Button */}
                {repliesCount > 0 && (
                  <div className='ml-9.5 pt-1'>
                    <button
                      type='button'
                      onClick={() => toggleReplies(c.id)}
                      className='inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-500/10'
                    >
                      {isRepliesExpanded ? (
                        <>
                          <ChevronUp className='h-3.5 w-3.5' />
                          <span>Ẩn {repliesCount} câu trả lời</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className='h-3.5 w-3.5' />
                          <span>{repliesCount} câu trả lời</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* YouTube Style Nested Replies List */}
                {isRepliesExpanded && c.replies && c.replies.length > 0 && (
                  <div className='mt-2 ml-9.5 space-y-2.5 border-l-2 border-slate-700/60 pl-3 sm:pl-3.5'>
                    {c.replies.map(reply => {
                      const isReplyOwner =
                        activeUser?.id && reply.user_id === activeUser.id;
                      const canDeleteReply =
                        isReplyOwner || activeUser?.is_admin;
                      const replyDisplayName = formatUserDisplayName(
                        reply.user.email,
                        reply.user.display_name,
                      );
                      const replyAvatar = (
                        replyDisplayName[0] ||
                        reply.user.email[0] ||
                        'U'
                      ).toUpperCase();
                      const replyAvatarBg = getAvatarColor(reply.user.email);

                      return (
                        <div
                          key={reply.id}
                          className='group/reply hover:bg-muted/30 relative flex flex-col gap-1.5 rounded-lg p-2 transition-colors'
                        >
                          <div className='flex items-start justify-between gap-2'>
                            <div className='flex items-center gap-2'>
                              <div
                                className={cn(
                                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold shadow-sm',
                                  replyAvatarBg,
                                )}
                              >
                                {replyAvatar}
                              </div>

                              <div className='flex flex-wrap items-center gap-1'>
                                <span className='text-foreground text-xs font-semibold'>
                                  {replyDisplayName}
                                </span>

                                {reply.user.is_admin ? (
                                  <span className='py-0.2 inline-flex items-center gap-0.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-1 text-[8px] font-bold text-amber-300'>
                                    <ShieldCheck className='h-2 w-2' />
                                    Giáo viên
                                  </span>
                                ) : (
                                  <span className='text-muted-foreground py-0.2 inline-flex items-center gap-0.5 rounded-full border border-slate-700 bg-slate-800/60 px-1 text-[8px] font-medium'>
                                    {reply.user.level}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className='flex items-center gap-1.5'>
                              <span className='text-muted-foreground/70 flex items-center gap-1 text-[9px]'>
                                <Clock className='h-2.5 w-2.5' />
                                {formatRelativeTime(reply.created_at)}
                              </span>

                              {canDeleteReply && (
                                <button
                                  type='button'
                                  onClick={() => handleDelete(reply.id, c.id)}
                                  disabled={deletingId === reply.id}
                                  className='text-muted-foreground/40 cursor-pointer p-0.5 opacity-0 transition-opacity group-hover/reply:opacity-100 hover:text-rose-400 disabled:opacity-50'
                                  title='Xóa câu trả lời này'
                                >
                                  <Trash2 className='h-2.5 w-2.5' />
                                </button>
                              )}
                            </div>
                          </div>

                          <p className='text-foreground/90 pl-8 text-xs leading-relaxed break-words whitespace-pre-wrap'>
                            {reply.content}
                          </p>

                          <div className='pt-0.5 pl-8'>
                            <button
                              type='button'
                              onClick={() => {
                                setReplyingToId(c.id);
                                setReplyTargetUser(replyDisplayName);
                                setReplyContent(`@${replyDisplayName} `);
                              }}
                              className='text-muted-foreground inline-flex cursor-pointer items-center gap-1 text-[10px] font-medium transition-colors hover:text-blue-400'
                            >
                              <CornerDownRight className='h-2.5 w-2.5' />
                              <span>Phản hồi</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
