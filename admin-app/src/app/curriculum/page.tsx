'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BookMarked,
  Search,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Loader2,
  BookOpen,
  Layers,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ThamLessonRow {
  id: number;
  lesson_num: number;
  title_vi: string;
  title_ja: string;
  description: string | null;
  level: string;
  book_vol: number;
  vocab_count: number;
  grammar_count: number;
  order_num: number;
  actual_vocab_count: number;
  actual_grammar_count: number;
}

export default function AdminCurriculumPage() {
  const [lessons, setLessons] = useState<ThamLessonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | '1' | '2'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state for adding/editing lesson
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLessonNum, setFormLessonNum] = useState('');
  const [formTitleVi, setFormTitleVi] = useState('');
  const [formTitleJa, setFormTitleJa] = useState('');
  const [formLevel, setFormLevel] = useState('n5');
  const [formBookVol, setFormBookVol] = useState(1);
  const [formDescription, setFormDescription] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch lessons from API
  const fetchLessons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('vol', activeTab);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await fetch(`/api/curriculum?${params.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách bài học');
      const data = await res.json();
      setLessons(data.lessons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [activeTab, searchQuery]);

  const handleOpenAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    const nextNum =
      lessons.length > 0 ? Math.max(...lessons.map(l => l.lesson_num)) + 1 : 1;
    setFormLessonNum(String(nextNum));
    setFormTitleVi('');
    setFormTitleJa(`第${nextNum}課`);
    setFormLevel(nextNum > 25 ? 'n4' : 'n5');
    setFormBookVol(nextNum > 25 ? 2 : 1);
    setFormDescription('');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (lesson: ThamLessonRow) => {
    setDialogMode('edit');
    setEditingId(lesson.id);
    setFormLessonNum(String(lesson.lesson_num));
    setFormTitleVi(lesson.title_vi);
    setFormTitleJa(lesson.title_ja);
    setFormLevel(lesson.level);
    setFormBookVol(lesson.book_vol);
    setFormDescription(lesson.description || '');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');

    try {
      const payload = {
        id: editingId,
        lesson_num: Number(formLessonNum),
        title_vi: formTitleVi.trim(),
        title_ja: formTitleJa.trim(),
        description: formDescription.trim(),
        level: formLevel,
        book_vol: Number(formBookVol),
        order_num: Number(formLessonNum),
      };

      const res = await fetch('/api/curriculum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu bài học');

      setIsDialogOpen(false);
      fetchLessons();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setFormError(message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: number, lessonNum: number) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa Bài ${lessonNum} cùng toàn bộ ngữ pháp và từ vựng liên quan?`,
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/curriculum?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Không thể xóa bài học');
      fetchLessons();
    } catch (err) {
      alert('Lỗi xóa bài học');
      console.error(err);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='flex size-9 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500'>
              <BookMarked className='size-5' />
            </div>
            <h1 className='text-xl font-bold text-slate-100'>
              Quản Lý Giáo Án (Curriculum)
            </h1>
          </div>
          <p className='mt-1 text-xs text-slate-400'>
            Quản lý 50 bài học Minna no Nihongo hoặc cập nhật giáo án riêng theo
            nhu cầu.
          </p>
        </div>

        <button
          type='button'
          onClick={handleOpenAdd}
          className='inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-sky-600 sm:self-auto'
        >
          <Plus className='size-4' />
          <span>Thêm bài học mới</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className='flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:flex-row sm:items-center'>
        {/* Tabs */}
        <div className='no-scrollbar flex items-center gap-2 overflow-x-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('all')}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả (50 bài)
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('1')}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === '1'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Minna I · N5 (Bài 1 - 25)
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('2')}
            className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTab === '2'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            Minna II · N4 (Bài 26 - 50)
          </button>
        </div>

        {/* Search */}
        <div className='relative flex-1 sm:max-w-xs'>
          <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' />
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm theo tên bài hoặc số bài...'
            className='w-full rounded-xl border border-slate-700 bg-slate-800 py-1.5 pr-4 pl-9 text-xs text-slate-100 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none'
          />
        </div>
      </div>

      {/* Table of Lessons */}
      <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm'>
        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-400'>
            <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
            <span className='text-sm'>Đang tải danh sách bài học...</span>
          </div>
        ) : lessons.length > 0 ? (
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-xs text-slate-300'>
              <thead className='border-b border-slate-800 bg-slate-800/60 text-[11px] tracking-wider text-slate-400 uppercase'>
                <tr>
                  <th className='px-4 py-3.5 font-semibold'>Bài số</th>
                  <th className='px-4 py-3.5 font-semibold'>
                    Chương tiếng Nhật
                  </th>
                  <th className='px-4 py-3.5 font-semibold'>Chủ đề bài học</th>
                  <th className='px-4 py-3.5 font-semibold'>Cấp độ</th>
                  <th className='px-4 py-3.5 font-semibold'>Ngữ pháp</th>
                  <th className='px-4 py-3.5 font-semibold'>Từ vựng</th>
                  <th className='px-4 py-3.5 text-right font-semibold'>
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-800/80'>
                {lessons.map(lesson => (
                  <tr
                    key={lesson.id}
                    className='transition-colors hover:bg-slate-800/40'
                  >
                    <td className='px-4 py-3.5 font-bold text-slate-100'>
                      Bài {lesson.lesson_num}
                    </td>
                    <td className='font-japanese px-4 py-3.5 font-medium text-slate-300'>
                      {lesson.title_ja}
                    </td>
                    <td className='px-4 py-3.5 font-medium text-slate-200'>
                      <div>{lesson.title_vi}</div>
                      {lesson.description && (
                        <div className='mt-0.5 line-clamp-1 text-[11px] text-slate-400'>
                          {lesson.description}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          lesson.level === 'n5'
                            ? 'border border-sky-500/20 bg-sky-500/10 text-sky-400'
                            : 'border border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
                        }`}
                      >
                        {lesson.level} · Tập {lesson.book_vol}
                      </span>
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='inline-flex items-center gap-1 font-semibold text-sky-400'>
                        <BookOpen className='size-3.5' />
                        <span>
                          {lesson.actual_grammar_count ?? lesson.grammar_count}{' '}
                          mẫu
                        </span>
                      </span>
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='inline-flex items-center gap-1 font-semibold text-emerald-400'>
                        <Layers className='size-3.5' />
                        <span>
                          {lesson.actual_vocab_count ?? lesson.vocab_count} từ
                        </span>
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        {/* Manage Content Button */}
                        <Link
                          href={`/curriculum/${lesson.lesson_num}`}
                          className='inline-flex items-center gap-1.5 rounded-lg bg-sky-500/10 px-3 py-1.5 font-medium text-sky-400 transition-all hover:bg-sky-500 hover:text-white'
                          title='Quản lý ngữ pháp và từ vựng chi tiết'
                        >
                          <ExternalLink className='size-3.5' />
                          <span>Chi tiết</span>
                        </Link>

                        {/* Edit metadata button */}
                        <button
                          type='button'
                          onClick={() => handleOpenEdit(lesson)}
                          className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100'
                          title='Chỉnh sửa thông tin bài'
                        >
                          <Edit className='size-4' />
                        </button>

                        {/* Delete button */}
                        <button
                          type='button'
                          onClick={() =>
                            handleDelete(lesson.id, lesson.lesson_num)
                          }
                          className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400'
                          title='Xóa bài học'
                        >
                          <Trash2 className='size-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className='py-16 text-center text-slate-400'>
            <BookMarked className='mx-auto mb-2 size-10 opacity-40' />
            <p className='text-sm font-medium'>Không tìm thấy bài học nào</p>
          </div>
        )}
      </div>

      {/* Add / Edit Lesson Modal */}
      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
          <div className='w-full max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3'>
              <h3 className='text-base font-bold text-slate-100'>
                {dialogMode === 'add'
                  ? 'Thêm bài học mới'
                  : `Sửa thông tin Bài ${formLessonNum}`}
              </h3>
              <button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='cursor-pointer text-lg text-slate-400 hover:text-slate-100'
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className='flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-3.5 text-xs'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Số bài (1-50):
                  </label>
                  <input
                    type='number'
                    value={formLessonNum}
                    onChange={e => setFormLessonNum(e.target.value)}
                    required
                    min='1'
                    className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Cấp độ:
                  </label>
                  <select
                    value={formLevel}
                    onChange={e => {
                      setFormLevel(e.target.value);
                      setFormBookVol(e.target.value === 'n4' ? 2 : 1);
                    }}
                    className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  >
                    <option value='n5'>N5 (Minna I)</option>
                    <option value='n4'>N4 (Minna II)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Tiêu đề tiếng Nhật:
                </label>
                <input
                  type='text'
                  value={formTitleJa}
                  onChange={e => setFormTitleJa(e.target.value)}
                  placeholder='VD: 第1課'
                  required
                  className='font-japanese w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Chủ đề bài học (tiếng Việt):
                </label>
                <input
                  type='text'
                  value={formTitleVi}
                  onChange={e => setFormTitleVi(e.target.value)}
                  placeholder='VD: Giới thiệu bản thân'
                  required
                  className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Mô tả tóm tắt:
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder='VD: Học cách chào hỏi, giới thiệu quốc tịch, nghề nghiệp...'
                  className='w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-slate-800 pt-3'>
                <button
                  type='button'
                  onClick={() => setIsDialogOpen(false)}
                  className='cursor-pointer rounded-xl px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={formSubmitting}
                  className='flex cursor-pointer items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 font-semibold text-white hover:bg-sky-600 disabled:opacity-50'
                >
                  {formSubmitting && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  <span>
                    {dialogMode === 'add' ? 'Tạo bài học' : 'Lưu thay đổi'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
