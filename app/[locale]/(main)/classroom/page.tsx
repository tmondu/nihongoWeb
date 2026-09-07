'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  PlayCircle,
  Clock,
  Lock,
  ExternalLink,
  BookOpen,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { parseVideoEmbedUrl } from '@/shared/utils/videoUrlParser';

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  order_num: number;
  created_at: string;
}

const LEVELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export default function ClassroomPage() {
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<'unauthorized' | 'pending' | null>(
    null,
  );
  const [userEmail, setUserEmail] = useState('');

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
      if (res.status === 403) {
        const data = await res.json();
        setAuthError('pending');
        setUserEmail(data?.user?.email || '');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Lỗi khi tải bài giảng');
      }

      const data = await res.json();
      const list: Lesson[] = data.lessons || [];
      setLessons(list);
      if (list.length > 0) {
        setSelectedLesson(list[0]);
      }
    } catch (err) {
      console.error('Fetch lessons failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Filter lessons by level
  const filteredLessons = useMemo(() => {
    if (selectedLevel === 'all') return lessons;
    return lessons.filter(
      l => l.level?.toLowerCase() === selectedLevel.toLowerCase(),
    );
  }, [lessons, selectedLevel]);

  // Keep selected lesson valid when level filter changes
  useEffect(() => {
    if (filteredLessons.length > 0) {
      const exists = filteredLessons.some(l => l.id === selectedLesson?.id);
      if (!exists) {
        setSelectedLesson(filteredLessons[0]);
      }
    } else {
      setSelectedLesson(null);
    }
  }, [filteredLessons, selectedLesson]);

  const parsedVideo = useMemo(() => {
    if (!selectedLesson?.video_url) return null;
    return parseVideoEmbedUrl(selectedLesson.video_url);
  }, [selectedLesson]);

  return (
    <div className='mx-auto min-h-screen w-full max-w-7xl px-4 py-6 md:px-8'>
      {/* Page Header */}
      <div className='border-border/40 mb-8 flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5 text-blue-400'>
              <GraduationCap className='h-7 w-7' />
            </div>
            <div>
              <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
                Kho Bài Giảng & Video Record
              </h1>
              <p className='text-muted-foreground mt-0.5 text-sm'>
                Xem lại video các buổi học, hỗ trợ trực tiếp Google Drive &
                YouTube Full HD
              </p>
            </div>
          </div>
        </div>

        {/* Level Filters */}
        {!authError && (
          <div className='flex max-w-full items-center gap-1.5 overflow-x-auto pb-1'>
            {LEVELS.map(lvl => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className='text-muted-foreground flex flex-col items-center justify-center gap-3 py-24'>
          <RefreshCw className='h-8 w-8 animate-spin text-blue-500' />
          <p className='text-sm font-medium'>Đang tải danh sách bài giảng...</p>
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

      {/* Auth state: Pending approval */}
      {!loading && authError === 'pending' && (
        <div className='mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-16 text-center'>
          <div className='mb-4 rounded-full border border-blue-500/20 bg-blue-500/10 p-4 text-blue-400'>
            <Clock className='h-10 w-10 animate-pulse' />
          </div>
          <h2 className='text-foreground mb-2 text-xl font-bold'>
            Tài khoản đang chờ phê duyệt
          </h2>
          <p className='text-muted-foreground mb-4 text-sm leading-relaxed'>
            Tài khoản{' '}
            <span className='text-foreground font-semibold'>{userEmail}</span>{' '}
            của bạn đã đăng ký thành công nhưng đang chờ giáo viên cấp quyền
            truy cập vào kho bài giảng.
          </p>
          <div className='bg-muted/40 border-border/50 text-muted-foreground mb-6 w-full rounded-xl border p-3.5 text-left text-xs'>
            💡 <strong>Mẹo:</strong> Hãy nhắn tin cho giáo viên hoặc quản trị
            viên để kích hoạt tài khoản của bạn nhanh chóng nhé.
          </div>
          <button
            onClick={() => fetchLessons()}
            className='bg-muted hover:bg-muted/80 text-foreground border-border flex items-center gap-2 rounded-xl border px-5 py-2 text-sm font-medium transition-all'
          >
            <RefreshCw className='h-4 w-4' />
            Kiểm tra lại
          </button>
        </div>
      )}

      {/* Normal State: Player & Playlist */}
      {!loading && !authError && (
        <>
          {filteredLessons.length === 0 ? (
            <div className='border-border/60 rounded-2xl border border-dashed py-20 text-center'>
              <BookOpen className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
              <h3 className='text-foreground text-base font-semibold'>
                Chưa có bài giảng nào
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                Hiện tại chưa có video ghi hình nào cho cấp độ này.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-12'>
              {/* Left Column: Big Video Player (8 cols) */}
              <div className='flex flex-col gap-4 lg:col-span-8'>
                {/* 16:9 Video Box */}
                <div className='border-border/60 relative aspect-video w-full overflow-hidden rounded-2xl border bg-black shadow-2xl shadow-black/40'>
                  {parsedVideo?.embedUrl ? (
                    <iframe
                      src={parsedVideo.embedUrl}
                      title={selectedLesson?.title || 'Video bài giảng'}
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

                {/* Lesson Info Box */}
                {selectedLesson && (
                  <div className='bg-card border-border/60 rounded-2xl border p-5 shadow-sm'>
                    <div className='mb-2.5 flex flex-wrap items-center justify-between gap-3'>
                      <div className='flex items-center gap-2'>
                        <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-400 uppercase'>
                          {selectedLesson.level}
                        </span>
                        <span className='text-muted-foreground flex items-center gap-1 text-xs'>
                          <Calendar className='h-3.5 w-3.5' />
                          {new Date(
                            selectedLesson.created_at,
                          ).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      {selectedLesson.video_url && (
                        <a
                          href={selectedLesson.video_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1.5 text-xs font-medium text-blue-400 transition-colors hover:text-blue-300'
                        >
                          <span>Mở link gốc</span>
                          <ExternalLink className='h-3.5 w-3.5' />
                        </a>
                      )}
                    </div>

                    <h2 className='text-foreground text-lg leading-snug font-bold md:text-xl'>
                      {selectedLesson.title}
                    </h2>

                    {selectedLesson.description && (
                      <div className='border-border/40 text-muted-foreground mt-3 border-t pt-3 text-sm leading-relaxed whitespace-pre-wrap'>
                        {selectedLesson.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Playlist Sidebar (4 cols) */}
              <div className='flex flex-col gap-3 lg:col-span-4'>
                <div className='bg-card border-border/60 rounded-2xl border p-4 shadow-sm'>
                  <div className='border-border/40 mb-3.5 flex items-center justify-between border-b pb-2'>
                    <div className='flex items-center gap-2'>
                      <PlayCircle className='h-5 w-5 text-blue-400' />
                      <h3 className='text-foreground text-sm font-semibold'>
                        Danh sách bài giảng
                      </h3>
                    </div>
                    <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs font-medium'>
                      {filteredLessons.length} buổi
                    </span>
                  </div>

                  {/* Scrollable playlist list */}
                  <div className='flex max-h-[600px] flex-col gap-2 overflow-y-auto pr-1'>
                    {filteredLessons.map((item, index) => {
                      const isPlaying = item.id === selectedLesson?.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedLesson(item)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                            isPlaying
                              ? 'border-blue-500/40 bg-blue-600/10 shadow-sm'
                              : 'bg-muted/30 hover:bg-muted/60 hover:border-border/40 border-transparent'
                          }`}
                        >
                          <div
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                              isPlaying
                                ? 'bg-blue-600 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {item.order_num || index + 1}
                          </div>

                          <div className='min-w-0 flex-1'>
                            <p
                              className={`line-clamp-2 text-xs leading-snug font-semibold ${
                                isPlaying ? 'text-blue-400' : 'text-foreground'
                              }`}
                            >
                              {item.title}
                            </p>
                            <div className='mt-1 flex items-center gap-2'>
                              <span className='text-muted-foreground text-[10px] font-bold uppercase'>
                                {item.level}
                              </span>
                              {isPlaying && (
                                <span className='flex items-center gap-1 text-[10px] font-medium text-blue-400'>
                                  <span className='h-1.5 w-1.5 animate-ping rounded-full bg-blue-400' />
                                  Đang phát
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
