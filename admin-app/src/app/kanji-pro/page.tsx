'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  BookOpenCheck,
  PlusCircle,
  X,
  Eye,
  CheckCircle2,
  AlertCircle,
  Volume2,
  CircleDot,
  FileSpreadsheet,
} from 'lucide-react';

export interface KanjiProExample {
  num?: string;
  japanese: string;
  reading?: string;
  meaning: string;
}

export interface KanjiProWord {
  id: string;
  kanjiChar: string;
  hanviet: string;
  meaning: string;
  kunyomi: string;
  onyomi: string;
  examples: KanjiProExample[];
}

export interface KanjiProLesson {
  id: number;
  level: string;
  lesson_num: number;
  title: string;
  description: string | null;
  is_available: number;
  kanji_list: KanjiProWord[];
  kanji_count?: number;
  created_at: string;
  updated_at: string;
}

const DEFAULT_LESSON_25_N4_KANJI: KanjiProWord[] = [
  {
    id: 'n4-b25-01-phan',
    kanjiChar: '飯',
    hanviet: 'PHẠN',
    meaning: 'Cơm, bữa ăn',
    kunyomi: 'めし',
    onyomi: 'ハン',
    examples: [
      { num: '①', japanese: 'ご飯', reading: 'ごはん', meaning: 'cơm, bữa ăn' },
      {
        num: '②',
        japanese: '朝ご飯',
        reading: 'あさごはん',
        meaning: 'bữa sáng',
      },
      { num: '③', japanese: '夕飯', reading: 'ゆうはん', meaning: 'bữa tối' },
    ],
  },
  {
    id: 'n4-b25-02-truong',
    kanjiChar: '場',
    hanviet: 'TRƯỜNG',
    meaning: 'Nơi chốn, địa điểm',
    kunyomi: 'ば',
    onyomi: 'ジョウ',
    examples: [
      { num: '①', japanese: '場所', reading: 'ばしょ', meaning: 'địa điểm' },
      { num: '②', japanese: '工場', reading: 'こうじょう', meaning: 'nhà máy' },
      {
        num: '③',
        japanese: '会場',
        reading: 'かいじょう',
        meaning: 'hội trường',
      },
    ],
  },
  {
    id: 'n4-b25-03-chinh',
    kanjiChar: '正',
    hanviet: 'CHÍNH',
    meaning: 'Đúng, chính xác',
    kunyomi: 'ただ.しい、ただ.す、まさ.に',
    onyomi: 'セイ、ショウ',
    examples: [
      {
        num: '①',
        japanese: '正しい',
        reading: 'ただしい',
        meaning: 'đúng, chính xác',
      },
      { num: '②', japanese: '正月', reading: 'しょうがつ', meaning: 'Tết' },
      {
        num: '③',
        japanese: '正直な',
        reading: 'しょうじきな',
        meaning: 'trung thực',
      },
    ],
  },
  {
    id: 'n4-b25-04-the',
    kanjiChar: '世',
    hanviet: 'THẾ',
    meaning: 'Đời, thế gian',
    kunyomi: 'よ',
    onyomi: 'セ、セイ',
    examples: [
      { num: '①', japanese: '世界', reading: 'せかい', meaning: 'thế giới' },
      {
        num: '②',
        japanese: '世の中',
        reading: 'よのなか',
        meaning: 'xã hội, thế gian',
      },
      {
        num: '③',
        japanese: '世話をする',
        reading: 'せわをする',
        meaning: 'chăm sóc',
      },
    ],
  },
  {
    id: 'n4-b25-05-gioi',
    kanjiChar: '界',
    hanviet: 'GIỚI',
    meaning: 'Giới hạn, thế giới',
    kunyomi: '—',
    onyomi: 'カイ',
    examples: [
      { num: '①', japanese: '世界', reading: 'せかい', meaning: 'thế giới' },
      { num: '②', japanese: '限界', reading: 'げんかい', meaning: 'giới hạn' },
    ],
  },
  {
    id: 'n4-b25-06-cap',
    kanjiChar: '急',
    hanviet: 'CẤP',
    meaning: 'Gấp, vội, nhanh',
    kunyomi: 'いそ.ぐ',
    onyomi: 'キュウ',
    examples: [
      { num: '①', japanese: '急ぐ', reading: 'いそぐ', meaning: 'vội, gấp' },
      { num: '②', japanese: '急に', reading: 'きゅうに', meaning: 'đột nhiên' },
      {
        num: '③',
        japanese: '急行',
        reading: 'きゅうこう',
        meaning: 'tàu tốc hành',
      },
    ],
  },
  {
    id: 'n4-b25-07-dac',
    kanjiChar: '特',
    hanviet: 'ĐẶC',
    meaning: 'Đặc biệt',
    kunyomi: '—',
    onyomi: 'トク',
    examples: [
      { num: '①', japanese: '特別', reading: 'とくべつ', meaning: 'đặc biệt' },
      { num: '②', japanese: '特に', reading: 'とくに', meaning: 'đặc biệt là' },
      {
        num: '③',
        japanese: '特急',
        reading: 'とっきゅう',
        meaning: 'tàu tốc hành đặc biệt',
      },
    ],
  },
  {
    id: 'n4-b25-08-huyen',
    kanjiChar: '県',
    hanviet: 'HUYỆN',
    meaning: 'Tỉnh (đơn vị hành chính)',
    kunyomi: '—',
    onyomi: 'ケン',
    examples: [
      { num: '①', japanese: '県', reading: 'けん', meaning: 'tỉnh' },
      {
        num: '②',
        japanese: '県知事',
        reading: 'けんちじ',
        meaning: 'thống đốc tỉnh',
      },
    ],
  },
  {
    id: 'n4-b25-09-de',
    kanjiChar: '低',
    hanviet: 'ĐÊ',
    meaning: 'Thấp',
    kunyomi: 'ひく.い、ひく.める、ひく.まる',
    onyomi: 'テイ',
    examples: [
      { num: '①', japanese: '低い', reading: 'ひくい', meaning: 'thấp' },
      {
        num: '②',
        japanese: '最低',
        reading: 'さいてい',
        meaning: 'thấp nhất, tệ nhất',
      },
      {
        num: '③',
        japanese: '低下する',
        reading: 'ていかする',
        meaning: 'suy giảm',
      },
    ],
  },
  {
    id: 'n4-b25-10-nhuoc',
    kanjiChar: '弱',
    hanviet: 'NHƯỢC',
    meaning: 'Yếu',
    kunyomi: 'よわ.い、よわ.る、よわ.まる、よわ.める',
    onyomi: 'ジャク',
    examples: [
      { num: '①', japanese: '弱い', reading: 'よわい', meaning: 'yếu' },
      {
        num: '②',
        japanese: '弱点',
        reading: 'じゃくてん',
        meaning: 'điểm yếu',
      },
    ],
  },
  {
    id: 'n4-b25-11-bat',
    kanjiChar: '不',
    hanviet: 'BẤT',
    meaning: 'Không, bất',
    kunyomi: '—',
    onyomi: 'フ、ブ',
    examples: [
      {
        num: '①',
        japanese: '不便な',
        reading: 'ふべんな',
        meaning: 'bất tiện',
      },
      { num: '②', japanese: '不安な', reading: 'ふあんな', meaning: 'bất an' },
      {
        num: '③',
        japanese: '不親切な',
        reading: 'ふしんせつな',
        meaning: 'không thân thiện',
      },
    ],
  },
  {
    id: 'n4-b25-12-cap-2',
    kanjiChar: '急',
    hanviet: 'CẤP',
    meaning: 'Nhanh, khẩn cấp',
    kunyomi: 'いそ.ぐ',
    onyomi: 'キュウ',
    examples: [
      {
        num: '①',
        japanese: '急用',
        reading: 'きゅうよう',
        meaning: 'việc gấp',
      },
      {
        num: '②',
        japanese: '大急ぎで',
        reading: 'おおいそぎで',
        meaning: 'vội vã, gấp rút',
      },
    ],
  },
];

