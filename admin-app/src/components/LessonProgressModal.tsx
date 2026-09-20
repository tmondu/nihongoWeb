'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  Clock,
  CircleDashed,
  Users,
  RefreshCw,
} from 'lucide-react';

interface StudentProgress {
  user_id: number;
  sbd: string;
  display_name: string;
  email: string;
  level: string;
  watched_seconds: number;
  last_position_seconds: number;
  duration_seconds: number;
  progress_percent: number;
  is_completed: boolean;
  last_watched_at: string | null;
}

interface SummaryData {
  total_students: number;
  completed_count: number;
  in_progress_count: number;
  not_started_count: number;
}

interface LessonInfo {
  id: number;
  title: string;
  level: string;
  order_num: number;
}

interface LessonProgressModalProps {
  lessonId: number;
  onClose: () => void;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export default function LessonProgressModal({
  lessonId,
  onClose,
}: LessonProgressModalProps) {
  const [lesson, setLesson] = useState<LessonInfo | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<
    'all' | 'completed' | 'in_progress' | 'not_started'
  >('all');

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/progress`);
      if (!res.ok) throw new Error('Không thể tải tiến độ');
      const data = await res.json();
      setLesson(data.lesson);
      setSummary(data.summary);
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [lessonId]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Tab filter
      if (filterTab === 'completed' && !s.is_completed) return false;
      if (
        filterTab === 'in_progress' &&
        (s.is_completed || s.progress_percent === 0)
      )
        return false;
      if (filterTab === 'not_started' && s.progress_percent > 0) return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        s.sbd?.toLowerCase().includes(q) ||
        s.display_name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
      );
    });
  }, [students, filterTab, searchQuery]);

  return (
    <div className='animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm duration-200'>
      <div className='flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400'>
              <Users className='h-5 w-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-400 uppercase'>
                  {lesson?.level || 'N5'}
                </span>
                {lesson?.order_num ? (
                  <span className='text-xs font-medium text-slate-400'>
                    Buổi {lesson.order_num}
                  </span>
                ) : null}
              </div>
              <h2 className='mt-0.5 line-clamp-1 text-base font-bold text-white'>
                {lesson?.title || 'Tiến độ học viên xem bài giảng'}
              </h2>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={fetchProgress}
              disabled={loading}
              title='Làm mới dữ liệu'
              className='flex h-8 items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 text-xs font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-700 hover:text-white disabled:opacity-50'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`}
              />
              <span className='hidden sm:inline'>Làm mới</span>
            </button>

