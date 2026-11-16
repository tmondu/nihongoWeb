'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  PlayCircle,
  BookOpen,
  Calendar,
  Search,
  ArrowUpRight,
  Lock,
  CheckCircle2,
  GraduationCap,
  FileText,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import { cn } from '@/shared/utils/utils';

type VideoType = 'grammar' | 'exam_review';

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  video_type: VideoType;
  order_num: number;
  created_at: string;
  is_locked?: boolean;
  progress_percent?: number;
  is_completed?: boolean;
  last_position?: number;
}

interface UserInfo {
  email: string;
  can_watch_video: boolean;
  level: string;
  is_admin: boolean;
}

const LEVELS = [
  { id: 'all', label: 'Tất cả' },
  { id: 'n5', label: 'N5' },
  { id: 'n4', label: 'N4' },
  { id: 'n3', label: 'N3' },
  { id: 'n2', label: 'N2' },
  { id: 'n1', label: 'N1' },
];

const VIDEO_TABS: {
  id: VideoType;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    id: 'grammar',
    label: 'Ngữ pháp',
    icon: <GraduationCap className='size-4' strokeWidth={1.75} />,
    desc: 'Video các buổi học ngữ pháp trực tiếp',
  },
  {
    id: 'exam_review',
    label: 'Chữa đề',
    icon: <FileText className='size-4' strokeWidth={1.75} />,
    desc: 'Video chữa đề thi, luyện tập thực chiến',
  },
];

// Nền đặc lấy từ biến theme của project, không dùng token shadcn (bg-card...)
// vì project không định nghĩa chúng nên khung sẽ bị trong suốt.
const SURFACE =
  'border border-[var(--border-color)] bg-[var(--card-color)] shadow-[0_16px_32px_-20px_rgba(15,23,42,0.35)]';

// Màu theo cấp độ, cùng bảng màu với các ô chọn cấp độ ở trang Từ vựng.
const INK = 'border-[#16353a] text-[#16353a]';
const LEVEL_TONE: Record<string, string> = {
  n5: 'bg-[#2fb7ad]',
  n4: 'bg-[#ffc93c]',
  n3: 'bg-[#ff7a6b]',
  n2: 'bg-[#6db7f2]',
  n1: 'bg-[#b6dc5a]',
};
const toneOf = (level?: string) =>
  LEVEL_TONE[level?.toLowerCase() ?? ''] ?? 'bg-[#ff9ec7]';

function LessonSkeleton() {
  return (
    <div
      className={cn(
        'divide-y divide-[var(--border-color)] rounded-3xl',
        SURFACE,
      )}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className='flex items-center gap-5 p-5 sm:p-6'>
          <div className='h-8 w-10 animate-pulse rounded-lg bg-[var(--border-color)]' />
          <div className='flex-1 space-y-2.5'>
            <div className='h-3 w-24 animate-pulse rounded bg-[var(--border-color)]' />
            <div className='h-4 w-2/3 animate-pulse rounded bg-[var(--border-color)]' />
          </div>
          <div className='hidden h-8 w-24 animate-pulse rounded-full bg-[var(--border-color)] sm:block' />
        </div>
      ))}
    </div>
  );
}