export default function AdminKanjiProPage() {
  const [lessons, setLessons] = useState<KanjiProLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState<string>('n4');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'edit' | 'preview'>('edit');
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );

  // Form states
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLevel, setFormLevel] = useState<string>('n4');
  const [formLessonNum, setFormLessonNum] = useState<number | ''>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsAvailable, setFormIsAvailable] = useState<boolean>(true);
  const [formKanjiList, setFormKanjiList] = useState<KanjiProWord[]>([]);
  const [formError, setFormError] = useState<string>('');

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeLevel !== 'all') params.set('level', activeLevel);
      if (searchQuery.trim()) params.set('query', searchQuery.trim());

      const res = await fetch(`/api/kanji-pro?${params.toString()}`);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLevel]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLessons();
  };

  const openAddDialog = () => {
    setEditingId(null);
    setFormLevel(activeLevel === 'all' ? 'n4' : activeLevel);
    setFormLessonNum('');
    setFormTitle('');
    setFormDescription('');
    setFormIsAvailable(true);
    setFormKanjiList([]);
    setFormError('');
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const openEditDialog = (lesson: KanjiProLesson) => {
    setEditingId(lesson.id);
    setFormLevel(lesson.level);
    setFormLessonNum(lesson.lesson_num);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description || '');
    setFormIsAvailable(lesson.is_available === 1);
    setFormKanjiList(
      Array.isArray(lesson.kanji_list) ? [...lesson.kanji_list] : [],
    );
    setFormError('');
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const openPreviewDialog = (lesson: KanjiProLesson) => {
    setEditingId(lesson.id);
    setFormLevel(lesson.level);
    setFormLessonNum(lesson.lesson_num);
    setFormTitle(lesson.title);
    setFormDescription(lesson.description || '');
    setFormIsAvailable(lesson.is_available === 1);
    setFormKanjiList(
      Array.isArray(lesson.kanji_list) ? [...lesson.kanji_list] : [],
    );
    setDialogMode('preview');
    setIsDialogOpen(true);
  };

  const handleLoadLesson25Template = () => {
    setFormLevel('n4');
    setFormLessonNum(25);
    setFormTitle('Bài 25');
    setFormDescription(
      '12 chữ Hán N4: 飯, 場, 正, 世, 界, 急, 特, 県, 低, 弱, 不, 急',
    );
    setFormKanjiList(DEFAULT_LESSON_25_N4_KANJI);
  };

  const handleAddKanjiItem = () => {
    const newItem: KanjiProWord = {
      id: `k-${Date.now()}`,
      kanjiChar: '新',
      hanviet: 'TÂN',
      meaning: 'Mới',
      kunyomi: 'あたら.しい',
      onyomi: 'シン',
      examples: [
        { num: '①', japanese: '新聞', reading: 'しんぶん', meaning: 'báo chí' },
      ],
    };
    setFormKanjiList([...formKanjiList, newItem]);
  };

  const handleUpdateKanjiItem = (
    index: number,
    updated: Partial<KanjiProWord>,
  ) => {
    const next = [...formKanjiList];
    next[index] = { ...next[index], ...updated };
    setFormKanjiList(next);
  };

  const handleRemoveKanjiItem = (index: number) => {
    const next = formKanjiList.filter((_, i) => i !== index);
    setFormKanjiList(next);
  };

  const handleAddExample = (kIndex: number) => {
    const item = formKanjiList[kIndex];
    const numMarkers = ['①', '②', '③', '④', '⑤', '⑥'];
    const nextNum =
      numMarkers[item.examples.length] || `(${item.examples.length + 1})`;
    const newEx: KanjiProExample = {
      num: nextNum,
      japanese: '',
      reading: '',
      meaning: '',
    };
    const updatedExamples = [...item.examples, newEx];
    handleUpdateKanjiItem(kIndex, { examples: updatedExamples });
  };

  const handleUpdateExample = (
    kIndex: number,
    exIndex: number,
    updated: Partial<KanjiProExample>,
  ) => {
    const item = formKanjiList[kIndex];
    const nextExs = [...item.examples];
    nextExs[exIndex] = { ...nextExs[exIndex], ...updated };
    handleUpdateKanjiItem(kIndex, { examples: nextExs });
  };

  const handleRemoveExample = (kIndex: number, exIndex: number) => {
    const item = formKanjiList[kIndex];
    const nextExs = item.examples.filter((_, i) => i !== exIndex);
    handleUpdateKanjiItem(kIndex, { examples: nextExs });
  };

  const handleSaveLesson = async () => {
    if (formLessonNum === '' || isNaN(Number(formLessonNum))) {
      setFormError('Vui lòng nhập số bài (Lesson Num)');
      return;
    }
    if (!formTitle.trim()) {
      setFormError('Vui lòng nhập tiêu đề bài học');
      return;
    }
    if (formKanjiList.length === 0) {
      setFormError('Vui lòng thêm ít nhất 1 chữ Hán cho bài học');
      return;
    }

    try {
      setActionLoading('saving');
      const payload = {
        id: editingId || undefined,
        level: formLevel,
        lesson_num: Number(formLessonNum),
        title: formTitle.trim(),
        description: formDescription.trim(),
        is_available: formIsAvailable ? 1 : 0,
        kanji_list: formKanjiList,
      };

      const res = await fetch('/api/kanji-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Lỗi khi lưu bài học');
      }

      setIsDialogOpen(false);
      await fetchLessons();
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu bài học',
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học Kanji Pro này?')) {
      return;
    }
    try {
      setActionLoading(id);
      const res = await fetch(`/api/kanji-pro?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Không thể xóa bài học');
      await fetchLessons();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xóa bài học');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Page Header */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400'>
              <BookOpenCheck className='size-5' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-white'>
                Quản Lý Kanji Pro
              </h1>
              <p className='text-xs text-slate-400'>
                Hệ thống giáo trình Kanji Pro chuẩn thẻ 3 cột &amp; đồng bộ cơ
                sở dữ liệu TiDB
              </p>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={openAddDialog}
            className='flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-amber-500/10 transition-all hover:bg-amber-400'
          >
            <Plus className='size-4' />
            Thêm Bài Học Mới
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='flex flex-col gap-4 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 lg:flex-row lg:items-center lg:justify-between'>
        {/* Level Tabs */}
        <div className='flex flex-wrap items-center gap-1.5'>
          {['all', 'n5', 'n4', 'n3', 'n2', 'n1'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold uppercase transition-all ${
                activeLevel === lvl
                  ? 'border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:bg-[#16161a] hover:text-slate-200'
              }`}
            >
              {lvl === 'all' ? 'Tất cả' : lvl.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className='relative w-full lg:w-80'>
          <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500' />
          <input
            type='text'
            placeholder='Tìm kiếm bài học...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full rounded-xl border border-[#1e1e24] bg-[#131316] py-2 pr-4 pl-9 text-sm text-slate-200 placeholder-slate-500 transition-colors focus:border-amber-500/50 focus:outline-none'
          />
        </form>
      </div>

      {/* Lesson List */}
      {loading ? (
        <div className='flex h-64 items-center justify-center rounded-2xl border border-[#1e1e24] bg-[#0c0c0e]'>
          <Loader2 className='size-8 animate-spin text-amber-500' />
        </div>
      ) : lessons.length === 0 ? (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#26262e] bg-[#0c0c0e] p-12 text-center'>
          <AlertCircle className='mb-3 size-10 text-slate-600' />
          <h3 className='text-base font-semibold text-slate-300'>
            Chưa có bài học nào trong danh sách
          </h3>
          <p className='mt-1 text-xs text-slate-500'>
            Nhấn vào nút &quot;Thêm Bài Học Mới&quot; hoặc nạp dữ liệu mẫu Bài
            25 N4 để bắt đầu.
          </p>
          <button
            onClick={() => {
              openAddDialog();
              handleLoadLesson25Template();
            }}
            className='mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20'
          >
            <FileSpreadsheet className='size-4' />
            Nạp mẫu Bài 25 N4 (12 Chữ Hán)
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {lessons.map(lesson => {
            const kanjiList = Array.isArray(lesson.kanji_list)
              ? lesson.kanji_list
              : [];
            return (
              <div
                key={lesson.id}
                className='group flex flex-col justify-between rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 transition-all hover:border-[#2b2b35] hover:bg-[#101014]'
              >
                <div className='space-y-3'>
                  {/* Card Header */}
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <span className='rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-400 uppercase'>
                        {lesson.level}
                      </span>
                      <h3 className='text-base font-bold text-white'>
                        {lesson.title}
                      </h3>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        lesson.is_available
                          ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                          : 'border border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      {lesson.is_available ? 'Khả dụng' : 'Khóa'}
                    </span>
                  </div>

                  {/* Description */}
                  {lesson.description && (
                    <p className='line-clamp-2 text-xs text-slate-400'>
                      {lesson.description}
                    </p>
                  )}

                  {/* Kanji preview tags */}
                  <div className='pt-1'>
                    <div className='mb-1.5 flex items-center justify-between text-[11px] font-medium text-slate-500'>
                      <span>Danh sách chữ Hán</span>
                      <span className='font-semibold text-amber-400'>
                        {kanjiList.length} chữ
                      </span>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {kanjiList.slice(0, 12).map((k, i) => (
                        <span
                          key={i}
                          className='flex size-7 items-center justify-center rounded-lg border border-[#262630] bg-[#16161c] text-xs font-bold text-slate-200 shadow-sm'
                        >
                          {k.kanjiChar}
                        </span>
                      ))}
                      {kanjiList.length > 12 && (
                        <span className='flex h-7 items-center justify-center rounded-lg border border-[#262630] bg-[#16161c] px-2 text-[10px] font-semibold text-slate-400'>
                          +{kanjiList.length - 12}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className='mt-5 flex items-center justify-between border-t border-[#1e1e24] pt-4'>
                  <button
                    onClick={() => openPreviewDialog(lesson)}
                    className='flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-[#1a1a22] hover:text-white'
                  >
                    <Eye className='size-3.5 text-slate-400' />
                    Xem Thẻ
                  </button>

                  <div className='flex items-center gap-1.5'>
                    <button
                      onClick={() => openEditDialog(lesson)}
                      className='flex items-center gap-1.5 rounded-lg bg-[#1a1a22] px-3 py-1.5 text-xs font-semibold text-amber-400 transition-colors hover:bg-amber-500/20'
                    >
                      <Edit className='size-3.5' />
                      Sửa
                    </button>
                    <button
                      disabled={actionLoading === lesson.id}
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className='flex items-center justify-center rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-950/30 hover:text-red-400 disabled:opacity-50'
                    >
                      {actionLoading === lesson.id ? (
                        <Loader2 className='size-4 animate-spin text-red-400' />
                      ) : (
                        <Trash2 className='size-4' />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Edit or Live Preview */}
      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
          <div className='relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl border border-[#262630] bg-[#0c0c0e] shadow-2xl'>
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b border-[#1e1e24] px-6 py-4'>
              <div className='flex items-center gap-3'>
                <h2 className='text-lg font-bold text-white'>
                  {dialogMode === 'preview'
                    ? `Xem Trước: ${formTitle} (${formLevel.toUpperCase()})`
                    : editingId
                      ? `Chỉnh Sửa Bài Học: ${formTitle}`
                      : 'Thêm Bài Học Kanji Pro Mới'}
                </h2>
                <div className='flex items-center rounded-xl border border-[#1e1e24] bg-[#131316] p-0.5'>
                  <button
                    onClick={() => setDialogMode('edit')}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      dialogMode === 'edit'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Soạn thảo
                  </button>
                  <button
                    onClick={() => setDialogMode('preview')}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                      dialogMode === 'preview'
                        ? 'bg-amber-500 text-black shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Xem trước Thẻ Live
                  </button>
                </div>
              </div>
              <button
                onClick={() => setIsDialogOpen(false)}
                className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#1a1a22] hover:text-white'
              >
                <X className='size-5' />
              </button>
            </div>

            {/* Modal Content */}
            <div className='flex-1 overflow-y-auto p-6'>
              {formError && (
                <div className='mb-5 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400'>
                  <AlertCircle className='size-4 shrink-0' />
                  <span>{formError}</span>
                </div>
              )}

              {dialogMode === 'edit' ? (
                <div className='space-y-6'>
                  {/* Basic Info */}
                  <div className='grid grid-cols-1 gap-4 rounded-xl border border-[#1e1e24] bg-[#131316] p-4 sm:grid-cols-4'>
                    <div>
                      <label className='mb-1.5 block text-xs font-semibold text-slate-400'>
                        Cấp độ
                      </label>
                      <select
                        value={formLevel}
                        onChange={e => setFormLevel(e.target.value)}
                        className='w-full rounded-xl border border-[#262630] bg-[#0c0c0e] px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none'
                      >
                        <option value='n5'>N5</option>
                        <option value='n4'>N4</option>
                        <option value='n3'>N3</option>
                        <option value='n2'>N2</option>
                        <option value='n1'>N1</option>
                      </select>
                    </div>

                    <div>
                      <label className='mb-1.5 block text-xs font-semibold text-slate-400'>
                        Số bài (Lesson Num)
                      </label>
                      <input
                        type='number'
                        value={formLessonNum}
                        onChange={e =>
                          setFormLessonNum(
                            e.target.value === '' ? '' : Number(e.target.value),
                          )
                        }
                        placeholder='Ví dụ: 25'
                        className='w-full rounded-xl border border-[#262630] bg-[#0c0c0e] px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none'
                      />
                    </div>

                    <div>
                      <label className='mb-1.5 block text-xs font-semibold text-slate-400'>
                        Tiêu đề hiển thị
                      </label>
                      <input
                        type='text'
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        placeholder='Ví dụ: Bài 25'
                        className='w-full rounded-xl border border-[#262630] bg-[#0c0c0e] px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none'
                      />
                    </div>

                    <div>
                      <label className='mb-1.5 block text-xs font-semibold text-slate-400'>
                        Trạng thái
                      </label>
                      <label className='flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-[#262630] bg-[#0c0c0e] px-3'>
                        <input
                          type='checkbox'
                          checked={formIsAvailable}
                          onChange={e => setFormIsAvailable(e.target.checked)}
                          className='size-4 accent-amber-500'
                        />
                        <span className='text-xs font-semibold text-slate-300'>
                          Khả dụng (Public)
                        </span>
                      </label>
                    </div>

                    <div className='sm:col-span-4'>
                      <label className='mb-1.5 block text-xs font-semibold text-slate-400'>
                        Mô tả ngắn
                      </label>
                      <input
                        type='text'
                        value={formDescription}
                        onChange={e => setFormDescription(e.target.value)}
                        placeholder='Mô tả các chữ Hán trong bài học...'
                        className='w-full rounded-xl border border-[#262630] bg-[#0c0c0e] px-3 py-2 text-sm text-slate-200 focus:border-amber-500 focus:outline-none'
                      />
                    </div>
                  </div>

                  {/* Kanji Items Section */}
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <h3 className='text-sm font-bold tracking-wider text-white uppercase'>
                          Danh Sách Chữ Hán ({formKanjiList.length})
                        </h3>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          type='button'
                          onClick={handleLoadLesson25Template}
                          className='flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20'
                        >
                          <FileSpreadsheet className='size-3.5' />
                          Nạp mẫu Bài 25 N4
                        </button>
                        <button
                          type='button'
                          onClick={handleAddKanjiItem}
                          className='flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-400'
                        >
                          <PlusCircle className='size-3.5' />
                          Thêm Chữ Hán
                        </button>
                      </div>
                    </div>

                    {formKanjiList.map((kItem, kIdx) => (
                      <div
                        key={kItem.id || kIdx}
                        className='space-y-4 rounded-xl border border-[#262630] bg-[#111115] p-4'
                      >
                        <div className='flex items-center justify-between border-b border-[#1e1e24] pb-3'>
                          <span className='flex size-6 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-400'>
                            {kIdx + 1}
                          </span>
                          <button
                            type='button'
                            onClick={() => handleRemoveKanjiItem(kIdx)}
                            className='rounded-md p-1 text-slate-500 hover:bg-red-950/30 hover:text-red-400'
                          >
                            <Trash2 className='size-4' />
                          </button>
                        </div>

                        {/* Kanji basic attributes */}
                        <div className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
                          <div>
                            <label className='mb-1 block text-[11px] font-medium text-slate-400'>
                              Chữ Kanji
                            </label>
                            <input
                              type='text'
                              value={kItem.kanjiChar}
                              onChange={e =>
                                handleUpdateKanjiItem(kIdx, {
                                  kanjiChar: e.target.value,
                                })
                              }
                              className='w-full rounded-lg border border-[#262630] bg-[#0c0c0e] px-2.5 py-1.5 text-center text-lg font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none'
                            />
                          </div>
                          <div>
                            <label className='mb-1 block text-[11px] font-medium text-slate-400'>
                              Hán-Việt
                            </label>
                            <input
                              type='text'
                              value={kItem.hanviet}
                              onChange={e =>
                                handleUpdateKanjiItem(kIdx, {
                                  hanviet: e.target.value,
                                })
                              }
                              className='w-full rounded-lg border border-[#262630] bg-[#0c0c0e] px-2.5 py-1.5 text-sm font-bold text-rose-400 focus:border-rose-500 focus:outline-none'
                            />
                          </div>
                          <div>
                            <label className='mb-1 block text-[11px] font-medium text-slate-400'>
                              Nghĩa tiếng Việt
                            </label>
                            <input
                              type='text'
                              value={kItem.meaning}
                              onChange={e =>
                                handleUpdateKanjiItem(kIdx, {
                                  meaning: e.target.value,
                                })
                              }
                              className='w-full rounded-lg border border-[#262630] bg-[#0c0c0e] px-2.5 py-1.5 text-sm text-sky-400 focus:border-sky-500 focus:outline-none'
                            />
                          </div>
                          <div>
                            <label className='mb-1 block text-[11px] font-medium text-slate-400'>
                              KUN
                            </label>
                            <input
                              type='text'
                              value={kItem.kunyomi}
                              onChange={e =>
                                handleUpdateKanjiItem(kIdx, {
                                  kunyomi: e.target.value,
                                })
                              }
                              className='w-full rounded-lg border border-[#262630] bg-[#0c0c0e] px-2.5 py-1.5 text-sm text-amber-400 focus:border-amber-500 focus:outline-none'
                            />
                          </div>
                          <div>
                            <label className='mb-1 block text-[11px] font-medium text-slate-400'>
                              ON
                            </label>
                            <input
                              type='text'
                              value={kItem.onyomi}
                              onChange={e =>
                                handleUpdateKanjiItem(kIdx, {
                                  onyomi: e.target.value,
                                })
                              }
                              className='w-full rounded-lg border border-[#262630] bg-[#0c0c0e] px-2.5 py-1.5 text-sm text-amber-400 focus:border-amber-500 focus:outline-none'
                            />
                          </div>
                        </div>

                        {/* Kanji examples */}
                        <div className='space-y-2 pt-2'>
                          <div className='flex items-center justify-between'>
                            <span className='text-xs font-semibold text-slate-400'>
                              Ví dụ / Cách dùng ({kItem.examples.length})
                            </span>
                            <button
                              type='button'
                              onClick={() => handleAddExample(kIdx)}
                              className='text-xs font-medium text-amber-400 hover:text-amber-300'
                            >
                              + Thêm ví dụ
                            </button>
                          </div>

                          {kItem.examples.map((ex, exIdx) => (
                            <div
                              key={exIdx}
                              className='flex items-center gap-2 rounded-lg border border-[#1e1e24] bg-[#0c0c0e] p-2'
                            >
                              <input
                                type='text'
                                value={ex.num || `①`}
                                onChange={e =>
                                  handleUpdateExample(kIdx, exIdx, {
                                    num: e.target.value,
                                  })
                                }
                                className='w-10 rounded border border-[#262630] bg-[#16161a] py-1 text-center text-xs font-bold text-amber-400'
                              />
                              <input
                                type='text'
                                placeholder='Từ / Câu tiếng Nhật (VD: ご飯)'
                                value={ex.japanese}
                                onChange={e =>
                                  handleUpdateExample(kIdx, exIdx, {
                                    japanese: e.target.value,
                                  })
                                }
                                className='flex-1 rounded border border-[#262630] bg-[#16161a] px-2 py-1 text-xs text-slate-200'
                              />
                              <input
                                type='text'
                                placeholder='Phiên âm (VD: ごはん)'
                                value={ex.reading || ''}
                                onChange={e =>
                                  handleUpdateExample(kIdx, exIdx, {
                                    reading: e.target.value,
                                  })
                                }
                                className='w-28 rounded border border-[#262630] bg-[#16161a] px-2 py-1 text-xs text-amber-400/90'
                              />
                              <input
                                type='text'
                                placeholder='Nghĩa tiếng Việt (VD: cơm)'
                                value={ex.meaning}
                                onChange={e =>
                                  handleUpdateExample(kIdx, exIdx, {
                                    meaning: e.target.value,
                                  })
                                }
                                className='flex-1 rounded border border-[#262630] bg-[#16161a] px-2 py-1 text-xs text-sky-400'
                              />
                              <button
                                type='button'
                                onClick={() => handleRemoveExample(kIdx, exIdx)}
                                className='p-1 text-slate-500 hover:text-red-400'
                              >
                                <X className='size-3.5' />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Live 3-Column Preview */
                <div className='space-y-6'>
                  <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300'>
                    Đây là bản xem trước trực quan chuẩn 3 cột hệt như giao diện
                    thẻ học sinh sẽ nhìn thấy.
                  </div>

                  <div className='space-y-6'>
                    {formKanjiList.map((word, index) => (
                      <div
                        key={word.id || index}
                        className='grid grid-cols-1 divide-y overflow-hidden rounded-2xl border border-[#2b2b35] bg-[#111116] shadow-xl md:grid-cols-12 md:divide-x md:divide-y-0'
                      >
                        {/* Cột 1: Kanji Main Details */}
                        <div className='flex flex-col items-center justify-between p-5 text-center md:col-span-3'>
                          <div className='flex w-full flex-col items-center'>
                            <div className='flex h-20 w-20 items-center justify-center text-5xl font-black text-emerald-400'>
                              {word.kanjiChar}
                            </div>
                            <h3 className='mt-2 text-xl font-black tracking-wider text-rose-400 uppercase'>
                              {word.hanviet}
                            </h3>
                            <p className='mt-1 text-sm font-semibold text-sky-400'>
                              {word.meaning}
                            </p>
                          </div>

                          <div className='mt-4 flex w-full justify-center gap-2'>
                            <span className='flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400'>
                              <CircleDot className='size-3 text-amber-400' />
                              KUN
                            </span>
                            <span className='flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400'>
                              <CircleDot className='size-3 text-amber-400' />
                              ON
                            </span>
                          </div>
                        </div>

                        {/* Cột 2: KUN / ON Pronunciation Table */}
                        <div className='flex flex-col justify-center border-[#2b2b35] p-5 md:col-span-3'>
                          <div className='w-full divide-y divide-[#2b2b35] rounded-xl border border-[#2b2b35] bg-[#0c0c0e] text-center'>
                            <div className='p-3'>
                              <span className='block text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
                                KUN
                              </span>
                              <span className='mt-0.5 block text-sm font-bold text-amber-400'>
                                {word.kunyomi || '—'}
                              </span>
                            </div>
                            <div className='p-3'>
                              <span className='block text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
                                ON
                              </span>
                              <span className='mt-0.5 block text-sm font-bold text-amber-400'>
                                {word.onyomi || '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Cột 3: Top Kanji Strip + Examples */}
                        <div className='flex flex-col border-[#2b2b35] p-5 md:col-span-6'>
                          {/* Top Kanji Strip */}
                          <div className='mb-4 flex flex-wrap gap-1.5 rounded-xl border border-[#2b2b35] bg-[#0c0c0e] p-2'>
                            {formKanjiList.map((k, i) => {
                              const isCurrent = i === index;
                              return (
                                <div
                                  key={i}
                                  className={`flex size-8 items-center justify-center rounded-lg text-sm font-black transition-all ${
                                    isCurrent
                                      ? 'border border-amber-500 bg-amber-500 text-black shadow-md shadow-amber-500/20'
                                      : 'border border-[#262630] bg-[#16161c] text-slate-300'
                                  }`}
                                >
                                  {k.kanjiChar}
                                </div>
                              );
                            })}
                          </div>

                          {/* Examples */}
                          <div className='flex-1 space-y-2 rounded-xl border border-[#2b2b35] bg-[#0c0c0e] p-3'>
                            {word.examples && word.examples.length > 0 ? (
                              word.examples.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  className='flex items-start gap-2 text-xs'
                                >
                                  <span className='shrink-0 font-bold text-amber-400'>
                                    {ex.num || `①`}
                                  </span>
                                  <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                                    <span className='font-bold text-slate-100'>
                                      {ex.japanese}
                                    </span>
                                    {ex.reading && (
                                      <span className='text-[11px] font-medium text-amber-400/90'>
                                        ({ex.reading})
                                      </span>
                                    )}
                                    <span className='text-xs font-semibold text-sky-400'>
                                      {ex.meaning}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className='py-2 text-center text-xs text-slate-500 italic'>
                                Chưa có câu ví dụ nào
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between border-t border-[#1e1e24] bg-[#09090b] px-6 py-4'>
              <button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='rounded-xl border border-[#262630] bg-[#16161c] px-4 py-2 text-xs font-semibold text-slate-300 transition-colors hover:bg-[#202028]'
              >
                Đóng
              </button>

              {dialogMode === 'edit' && (
                <button
                  type='button'
                  disabled={actionLoading === 'saving'}
                  onClick={handleSaveLesson}
                  className='flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 disabled:opacity-50'
                >
                  {actionLoading === 'saving' ? (
                    <Loader2 className='size-4 animate-spin' />
                  ) : (
                    <CheckCircle2 className='size-4' />
                  )}
                  Lưu Bài Học
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
