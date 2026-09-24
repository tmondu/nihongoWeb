'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Volume2,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  X,
  Layers,
} from 'lucide-react';
import type {
  KanjiProLesson,
  KanjiProWord,
  KanjiProExample,
} from '@/features/Kanji/data/kanjiProCurriculum';
import {
  KANJI_PRO_LEVELS,
  LESSON_24_N4_KANJI,
  LESSON_25_N4_KANJI,
} from '@/features/Kanji/data/kanjiProCurriculum';
import type { KanjiLevel } from '@/entities/kanji/types';
import clsx from 'clsx';

export default function AdminKanjiProPage() {
  const [selectedLevel, setSelectedLevel] = useState<KanjiLevel>('n4');
  const [lessons, setLessons] = useState<KanjiProLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Lesson being edited
  const [editingLesson, setEditingLesson] = useState<KanjiProLesson | null>(
    null,
  );
  const [isSaving, startSaveTransition] = useTransition();

  // Word modal state (for adding/editing a single Kanji character)
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [wordForm, setWordForm] = useState<KanjiProWord>({
    id: '',
    kanjiChar: '',
    hanviet: '',
    meaning: '',
    kunyomi: '',
    onyomi: '',
    note: '',
    examples: [
      { num: '①', japanese: '', reading: '', meaning: '' },
      { num: '②', japanese: '', reading: '', meaning: '' },
    ],
  });

  // Fetch lessons for the selected level
  const fetchLessons = async (level: KanjiLevel) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/kanji-pro?level=${level}`);
      if (!res.ok) {
        throw new Error('Không thể tải danh sách bài học');
      }
      const data = (await res.json()) as { lessons: KanjiProLesson[] };
      setLessons(data.lessons || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Lỗi kết nối cơ sở dữ liệu',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLessons(selectedLevel);
  }, [selectedLevel]);

  // Open Lesson Editor
  const handleOpenEditLesson = (lesson: KanjiProLesson) => {
    setEditingLesson(JSON.parse(JSON.stringify(lesson)) as KanjiProLesson);
    setSuccessMessage(null);
  };

  // Save Lesson to DB
  const handleSaveLesson = () => {
    if (!editingLesson) return;

    startSaveTransition(async () => {
      try {
        const res = await fetch('/api/admin/kanji-pro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: editingLesson.level,
            lesson_num: editingLesson.lessonNum,
            title: editingLesson.title,
            description: editingLesson.description,
            is_available: editingLesson.isAvailable,
            kanji_list: editingLesson.kanjiList,
          }),
        });

        if (!res.ok) {
          const errData = (await res.json()) as { error?: string };
          throw new Error(errData.error || 'Lỗi khi lưu bài học');
        }

        setSuccessMessage(`Đã lưu thành công ${editingLesson.title}!`);
        await fetchLessons(selectedLevel);
        setEditingLesson(null);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Lỗi khi lưu bài học');
      }
    });
  };

  // Open Word Modal
  const handleOpenAddWord = () => {
    setEditingWordIndex(null);
    setWordForm({
      id: `${editingLesson?.level}-b${editingLesson?.lessonNum}-${Date.now()}`,
      kanjiChar: '',
      hanviet: '',
      meaning: '',
      kunyomi: '',
      onyomi: '',
      note: 'Cột ghi chú & nét nghĩa nhớ chữ',
      examples: [
        { num: '①', japanese: '', reading: '', meaning: '' },
        { num: '②', japanese: '', reading: '', meaning: '' },
      ],
    });
    setWordModalOpen(true);
  };

  const handleOpenEditWord = (index: number) => {
    if (!editingLesson) return;
    setEditingWordIndex(index);
    setWordForm(
      JSON.parse(
        JSON.stringify(editingLesson.kanjiList[index]),
      ) as KanjiProWord,
    );
    setWordModalOpen(true);
  };

  const handleSaveWordForm = () => {
    if (!wordForm.kanjiChar || !wordForm.hanviet) {
      alert('Vui lòng nhập Chữ Hán và Âm Hán-Việt');
      return;
    }

    if (!editingLesson) return;

    const updatedKanjiList = [...editingLesson.kanjiList];
    if (editingWordIndex !== null) {
      updatedKanjiList[editingWordIndex] = wordForm;
    } else {
      updatedKanjiList.push(wordForm);
    }

    setEditingLesson({
      ...editingLesson,
      kanjiList: updatedKanjiList,
      isAvailable: updatedKanjiList.length > 0,
      description: `${updatedKanjiList.length} chữ Hán: ${updatedKanjiList.map(k => k.kanjiChar).join(', ')}`,
    });

    setWordModalOpen(false);
  };

  const handleDeleteWord = (index: number) => {
    if (!editingLesson) return;
    if (!confirm('Bạn có chắc muốn xóa chữ Hán này khỏi bài học?')) return;

    const updatedKanjiList = editingLesson.kanjiList.filter(
      (_, i) => i !== index,
    );
    setEditingLesson({
      ...editingLesson,
      kanjiList: updatedKanjiList,
      isAvailable: updatedKanjiList.length > 0,
      description:
        updatedKanjiList.length > 0
          ? `${updatedKanjiList.length} chữ Hán: ${updatedKanjiList.map(k => k.kanjiChar).join(', ')}`
          : `Nội dung Kanji cho ${editingLesson.title}`,
    });
  };

  // Seed standard template for Bài 24 / Bài 25
  const handleSeedTemplate = (lessonNum: number) => {
    if (!editingLesson) return;
    if (lessonNum === 24) {
      setEditingLesson({
        ...editingLesson,
        kanjiList: JSON.parse(
          JSON.stringify(LESSON_24_N4_KANJI),
        ) as KanjiProWord[],
        isAvailable: true,
        description: '9 chữ Hán: 試, 問, 答, 耳, 用, 験, 集, 研, 台',
      });
    } else if (lessonNum === 25) {
      setEditingLesson({
        ...editingLesson,
        kanjiList: JSON.parse(
          JSON.stringify(LESSON_25_N4_KANJI),
        ) as KanjiProWord[],
        isAvailable: true,
        description:
          '12 mục chữ Hán: 飯, 場, 正, 世, 界, 急, 特, 県, 低, 弱, 不, 急',
      });
    }
  };

  const handleAddExampleRow = () => {
    const nextNum = wordForm.examples.length + 1;
    const numChar =
      nextNum === 1
        ? '①'
        : nextNum === 2
          ? '②'
          : nextNum === 3
            ? '③'
            : `(${nextNum})`;
    setWordForm({
      ...wordForm,
      examples: [
        ...wordForm.examples,
        { num: numChar, japanese: '', reading: '', meaning: '' },
      ],
    });
  };

  const handleUpdateExample = (
    index: number,
    field: keyof KanjiProExample,
    val: string,
  ) => {
    const updated = [...wordForm.examples];
    updated[index] = { ...updated[index], [field]: val };
    setWordForm({ ...wordForm, examples: updated });
  };

  const handleRemoveExample = (index: number) => {
    setWordForm({
      ...wordForm,
      examples: wordForm.examples.filter((_, i) => i !== index),
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header Banner */}
      <div className='flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#27272a] bg-[#121215] p-6 shadow-sm'>
        <div className='flex items-center gap-3.5'>
          <div className='flex size-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-500'>
            <GraduationCap className='size-6' />
          </div>
          <div>
            <h2 className='text-xl font-black tracking-tight text-white'>
              Quản Trị Giáo Trình Kanji Pro
            </h2>
            <p className='text-xs text-slate-400'>
              Quản lý danh sách chữ Hán, âm đọc KUN/ON và câu ví dụ theo từng
              bài học Minna no Nihongo.
            </p>
          </div>
        </div>

        {/* Level Select Tabs */}
        <div className='flex items-center rounded-2xl border border-[#27272a] bg-[#18181b] p-1 text-xs'>
          {KANJI_PRO_LEVELS.map(lvl => (
            <button
              key={lvl.level}
              type='button'
              onClick={() => setSelectedLevel(lvl.level)}
              className={clsx(
                'rounded-xl px-4 py-2 font-bold transition-all',
                selectedLevel === lvl.level
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'text-slate-400 hover:text-white',
              )}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div className='flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400'>
          <CheckCircle2 className='size-4 shrink-0' />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className='flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-bold text-rose-400'>
          <AlertCircle className='size-4 shrink-0' />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Lessons List */}
      {loading ? (
        <div className='flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-[#27272a] bg-[#121215]'>
          <Loader2 className='size-8 animate-spin text-amber-500' />
          <span className='text-xs font-medium text-slate-400'>
            Đang tải dữ liệu bài học...
          </span>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {lessons.map(lesson => {
            const hasData = lesson.isAvailable && lesson.kanjiList.length > 0;

            return (
              <div
                key={lesson.id}
                className={clsx(
                  'flex flex-col justify-between rounded-3xl border p-5 transition-all',
                  hasData
                    ? 'border-emerald-500/40 bg-[#161d19]/60 shadow-sm hover:border-emerald-500'
                    : 'border-[#27272a] bg-[#121215] hover:border-[#3f3f46]',
                )}
              >
                <div>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div
                        className={clsx(
                          'flex size-9 items-center justify-center rounded-xl text-sm font-black',
                          hasData
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-[#27272a] text-slate-400',
                        )}
                      >
                        {lesson.lessonNum}
                      </div>
                      <div>
                        <h3 className='text-sm font-black text-white'>
                          {lesson.title}
                        </h3>
                        <span className='text-[10px] font-bold text-slate-400 uppercase'>
                          {lesson.level}
                        </span>
                      </div>
                    </div>

                    <span
                      className={clsx(
                        'rounded-full px-2.5 py-0.5 text-[10px] font-bold',
                        hasData
                          ? 'border border-emerald-500/30 bg-emerald-500/15 text-emerald-400'
                          : 'border border-[#3f3f46] bg-[#27272a] text-slate-400',
                      )}
                    >
                      {hasData
                        ? `${lesson.kanjiList.length} chữ`
                        : 'Chưa có data'}
                    </span>
                  </div>

                  <p className='mt-3 line-clamp-2 text-xs text-slate-400'>
                    {lesson.description || 'Chưa có mô tả nội dung cho bài này'}
                  </p>

                  {/* Preview Kanji chips if has data */}
                  {hasData && (
                    <div className='mt-3 flex flex-wrap gap-1.5'>
                      {lesson.kanjiList.map((k, i) => (
                        <span
                          key={i}
                          className='font-japanese flex size-6 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-bold text-emerald-300'
                        >
                          {k.kanjiChar}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className='mt-5 flex items-center justify-end gap-2 border-t border-[#27272a] pt-3'>
                  <button
                    type='button'
                    onClick={() => handleOpenEditLesson(lesson)}
                    className='flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-400 transition-colors hover:bg-amber-500 hover:text-black'
                  >
                    <Edit2 className='size-3.5' />
                    <span>Soạn bài</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* LESSON EDITOR MODAL / DRAWER                                        */}
      {/* =================================================================== */}
      {editingLesson && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm'>
          <div className='flex max-h-[92vh] w-full max-w-5xl flex-col rounded-3xl border border-[#27272a] bg-[#121215] shadow-2xl'>
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b border-[#27272a] p-5 sm:px-7'>
              <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-xl bg-amber-500 text-black'>
                  <BookOpen className='size-5' />
                </div>
                <div>
                  <h3 className='text-base font-black text-white sm:text-lg'>
                    Chỉnh sửa {editingLesson.title} (
                    {editingLesson.level.toUpperCase()})
                  </h3>
                  <p className='text-xs text-slate-400'>
                    Quản lý danh sách các chữ Hán trong bài học này.
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {/* Template Quick Seed */}
                {editingLesson.level === 'n4' &&
                  (editingLesson.lessonNum === 24 ||
                    editingLesson.lessonNum === 25) && (
                    <button
                      type='button'
                      onClick={() =>
                        handleSeedTemplate(editingLesson.lessonNum)
                      }
                      className='flex items-center gap-1 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-400 hover:bg-sky-500 hover:text-white'
                    >
                      <RotateCcw className='size-3' />
                      <span>Nạp mẫu Bài {editingLesson.lessonNum}</span>
                    </button>
                  )}

                <button
                  type='button'
                  onClick={() => setEditingLesson(null)}
                  className='rounded-xl p-1.5 text-slate-400 hover:bg-[#27272a] hover:text-white'
                >
                  <X className='size-5' />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className='flex-1 space-y-6 overflow-y-auto p-5 sm:p-7'>
              {/* Settings Bar */}
              <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#27272a] bg-[#18181b] p-4'>
                <div className='flex items-center gap-3'>
                  <label className='flex cursor-pointer items-center gap-2 text-xs font-bold text-white'>
                    <input
                      type='checkbox'
                      checked={editingLesson.isAvailable}
                      onChange={e =>
                        setEditingLesson({
                          ...editingLesson,
                          isAvailable: e.target.checked,
                        })
                      }
                      className='size-4 rounded-md accent-emerald-500'
                    />
                    <span>Xuất bản bài học (Hiển thị cho học viên)</span>
                  </label>
                </div>

                <button
                  type='button'
                  onClick={handleOpenAddWord}
                  className='flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-black shadow-sm transition-all hover:bg-emerald-400'
                >
                  <Plus className='size-3.5' />
                  <span>Thêm Chữ Hán Mới</span>
                </button>
              </div>

              {/* Kanji Words List */}
              {editingLesson.kanjiList.length === 0 ? (
                <div className='flex h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-[#27272a] text-center'>
                  <Layers className='size-8 text-slate-500' />
                  <p className='mt-2 text-xs font-medium text-slate-400'>
                    Chưa có chữ Hán nào trong bài học này.
                  </p>
                  <button
                    type='button'
                    onClick={handleOpenAddWord}
                    className='mt-3 text-xs font-bold text-amber-400 hover:underline'
                  >
                    + Bấm vào đây để thêm chữ đầu tiên
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  {editingLesson.kanjiList.map((word, idx) => (
                    <div
                      key={word.id || idx}
                      className='group relative flex flex-col justify-between gap-4 rounded-2xl border border-[#27272a] bg-[#16161a] p-4 sm:flex-row sm:items-center'
                    >
                      <div className='flex items-start gap-4'>
                        <div className='flex size-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center'>
                          <span className='font-japanese text-2xl font-black text-emerald-400'>
                            {word.kanjiChar}
                          </span>
                          <span className='text-[9px] font-black text-rose-400 uppercase'>
                            {word.hanviet}
                          </span>
                        </div>

                        <div className='space-y-1 text-xs'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <span className='font-bold text-white'>
                              {word.meaning}
                            </span>
                            <span className='text-slate-400'>•</span>
                            <span className='font-bold text-amber-400'>
                              KUN: {word.kunyomi || '—'}
                            </span>
                            <span className='text-slate-400'>•</span>
                            <span className='font-bold text-amber-400'>
                              ON: {word.onyomi || '—'}
                            </span>
                          </div>

                          <div className='text-slate-400'>
                            {word.examples.map((ex, exI) => (
                              <div key={exI} className='flex gap-1'>
                                <span className='text-slate-500'>{ex.num}</span>
                                <span className='text-sky-400'>
                                  {ex.japanese}
                                </span>
                                <span>: {ex.meaning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className='flex shrink-0 items-center gap-2 self-end sm:self-center'>
                        <button
                          type='button'
                          onClick={() => handleOpenEditWord(idx)}
                          className='flex items-center gap-1 rounded-xl border border-[#3f3f46] bg-[#27272a] px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:text-white'
                        >
                          <Edit2 className='size-3' />
                          <span>Sửa</span>
                        </button>
                        <button
                          type='button'
                          onClick={() => handleDeleteWord(idx)}
                          className='rounded-xl border border-rose-500/30 bg-rose-500/10 p-1.5 text-rose-400 hover:bg-rose-500 hover:text-white'
                          title='Xóa chữ'
                        >
                          <Trash2 className='size-3.5' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex items-center justify-between border-t border-[#27272a] p-5 sm:px-7'>
              <span className='text-xs text-slate-400'>
                Tổng cộng: {editingLesson.kanjiList.length} chữ Hán
              </span>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setEditingLesson(null)}
                  className='rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-bold text-slate-300 hover:text-white'
                >
                  Hủy bỏ
                </button>
                <button
                  type='button'
                  disabled={isSaving}
                  onClick={handleSaveLesson}
                  className='flex items-center gap-1.5 rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-black shadow-md transition-all hover:bg-amber-400 disabled:opacity-50'
                >
                  {isSaving ? (
                    <Loader2 className='size-3.5 animate-spin' />
                  ) : (
                    <Save className='size-3.5' />
                  )}
                  <span>Lưu Vào CSDL</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* WORD ADD/EDIT MODAL WITH LIVE 3-COLUMN PREVIEW                      */}
      {/* =================================================================== */}
      {wordModalOpen && (
        <div className='fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md'>
          <div className='flex max-h-[92vh] w-full max-w-4xl flex-col rounded-3xl border border-[#27272a] bg-[#121215] shadow-2xl'>
            <div className='flex items-center justify-between border-b border-[#27272a] p-5'>
              <h4 className='text-base font-black text-white'>
                {editingWordIndex !== null
                  ? 'Chỉnh sửa Chữ Hán'
                  : 'Thêm Chữ Hán Mới'}
              </h4>
              <button
                type='button'
                onClick={() => setWordModalOpen(false)}
                className='text-slate-400 hover:text-white'
              >
                <X className='size-5' />
              </button>
            </div>

            <div className='flex-1 space-y-6 overflow-y-auto p-5 sm:p-7'>
              {/* Form inputs grid */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                    Chữ Kanji <span className='text-rose-400'>*</span>
                  </label>
                  <input
                    type='text'
                    value={wordForm.kanjiChar}
                    onChange={e =>
                      setWordForm({ ...wordForm, kanjiChar: e.target.value })
                    }
                    placeholder='Ví dụ: 試'
                    className='font-japanese w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-lg font-bold text-white focus:border-amber-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                    Âm Hán-Việt <span className='text-rose-400'>*</span>
                  </label>
                  <input
                    type='text'
                    value={wordForm.hanviet}
                    onChange={e =>
                      setWordForm({
                        ...wordForm,
                        hanviet: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder='Ví dụ: THỬ'
                    className='w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-sm font-bold text-rose-400 uppercase focus:border-amber-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                    Nghĩa Tiếng Việt
                  </label>
                  <input
                    type='text'
                    value={wordForm.meaning}
                    onChange={e =>
                      setWordForm({ ...wordForm, meaning: e.target.value })
                    }
                    placeholder='Ví dụ: Thử'
                    className='w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-sm font-bold text-sky-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                    Âm KUN (Hiragana)
                  </label>
                  <input
                    type='text'
                    value={wordForm.kunyomi}
                    onChange={e =>
                      setWordForm({ ...wordForm, kunyomi: e.target.value })
                    }
                    placeholder='Ví dụ: ため.す、こころ.みる'
                    className='font-japanese w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-sm text-amber-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>

                <div>
                  <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                    Âm ON (Katakana)
                  </label>
                  <input
                    type='text'
                    value={wordForm.onyomi}
                    onChange={e =>
                      setWordForm({ ...wordForm, onyomi: e.target.value })
                    }
                    placeholder='Ví dụ: シ'
                    className='font-japanese w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-sm text-amber-400 focus:border-amber-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1.5 block text-xs font-bold text-slate-300'>
                  Ghi chú / Nét nghĩa nhớ chữ
                </label>
                <input
                  type='text'
                  value={wordForm.note || ''}
                  onChange={e =>
                    setWordForm({ ...wordForm, note: e.target.value })
                  }
                  placeholder='Cột ghi chú & nét nghĩa nhớ chữ'
                  className='w-full rounded-xl border border-[#3f3f46] bg-[#18181b] p-2.5 text-xs text-slate-300 italic focus:border-amber-500 focus:outline-none'
                />
              </div>

              {/* Examples section */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h5 className='text-xs font-black text-slate-300 uppercase'>
                    Danh Sách Ví Dụ & Từ Vựng
                  </h5>
                  <button
                    type='button'
                    onClick={handleAddExampleRow}
                    className='text-xs font-bold text-amber-400 hover:underline'
                  >
                    + Thêm dòng ví dụ
                  </button>
                </div>

                {wordForm.examples.map((ex, exIdx) => (
                  <div
                    key={exIdx}
                    className='flex flex-col gap-2 rounded-2xl border border-[#27272a] bg-[#18181b] p-3 sm:flex-row sm:items-center'
                  >
                    <span className='font-bold text-slate-400'>{ex.num}</span>

                    <input
                      type='text'
                      value={ex.japanese}
                      onChange={e =>
                        handleUpdateExample(exIdx, 'japanese', e.target.value)
                      }
                      placeholder='Từ / Câu tiếng Nhật (VD: 試験)'
                      className='font-japanese flex-1 rounded-lg border border-[#3f3f46] bg-[#121215] p-2 text-xs text-sky-400 focus:border-amber-500 focus:outline-none'
                    />

                    <input
                      type='text'
                      value={ex.meaning}
                      onChange={e =>
                        handleUpdateExample(exIdx, 'meaning', e.target.value)
                      }
                      placeholder='Nghĩa tiếng Việt (VD: kỳ thi)'
                      className='flex-1 rounded-lg border border-[#3f3f46] bg-[#121215] p-2 text-xs text-white focus:border-amber-500 focus:outline-none'
                    />

                    <button
                      type='button'
                      onClick={() => handleRemoveExample(exIdx)}
                      className='self-end p-1 text-slate-500 hover:text-rose-400 sm:self-center'
                    >
                      <Trash2 className='size-3.5' />
                    </button>
                  </div>
                ))}
              </div>

              {/* LIVE 3-COLUMN CARD PREVIEW */}
              <div className='space-y-2 border-t border-[#27272a] pt-4'>
                <div className='flex items-center gap-1.5 text-xs font-bold text-amber-400'>
                  <Eye className='size-3.5' />
                  <span>Bản xem trước thẻ thực tế (Live Preview):</span>
                </div>

                {/* 3-Column Card Design */}
                <div className='relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-md'>
                  <div className='grid grid-cols-1 md:grid-cols-12'>
                    {/* Cột 1 */}
                    <div className='flex flex-col items-center justify-between border-b border-slate-200 bg-white p-4 text-center md:col-span-3 md:border-r md:border-b-0'>
                      <span className='font-sans text-xs font-black tracking-wider text-rose-500 uppercase sm:text-sm'>
                        {wordForm.hanviet || 'HÁN VIỆT'}
                      </span>
                      <div className='my-2 flex flex-col items-center'>
                        <span className='font-japanese text-4xl font-black text-emerald-600 sm:text-5xl'>
                          {wordForm.kanjiChar || '字'}
                        </span>
                        <div className='mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-0.5 text-[10px] font-semibold text-slate-600'>
                          <Volume2 className='size-3' />
                          <span>Phát âm</span>
                        </div>
                      </div>
                      <span className='font-sans text-xs font-bold text-sky-600 capitalize'>
                        {wordForm.meaning || 'Nghĩa tiếng Việt'}
                      </span>
                    </div>

                    {/* Cột 2 */}
                    <div className='flex flex-col justify-between border-b border-slate-200 bg-white md:col-span-4 md:border-r md:border-b-0'>
                      <div className='flex flex-1 flex-col justify-center space-y-2 p-4 text-xs'>
                        <div className='flex items-baseline gap-2'>
                          <span className='font-sans font-black text-slate-800 uppercase'>
                            KUN:
                          </span>
                          <span className='font-japanese font-bold text-amber-500'>
                            {wordForm.kunyomi || '—'}
                          </span>
                        </div>
                        <div className='border-b border-dashed border-slate-200' />
                        <div className='flex items-baseline gap-2'>
                          <span className='font-sans font-black text-slate-800 uppercase'>
                            ON:
                          </span>
                          <span className='font-japanese font-bold text-amber-500'>
                            {wordForm.onyomi || '—'}
                          </span>
                        </div>
                      </div>
                      <div className='border-t border-dashed border-rose-200 bg-[#fff1f2] px-4 py-2 text-[11px] text-slate-400 italic'>
                        {wordForm.note || 'Cột ghi chú & nét nghĩa nhớ chữ'}
                      </div>
                    </div>

                    {/* Cột 3 */}
                    <div className='bg-white p-4 md:col-span-5'>
                      <h6 className='mb-2 font-sans text-[11px] font-black text-slate-800 uppercase'>
                        VÍ DỤ CÂU & TỪ VỰNG:
                      </h6>
                      <div className='space-y-2'>
                        {wordForm.examples.map((ex, exI) => (
                          <div
                            key={exI}
                            className='flex items-center justify-between rounded-xl border border-slate-200 bg-[#f8fafc] p-2 text-xs'
                          >
                            <div className='flex items-baseline gap-1'>
                              <span className='font-bold text-slate-500'>
                                {ex.num}
                              </span>
                              <span className='font-japanese font-bold text-sky-600'>
                                {ex.japanese || 'Ví dụ'}
                              </span>
                              <span className='text-slate-700'>
                                : {ex.meaning || 'Nghĩa'}
                              </span>
                            </div>
                            <div className='flex size-5 items-center justify-center rounded-full border border-emerald-400 bg-emerald-50 text-emerald-500'>
                              <CircleDot className='size-3' />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-end gap-3 border-t border-[#27272a] p-5'>
              <button
                type='button'
                onClick={() => setWordModalOpen(false)}
                className='rounded-xl border border-[#3f3f46] bg-[#27272a] px-4 py-2 text-xs font-bold text-slate-300 hover:text-white'
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={handleSaveWordForm}
                className='rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black hover:bg-emerald-400'
              >
                Lưu Chữ Hán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
