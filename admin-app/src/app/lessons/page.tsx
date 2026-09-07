/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  GraduationCap,
  ExternalLink,
  Video,
  Play,
  CheckCircle,
} from 'lucide-react';

interface LessonRecord {
  id: number;
  title: string;
  description: string | null;
  level: string;
  video_url: string;
  order_num: number;
  created_at: string;
}

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formLevel, setFormLevel] = useState('n5');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formOrderNum, setFormOrderNum] = useState('1');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState('');

  const fetchLessons = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const queryParams = new URLSearchParams();
      if (level) queryParams.set('level', level);
      if (search) queryParams.set('query', search);

      const res = await fetch(`/api/lessons?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách bài giảng');
      const data = await res.json();
      setLessons(data.lessons || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons();
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentId(null);
    setFormTitle('');
    setFormLevel(level || 'n5');
    setFormVideoUrl('');
    setFormOrderNum((lessons.length + 1).toString());
    setFormDescription('');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: LessonRecord) => {
    setDialogMode('edit');
    setCurrentId(item.id);
    setFormTitle(item.title);
    setFormLevel(item.level);
    setFormVideoUrl(item.video_url);
    setFormOrderNum(item.order_num.toString());
    setFormDescription(item.description || '');
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Vui lòng nhập tiêu đề buổi học');
      return;
    }
    if (!formVideoUrl.trim()) {
      setFormError('Vui lòng nhập link video (Google Drive hoặc YouTube)');
      return;
    }

    try {
      setActionLoading('save');
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || null,
        level: formLevel,
        video_url: formVideoUrl.trim(),
        order_num: Number(formOrderNum) || 1,
      };

      const url = '/api/lessons';
      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const body =
        dialogMode === 'add' ? payload : { ...payload, id: currentId };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu bài giảng');

      setIsDialogOpen(false);
      await fetchLessons(true);
    } catch (err: any) {
      setFormError(err.message || 'Lỗi xử lý');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa bài giảng này không?')) return;

    try {
      setActionLoading(id);
      const res = await fetch(`/api/lessons?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi xóa bài giảng');

      await fetchLessons(true);
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bài giảng');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2.5 text-2xl font-bold tracking-tight text-white'>
            <GraduationCap className='h-7 w-7 text-blue-500' />
            Quản Lý Bài Giảng & Video Record
          </h1>
          <p className='mt-1 text-sm text-slate-400'>
            Tổng số: <span className='font-bold text-blue-400'>{total}</span>{' '}
            bài giảng trong hệ thống
          </p>
        </div>

        <button
          onClick={openAddDialog}
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500'
        >
          <Plus className='h-4 w-4' />
          Thêm Bài Giảng Mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[#1e1e24] bg-[#121216] p-3 sm:flex-row sm:items-center'>
        {/* Level Filters */}
        <div className='flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0'>
          {[
            { id: '', label: 'Tất cả' },
            { id: 'n5', label: 'N5' },
            { id: 'n4', label: 'N4' },
            { id: 'n3', label: 'N3' },
            { id: 'n2', label: 'N2' },
            { id: 'n1', label: 'N1' },
          ].map(lvl => (
            <button
              key={lvl.id}
              onClick={() => setLevel(lvl.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                level === lvl.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-[#1e1e24] hover:text-white'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className='flex min-w-[280px] gap-2'
        >
          <div className='relative flex-1'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <input
              type='text'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Tìm theo tiêu đề...'
              className='w-full rounded-xl border border-[#26262e] bg-[#18181c] py-1.5 pr-3 pl-9 text-xs text-white focus:border-blue-500 focus:outline-none'
            />
          </div>
          <button
            type='submit'
            className='rounded-xl bg-[#1e1e24] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#26262e]'
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Table Content */}
      <div className='overflow-hidden rounded-2xl border border-[#1e1e24] bg-[#121216] shadow-xl'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm text-slate-300'>
            <thead className='border-b border-[#1e1e24] bg-[#18181c]/60 text-xs font-semibold text-slate-400 uppercase'>
              <tr>
                <th className='w-16 px-4 py-3.5 text-center'>Thứ tự</th>
                <th className='px-4 py-3.5'>Cấp độ</th>
                <th className='px-4 py-3.5'>Tiêu đề bài giảng</th>
                <th className='px-4 py-3.5'>Loại Video</th>
                <th className='px-4 py-3.5'>Ngày tạo</th>
                <th className='px-4 py-3.5 text-right'>Hành động</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-[#1e1e24]'>
              {loading ? (
                <tr>
                  <td colSpan={6} className='py-16 text-center text-slate-400'>
                    <Loader2 className='mx-auto mb-2 h-6 w-6 animate-spin text-blue-500' />
                    Đang tải danh sách bài giảng...
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={6} className='py-16 text-center text-slate-400'>
                    Chưa có bài giảng nào được thêm. Bấm &quot;Thêm Bài Giảng
                    Mới&quot; để bắt đầu.
                  </td>
                </tr>
              ) : (
                lessons.map(item => {
                  const isDrive = item.video_url.includes('drive.google.com');
                  const isYouTube =
                    item.video_url.includes('youtube.com') ||
                    item.video_url.includes('youtu.be');

                  return (
                    <tr
                      key={item.id}
                      className='transition-colors hover:bg-[#18181c]/40'
                    >
                      <td className='px-4 py-3 text-center font-bold text-slate-400'>
                        #{item.order_num}
                      </td>
                      <td className='px-4 py-3'>
                        <span className='rounded-md border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[11px] font-bold text-blue-400 uppercase'>
                          {item.level}
                        </span>
                      </td>
                      <td className='max-w-md px-4 py-3 font-medium text-white'>
                        <div>{item.title}</div>
                        {item.description && (
                          <div className='mt-0.5 line-clamp-1 text-xs text-slate-400'>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-1.5'>
                          {isDrive && (
                            <span className='rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400'>
                              Google Drive
                            </span>
                          )}
                          {isYouTube && (
                            <span className='rounded border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400'>
                              YouTube
                            </span>
                          )}
                          {!isDrive && !isYouTube && (
                            <span className='rounded border border-slate-500/20 bg-slate-500/10 px-2 py-0.5 text-[10px] font-bold text-slate-400'>
                              Direct Link
                            </span>
                          )}
                          <a
                            href={item.video_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='ml-1 text-slate-400 hover:text-blue-400'
                          >
                            <ExternalLink className='h-3.5 w-3.5' />
                          </a>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-xs text-slate-400'>
                        {new Date(item.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <button
                            onClick={() => openEditDialog(item)}
                            className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400'
                            title='Chỉnh sửa'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={actionLoading === item.id}
                            className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50'
                            title='Xóa'
                          >
                            {actionLoading === item.id ? (
                              <Loader2 className='h-4 w-4 animate-spin' />
                            ) : (
                              <Trash2 className='h-4 w-4' />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg rounded-2xl border border-[#26262e] bg-[#121216] p-6 shadow-2xl'>
            <h2 className='mb-4 text-lg font-bold text-white'>
              {dialogMode === 'add'
                ? 'Thêm Bài Giảng Mới'
                : 'Chỉnh Sửa Bài Giảng'}
            </h2>

            {formError && (
              <div className='mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400'>
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='mb-1 block text-xs font-semibold text-slate-300'>
                  Tiêu đề bài giảng *
                </label>
                <input
                  type='text'
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder='VD: Buổi 1 - Làm quen Hiragana và cách phát âm chuẩn'
                  className='w-full rounded-xl border border-[#26262e] bg-[#18181c] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
                  required
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <label className='mb-1 block text-xs font-semibold text-slate-300'>
                    Cấp độ (Level)
                  </label>
                  <select
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className='w-full rounded-xl border border-[#26262e] bg-[#18181c] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
                  >
                    <option value='n5'>JLPT N5</option>
                    <option value='n4'>JLPT N4</option>
                    <option value='n3'>JLPT N3</option>
                    <option value='n2'>JLPT N2</option>
                    <option value='n1'>JLPT N1</option>
                  </select>
                </div>

                <div>
                  <label className='mb-1 block text-xs font-semibold text-slate-300'>
                    Thứ tự buổi học (STT)
                  </label>
                  <input
                    type='number'
                    value={formOrderNum}
                    onChange={e => setFormOrderNum(e.target.value)}
                    min='1'
                    className='w-full rounded-xl border border-[#26262e] bg-[#18181c] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-slate-300'>
                  Link Video (Google Drive hoặc YouTube) *
                </label>
                <input
                  type='url'
                  value={formVideoUrl}
                  onChange={e => setFormVideoUrl(e.target.value)}
                  placeholder='https://drive.google.com/file/d/... hoặc https://youtu.be/...'
                  className='w-full rounded-xl border border-[#26262e] bg-[#18181c] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
                  required
                />
                <p className='mt-1 text-[11px] text-slate-400'>
                  💡 Dán link Google Drive (đã bật quyền xem) hoặc link YouTube
                  (Unlisted). Web sẽ tự trích xuất để phát video.
                </p>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-slate-300'>
                  Mô tả / Ghi chú buổi học (Tùy chọn)
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  rows={3}
                  placeholder='Tóm tắt nội dung bài học, bài tập về nhà hoặc link tài liệu đính kèm...'
                  className='w-full rounded-xl border border-[#26262e] bg-[#18181c] px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none'
                />
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-[#1e1e24] pt-3'>
                <button
                  type='button'
                  onClick={() => setIsDialogOpen(false)}
                  className='rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-[#1e1e24]'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={actionLoading === 'save'}
                  className='inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 disabled:opacity-50'
                >
                  {actionLoading === 'save' ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    <CheckCircle className='h-4 w-4' />
                  )}
                  Lưu Bài Giảng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