export default function ClassroomPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState<VideoType>('grammar');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/lessons');
      if (!res.ok) {
        throw new Error('Lỗi khi tải bài giảng');
      }

      const data = await res.json();
      const list: Lesson[] = data.lessons || [];
      setLessons(list);
      setUserInfo(data.user || null);

      if (
        data.user &&
        (!data.user.display_name || data.user.display_name.trim() === '')
      ) {
        window.dispatchEvent(new CustomEvent('open-display-name-prompt'));
      }
    } catch (err) {
      console.error('Fetch lessons failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();

    const handleNameUpdated = () => {
      fetchLessons();
    };

    window.addEventListener('display-name-updated', handleNameUpdated);
    return () => {
      window.removeEventListener('display-name-updated', handleNameUpdated);
    };
  }, []);

  // Filter lessons by active tab (video_type), level & search
  const filteredLessons = useMemo(() => {
    const list = lessons.filter(l => {
      const matchType = l.video_type === activeTab;
      const matchLevel =
        selectedLevel === 'all' ||
        l.level?.toLowerCase() === selectedLevel.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description &&
          l.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchLevel && matchQuery;
    });

    const levelPriority: Record<string, number> = {
      n5: 1,
      n4: 2,
      n3: 3,
      n2: 4,
      n1: 5,
    };

    return list.sort((a, b) => {
      const pA = levelPriority[a.level?.toLowerCase()] ?? 99;
      const pB = levelPriority[b.level?.toLowerCase()] ?? 99;
      if (pA !== pB) return pA - pB;
      const orderA = a.order_num ?? 0;
      const orderB = b.order_num ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.id - b.id;
    });
  }, [lessons, activeTab, selectedLevel, searchQuery]);

  const tabCounts: Record<VideoType, number> = useMemo(
    () => ({
      grammar: lessons.filter(l => l.video_type === 'grammar').length,
      exam_review: lessons.filter(l => l.video_type === 'exam_review').length,
    }),
    [lessons],
  );

  const activeTabInfo = VIDEO_TABS.find(t => t.id === activeTab)!;

  return (
    <div className='font-vietnamese mx-auto min-h-[100dvh] w-full max-w-6xl px-4 py-8 md:px-8 md:py-12'>
      {/* Header: lệch trái, chữ tiêu đề không quá to */}
      <header className='grid grid-cols-1 items-end gap-6 md:grid-cols-[1fr_auto]'>
        <div>
          <p className='text-xs font-medium tracking-wide text-[var(--secondary-color)] uppercase'>
            Lớp học
          </p>
          <h1 className='mt-2 text-3xl font-bold tracking-tight text-[var(--foreground-color)] md:text-4xl'>
            Kho bài giảng &amp; video record
          </h1>
          <p className='mt-2 max-w-[56ch] text-sm leading-relaxed text-[var(--secondary-color)]'>
            Xem lại video các buổi học, hỗ trợ trực tiếp của Mondu.
          </p>
        </div>

        {userInfo && (
          <div className={cn('rounded-2xl px-5 py-3', SURFACE)}>
            <p className='text-[11px] font-medium tracking-wide text-[var(--secondary-color)] uppercase'>
              Cấp độ tài khoản
            </p>
            <p className='mt-0.5 font-mono text-sm font-bold text-[var(--main-color)] uppercase'>
              {userInfo.is_admin
                ? 'Admin · mọi cấp độ'
                : `Khóa ${userInfo.level || 'N5'}`}
            </p>
          </div>
        )}
      </header>

      {/* Điều khiển: loại video, cấp độ, tìm kiếm */}
      <section className='mt-8 flex flex-col gap-4'>
        <div
          role='tablist'
          aria-label='Loại video'
          className={cn('inline-flex w-fit gap-1 rounded-2xl p-1.5', SURFACE)}
        >
          {VIDEO_TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const count = tabCounts[tab.id];
            return (
              <button
                key={tab.id}
                role='tab'
                aria-selected={isActive}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedLevel('all');
                  setSearchQuery('');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-[0.98]',
                  isActive
                    ? 'bg-[var(--main-color)] text-[var(--background-color)]'
                    : 'text-[var(--secondary-color)] hover:bg-[var(--border-color)]/60 hover:text-[var(--foreground-color)]',
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {!loading && count > 0 && (
                  <span
                    className={cn(
                      'rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold',
                      isActive
                        ? 'bg-[var(--background-color)]/20'
                        : 'bg-[var(--border-color)]',
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className='text-xs text-[var(--secondary-color)]'>
          {activeTabInfo.desc}
          {activeTab === 'exam_review' && userInfo && (
            <span className='ml-1.5 font-semibold text-[var(--main-color)]'>
              · Miễn phí
            </span>
          )}
        </p>

        <div className='grid grid-cols-1 gap-3 md:grid-cols-[1fr_20rem] md:items-center'>
          <div
            role='group'
            aria-label='Lọc theo cấp độ'
            className='flex items-center gap-2 overflow-x-auto pb-1'
          >
            {LEVELS.map(lvl => {
              const active = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={cn(
                    'rounded-full border px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.97]',
                    active
                      ? 'border-[var(--main-color)] bg-[var(--main-color)] text-[var(--background-color)]'
                      : 'border-[var(--border-color)] bg-[var(--card-color)] text-[var(--secondary-color)] hover:border-[var(--main-color)] hover:text-[var(--foreground-color)]',
                  )}
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>

          <label className='relative block'>
            <span className='sr-only'>Tìm kiếm bài học</span>
            <Search
              className='pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[var(--secondary-color)]'
              strokeWidth={1.75}
            />
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Tìm kiếm bài học...'
              className='w-full rounded-2xl border border-[var(--border-color)] bg-[var(--card-color)] py-2.5 pr-4 pl-10 text-sm text-[var(--foreground-color)] placeholder:text-[var(--secondary-color)]/70 focus:border-[var(--main-color)] focus:outline-none'
            />
          </label>
        </div>
      </section>

      {/* Danh sách bài giảng */}
      <section className='mt-8'>
        {loading ? (
          <LessonSkeleton />
        ) : filteredLessons.length === 0 ? (
          <div
            className={cn(
              'flex flex-col items-start gap-4 rounded-3xl p-8 sm:p-12',
              SURFACE,
            )}
          >
            <span className='flex size-12 items-center justify-center rounded-2xl bg-[var(--main-color)]/10 text-[var(--main-color)]'>
              <BookOpen className='size-6' strokeWidth={1.75} />
            </span>
            <div>
              <h3 className='text-lg font-bold text-[var(--foreground-color)]'>
                Chưa có bài giảng nào
              </h3>
              <p className='mt-1 max-w-[52ch] text-sm leading-relaxed text-[var(--secondary-color)]'>
                {searchQuery
                  ? 'Không tìm thấy bài giảng nào phù hợp với từ khóa. Thử từ khóa ngắn hơn hoặc xóa bộ lọc.'
                  : `Hiện tại chưa có video ${activeTab === 'grammar' ? 'ngữ pháp' : 'chữa đề'} nào cho cấp độ này.`}
              </p>
            </div>
            {(searchQuery || selectedLevel !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedLevel('all');
                }}
                className='rounded-xl border border-[var(--border-color)] px-4 py-2 text-sm font-semibold text-[var(--foreground-color)] transition-all hover:border-[var(--main-color)] active:scale-[0.98]'
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            <div className='mb-3 flex items-center justify-between px-1 text-xs text-[var(--secondary-color)]'>
              <span>
                {activeTab === 'grammar'
                  ? 'Bài giảng ngữ pháp'
                  : 'Video chữa đề'}
              </span>
              <span className='font-mono'>
                {filteredLessons.length} bài giảng
              </span>
            </div>

            <div
              className={cn(
                'divide-y divide-[var(--border-color)] overflow-hidden rounded-3xl',
                SURFACE,
              )}
            >
              {filteredLessons.map((item, index) => {
                const lessonNumber = item.order_num || index + 1;
                const isLocked = Boolean(item.is_locked);
                const inProgress =
                  !isLocked &&
                  !item.is_completed &&
                  (item.progress_percent ?? 0) > 0;

                return (
                  <Link
                    key={item.id}
                    href={`/classroom/${item.id}`}
                    className={cn(
                      'group grid grid-cols-[3.5rem_1fr] items-center gap-x-4 gap-y-3 p-5 transition-colors duration-200 sm:p-6 md:grid-cols-[4rem_1fr_auto] md:gap-x-6',
                      'hover:bg-[var(--main-color)]/[0.06] active:bg-[var(--main-color)]/10',
                      isLocked && 'opacity-80',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-14 items-center justify-center rounded-2xl border-[3px] font-mono text-xl font-extrabold tabular-nums transition-all duration-150 md:size-16 md:text-2xl',
                        isLocked
                          ? 'border-[var(--border-color)] bg-[var(--border-color)] text-[var(--secondary-color)]'
                          : cn(
                              INK,
                              toneOf(item.level),
                              'shadow-[-4px_5px_0_0_#16353a] group-hover:translate-x-[-2px] group-hover:translate-y-[3px] group-hover:shadow-[-2px_2px_0_0_#16353a]',
                            ),
                      )}
                    >
                      {isLocked ? (
                        <Lock className='size-6' strokeWidth={1.75} />
                      ) : (
                        String(lessonNumber).padStart(2, '0')
                      )}
                    </span>

                    <div className='min-w-0'>
                      <div className='mb-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-medium text-[var(--secondary-color)]'>
                        <span
                          className={cn(
                            'rounded-md border-2 px-2 py-0.5 font-mono font-extrabold uppercase',
                            isLocked
                              ? 'border-[var(--border-color)] text-[var(--secondary-color)]'
                              : cn(INK, toneOf(item.level)),
                          )}
                        >
                          {item.level}
                        </span>
                        <span className='flex items-center gap-1.5'>
                          <Calendar className='size-3' strokeWidth={1.75} />
                          {new Date(item.created_at).toLocaleDateString(
                            'vi-VN',
                          )}
                        </span>
                        {!isLocked && item.is_completed && (
                          <span className='flex items-center gap-1 font-semibold text-emerald-500'>
                            <CheckCircle2
                              className='size-3.5'
                              strokeWidth={2}
                            />
                            Đã học
                          </span>
                        )}
                        {isLocked && (
                          <span className='font-semibold text-amber-500'>
                            Cần cấp độ cao hơn
                          </span>
                        )}
                      </div>

                      <h2 className='text-base font-bold text-[var(--foreground-color)] transition-colors group-hover:text-[var(--main-color)] md:text-lg'>
                        {item.title}
                      </h2>

                      {item.description && (
                        <p className='mt-1 line-clamp-2 max-w-[70ch] text-sm leading-relaxed text-[var(--secondary-color)]'>
                          {item.description}
                        </p>
                      )}

                      {inProgress && (
                        <div className='mt-3 flex max-w-xs items-center gap-3'>
                          <div className='h-1 flex-1 overflow-hidden rounded-full bg-[var(--border-color)]'>
                            <div
                              className='h-full rounded-full bg-[var(--main-color)]'
                              style={{ width: `${item.progress_percent}%` }}
                            />
                          </div>
                          <span className='font-mono text-[11px] text-[var(--secondary-color)] tabular-nums'>
                            {item.progress_percent}%
                          </span>
                        </div>
                      )}
                    </div>

                    <span
                      className={cn(
                        'col-span-2 inline-flex items-center justify-between gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold transition-all duration-150 md:col-span-1 md:justify-center',
                        isLocked
                          ? 'border-[var(--border-color)] bg-[var(--border-color)] text-[var(--secondary-color)]'
                          : cn(
                              INK,
                              toneOf(item.level),
                              'shadow-[-3px_4px_0_0_#16353a] group-hover:translate-x-[-2px] group-hover:translate-y-[3px] group-hover:shadow-[-1px_1px_0_0_#16353a]',
                            ),
                      )}
                    >
                      {isLocked ? (
                        <>
                          <Lock className='size-4' strokeWidth={1.75} />
                          Chưa mở khóa
                        </>
                      ) : (
                        <>
                          <PlayCircle className='size-4' strokeWidth={1.75} />
                          {inProgress ? 'Học tiếp' : 'Xem bài giảng'}
                        </>
                      )}
                      <ArrowUpRight
                        className='size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5'
                        strokeWidth={1.75}
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