            <button
              type='button'
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className='flex-1 space-y-5 overflow-y-auto p-6'>
          {/* Summary Cards */}
          {summary && (
            <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <div className='rounded-xl border border-slate-800 bg-slate-950/60 p-3.5'>
                <div className='text-xs font-medium text-slate-400'>
                  Tổng học viên
                </div>
                <div className='mt-1 text-2xl font-bold text-white'>
                  {summary.total_students}
                </div>
              </div>

              <div className='rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5'>
                <div className='flex items-center gap-1.5 text-xs font-medium text-emerald-400'>
                  <CheckCircle2 className='h-3.5 w-3.5' />
                  <span>Đã học xong</span>
                </div>
                <div className='mt-1 text-2xl font-bold text-emerald-400'>
                  {summary.completed_count}
                </div>
              </div>

              <div className='rounded-xl border border-blue-500/20 bg-blue-500/5 p-3.5'>
                <div className='flex items-center gap-1.5 text-xs font-medium text-blue-400'>
                  <Clock className='h-3.5 w-3.5' />
                  <span>Đang học dở</span>
                </div>
                <div className='mt-1 text-2xl font-bold text-blue-400'>
                  {summary.in_progress_count}
                </div>
              </div>

              <div className='rounded-xl border border-slate-700/40 bg-slate-800/30 p-3.5'>
                <div className='flex items-center gap-1.5 text-xs font-medium text-slate-400'>
                  <CircleDashed className='h-3.5 w-3.5' />
                  <span>Chưa xem</span>
                </div>
                <div className='mt-1 text-2xl font-bold text-slate-300'>
                  {summary.not_started_count}
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search Bar */}
          <div className='flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between'>
            {/* Filter Tabs */}
            <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
              <button
                type='button'
                onClick={() => setFilterTab('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Tất cả ({summary?.total_students ?? 0})
              </button>
              <button
                type='button'
                onClick={() => setFilterTab('completed')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Đã học xong ({summary?.completed_count ?? 0})
              </button>
              <button
                type='button'
                onClick={() => setFilterTab('in_progress')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'in_progress'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Đang học ({summary?.in_progress_count ?? 0})
              </button>
              <button
                type='button'
                onClick={() => setFilterTab('not_started')}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterTab === 'not_started'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Chưa xem ({summary?.not_started_count ?? 0})
              </button>
            </div>

            {/* Search Input */}
            <div className='relative w-full sm:w-64'>
              <Search className='absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                placeholder='Tìm SBD, tên hoặc email...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className='w-full rounded-lg border border-slate-700/80 bg-slate-950/70 py-1.5 pr-3 pl-9 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none'
              />
            </div>
          </div>

          {/* Students List Table */}
          {loading ? (
            <div className='flex flex-col items-center justify-center gap-2 py-16 text-slate-400'>
              <RefreshCw className='h-6 w-6 animate-spin text-blue-500' />
              <p className='text-xs'>Đang tải tiến độ học viên...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className='rounded-xl border border-slate-800/80 bg-slate-950/40 py-12 text-center text-xs text-slate-400'>
              Không tìm thấy học viên nào phù hợp với bộ lọc.
            </div>
          ) : (
            <div className='overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/50'>
              <table className='w-full text-left text-xs'>
                <thead className='border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold tracking-wider text-slate-400 uppercase'>
                  <tr>
                    <th className='px-4 py-3'>SBD</th>
                    <th className='px-4 py-3'>Học viên</th>
                    <th className='px-3 py-3 text-center'>Cấp độ</th>
                    <th className='px-4 py-3'>Tiến độ xem (%)</th>
                    <th className='px-4 py-3'>Thời gian xem</th>
                    <th className='px-4 py-3 text-right'>Lần xem gần nhất</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800/60'>
                  {filteredStudents.map(s => {
                    const isDone = s.is_completed;
                    const hasProgress = s.progress_percent > 0;

                    return (
                      <tr
                        key={s.user_id}
                        className='transition-colors hover:bg-slate-800/30'
                      >
                        {/* SBD */}
                        <td className='px-4 py-3 font-mono text-xs font-bold'>
                          {s.sbd ? (
                            <span className='inline-flex items-center rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-blue-400'>
                              {s.sbd}
                            </span>
                          ) : (
                            <span className='text-slate-600 italic'>-</span>
                          )}
                        </td>

                        {/* Name & Email */}
                        <td className='px-4 py-3'>
                          <div className='font-semibold text-white'>
                            {s.display_name}
                          </div>
                          <div className='text-[11px] text-slate-400'>
                            {s.email}
                          </div>
                        </td>

                        {/* Level */}
                        <td className='px-3 py-3 text-center'>
                          <span className='rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-300 uppercase'>
                            {s.level}
                          </span>
                        </td>

                        {/* Progress Bar & Percentage */}
                        <td className='min-w-[140px] px-4 py-3'>
                          <div className='mb-1 flex items-center justify-between gap-2'>
                            <span
                              className={`font-bold ${
                                isDone
                                  ? 'text-emerald-400'
                                  : hasProgress
                                    ? 'text-blue-400'
                                    : 'text-slate-500'
                              }`}
                            >
                              {s.progress_percent}%
                            </span>
                            {isDone ? (
                              <span className='text-[10px] font-semibold text-emerald-400'>
                                Hoàn thành
                              </span>
                            ) : null}
                          </div>
                          <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isDone
                                  ? 'bg-emerald-500'
                                  : hasProgress
                                    ? 'bg-blue-500'
                                    : 'bg-transparent'
                              }`}
                              style={{ width: `${s.progress_percent}%` }}
                            />
                          </div>
                        </td>

                        {/* Watched time */}
                        <td className='px-4 py-3 font-mono text-slate-300'>
                          {hasProgress || s.watched_seconds > 0 ? (
                            <div>
                              <div className='font-semibold text-white'>
                                {formatDuration(s.watched_seconds)}
                              </div>
                              <div className='text-[10px] text-slate-400'>
                                Dừng ở:{' '}
                                {formatDuration(s.last_position_seconds)}
                                {s.duration_seconds > 0
                                  ? ` / ${formatDuration(s.duration_seconds)}`
                                  : ''}
                              </div>
                            </div>
                          ) : (
                            <span className='text-slate-600'>0:00</span>
                          )}
                        </td>

                        {/* Last Watched At */}
                        <td className='px-4 py-3 text-right text-[11px] text-slate-400'>
                          {s.last_watched_at ? (
                            new Date(s.last_watched_at).toLocaleString(
                              'vi-VN',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              },
                            )
                          ) : (
                            <span className='text-slate-600 italic'>
                              Chưa xem
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-xs text-slate-400'>
          <span>
            Hiển thị <strong>{filteredStudents.length}</strong> học viên
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={fetchProgress}
              disabled={loading}
              className='flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white disabled:opacity-50'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`}
              />
              <span>Tải lại</span>
            </button>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg bg-slate-800 px-4 py-1.5 font-semibold text-white transition-colors hover:bg-slate-700'
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
