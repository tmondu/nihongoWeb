'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import clsx from 'clsx';
import {
  Volume2,
  Loader2,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  PenLine,
  Send,
  Check,
  Trash2,
  User,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useAudioPreferences } from '@/features/Preferences';
import { useJapaneseTTS } from '@/features/Preferences/hooks/useJapaneseTTS';

export interface ExampleSentence {
  content: string;
  mean: string;
  transcription?: string;
}

export interface CommunityFeedback {
  id: number;
  username: string;
  avatar: string | null;
  mean: string;
  like: number;
  dislike: number;
  isUserContribution?: boolean;
  createdAt?: string;
}

interface LookupResponse {
  word: string;
  phonetic?: string;
  means?: { kind?: string; mean: string }[];
  examples: ExampleSentence[];
  feedbacks: CommunityFeedback[];
}

interface KanjiSentenceAndFeedbackProps {
  kanjiChar: string;
  className?: string;
}

const FEEDBACKS_PER_PAGE = 5;
const NICKNAME_STORAGE_KEY = 'ptham_student_nickname';
const LIKED_FEEDBACKS_STORAGE_KEY = 'ptham_liked_feedbacks';
const DISLIKED_FEEDBACKS_STORAGE_KEY = 'ptham_disliked_feedbacks';

export default function KanjiSentenceAndFeedback({
  kanjiChar,
  className,
}: KanjiSentenceAndFeedbackProps) {
  const { playClick } = useClick();
  const { pronunciationEnabled, pronunciationSpeed, pronunciationPitch } =
    useAudioPreferences();
  const { speak, refreshVoices } = useJapaneseTTS();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<LookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAllExamples, setShowAllExamples] = useState(false);
  const [feedbackPage, setFeedbackPage] = useState(1);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  // Student Contribution Form States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [nickname, setNickname] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<number>>(new Set());
  const [dislikedIds, setDislikedIds] = useState<Set<number>>(new Set());

  // Authenticated account user state
  const [accountUser, setAccountUser] = useState<{
    id: number;
    displayName: string;
    email: string;
  } | null>(null);

  // Load saved nickname and liked/disliked comments on client mount + sync with authenticated user
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedNickname = localStorage.getItem(NICKNAME_STORAGE_KEY);
      if (savedNickname) {
        setNickname(savedNickname);
      }

      const rawLiked = localStorage.getItem(LIKED_FEEDBACKS_STORAGE_KEY);
      if (rawLiked) {
        const parsed = JSON.parse(rawLiked);
        if (Array.isArray(parsed)) {
          setLikedIds(new Set(parsed));
        }
      }

      const rawDisliked = localStorage.getItem(DISLIKED_FEEDBACKS_STORAGE_KEY);
      if (rawDisliked) {
        const parsed = JSON.parse(rawDisliked);
        if (Array.isArray(parsed)) {
          setDislikedIds(new Set(parsed));
        }
      }
    } catch {
      // Ignore localStorage read errors
    }

    // Fetch account profile from /api/auth/me to use user's real nickname
    fetch('/api/auth/me')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data) {
          const resolvedName =
            data.display_name?.trim() || data.email?.split('@')[0] || '';
          setAccountUser({
            id: data.id,
            displayName: resolvedName,
            email: data.email,
          });
          if (resolvedName) {
            setNickname(resolvedName);
            localStorage.setItem(NICKNAME_STORAGE_KEY, resolvedName);
          }
        }
      })
      .catch(() => {});

    // Listen for real-time display name updates
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ displayName: string }>;
      if (customEvent.detail?.displayName) {
        const newName = customEvent.detail.displayName.trim();
        setNickname(newName);
        setAccountUser(prev =>
          prev ? { ...prev, displayName: newName } : null,
        );
        try {
          localStorage.setItem(NICKNAME_STORAGE_KEY, newName);
        } catch {
          // Ignore
        }
      }
    };
    window.addEventListener('displayNameUpdated', handleUpdate);
    return () => window.removeEventListener('displayNameUpdated', handleUpdate);
  }, []);

  // Pronunciation handler
  const playSentenceAudio = useCallback(
    async (text: string) => {
      if (!text) return;
      playClick();

      if (pronunciationEnabled) {
        if (typeof window !== 'undefined') {
          refreshVoices();
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        setSpeakingText(text);
        try {
          await speak(text, {
            rate: pronunciationSpeed || 0.85,
            pitch: pronunciationPitch || 1.0,
            volume: 0.9,
          });
        } finally {
          setSpeakingText(null);
        }
      } else if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.rate = 0.85;
        utterance.onstart = () => setSpeakingText(text);
        utterance.onend = () => setSpeakingText(null);
        utterance.onerror = () => setSpeakingText(null);
        window.speechSynthesis.speak(utterance);
      }
    },
    [
      playClick,
      pronunciationEnabled,
      pronunciationPitch,
      pronunciationSpeed,
      refreshVoices,
      speak,
    ],
  );

  // Fetch data
  useEffect(() => {
    if (!kanjiChar) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setFeedbackPage(1);
    setShowAllExamples(false);
    setIsFormOpen(false);
    setSubmitSuccess(null);

    // Read any locally stored contributions for this specific Kanji
    let localSavedList: CommunityFeedback[] = [];
    if (typeof window !== 'undefined') {
      try {
        const rawLocal = localStorage.getItem(
          `ptham_kanji_contributions_${kanjiChar}`,
        );
        if (rawLocal) {
          localSavedList = JSON.parse(rawLocal) || [];
        }
      } catch {
        localSavedList = [];
      }
    }

    fetch(`/api/dictionary/lookup?word=${encodeURIComponent(kanjiChar)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json() as Promise<LookupResponse>;
      })
      .then(resData => {
        if (isMounted) {
          // Merge local contributions, avoiding duplicates by id
          const existingIds = new Set(resData.feedbacks.map(f => f.id));
          const uniqueLocal = localSavedList.filter(
            f => !existingIds.has(f.id),
          );
          const mergedFeedbacks = [...uniqueLocal, ...resData.feedbacks];

          setData({
            ...resData,
            feedbacks: mergedFeedbacks,
          });
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching kanji sentences & feedback:', err);
        if (isMounted) {
          if (localSavedList.length > 0) {
            setData({
              word: kanjiChar,
              examples: [],
              feedbacks: localSavedList,
            });
            setLoading(false);
          } else {
            setError('Không thể kết nối đến từ điển ví dụ & góp ý.');
            setLoading(false);
          }
        }
      });

    return () => {
      isMounted = false;
    };
  }, [kanjiChar]);

  // Handle student feedback submission
  const handleSubmitContribution = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveNickname =
      accountUser?.displayName?.trim() || nickname.trim();
    if (!effectiveNickname || !feedbackContent.trim() || submitting) return;

    playClick();
    setSubmitting(true);
    const trimmedNick = effectiveNickname;
    const trimmedMean = feedbackContent.trim();

    try {
      // 1. Remember nickname in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(NICKNAME_STORAGE_KEY, trimmedNick);
      }

      // 2. Call backend POST endpoint
      const res = await fetch('/api/dictionary/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: kanjiChar,
          nickname: trimmedNick,
          mean: trimmedMean,
        }),
      });

      const resData = await res.json();
      const newFeedback: CommunityFeedback = resData.feedback || {
        id: Date.now(),
        username: trimmedNick,
        avatar: null,
        mean: trimmedMean,
        like: 0,
        dislike: 0,
        isUserContribution: true,
        createdAt: new Date().toISOString(),
      };

      // 3. Save to localStorage as backup
      if (typeof window !== 'undefined') {
        try {
          const key = `ptham_kanji_contributions_${kanjiChar}`;
          const currentLocalRaw = localStorage.getItem(key);
          const currentLocal: CommunityFeedback[] = currentLocalRaw
            ? JSON.parse(currentLocalRaw)
            : [];
          localStorage.setItem(
            key,
            JSON.stringify([newFeedback, ...currentLocal]),
          );
        } catch {
          // Ignore localStorage errors
        }
      }

      // 4. Update state immediately
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedbacks: [newFeedback, ...prev.feedbacks],
        };
      });

      setFeedbackContent('');
      setFeedbackPage(1);
      setSubmitSuccess(
        'Cảm ơn bạn! Ý kiến đóng góp của bạn đã được đăng thành công.',
      );

      // Auto close form after 1.5s
      setTimeout(() => {
        setSubmitSuccess(null);
        setIsFormOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit kanji contribution:', err);
      // Fallback: still save locally
      const fallbackFeedback: CommunityFeedback = {
        id: Date.now(),
        username: trimmedNick,
        avatar: null,
        mean: trimmedMean,
        like: 0,
        dislike: 0,
        isUserContribution: true,
        createdAt: new Date().toISOString(),
      };

      if (typeof window !== 'undefined') {
        try {
          const key = `ptham_kanji_contributions_${kanjiChar}`;
          const currentLocalRaw = localStorage.getItem(key);
          const currentLocal = currentLocalRaw
            ? JSON.parse(currentLocalRaw)
            : [];
          localStorage.setItem(
            key,
            JSON.stringify([fallbackFeedback, ...currentLocal]),
          );
        } catch {
          // Ignore
        }
      }

      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          feedbacks: [fallbackFeedback, ...prev.feedbacks],
        };
      });

      setFeedbackContent('');
      setFeedbackPage(1);
      setSubmitSuccess('Đã lưu đóng góp của bạn trên thiết bị.');
      setTimeout(() => {
        setSubmitSuccess(null);
        setIsFormOpen(false);
      }, 2000);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle like toggle
  const handleToggleLike = (fbId: number) => {
    playClick();
    const isCurrentlyLiked = likedIds.has(fbId);
    const isCurrentlyDisliked = dislikedIds.has(fbId);

    const nextLiked = new Set(likedIds);
    const nextDisliked = new Set(dislikedIds);

    if (isCurrentlyLiked) {
      nextLiked.delete(fbId);
    } else {
      nextLiked.add(fbId);
      if (isCurrentlyDisliked) {
        nextDisliked.delete(fbId);
      }
    }

    setLikedIds(nextLiked);
    setDislikedIds(nextDisliked);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          LIKED_FEEDBACKS_STORAGE_KEY,
          JSON.stringify(Array.from(nextLiked)),
        );
        localStorage.setItem(
          DISLIKED_FEEDBACKS_STORAGE_KEY,
          JSON.stringify(Array.from(nextDisliked)),
        );
      } catch {
        // Ignore
      }
    }

    const likeDelta = isCurrentlyLiked ? -1 : 1;
    const dislikeDelta = !isCurrentlyLiked && isCurrentlyDisliked ? -1 : 0;
    fetch('/api/dictionary/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'react',
        feedbackId: fbId,
        likeDelta,
        dislikeDelta,
      }),
    }).catch(() => {});

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedbacks: prev.feedbacks.map(fb => {
          if (fb.id === fbId) {
            let newLike = fb.like;
            let newDislike = fb.dislike;
            if (isCurrentlyLiked) {
              newLike = Math.max(0, newLike - 1);
            } else {
              newLike = newLike + 1;
              if (isCurrentlyDisliked) {
                newDislike = Math.max(0, newDislike - 1);
              }
            }
            return {
              ...fb,
              like: newLike,
              dislike: newDislike,
            };
          }
          return fb;
        }),
      };
    });
  };

  // Handle dislike toggle
  const handleToggleDislike = (fbId: number) => {
    playClick();
    const isCurrentlyLiked = likedIds.has(fbId);
    const isCurrentlyDisliked = dislikedIds.has(fbId);

    const nextLiked = new Set(likedIds);
    const nextDisliked = new Set(dislikedIds);

    if (isCurrentlyDisliked) {
      nextDisliked.delete(fbId);
    } else {
      nextDisliked.add(fbId);
      if (isCurrentlyLiked) {
        nextLiked.delete(fbId);
      }
    }

    setLikedIds(nextLiked);
    setDislikedIds(nextDisliked);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(
          LIKED_FEEDBACKS_STORAGE_KEY,
          JSON.stringify(Array.from(nextLiked)),
        );
        localStorage.setItem(
          DISLIKED_FEEDBACKS_STORAGE_KEY,
          JSON.stringify(Array.from(nextDisliked)),
        );
      } catch {
        // Ignore
      }
    }

    const dislikeDelta = isCurrentlyDisliked ? -1 : 1;
    const likeDelta = !isCurrentlyDisliked && isCurrentlyLiked ? -1 : 0;
    fetch('/api/dictionary/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'react',
        feedbackId: fbId,
        likeDelta,
        dislikeDelta,
      }),
    }).catch(() => {});

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedbacks: prev.feedbacks.map(fb => {
          if (fb.id === fbId) {
            let newLike = fb.like;
            let newDislike = fb.dislike;
            if (isCurrentlyDisliked) {
              newDislike = Math.max(0, newDislike - 1);
            } else {
              newDislike = newDislike + 1;
              if (isCurrentlyLiked) {
                newLike = Math.max(0, newLike - 1);
              }
            }
            return {
              ...fb,
              like: newLike,
              dislike: newDislike,
            };
          }
          return fb;
        }),
      };
    });
  };

  // Delete student's own locally contributed feedback
  const handleDeleteContribution = (fbId: number) => {
    playClick();
    if (typeof window !== 'undefined') {
      try {
        const key = `ptham_kanji_contributions_${kanjiChar}`;
        const currentLocalRaw = localStorage.getItem(key);
        if (currentLocalRaw) {
          const currentLocal: CommunityFeedback[] = JSON.parse(currentLocalRaw);
          const filtered = currentLocal.filter(f => f.id !== fbId);
          localStorage.setItem(key, JSON.stringify(filtered));
        }
      } catch {
        // Ignore
      }
    }

    fetch('/api/dictionary/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        feedbackId: fbId,
      }),
    }).catch(() => {});

    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        feedbacks: prev.feedbacks.filter(f => f.id !== fbId),
      };
    });
  };

  const examples = data?.examples || [];
  const displayedExamples = showAllExamples ? examples : examples.slice(0, 2);

  // Feedbacks pagination
  const feedbacks = useMemo(() => data?.feedbacks || [], [data?.feedbacks]);
  const totalFeedbackPages = Math.max(
    1,
    Math.ceil(feedbacks.length / FEEDBACKS_PER_PAGE),
  );
  const paginatedFeedbacks = useMemo(() => {
    const start = (feedbackPage - 1) * FEEDBACKS_PER_PAGE;
    return feedbacks.slice(start, start + FEEDBACKS_PER_PAGE);
  }, [feedbacks, feedbackPage]);

  if (loading) {
    return (
      <div className='flex min-h-[160px] flex-col items-center justify-center gap-2.5 py-6 text-(--secondary-color)'>
        <Loader2 className='size-6 animate-spin text-(--main-color)' />
        <span className='text-xs font-medium'>
          Đang tải câu ví dụ & đóng góp cho chữ {kanjiChar}...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-medium text-red-500'>
        <HelpCircle className='size-4 shrink-0' />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col gap-6', className)}>
      {/* 1. PHẦN VÍ DỤ THEO CÂU (1 - 2 CÂU) */}
      <div className='flex flex-col gap-3'>
        <div className='flex items-center justify-between border-b border-(--border-color)/60 pb-2.5'>
          <div className='flex items-center gap-2'>
            <BookOpen className='size-4 text-(--main-color)' />
            <h3 className='text-base font-bold text-(--main-color)'>
              Ví dụ theo câu
            </h3>
            {displayedExamples.length > 0 && (
              <span className='rounded-full bg-(--main-color)/10 px-2 py-0.5 text-xs font-bold text-(--main-color)'>
                {displayedExamples.length} câu ví dụ
              </span>
            )}
          </div>

          {examples.length > 2 && (
            <button
              type='button'
              onClick={() => {
                playClick();
                setShowAllExamples(prev => !prev);
              }}
              className='inline-flex items-center gap-1 text-xs font-bold text-(--secondary-color) transition-colors hover:text-(--main-color)'
            >
              <span>
                {showAllExamples
                  ? 'Thu gọn'
                  : `Xem thêm (${examples.length - 2} câu)`}
              </span>
              {showAllExamples ? (
                <ChevronUp className='size-3.5' />
              ) : (
                <ChevronDown className='size-3.5' />
              )}
            </button>
          )}
        </div>

        {examples.length === 0 ? (
          <div className='py-4 text-xs text-(--secondary-color)/60'>
            Chưa có câu ví dụ nào cho chữ {kanjiChar}.
          </div>
        ) : (
          <div className='flex flex-col gap-3.5'>
            {displayedExamples.map((ex, idx) => {
              const isSpeaking = speakingText === ex.content;
              return (
                <div
                  key={idx}
                  className='group flex flex-col justify-between rounded-2xl border border-(--border-color) bg-(--background-color)/70 p-5 shadow-xs transition-all hover:border-(--main-color)/60 hover:bg-(--background-color) sm:p-6'
                >
                  <div>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='font-japanese text-xl leading-relaxed font-bold tracking-wide text-(--main-color) sm:text-2xl'>
                          {ex.content}
                        </div>
                        {ex.transcription &&
                          ex.transcription !== ex.content && (
                            <div className='font-japanese mt-1 text-sm leading-normal font-medium text-(--secondary-color)/90 sm:text-base'>
                              {ex.transcription}
                            </div>
                          )}
                      </div>

                      <button
                        type='button'
                        onClick={() => playSentenceAudio(ex.content)}
                        className={clsx(
                          'rounded-2xl border border-(--border-color) p-2.5 shadow-xs transition-all sm:p-3',
                          isSpeaking
                            ? 'border-blue-500 bg-blue-500/15 text-blue-500'
                            : 'bg-(--card-color) text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)',
                        )}
                        title='Phát âm câu này'
                      >
                        <Volume2 className='size-5 sm:size-6' />
                      </button>
                    </div>

                    <div className='mt-3.5 border-t border-(--border-color)/60 pt-3 text-sm leading-relaxed font-medium text-(--foreground-color) sm:text-base md:text-lg'>
                      {ex.mean}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. PHẦN Ý KIẾN ĐÓNG GÓP CỘNG ĐỒNG */}
      <div className='flex flex-col gap-3 border-t border-(--border-color)/70 pt-5'>
        {/* Header with Title and "Thêm đóng góp" button */}
        <div className='flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/60 pb-2.5'>
          <div className='flex items-center gap-2'>
            <MessageSquare className='size-4 text-(--main-color)' />
            <h3 className='text-base font-bold text-(--main-color)'>
              Ý kiến đóng góp
            </h3>
            <span className='rounded-full bg-(--main-color)/10 px-2 py-0.5 text-xs font-bold text-(--main-color)'>
              {feedbacks.length}
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => {
                playClick();
                setIsFormOpen(prev => !prev);
              }}
              className='inline-flex items-center gap-1.5 rounded-xl border border-(--main-color)/30 bg-(--main-color) px-3 py-1.5 text-xs font-bold text-(--background-color) shadow-xs transition-all hover:opacity-90 active:scale-95'
            >
              <PenLine className='size-3.5' />
              <span>{isFormOpen ? 'Đóng form' : 'Đóng góp ý kiến'}</span>
            </button>
          </div>
        </div>

        {/* Form for Student Contribution */}
        {isFormOpen && (
          <form
            onSubmit={handleSubmitContribution}
            className='flex flex-col gap-3 rounded-2xl border border-(--main-color)/40 bg-(--card-color) p-4 shadow-sm transition-all'
          >
            <div className='flex items-center justify-between border-b border-(--border-color)/60 pb-2'>
              <span className='flex items-center gap-1.5 text-xs font-bold text-(--main-color)'>
                <PenLine className='size-3.5 text-(--main-color)' />
                Thêm mẹo nhớ / ý kiến cho chữ {kanjiChar}
              </span>
              <span className='text-[11px] font-medium text-(--secondary-color)/70'>
                Học viên PThamSS
              </span>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <div className='flex flex-col gap-1.5 sm:col-span-1'>
                <div className='flex items-center justify-between'>
                  <label className='flex items-center gap-1 text-xs font-semibold text-(--secondary-color)'>
                    <User className='size-3.5 text-(--main-color)' />
                    Tên hiển thị (Nickname):
                  </label>
                  {accountUser ? (
                    <Link
                      href='/profile'
                      className='text-[10px] font-medium text-(--secondary-color)/70 hover:text-(--main-color) hover:underline'
                      title='Cập nhật tên hiển thị trong Cài đặt tài khoản'
                    >
                      Đổi tên
                    </Link>
                  ) : (
                    <Link
                      href='/login'
                      className='text-[10px] font-semibold text-(--main-color) hover:underline'
                    >
                      Đăng nhập
                    </Link>
                  )}
                </div>

                {accountUser ? (
                  <div className='flex items-center gap-2 rounded-xl border border-(--main-color)/30 bg-(--main-color)/10 px-3 py-2 text-xs font-bold text-(--main-color)'>
                    <span className='size-2 rounded-full bg-emerald-500' />
                    <span className='truncate'>{accountUser.displayName}</span>
                  </div>
                ) : (
                  <input
                    type='text'
                    required
                    maxLength={30}
                    placeholder='Nhập nickname của bạn...'
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-base font-medium text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-hidden sm:text-xs'
                  />
                )}
              </div>

              <div className='flex flex-col gap-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-(--secondary-color)'>
                  Nội dung đóng góp / Mẹo nhớ Kanji:
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder='Chia sẻ mẹo nhớ chữ Hán, câu chuyện chiết tự hoặc ví dụ của bạn...'
                  value={feedbackContent}
                  onChange={e => setFeedbackContent(e.target.value)}
                  className='w-full rounded-xl border border-(--border-color) bg-(--background-color) p-2.5 text-base text-(--main-color) placeholder:text-(--secondary-color)/40 focus:border-(--main-color) focus:ring-1 focus:ring-(--main-color) focus:outline-hidden sm:text-xs'
                />
              </div>
            </div>

            {submitSuccess && (
              <div className='flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                <Check className='size-4' />
                <span>{submitSuccess}</span>
              </div>
            )}

            <div className='flex items-center justify-end gap-2 pt-1'>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  setIsFormOpen(false);
                }}
                className='rounded-xl border border-(--border-color) px-3 py-1.5 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
              >
                Hủy
              </button>

              <button
                type='submit'
                disabled={
                  submitting || !nickname.trim() || !feedbackContent.trim()
                }
                className='inline-flex items-center gap-1.5 rounded-xl bg-(--main-color) px-4 py-1.5 text-xs font-bold text-(--background-color) shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
              >
                {submitting ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <Send className='size-3.5' />
                    <span>Gửi đóng góp</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {feedbacks.length === 0 ? (
          <div className='py-4 text-xs text-(--secondary-color)/60'>
            Chưa có ý kiến đóng góp nào cho chữ {kanjiChar}. Hãy là người đầu
            tiên chia sẻ mẹo nhớ!
          </div>
        ) : (
          <div className='space-y-3'>
            {paginatedFeedbacks.map(fb => {
              const isLiked = likedIds.has(fb.id);
              const isDisliked = dislikedIds.has(fb.id);
              const currentAuthor = (accountUser?.displayName || nickname)
                .trim()
                .toLowerCase();
              const isOwnContribution =
                fb.isUserContribution &&
                Boolean(currentAuthor) &&
                fb.username.trim().toLowerCase() === currentAuthor;

              return (
                <div
                  key={fb.id}
                  className={clsx(
                    'flex flex-col gap-2 rounded-2xl border p-4 transition-all hover:bg-(--background-color)',
                    fb.isUserContribution
                      ? 'border-(--main-color)/40 bg-(--main-color)/5'
                      : 'border-(--border-color) bg-(--background-color)/60 hover:border-(--main-color)/60',
                  )}
                >
                  {/* Author Header */}
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-2.5'>
                      {fb.avatar ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={fb.avatar}
                          alt={fb.username}
                          className='size-8 rounded-full object-cover ring-1 ring-(--border-color)'
                        />
                      ) : (
                        <div
                          className={clsx(
                            'flex size-8 items-center justify-center rounded-full text-xs font-bold',
                            fb.isUserContribution
                              ? 'bg-(--main-color) text-(--background-color)'
                              : 'bg-(--main-color)/15 text-(--main-color)',
                          )}
                        >
                          {fb.username.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className='flex min-w-0 items-center gap-1.5 sm:gap-2'>
                        <span className='max-w-[140px] truncate text-sm font-bold text-(--main-color) sm:max-w-[220px] sm:text-base'>
                          {fb.username}
                        </span>

                        {fb.isUserContribution && (
                          <span className='shrink-0 rounded-full bg-(--main-color)/15 px-2 py-0.5 text-xs font-bold text-(--main-color)'>
                            Học viên
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions: Likes & Dislikes & Optional Delete if own contribution */}
                    <div className='flex shrink-0 items-center gap-2 text-xs font-semibold sm:text-sm'>
                      <button
                        type='button'
                        onClick={() => handleToggleLike(fb.id)}
                        className={clsx(
                          'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-colors active:scale-95 sm:text-sm',
                          isLiked
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400',
                        )}
                        title={isLiked ? 'Bỏ thích' : 'Thích đóng góp này'}
                      >
                        <ThumbsUp className='size-3.5' />
                        <span>{fb.like}</span>
                      </button>

                      <button
                        type='button'
                        onClick={() => handleToggleDislike(fb.id)}
                        className={clsx(
                          'inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold transition-colors active:scale-95 sm:text-sm',
                          isDisliked
                            ? 'bg-rose-500 text-white'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400',
                        )}
                        title={
                          isDisliked
                            ? 'Bỏ không thích'
                            : 'Không thích đóng góp này'
                        }
                      >
                        <ThumbsDown className='size-3.5' />
                        <span>{fb.dislike}</span>
                      </button>

                      {isOwnContribution && (
                        <button
                          type='button'
                          onClick={() => handleDeleteContribution(fb.id)}
                          className='touch-manipulation p-1 text-(--secondary-color)/60 transition-colors hover:text-red-500 active:scale-95'
                          title='Xóa đóng góp này'
                        >
                          <Trash2 className='size-4' />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div className='font-japanese rounded-2xl bg-(--card-color) p-4 text-xl leading-relaxed font-bold tracking-wide break-words whitespace-pre-line text-(--main-color) sm:p-5 sm:text-2xl'>
                    {fb.mean}
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalFeedbackPages > 1 && (
              <div className='flex flex-wrap items-center justify-between gap-2 border-t border-(--border-color) pt-3 text-xs'>
                <span className='text-[11px] text-(--secondary-color)/70 sm:text-xs'>
                  Trang <strong>{feedbackPage}</strong> / {totalFeedbackPages}{' '}
                  <span className='hidden sm:inline'>
                    ({FEEDBACKS_PER_PAGE}/trang)
                  </span>
                </span>

                <div className='flex items-center gap-1'>
                  <button
                    type='button'
                    disabled={feedbackPage <= 1}
                    onClick={() => {
                      playClick();
                      setFeedbackPage(p => Math.max(1, p - 1));
                    }}
                    className={clsx(
                      'flex size-8 touch-manipulation items-center justify-center rounded-lg border border-(--border-color) bg-(--card-color) transition-colors active:scale-95',
                      feedbackPage <= 1
                        ? 'cursor-not-allowed opacity-40'
                        : 'text-(--secondary-color) hover:text-(--main-color)',
                    )}
                  >
                    <ChevronLeft className='size-4' />
                  </button>

                  {/* Mobile Compact Page Indicator */}
                  <div className='flex items-center px-2 font-bold text-(--main-color) sm:hidden'>
                    {feedbackPage} / {totalFeedbackPages}
                  </div>

                  {/* Desktop Full Page Number Buttons */}
                  <div className='hidden items-center gap-1 sm:flex'>
                    {Array.from(
                      { length: totalFeedbackPages },
                      (_, i) => i + 1,
                    ).map(page => (
                      <button
                        key={page}
                        type='button'
                        onClick={() => {
                          playClick();
                          setFeedbackPage(page);
                        }}
                        className={clsx(
                          'flex size-8 touch-manipulation items-center justify-center rounded-lg text-xs font-bold transition-colors active:scale-95',
                          feedbackPage === page
                            ? 'bg-(--main-color) text-(--background-color)'
                            : 'border border-(--border-color) bg-(--card-color) text-(--secondary-color) hover:text-(--main-color)',
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    type='button'
                    disabled={feedbackPage >= totalFeedbackPages}
                    onClick={() => {
                      playClick();
                      setFeedbackPage(p => Math.min(totalFeedbackPages, p + 1));
                    }}
                    className={clsx(
                      'flex size-8 touch-manipulation items-center justify-center rounded-lg border border-(--border-color) bg-(--card-color) transition-colors active:scale-95',
                      feedbackPage >= totalFeedbackPages
                        ? 'cursor-not-allowed opacity-40'
                        : 'text-(--secondary-color) hover:text-(--main-color)',
                    )}
                  >
                    <ChevronRight className='size-4' />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
