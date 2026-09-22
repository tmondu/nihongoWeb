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
  Languages,
  Star,
  PlusCircle,
  X,
} from 'lucide-react';

export interface KanjiExampleItem {
  japanese: string;
  reading?: string;
  meaning: string;
}

interface KanjiRecord {
  id: number;
  level: string;
  original_id: number;
  kanji_char: string;
  onyomi: string[];
  kunyomi: string[];
  hanviet?: string;
  meanings: string[];
  is_decoration: number;
  examples?: KanjiExampleItem[];
}

export default function AdminKanjiPage() {
  const [kanjis, setKanjis] = useState<KanjiRecord[]>([]);
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
  const [formOriginalId, setFormOriginalId] = useState('');
  const [formChar, setFormChar] = useState('');
  const [formHanviet, setFormHanviet] = useState('');
  const [formOnyomi, setFormOnyomi] = useState('');
  const [formKunyomi, setFormKunyomi] = useState('');
  const [formMeanings, setFormMeanings] = useState('');
  const [formExamples, setFormExamples] = useState<KanjiExampleItem[]>([]);
  const [formIsDecoration, setFormIsDecoration] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchKanjis = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (level) queryParams.set('level', level);
      if (appliedSearch) queryParams.set('query', appliedSearch);

      const res = await fetch(`/api/kanji?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Không thể tải danh sách Kanji');
      const data = await res.json();
      setKanjis(data.kanjis || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchKanjis();
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
    setFormOriginalId(Math.floor(1000 + Math.random() * 9000).toString());
    setFormChar('');
    setFormHanviet('');
    setFormOnyomi('');
    setFormKunyomi('');
    setFormMeanings('');
    setFormExamples([]);
    setFormIsDecoration(false);
    setFormError('');
    setIsDialogOpen(true);
  };

  const openEditDialog = (kanji: KanjiRecord) => {
    setDialogMode('edit');
    setCurrentId(kanji.id);
    setFormLevel(kanji.level);
    setFormOriginalId(kanji.original_id.toString());
    setFormChar(kanji.kanji_char);
    setFormHanviet(kanji.hanviet || '');
    setFormOnyomi(kanji.onyomi.join(', '));
    setFormKunyomi(kanji.kunyomi.join(', '));
    setFormMeanings(kanji.meanings.join(', '));
    setFormExamples(
      Array.isArray(kanji.examples)
        ? JSON.parse(JSON.stringify(kanji.examples))
        : [],
    );
    setFormIsDecoration(kanji.is_decoration === 1);
    setFormError('');
    setIsDialogOpen(true);
  };

  const handleAddExample = () => {
    setFormExamples(prev => [
      ...prev,
      { japanese: '', reading: '', meaning: '' },
    ]);
  };

  const handleRemoveExample = (idx: number) => {
    setFormExamples(prev => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateExample = (
    idx: number,
    field: keyof KanjiExampleItem,
    val: string,
  ) => {
    setFormExamples(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formLevel || !formChar || !formMeanings) {
      setFormError('Vui lòng nhập đầy đủ các trường bắt buộc (*)');
      return;
    }

    try {
      setActionLoading('form');
      const onyomiArray = formOnyomi
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const kunyomiArray = formKunyomi
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const meaningsArray = formMeanings
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      // Clean empty examples
      const validExamples = formExamples.filter(
        ex => ex.japanese.trim() || ex.meaning.trim(),
      );

      const body = {
        id: currentId,
        level: formLevel,
        original_id: Number(formOriginalId) || 0,
        kanji_char: formChar,
        hanviet: formHanviet.trim(),
        onyomi: onyomiArray,
        kunyomi: kunyomiArray,
        meanings: meaningsArray,
        examples: validExamples,
        is_decoration: formIsDecoration,
      };

      const method = dialogMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/kanji', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Thao tác thất bại');
      }

      setIsDialogOpen(false);
      await fetchKanjis(true); // Silent refetch
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Thao tác thất bại';
      setFormError(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (
      !confirm('Bạn có chắc chắn muốn xóa chữ Kanji này khỏi database không?')
    )
      return;

    try {
      setActionLoading(id);
      const res = await fetch(`/api/kanji?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchKanjis(true);
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
            Quản Lý Chữ Hán (Kanji)
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Tổng số: <span className='font-bold text-blue-400'>{total}</span>{' '}
            chữ Kanji trong hệ thống
          </p>
        </div>
        <button
          onClick={openAddDialog}
          className='flex cursor-pointer items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-400 active:scale-95'
        >
          <Plus className='size-4' />
          Thêm Chữ Kanji Mới
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
                  ? 'border border-blue-500/30 bg-blue-500/20 text-blue-400'
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
              placeholder='Tìm Kanji, Hán Việt, On, Kun...'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-64 rounded-xl border border-[#1e1e24] bg-[#121215] py-1.5 pr-3 pl-8 text-xs text-white placeholder-slate-500 focus:border-blue-500/50 focus:outline-none'
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
            <Loader2 className='size-8 animate-spin text-blue-500' />
          </div>
        ) : kanjis.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
            <Languages className='mb-2 size-10 text-slate-700' />
            <p className='text-xs'>Không tìm thấy chữ Kanji nào.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='overflow-hidden rounded-xl border border-[#1e1e24]'>
              <table className='w-full border-collapse text-left text-sm'>
                <thead>
                  <tr className='border-b border-[#1e1e24] bg-[#121215] text-xs font-semibold text-slate-400'>
                    <th className='px-5 py-3'>Chữ Kanji</th>
                    <th className='px-5 py-3'>Hán-Việt</th>
                    <th className='px-5 py-3'>Cấp Độ</th>
                    <th className='px-5 py-3'>Âm On (Onyomi)</th>
                    <th className='px-5 py-3'>Âm Kun (Kunyomi)</th>
                    <th className='px-5 py-3'>Ví Dụ</th>
                    <th className='px-5 py-3'>Ý Nghĩa</th>
                    <th className='px-5 py-3 text-right'>Thao Tác</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#1e1e24]'>
                  {kanjis.map(k => (
                    <tr
                      key={k.id}
                      className='text-slate-300 transition-colors hover:bg-[#16161a]'
                    >
                      <td className='px-5 py-3.5'>
                        <div className='flex items-center gap-2'>
                          <span className='font-japanese text-2xl font-black text-white'>
                            {k.kanji_char}
                          </span>
                          {k.is_decoration === 1 && (
                            <span title='Trang trí'>
                              <Star className='size-3 text-amber-400' />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-5 py-3.5 text-xs font-bold text-rose-400 uppercase'>
                        {k.hanviet || '-'}
                      </td>
                      <td className='px-5 py-3.5'>
                        <span className='rounded-md border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-400 uppercase'>
                          {k.level}
                        </span>
                      </td>
                      <td className='px-5 py-3.5 text-xs text-blue-200'>
                        {k.onyomi.join(', ') || '-'}
                      </td>
                      <td className='px-5 py-3.5 text-xs text-emerald-200'>
                        {k.kunyomi.join(', ') || '-'}
                      </td>
                      <td className='px-5 py-3.5 text-xs text-amber-300'>
                        {Array.isArray(k.examples) && k.examples.length > 0 ? (
                          <span className='rounded bg-amber-500/15 px-2 py-0.5 text-[11px] font-bold'>
                            {k.examples.length} ví dụ
                          </span>
                        ) : (
                          <span className='text-slate-600'>0 ví dụ</span>
                        )}
                      </td>
                      <td
                        className='max-w-xs truncate px-5 py-3.5 text-xs text-slate-400'
                        title={k.meanings.join(', ')}
                      >
                        {k.meanings.join(', ')}
                      </td>
                      <td className='flex items-center justify-end gap-1 px-5 py-3.5 text-right'>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => openEditDialog(k)}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-[#202026] hover:text-white'
                          title='Chỉnh sửa'
                        >
                          <Edit className='size-4' />
                        </button>
                        <button
                          disabled={actionLoading !== null}
                          onClick={() => handleDelete(k.id)}
                          className='flex size-8 cursor-pointer items-center justify-center rounded-lg text-red-400 transition-colors hover:bg-red-950/20 hover:text-red-300'
                          title='Xóa'
                        >
                          {actionLoading === k.id ? (
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
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs'>
          <div className='animate-fade-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-6 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-[#1e1e24] pb-3'>
              <div>
                <h2 className='text-lg font-bold text-white'>
                  {dialogMode === 'add'
                    ? 'Thêm Chữ Kanji Mới'
                    : `Chỉnh Sửa Chữ Kanji: ${formChar}`}
                </h2>
                <p className='mt-0.5 text-xs text-slate-400'>
                  Dữ liệu được lưu trực tiếp vào cơ sở dữ liệu và hiển thị trên
                  cả 2 trang web.
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-[#1e1e24] hover:text-white'
              >
                <X className='size-4' />
              </button>
            </div>

            {formError && (
              <div className='mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs font-semibold text-red-400'>
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className='mt-4 space-y-4'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Cấp độ (JLPT) *
                  </label>
                  <select
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none'
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
                    Chữ Kanji (Ký tự) *
                  </label>
                  <input
                    type='text'
                    placeholder='vd: 行'
                    value={formChar}
                    onChange={e => setFormChar(e.target.value)}
                    className='font-japanese mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs font-bold text-white focus:border-blue-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Âm Hán-Việt
                  </label>
                  <input
                    type='text'
                    placeholder='vd: HÀNH'
                    value={formHanviet}
                    onChange={e => setFormHanviet(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-rose-300 uppercase placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Âm Kun (Kunyomi){' '}
                    <span className='font-normal text-slate-500'>
                      (để trống nếu chưa có)
                    </span>
                  </label>
                  <input
                    type='text'
                    placeholder='vd: い.く, ゆ.く, おこな.う'
                    value={formKunyomi}
                    onChange={e => setFormKunyomi(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-slate-300'>
                    Âm On (Onyomi){' '}
                    <span className='font-normal text-slate-500'>
                      (để trống nếu chưa có)
                    </span>
                  </label>
                  <input
                    type='text'
                    placeholder='vd: コウ, ギョウ, アン'
                    value={formOnyomi}
                    onChange={e => setFormOnyomi(e.target.value)}
                    className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-300'>
                  Ý nghĩa tiếng Việt (phân cách bằng dấu phẩy) *
                </label>
                <textarea
                  rows={2}
                  placeholder='vd: đi, thực hiện, tổ chức, tiến hành'
                  value={formMeanings}
                  onChange={e => setFormMeanings(e.target.value)}
                  className='mt-1.5 w-full rounded-xl border border-[#1e1e24] bg-[#121215] p-2.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                />
              </div>

              {/* Dynamic Examples Management */}
              <div className='rounded-xl border border-[#1e1e24] bg-[#121215] p-3.5'>
                <div className='flex items-center justify-between'>
                  <div>
                    <span className='text-xs font-bold text-amber-400'>
                      Danh Sách Ví Dụ (Examples cho Thẻ Học)
                    </span>
                    <p className='text-[11px] text-slate-400'>
                      Thêm các câu/từ vựng ví dụ có Furigana hiển thị ở cột bên
                      phải thẻ Kanji.
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={handleAddExample}
                    className='flex cursor-pointer items-center gap-1 rounded-lg bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-400 hover:bg-amber-500/30'
                  >
                    <PlusCircle className='size-3.5' />
                    Thêm ví dụ
                  </button>
                </div>

                {formExamples.length === 0 ? (
                  <p className='mt-2.5 text-center text-xs text-slate-500 italic'>
                    Chưa có ví dụ nào. Bấm &quot;Thêm ví dụ&quot; để tạo mới.
                  </p>
                ) : (
                  <div className='mt-3 space-y-2.5'>
                    {formExamples.map((ex, idx) => (
                      <div
                        key={idx}
                        className='flex items-center gap-2 rounded-lg border border-[#2b2b35] bg-[#18181d] p-2'
                      >
                        <span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2b2b35] text-[10px] font-bold text-slate-300'>
                          {idx + 1}
                        </span>
                        <input
                          type='text'
                          placeholder='Từ/Câu tiếng Nhật (vd: 行きます)'
                          value={ex.japanese}
                          onChange={e =>
                            handleUpdateExample(idx, 'japanese', e.target.value)
                          }
                          className='font-japanese w-1/3 rounded-md border border-[#2b2b35] bg-[#121215] px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                        />
                        <input
                          type='text'
                          placeholder='Cách đọc (vd: いきます)'
                          value={ex.reading || ''}
                          onChange={e =>
                            handleUpdateExample(idx, 'reading', e.target.value)
                          }
                          className='font-japanese w-1/4 rounded-md border border-[#2b2b35] bg-[#121215] px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                        />
                        <input
                          type='text'
                          placeholder='Nghĩa tiếng Việt (vd: đi)'
                          value={ex.meaning}
                          onChange={e =>
                            handleUpdateExample(idx, 'meaning', e.target.value)
                          }
                          className='flex-1 rounded-md border border-[#2b2b35] bg-[#121215] px-2 py-1.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-none'
                        />
                        <button
                          type='button'
                          onClick={() => handleRemoveExample(idx)}
                          className='flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-red-400 hover:bg-red-500/20'
                          title='Xóa ví dụ này'
                        >
                          <Trash2 className='size-3.5' />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className='flex items-center gap-2 pt-1'>
                <input
                  type='checkbox'
                  id='is_decoration'
                  checked={formIsDecoration}
                  onChange={e => setFormIsDecoration(e.target.checked)}
                  className='size-4 rounded accent-blue-500'
                />
                <label
                  htmlFor='is_decoration'
                  className='cursor-pointer text-xs text-slate-300'
                >
                  Đánh dấu là Kanji trang trí (Decoration)
                </label>
              </div>

              <div className='flex items-center justify-end gap-2 border-t border-[#1e1e24] pt-3'>
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
                  className='flex cursor-pointer items-center gap-1.5 rounded-xl bg-blue-500 px-5 py-2 text-xs font-bold text-white hover:bg-blue-400 disabled:opacity-50'
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
