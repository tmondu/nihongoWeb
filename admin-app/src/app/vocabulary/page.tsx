/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface VocabularyRecord {
  id: number;
  level: string;
  jmdict_seq: string;
  kana: string;
  kanji: string | null;
  waller_definition: string;
}

export default function AdminVocabularyPage() {
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

  const fetchVocabulary = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (level) queryParams.set('level', level);
      if (appliedSearch) queryParams.set('query', appliedSearch);

      const res = await fetch(`/api/vocabulary?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách từ vựng');
      const data = await res.json();
      setVocabularies(data.vocabularies);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
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

  const openAddDialog = () => {
    setDialogMode('add');
    setCurrentId(null);
    setFormLevel('n5');
    setFormSeq(Math.floor(100000 + Math.random() * 900000).toString());
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
      const res = await fetch('/api/vocabulary', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Thao tác thất bại');
      }

      setIsDialogOpen(false);
      await fetchVocabulary(true); // Silent refetch: Giữ nguyên vị trí cuộn trang
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa từ vựng này khỏi database không?'))
      return;

    try {
      setActionLoading(id);
      const res = await fetch(`/api/vocabulary?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchVocabulary(true); // Silent refetch
      }
    } catch (err) {
      console.error(err);
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
          <h1 className='text-2xl font-black tracking-tight text-white'>
            Quản Lý Từ Vựng (Vocabulary)
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Tổng số: <span className='font-bold text-amber-400'>{total}</span>{' '}
            từ vựng trong cơ sở dữ liệu
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className='flex cursor-pointer items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 active:scale-95'
        >
          <Plus className='size-4' />
          Thêm Từ Vựng Mới
        </button>
      </div>

      {/* Filters & Search */}
      <div className='flex flex-col gap-3 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 sm:flex-row sm:items-center sm:justify-between'>
        {/* Level Tabs */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {['', 'n5', 'n4', 'n3', 'n2', 'n1'].map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setPage(1);
                setLevel(lvl);
              }}
              className={`cursor-pointer rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
                level === lvl
                  ? 'border border-amber-500/30 bg-amber-500/20 text-amber-400'
                  : 'text-slate-400 hover:bg-[#16161a] hover:text-slate-200'
              }`}
            >
              {lvl ? lvl.toUpperCase() : 'Tất cả'}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className='flex items-center gap-2'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-slate-500' />
            <input
              type='text'
              placeholder='Tìm Kanji, Kana, nghĩa...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-64 rounded-xl border border-[#1e1e24] bg-[#121215] py-1.5 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-amber-500/50 focus:outline-none'
            />
          </div>
          <button
            type='submit'
            className='cursor-pointer rounded-xl border border-[#2b2b35] bg-[#16161a] px-3 py-1.5 text-xs font-bold text-slate-200 hover:bg-[#202026]'
          >
            Tìm
          </button>
        </form>
      </div>

      {/* Table */}
      <div className='rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 shadow-sm'>
        {loading ? (
          <div className='flex justify-center py-20'>
            <Loader2 className='size-8 animate-spin text-amber-500' />
          </div>
        ) : vocabularies.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
            <BookOpen className='mb-2 size-10 text-slate-700' />
            <p className='text-xs'>Không tìm thấy từ vựng nào.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='overflow-hidden rounded-xl border border-[#1e1e24]'>
              <table className='w-full border-collapse text-left text-sm'>
                <thead>
                  <tr className='border-b border-[#1e1e24] bg-[#121215] text-xs font-semibold text-slate-400'>
                    <th className='px-5 py-3'>Mã Seq</th>
                    <th className='px-5 py-3'>Cấp Độ</th>
                    <th className='px-5 py-3'>Chữ Kanji</th>
                    <th className='px-5 py-3'>Hiragana (Kana)</th>
                    <th className='px-5 py-3'>Nghĩa</th>
                    <th className='px-5 py-3 text-right'>Thao Tác</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#1e1e24]'>
                  {vocabularies.map(vocab => (
                    <tr
                      key={vocab.id}
                      className='text-slate-300 transition-colors hover:bg-[#16161a]'
                    >
                      <td className='px-5 py-3.5 font-mono text-xs text-slate-500'>
                        #{vocab.jmdict_seq}
                      </td>
                      <td className='px-5 py-3.5'>
                        <span className='rounded-md border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 uppercase'>
                          {vocab.level}
                        </span>
                      </td>
                      <td className='px-5 py-3.5 text-lg font-bold text-white'>
                        {vocab.kanji || (
                          <span className='text-xs font-normal text-slate-600 italic'>
                            (Kana thuần)
                          </span>
                        )}
                      </td>
                      <td className='px-5 py-3.5 font-medium text-amber-100'>
                        {vocab.kana}
                      </td>
                      <td
                        className='max-w-xs truncate px-5 py-3.5 text-xs text-slate-400'
                        title={vocab.waller_definition}
                      >
                        {vocab.waller_definition}
                      </td>
                      <td className='flex items-center justify-end gap-1 px-5 py-3.5 text-right'>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => openEditDialog(vocab)}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#202026] hover:text-white'
                        >
                          <Edit className='size-4' />
                        </button>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleDelete(vocab.id)}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-950/20 hover:text-red-300'
                        >
                          {actionLoading === vocab.id ? (
                            <Loader2 className='size-4 animate-spin text-slate-500' />
                          ) : (
                            <Trash2 className='size-4' />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='flex items-center justify-between pt-2'>
              <span className='text-xs text-slate-500'>
                Trang <span className='font-bold text-slate-300'>{page}</span> /{' '}
                {totalPages}
              </span>
              <div className='flex items-center gap-1.5'>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  className='flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#1e1e24] bg-[#121215] text-slate-400 hover:bg-[#1c1c22] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <ChevronLeft className='size-4' />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage(prev => Math.min(totalPages, prev + 1))
                  }
                  className='flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#1e1e24] bg-[#121215] text-slate-400 hover:bg-[#1c1c22] disabled:cursor-not-allowed disabled:opacity-40'
                >
                  <ChevronRight className='size-4' />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal Dialog */}
      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
          <div className='animate-fade-in w-full max-w-lg rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-6 shadow-2xl'>
            <h2 className='text-lg font-bold text-white'>
              {dialogMode === 'add' ? 'Thêm Từ Vựng Mới' : 'Chỉnh Sửa Từ Vựng'}
            </h2>
            <p className='mt-1 text-xs text-slate-400'>
              Dữ liệu sẽ được lưu trực tiếp vào cơ sở dữ liệu MySQL.
            </p>

            {formError && (
              <div className='mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400'>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className='mt-4 space-y-3.5'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Cấp độ (JLPT) *
                  </label>
                  <select
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none'
                  >
                    <option value='n5'>N5</option>
                    <option value='n4'>N4</option>
                    <option value='n3'>N3</option>
                    <option value='n2'>N2</option>
                    <option value='n1'>N1</option>
                  </select>
                </div>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Mã Seq (JMdict) *
                  </label>
                  <input
                    type='text'
                    value={formSeq}
                    onChange={e => setFormSeq(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Hiragana (Kana) *
                  </label>
                  <input
                    type='text'
                    placeholder='vd: いしゃ'
                    value={formKana}
                    onChange={e => setFormKana(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Chữ Kanji (nếu có)
                  </label>
                  <input
                    type='text'
                    placeholder='vd: 医者'
                    value={formKanji}
                    onChange={e => setFormKanji(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-300'>
                  Nghĩa (Waller definition) *
                </label>
                <textarea
                  rows={3}
                  placeholder='vd: bác sĩ y khoa, bác sĩ'
                  value={formDefinition}
                  onChange={e => setFormDefinition(e.target.value)}
                  className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none'
                />
              </div>

              <div className='flex items-center justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsDialogOpen(false)}
                  className='cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-[#16161a] hover:text-white'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={actionLoading !== null}
                  className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50'
                >
                  {actionLoading === 'form' && (
                    <Loader2 className='size-3.5 animate-spin' />
                  )}
                  Lưu Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
