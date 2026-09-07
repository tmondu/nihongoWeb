'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  Calendar,
  RefreshCw,
  Search,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';

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

interface UserInfo {
  email: string;
  can_watch_video: boolean;
  level: string;
  is_admin: boolean;
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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
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
    } catch (err) {
      console.error('Fetch lessons failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  // Filter lessons by level & search query
  const filteredLessons = useMemo(() => {
    return lessons.filter(l => {
      const matchLevel =
        selectedLevel === 'all' ||
        l.level?.toLowerCase() === selectedLevel.toLowerCase();
      const matchQuery =
        !searchQuery.trim() ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.description &&
          l.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchLevel && matchQuery;
    });
  }, [lessons, selectedLevel, searchQuery]);

  return (
    <div className='mx-auto min-h-screen w-full max-w-6xl px-4 py-6 md:px-8'>
      {/* Page Header */}
      <div className='border-border/40 mb-8 border-b pb-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='flex items-center gap-3.5'>
            <div className='rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3 text-blue-400'>
              <GraduationCap className='h-8 w-8' />
            </div>
            <div>
              <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
                Kho Bài Giảng & Video Record
              </h1>
              <p className='text-muted-foreground mt-0.5 text-sm'>
                Xem lại video các buổi học, hỗ trợ trực tiếp của PThamSS!
              </p>
            </div>
          </div>

          {userInfo && (
            <div className='flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-2.5 text-xs'>
              <div className='flex flex-col'>
                <span className='text-muted-foreground text-[10px] font-semibold tracking-wider uppercase'>
                  Cấp độ tài khoản
                </span>
                <span className='text-sm font-bold text-blue-400 uppercase'>
                  {userInfo.is_admin
                    ? 'Admin (Mọi cấp độ)'
                    : `Khóa học ${userInfo.level || 'N5'}`}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Level Filters & Search bar */}
        {!loading && (
          <div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            {/* Level Tabs */}
            <div className='flex max-w-full items-center gap-1.5 overflow-x-auto pb-1'>
              {LEVELS.map(lvl => {
                const active = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => setSelectedLevel(lvl.id)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
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

            {/* Search Input */}
            <div className='relative w-full sm:max-w-xs'>
              <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm bài học...'
                className='border-border/60 bg-card text-foreground placeholder:text-muted-foreground/60 w-full rounded-xl border py-2 pr-3 pl-9 text-xs focus:border-blue-500 focus:outline-none'
              />
            </div>
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

      {/* Normal State: List of Lesson Titles */}
      {!loading && (
        <>
          {filteredLessons.length === 0 ? (
            <div className='border-border/60 rounded-2xl border border-dashed py-20 text-center'>
              <BookOpen className='text-muted-foreground/50 mx-auto mb-3 h-12 w-12' />
              <h3 className='text-foreground text-base font-semibold'>
                Chưa có bài giảng nào
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                {searchQuery
                  ? 'Không tìm thấy bài giảng nào phù hợp với từ khóa.'
                  : 'Hiện tại chưa có video ghi hình nào cho cấp độ này.'}
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='text-muted-foreground flex items-center justify-between px-1 text-xs'>
                <span>Danh sách các bài học</span>
                <span>{filteredLessons.length} bài giảng</span>
              </div>

              <div className='grid grid-cols-1 gap-3 sm:gap-4'>
                {filteredLessons.map((item, index) => {
                  const lessonNumber = item.order_num || index + 1;
                  const isLocked = Boolean(item.is_locked);
                  return (
                    <Link
                      key={item.id}
                      href={`/classroom/${item.id}`}
                      className={`group border-border/60 bg-card flex flex-col justify-between gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 md:flex-row md:items-center md:p-5 ${
                        isLocked
                          ? 'opacity-85 hover:border-amber-500/40 hover:bg-amber-500/[0.02]'
                          : 'hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-blue-600/[0.03] hover:shadow-md'
                      }`}
                    >
                      <div className='flex min-w-0 items-start gap-3.5 sm:gap-4'>
                        {/* Lesson number badge */}
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-200 ${
                            isLocked
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 group-hover:border-amber-500/40'
                              : 'border-border/60 bg-muted/60 text-muted-foreground group-hover:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white'
                          }`}
                        >
                          {isLocked ? (
                            <Lock className='h-4 w-4' />
                          ) : (
                            lessonNumber
                          )}
                        </div>

                        {/* Title and metadata */}
                        <div className='min-w-0 flex-1'>
                          <div className='mb-1 flex flex-wrap items-center gap-2'>
                            {isLocked ? (
                              <span className='flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase'>
                                <Lock className='h-2.5 w-2.5' /> Cần{' '}
                                {item.level}
                              </span>
                            ) : (
                              <span className='rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase'>
                                {item.level}
                              </span>
                            )}
                            <span className='text-muted-foreground flex items-center gap-1 text-[11px]'>
                              <Calendar className='h-3 w-3' />
                              {new Date(item.created_at).toLocaleDateString(
                                'vi-VN',
                              )}
                            </span>
                          </div>

                          <h2
                            className={`text-foreground text-sm font-bold transition-colors md:text-base ${
                              isLocked
                                ? 'group-hover:text-amber-400'
                                : 'group-hover:text-blue-400'
                            }`}
                          >
                            {item.title}
                          </h2>

                          {item.description && (
                            <p className='text-muted-foreground mt-1 line-clamp-2 text-xs leading-relaxed'>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className='flex shrink-0 items-center justify-end md:justify-center'>
                        <div
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold shadow-xs transition-all duration-200 ${
                            isLocked
                              ? 'border-border/60 bg-muted/40 text-muted-foreground group-hover:border-amber-500/30 group-hover:bg-amber-500/10 group-hover:text-amber-400'
                              : 'border-border/60 bg-muted/40 text-muted-foreground group-hover:border-blue-500/30 group-hover:bg-blue-600 group-hover:text-white'
                          }`}
                        >
                          {isLocked ? (
                            <>
                              <Lock className='h-4 w-4' />
                              <span>Chưa mở khóa</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className='h-4 w-4' />
                              <span>Xem bài giảng</span>
                            </>
                          )}
                          <ChevronRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5' />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
