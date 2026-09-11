'use client';

import React, { useState, useEffect, useMemo, useRef, use } from 'react';
import {
  Lock,
  BookOpen,
  Calendar,
  RefreshCw,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  VideoOff,
  Smartphone,
  Tv,
} from 'lucide-react';
import { Link, useRouter } from '@/core/i18n/routing';
import { parseVideoEmbedUrl } from '@/shared/utils/videoUrlParser';
import { cn } from '@/shared/utils';
import DriveVideoPlayer from '@/features/Classroom/components/DriveVideoPlayer';
import YouTubeVideoPlayer from '@/features/Classroom/components/YouTubeVideoPlayer';
import LessonComments from '@/features/Classroom/components/LessonComments';

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  order_num: number;
  created_at: string;
  is_locked?: boolean;
}

interface LessonVideoPageProps {
  params: Promise<{ id: string }>;
}

export default function LessonVideoPage({ params }: LessonVideoPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const lessonId = Number(id);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<
    'unauthorized' | 'pending' | 'forbidden_level' | null
  >(null);
  const [userEmail, setUserEmail] = useState('');
  const [currentUserLevel, setCurrentUserLevel] = useState('N5');
  const [currentUser, setCurrentUser] = useState<{
    id?: number;
    email?: string;
    display_name?: string | null;
    level?: string;
    is_admin?: boolean;
  } | null>(null);
  const [requiredLevel, setRequiredLevel] = useState('');
  const [videoChecking, setVideoChecking] = useState(false);
  const [videoAvailable, setVideoAvailable] = useState<boolean | null>(null);
  const [videoErrorReason, setVideoErrorReason] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('16:9');
  const videoBoxRef = useRef<HTMLDivElement>(null);

  const checkVideoStatus = async (url: string, _fresh = false) => {
    if (!url) {
      setVideoAvailable(false);
      setVideoErrorReason('empty_url');
      return;
    }
    setVideoChecking(true);
    try {
      const driveInfo = parseVideoEmbedUrl(url);
      if (driveInfo.type === 'drive') {
        setVideoAvailable(true);
        setVideoErrorReason(null);
        return;
      } else {
        setVideoAvailable(true);
        setVideoErrorReason(null);
      }
    } catch {
      setVideoAvailable(false);
      setVideoErrorReason('fetch_error');
    } finally {
      setVideoChecking(false);
    }
  };

  const fetchLessons = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/lessons');
      if (res.status === 401) {
        setAuthError('unauthorized');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Lỗi khi tải bài giảng');
      }

      const data = await res.json();
      if (!data.user) {
        setAuthError('unauthorized');
        setLoading(false);
        return;
      }

      if (!data.user.can_watch_video && !data.user.is_admin) {
        setAuthError('pending');
        setUserEmail(data.user.email || '');
        setLoading(false);
        return;
      }

      const userLvl = (data.user.level || 'n5').toUpperCase();
      setCurrentUserLevel(userLvl);
      setUserEmail(data.user.email || '');
      setCurrentUser({
        id: data.user.id,
        email: data.user.email,
        display_name: data.user.display_name,
        level: userLvl,
        is_admin: Boolean(data.user.is_admin),
      });

      const list: Lesson[] = data.lessons || [];
      setLessons(list);

      const target = list.find(l => l.id === lessonId);
      if (target && target.is_locked) {
        setAuthError('forbidden_level');
        setRequiredLevel(target.level.toUpperCase());
      }
    } catch (err) {
      console.error('Fetch lessons failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentLesson = useMemo(() => {
    return lessons.find(l => l.id === lessonId) || null;
  }, [lessons, lessonId]);

  const currentIndex = useMemo(() => {
    if (!currentLesson) return -1;
    return lessons.findIndex(l => l.id === currentLesson.id);
  }, [lessons, currentLesson]);

  const prevLesson = useMemo(() => {
    if (currentIndex <= 0) return null;
    return lessons[currentIndex - 1];
  }, [lessons, currentIndex]);

  const nextLesson = useMemo(() => {
    if (currentIndex === -1 || currentIndex >= lessons.length - 1) return null;
    return lessons[currentIndex + 1];
  }, [lessons, currentIndex]);

  const parsedVideo = useMemo(() => {
    if (!currentLesson?.video_url) return null;
    return parseVideoEmbedUrl(currentLesson.video_url);
  }, [currentLesson]);

  useEffect(() => {
    if (currentLesson?.video_url) {
      checkVideoStatus(currentLesson.video_url);
    } else if (currentLesson && !currentLesson.video_url) {
      setVideoAvailable(false);
      setVideoErrorReason('empty_url');
    }
  }, [currentLesson]);

  return (
    <div className='mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-8'>
      {/* Top Breadcrumb / Back Bar */}
      <div className='border-border/40 mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4'>
        <Link
          href='/classroom'
          className='text-muted-foreground hover:text-foreground group inline-flex items-center gap-2 text-sm font-medium transition-colors'
        >
          <ArrowLeft className='h-4 w-4 transition-transform group-hover:-translate-x-1' />
          <span>Quay lại danh sách bài giảng</span>
        </Link>

        {currentLesson && (
          <div className='flex items-center gap-2'>
            <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-400 uppercase'>
              {currentLesson.level}
            </span>
            <span className='text-muted-foreground text-xs'>
              {currentLesson.order_num
                ? `Buổi ${currentLesson.order_num}`
                : `Bài ${currentIndex + 1}`}
            </span>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className='text-muted-foreground flex flex-col items-center justify-center gap-3 py-24'>
          <RefreshCw className='h-8 w-8 animate-spin text-blue-500' />
          <p className='text-sm font-medium'>Đang tải video bài giảng...</p>
        </div>
      )}

      {/* Auth state: Unauthorized */}
      {!loading && authError === 'unauthorized' && (
        <div className='mx-auto flex max-w-md flex-col items-center justify-center px-4 py-16 text-center'>
          <div className='mb-4 rounded-full border border-amber-500/20 bg-amber-500/10 p-4 text-amber-400'>
            <Lock className='h-10 w-10' />
          </div>
          <h2 className='text-foreground mb-2 text-xl font-bold'>
            Vui lòng đăng nhập
          </h2>
          <p className='text-muted-foreground mb-6 text-sm leading-relaxed'>
            Khu vực bài giảng chỉ dành riêng cho học viên của PThamSS. Vui lòng
            đăng nhập vào tài khoản của bạn để tiếp tục học.
          </p>
          <button
            onClick={() => router.push('/profile')}
            className='rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500'
          >
            Đăng nhập ngay
          </button>
        </div>
      )}

      {/* Auth state: No video permission */}
      {!loading && authError === 'pending' && (
        <div className='mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center'>
          <div className='mb-4 rounded-full border border-amber-500/20 bg-amber-500/10 p-4 text-amber-400'>
            <Lock className='h-10 w-10' />
          </div>
          <h2 className='text-foreground mb-2 text-xl font-bold'>
            Chưa có quyền xem video bài giảng
          </h2>
          <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
            Tài khoản{' '}
            <span className='text-foreground font-semibold'>{userEmail}</span>{' '}
            của bạn chưa được kích hoạt quyền xem video các buổi học.
          </p>
          <div className='bg-muted/40 border-border/50 text-muted-foreground mb-6 w-full rounded-xl border p-3.5 text-left text-xs'>
            💡 <strong>Mẹo:</strong> Hãy liên hệ với giáo viên hoặc quản trị
            viên để được cấp quyền xem video nhé.
          </div>
          <button
            onClick={() => fetchLessons()}
            className='border-border bg-muted/80 hover:bg-muted text-foreground flex items-center gap-2 rounded-xl border px-5 py-2 text-sm font-medium transition-all'
          >
            <RefreshCw className='h-4 w-4' />
            Kiểm tra lại
          </button>
        </div>
      )}

      {/* Auth state: Forbidden level */}
      {!loading && authError === 'forbidden_level' && (
        <div className='mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center'>
          <div className='mb-4 rounded-full border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400'>
            <Lock className='h-10 w-10' />
          </div>
          <div className='mb-2 inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 uppercase'>
            Yêu cầu cấp độ {requiredLevel}
          </div>
          <h2 className='text-foreground mb-2 text-xl font-bold'>
            Bài giảng yêu cầu cấp độ cao hơn
          </h2>
          <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
            Bài giảng này thuộc chương trình học{' '}
            <strong className='text-foreground font-semibold'>
              {requiredLevel}
            </strong>
            . Tài khoản của bạn hiện tại đang được đăng ký ở cấp độ{' '}
            <strong className='font-semibold text-blue-400'>
              {currentUserLevel}
            </strong>
            .
          </p>
          <div className='bg-muted/40 border-border/50 text-muted-foreground mb-6 w-full rounded-xl border p-3.5 text-left text-xs leading-relaxed'>
            💡 <strong>Quy định xem bài giảng:</strong> Học viên có quyền truy
            cập các bài giảng thuộc cấp độ của mình và các cấp độ thấp hơn (ví
            dụ: N4 có thể xem N5, N4; N3 có thể xem N5, N4, N3).
            <br />
            Nếu bạn muốn đăng ký hoặc nâng cấp lên khóa{' '}
            <strong className='text-foreground'>{requiredLevel}</strong>, vui
            lòng liên hệ giáo viên để được hỗ trợ kích hoạt.
          </div>
          <div className='flex items-center gap-3'>
            <Link
              href='/classroom'
              className='rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500'
            >
              Quay lại danh sách bài giảng
            </Link>
          </div>
        </div>
      )}

      {/* Normal State: Video Player + Details + Playlist */}
      {!loading && !authError && (
        <>
          {!currentLesson ? (
            <div className='border-border/60 rounded-2xl border border-dashed py-20 text-center'>
              <BookOpen className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
              <h3 className='text-foreground text-base font-semibold'>
                Không tìm thấy bài giảng
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                Bài giảng bạn yêu cầu không tồn tại hoặc đã được gỡ bỏ.
              </p>
              <Link
                href='/classroom'
                className='mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500'
              >
                <ArrowLeft className='h-4 w-4' />
                <span>Trở về danh sách bài giảng</span>
              </Link>
            </div>
          ) : (
            <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
              {/* Left Column: Big Video Player & Details (8 cols) */}
              <div className='flex flex-col gap-5 lg:col-span-8'>
                {/* Collapsible Ratio — dưới video */}

                {/* Drive Custom Video Player */}
                {parsedVideo?.type === 'drive' && parsedVideo.driveId ? (
                  <DriveVideoPlayer
                    fileId={parsedVideo.driveId}
                    title={currentLesson.title}
                    watermark={userEmail || undefined}
                    className={cn(
                      'w-full transition-all duration-300',
                      aspectRatio === '9:16'
                        ? 'mx-auto aspect-[9/16] max-h-[85vh] max-w-[460px]'
                        : 'aspect-video',
                    )}
                  />
                ) : parsedVideo?.type === 'youtube' && parsedVideo.youtubeId ? (
                  /* YouTube Custom Video Player (Hides all YouTube UI/links & applies Drive-style UI) */
                  <YouTubeVideoPlayer
                    videoId={parsedVideo.youtubeId}
                    title={currentLesson.title}
                    watermark={userEmail || undefined}
                    className={cn(
                      'w-full transition-all duration-300',
                      aspectRatio === '9:16'
                        ? 'mx-auto aspect-[9/16] max-h-[85vh] max-w-[460px]'
                        : 'aspect-video',
                    )}
                  />
                ) : (
                  /* Fallback: iframe for generic */
                  <div
                    ref={videoBoxRef}
                    className={cn(
                      'border-border/60 relative w-full overflow-hidden rounded-2xl border bg-black shadow-2xl shadow-black/40 transition-all duration-300',
                      aspectRatio === '9:16'
                        ? 'mx-auto aspect-[9/16] max-h-[85vh] max-w-[460px]'
                        : 'aspect-video w-full',
                    )}
                  >
                    {videoChecking ? (
                      <div className='text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-3 bg-black/60'>
                        <RefreshCw className='h-7 w-7 animate-spin text-blue-500' />
                        <p className='text-xs font-medium'>
                          Đang chuẩn bị bài giảng...
                        </p>
                      </div>
                    ) : videoAvailable === false ? (
                      <div className='flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 via-[#111118] to-black p-6 text-center'>
                        <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400 shadow-lg shadow-rose-500/10'>
                          <VideoOff className='h-7 w-7' />
                        </div>
                        <h3 className='text-foreground text-base font-bold md:text-lg'>
                          Video bài giảng tạm thời không khả dụng
                        </h3>
                        <p className='text-muted-foreground mt-1.5 max-w-md text-xs leading-relaxed md:text-sm'>
                          {videoErrorReason === 'private_or_not_shared'
                            ? 'Tệp video Google Drive hiện chưa được cấp quyền xem công khai hoặc đã bị giới hạn truy cập.'
                            : 'Không thể tải video từ liên kết được cung cấp (tệp có thể đã bị xóa hoặc liên kết không chính xác).'}
                        </p>
                        <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
                          <button
                            onClick={() =>
                              currentLesson?.video_url &&
                              checkVideoStatus(currentLesson.video_url, true)
                            }
                            className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-600/20 transition-all hover:bg-blue-500'
                          >
                            <RefreshCw className='h-3.5 w-3.5' />
                            <span>Thử kiểm tra lại</span>
                          </button>
                          <Link
                            href='/classroom'
                            className='border-border/60 bg-muted/40 hover:bg-muted text-foreground inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-medium transition-all'
                          >
                            <ArrowLeft className='h-3.5 w-3.5' />
                            <span>Xem bài giảng khác</span>
                          </Link>
                        </div>
                      </div>
                    ) : parsedVideo?.embedUrl ? (
                      <iframe
                        src={parsedVideo.embedUrl}
                        title={currentLesson.title}
                        className='absolute inset-0 h-full w-full border-0'
                        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen'
                        allowFullScreen
                      />
                    ) : (
                      <div className='text-muted-foreground flex h-full w-full items-center justify-center'>
                        Không tìm thấy liên kết video hợp lệ.
                      </div>
                    )}
                  </div>
                )}

                {/* Ratio switcher dưới video */}
                <div className='flex items-center gap-1 pt-1'>
                  <button
                    type='button'
                    onClick={() => setAspectRatio('9:16')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                      aspectRatio === '9:16'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Smartphone className='h-3.5 w-3.5' />
                    <span>9:16</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setAspectRatio('16:9')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                      aspectRatio === '16:9'
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground',
                    )}
                  >
                    <Tv className='h-3.5 w-3.5' />
                    <span>16:9</span>
                  </button>
                </div>

                {/* Lesson Info Box - NO "Mở link gốc" */}
                <div className='bg-card border-border/60 rounded-2xl border p-5 shadow-sm md:p-6'>
                  <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex items-center gap-2'>
                      <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-400 uppercase'>
                        {currentLesson.level}
                      </span>
                      {currentLesson.order_num > 0 && (
                        <span className='text-muted-foreground text-xs font-semibold'>
                          Buổi {currentLesson.order_num}
                        </span>
                      )}
                      <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                        <Calendar className='h-3.5 w-3.5' />
                        {new Date(currentLesson.created_at).toLocaleDateString(
                          'vi-VN',
                        )}
                      </span>
                    </div>
                  </div>

                  <h1 className='text-foreground text-xl leading-snug font-bold md:text-2xl'>
                    {currentLesson.title}
                  </h1>

                  {currentLesson.description && (
                    <div className='border-border/40 text-muted-foreground mt-4 border-t pt-4 text-sm leading-relaxed whitespace-pre-wrap'>
                      {currentLesson.description}
                    </div>
                  )}

                  {/* Previous / Next Lesson Navigation */}
                  <div className='border-border/40 mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4'>
                    {prevLesson ? (
                      <Link
                        href={`/classroom/${prevLesson.id}`}
                        className='bg-muted/40 hover:bg-muted border-border/60 text-foreground group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all'
                      >
                        <ChevronLeft className='h-4 w-4 transition-transform group-hover:-translate-x-0.5' />
                        <span className='max-w-[180px] truncate sm:max-w-[240px]'>
                          Bài trước: {prevLesson.title}
                        </span>
                      </Link>
                    ) : (
                      <div />
                    )}

                    {nextLesson && (
                      <Link
                        href={`/classroom/${nextLesson.id}`}
                        className='bg-muted/40 hover:bg-muted border-border/60 text-foreground group inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition-all'
                      >
                        <span className='max-w-[180px] truncate sm:max-w-[240px]'>
                          Bài tiếp: {nextLesson.title}
                        </span>
                        <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Comments & Discussion for students (4 cols) */}
              <div className='flex flex-col gap-3 lg:col-span-4'>
                <LessonComments
                  lessonId={currentLesson.id}
                  currentUser={currentUser}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
