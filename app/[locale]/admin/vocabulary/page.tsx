/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Loader2,
  Search,
  Trash2,
  Edit,
  Plus,
  AlertCircle,
  BookCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/ui/components/dialog';

interface VocabularyRecord {
  id: number;
  level: string;
  jmdict_seq: string;
  kana: string;
  kanji: string | null;
  waller_definition: string;
}

export default function AdminVocabulary() {
  const [vocabularies, setVocabularies] = useState<VocabularyRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [level, setLevel] = useState('');
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );
  const [error, setError] = useState('');

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [currentId, setCurrentId] = useState<number | null>(null);

  // Form states
  const [formLevel, setFormLevel] = useState('n5');
  const [formSeq, setFormSeq] = useState('');
  const [formKana, setFormKana] = useState('');
  const [formKanji, setFormKanji] = useState('');
  const [formDefinition, setFormDefinition] = useState('');
  const [formError, setFormError] = useState('');

  const fetchVocabulary = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (level) queryParams.set('level', level);
      if (appliedSearch) queryParams.set('query', appliedSearch);

      const res = await fetch(
        `/api/admin/vocabulary?${queryParams.toString()}`,
      );
      if (!res.ok) throw new Error('Không thể tải danh sách từ vựng');
      const data = await res.json();
      setVocabularies(data.vocabularies);
      setTotal(data.total);
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Lỗi khi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, level, appliedSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search);
  };

  const handleLevelChange = (lvl: string) => {
    setPage(1);
    setLevel(lvl);
  };

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentId(null);
    setFormLevel('n5');
    setFormSeq(Math.floor(100000 + Math.random() * 900000).toString()); // Pre-fill custom seq
    setFormKana('');
    setFormKanji('');
    setFormDefinition('');
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (vocab: VocabularyRecord) => {
    setDialogMode('edit');
    setCurrentId(vocab.id);
    setFormLevel(vocab.level);
    setFormSeq(vocab.jmdict_seq);
    setFormKana(vocab.kana);
    setFormKanji(vocab.kanji || '');
    setFormDefinition(vocab.waller_definition);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLevel || !formSeq || !formKana || !formDefinition) {
      setFormError('Vui lòng nhập đầy đủ các trường bắt buộc (*)');
      return;
    }

    try {
      setActionLoading('form');
      const body = {
        id: currentId,
        level: formLevel,
        jmdict_seq: formSeq,
        kana: formKana,
        kanji: formKanji || null,
        waller_definition: formDefinition,
      };

      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/vocabulary', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Thao tác lưu thất bại');
      }

      setIsDialogOpen(false);
      await fetchVocabulary();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa vĩnh viễn từ vựng này khỏi database không?',
      )
    )
      return;

    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/vocabulary?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Xóa từ vựng thất bại');
      }

      await fetchVocabulary();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-3xl font-extrabold tracking-tight text-white'>
            Quản lý Từ vựng
          </h2>
          <p className='mt-1 text-sm text-slate-400'>
            Tra cứu, cập nhật dữ liệu từ vựng JLPT tiếng Nhật (N5 - N1) trong
            database.
          </p>
        </div>
        <Button
          onClick={openAddDialog}
          className='flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-xl bg-amber-500 px-4 font-semibold text-black hover:bg-amber-400 sm:self-center'
        >
          <Plus className='size-4' /> Thêm từ mới
        </Button>
      </div>

      {error && (
        <div className='flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-950/10 p-4 text-sm text-red-400'>
          <AlertCircle className='size-5 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Level Filters tabs */}
      <div className='flex flex-wrap gap-2'>
        {['', 'n5', 'n4', 'n3', 'n2', 'n1'].map(lvl => (
          <button
            key={lvl}
            onClick={() => handleLevelChange(lvl)}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all select-none ${
              level === lvl
                ? 'border-amber-500 bg-amber-500 text-black shadow-md shadow-amber-500/10'
                : 'border-[#1a1a1f] bg-[#09090b] text-slate-400 hover:bg-[#16161a] hover:text-white'
            }`}
          >
            {lvl === '' ? 'Tất cả' : lvl}
          </button>
        ))}
      </div>

      {/* Control Search bar */}
      <form
        onSubmit={handleSearchSubmit}
        className='flex gap-3 rounded-xl border border-[#1a1a1f] bg-[#09090b] p-4'
      >
        <div className='relative max-w-md flex-1'>
          <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
          <Input
            placeholder='Tìm theo Hiragana, Kanji hoặc Nghĩa tiếng Anh...'
            value={search}
            onChange={e => setSearch(e.target.value)}
            className='border-[#1a1a1f] bg-[#121215] pl-9 text-slate-100 placeholder-slate-500 focus-visible:ring-amber-500'
          />
        </div>
        <Button
          type='submit'
          className='h-9 cursor-pointer border border-[#2b2b35] bg-[#16161a] px-4 text-xs font-semibold text-slate-100 hover:bg-[#1c1c22]'
        >
          Tìm kiếm
        </Button>
      </form>

      {/* Table */}
      <div className='rounded-2xl border border-[#1a1a1f] bg-[#09090b] p-6'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-amber-500' />
          </div>
        ) : vocabularies.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-sm text-slate-500'>
            <BookCheck className='mb-3 size-12 text-slate-700' />
            <p>Không có dữ liệu từ vựng nào.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='overflow-hidden rounded-xl border border-[#1a1a1f]'>
              <table className='w-full border-collapse text-left'>
                <thead>
                  <tr className='border-b border-[#1a1a1f] bg-[#121215] text-xs font-semibold text-slate-400'>
                    <th className='px-6 py-3.5'>Mã Seq</th>
                    <th className='px-6 py-3.5'>Cấp độ</th>
                    <th className='px-6 py-3.5'>Kanji</th>
                    <th className='px-6 py-3.5'>Hiragana (Kana)</th>
                    <th className='px-6 py-3.5'>Nghĩa tiếng Anh</th>
                    <th className='px-6 py-3.5 text-right'>Thao tác</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#1a1a1f] bg-[#09090b]/50'>
                  {vocabularies.map(vocab => (
                    <tr
                      key={vocab.id}
                      className='text-sm text-slate-300 transition-colors hover:bg-[#121215]/50'
                    >
                      <td className='px-6 py-4 font-mono text-xs text-slate-500'>
                        #{vocab.jmdict_seq}
                      </td>
                      <td className='px-6 py-4'>
                        <span className='rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-500 uppercase'>
                          {vocab.level}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-lg font-bold text-white select-all'>
                        {vocab.kanji || (
                          <span className='text-xs font-normal text-slate-600 italic'>
                            Không có
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 font-medium text-amber-100 select-all'>
                        {vocab.kana}
                      </td>
                      <td
                        className='max-w-xs truncate px-6 py-4 text-slate-400'
                        title={vocab.waller_definition}
                      >
                        {vocab.waller_definition}
                      </td>
                      <td className='flex items-center justify-end gap-1 px-6 py-4 text-right'>
                        <Button
                          size='icon'
                          variant='ghost'
                          disabled={actionLoading !== null}
                          onClick={() => openEditDialog(vocab)}
                          className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-[#16161a] hover:text-white'
                        >
                          <Edit className='size-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          disabled={actionLoading !== null}
                          onClick={() => handleDelete(vocab.id)}
                          className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-red-400 hover:bg-red-950/20 hover:text-red-300'
                        >
                          {actionLoading === vocab.id ? (
                            <Loader2 className='size-4 animate-spin text-slate-500' />
                          ) : (
                            <Trash2 className='size-4' />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className='flex items-center justify-between border-t border-[#1a1a1f] pt-4'>
              <div className='font-mono text-xs font-medium text-slate-500'>
                Tổng cộng {total} từ vựng
              </div>
              <div className='flex items-center gap-3'>
                <Button
                  size='icon'
                  variant='outline'
                  disabled={page <= 1 || loading}
                  onClick={() => setPage(p => p - 1)}
                  className='flex h-8.5 w-8.5 cursor-pointer items-center justify-center border-[#1a1a1f] bg-[#121215] text-slate-300 hover:bg-[#16161a]'
                >
                  <ChevronLeft className='size-4' />
                </Button>
                <span className='font-mono text-xs font-semibold text-slate-400'>
                  Trang {page} / {totalPages}
                </span>
                <Button
                  size='icon'
                  variant='outline'
                  disabled={page >= totalPages || loading}
                  onClick={() => setPage(p => p + 1)}
                  className='flex h-8.5 w-8.5 cursor-pointer items-center justify-center border-[#1a1a1f] bg-[#121215] text-slate-300 hover:bg-[#16161a]'
                >
                  <ChevronRight className='size-4' />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-md rounded-2xl border border-[#1a1a1f] bg-[#09090b] text-slate-100'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-white'>
              {dialogMode === 'add' ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleFormSubmit} className='space-y-4 py-4'>
            {formError && (
              <div className='flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-950/10 p-3 text-xs text-red-400'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{formError}</span>
              </div>
            )}

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                  Cấp độ *
                </label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value)}
                  className='w-full rounded-lg border border-[#1a1a1f] bg-[#121215] p-2.5 text-sm text-slate-100 transition-colors focus:border-amber-500 focus:outline-none'
                >
                  <option value='n5'>N5</option>
                  <option value='n4'>N4</option>
                  <option value='n3'>N3</option>
                  <option value='n2'>N2</option>
                  <option value='n1'>N1</option>
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                  Mã JMDict Seq *
                </label>
                <Input
                  value={formSeq}
                  onChange={e => setFormSeq(e.target.value)}
                  placeholder='Ví dụ: 100120'
                  className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                />
              </div>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-1.5'>
                <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                  Hiragana (Kana) *
                </label>
                <Input
                  value={formKana}
                  onChange={e => setFormKana(e.target.value)}
                  placeholder='Ví dụ: くるま'
                  className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                  Kanji (Hán tự)
                </label>
                <Input
                  value={formKanji}
                  onChange={e => setFormKanji(e.target.value)}
                  placeholder='Ví dụ: 車'
                  className='border-[#1a1a1f] bg-[#121215] text-slate-100 placeholder-slate-600 focus-visible:ring-amber-500'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold tracking-wider text-slate-400 uppercase'>
                Nghĩa tiếng Anh *
              </label>
              <textarea
                value={formDefinition}
                onChange={e => setFormDefinition(e.target.value)}
                placeholder='Nhập nghĩa tiếng Anh của từ, ví dụ: car, automobile...'
                rows={3}
                className='w-full resize-none rounded-lg border border-[#1a1a1f] bg-[#121215] p-2.5 text-sm text-slate-100 placeholder-slate-600 transition-colors focus:border-amber-500 focus:outline-none'
              />
            </div>

            <DialogFooter className='flex gap-2 border-t border-[#1a1a1f] pt-4'>
              <Button
                type='button'
                variant='ghost'
                onClick={() => setIsDialogOpen(false)}
                className='h-9 cursor-pointer bg-transparent text-xs text-slate-400 hover:bg-[#16161a] hover:text-white'
              >
                Hủy bỏ
              </Button>
              <Button
                type='submit'
                disabled={actionLoading === 'form'}
                className='flex h-9 cursor-pointer items-center gap-1.5 bg-amber-500 px-4 text-xs font-semibold text-black hover:bg-amber-400'
              >
                {actionLoading === 'form' && (
                  <Loader2 className='size-3 animate-spin' />
                )}
                Lưu lại
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
