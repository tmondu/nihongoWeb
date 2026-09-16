'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Layers,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Volume2,
} from 'lucide-react';

interface GrammarExample {
  ja: string;
  kana: string;
  romaji?: string;
  vi: string;
}

interface GrammarPoint {
  id: number;
  lesson_num: number;
  title: string;
  summary_vi: string;
  structure: string | null;
  explanation_vi: string;
  examples: GrammarExample[];
  order_num: number;
}

interface VocabularyItem {
  id: number;
  lesson_num: number;
  kanji: string | null;
  kana: string;
  romaji: string;
  meaning_vi: string;
  word_type: string | null;
  example_ja: string | null;
  example_vi: string | null;
  order_num: number;
}

interface LessonDetailData {
  lesson: {
    id: number;
    lesson_num: number;
    title_vi: string;
    title_ja: string;
    description: string | null;
    level: string;
    book_vol: number;
  };
  grammar_points: GrammarPoint[];
  vocabularies: VocabularyItem[];
}

export default function AdminLessonDetailManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<LessonDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grammar' | 'vocab'>('grammar');

  // Grammar Modal State
  const [isGrammarModalOpen, setIsGrammarModalOpen] = useState(false);
  const [grammarModalMode, setGrammarModalMode] = useState<'add' | 'edit'>(
    'add',
  );
  const [editingGrammarId, setEditingGrammarId] = useState<number | null>(null);
  const [grammarTitle, setGrammarTitle] = useState('');
  const [grammarSummary, setGrammarSummary] = useState('');
  const [grammarStructure, setGrammarStructure] = useState('');
  const [grammarExplanation, setGrammarExplanation] = useState('');
  const [grammarExamples, setGrammarExamples] = useState<GrammarExample[]>([
    { ja: '', kana: '', romaji: '', vi: '' },
  ]);
  const [grammarSubmitting, setGrammarSubmitting] = useState(false);
  const [grammarError, setGrammarError] = useState('');

  // Vocab Modal State
  const [isVocabModalOpen, setIsVocabModalOpen] = useState(false);
  const [vocabModalMode, setVocabModalMode] = useState<'add' | 'edit'>('add');
  const [editingVocabId, setEditingVocabId] = useState<number | null>(null);
  const [vocabKanji, setVocabKanji] = useState('');
  const [vocabKana, setVocabKana] = useState('');
  const [vocabRomaji, setVocabRomaji] = useState('');
  const [vocabMeaning, setVocabMeaning] = useState('');
  const [vocabWordType, setVocabWordType] = useState('Danh từ');
  const [vocabExampleJa, setVocabExampleJa] = useState('');
  const [vocabExampleVi, setVocabExampleVi] = useState('');
  const [vocabSubmitting, setVocabSubmitting] = useState(false);
  const [vocabError, setVocabError] = useState('');

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/curriculum/${id}`);
      if (!res.ok) throw new Error('Không thể tải chi tiết bài học');
      const json: LessonDetailData = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Grammar Handlers
  const handleOpenAddGrammar = () => {
    setGrammarModalMode('add');
    setEditingGrammarId(null);
    setGrammarTitle('');
    setGrammarSummary('');
    setGrammarStructure('');
    setGrammarExplanation('');
    setGrammarExamples([{ ja: '', kana: '', romaji: '', vi: '' }]);
    setGrammarError('');
    setIsGrammarModalOpen(true);
  };

  const handleOpenEditGrammar = (g: GrammarPoint) => {
    setGrammarModalMode('edit');
    setEditingGrammarId(g.id);
    setGrammarTitle(g.title);
    setGrammarSummary(g.summary_vi);
    setGrammarStructure(g.structure || '');
    setGrammarExplanation(g.explanation_vi);
    setGrammarExamples(
      g.examples && g.examples.length > 0
        ? g.examples
        : [{ ja: '', kana: '', romaji: '', vi: '' }],
    );
    setGrammarError('');
    setIsGrammarModalOpen(true);
  };

  const handleAddExampleRow = () => {
    setGrammarExamples(prev => [
      ...prev,
      { ja: '', kana: '', romaji: '', vi: '' },
    ]);
  };

  const handleRemoveExampleRow = (idx: number) => {
    setGrammarExamples(prev => prev.filter((_, i) => i !== idx));
  };

  const handleExampleChange = (
    idx: number,
    field: keyof GrammarExample,
    val: string,
  ) => {
    setGrammarExamples(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: val };
      return updated;
    });
  };

  const handleSubmitGrammar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGrammarSubmitting(true);
    setGrammarError('');

    try {
      const cleanedExamples = grammarExamples.filter(
        ex => ex.ja.trim() && ex.vi.trim(),
      );

      const payload = {
        id: editingGrammarId,
        lesson_num: data?.lesson.lesson_num,
        title: grammarTitle.trim(),
        summary_vi: grammarSummary.trim(),
        structure: grammarStructure.trim(),
        explanation_vi: grammarExplanation.trim(),
        examples: cleanedExamples,
      };

      const res = await fetch(`/api/curriculum/${id}/grammar`, {
        method: grammarModalMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Lỗi lưu ngữ pháp');

      setIsGrammarModalOpen(false);
      fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setGrammarError(msg);
    } finally {
      setGrammarSubmitting(false);
    }
  };

  const handleDeleteGrammar = async (grammarId: number, title: string) => {
    if (!confirm(`Xóa mẫu ngữ pháp "${title}"?`)) return;

    try {
      const res = await fetch(
        `/api/curriculum/${id}/grammar?grammar_id=${grammarId}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error('Không thể xóa ngữ pháp');
      fetchDetail();
    } catch (err) {
      alert('Lỗi xóa ngữ pháp');
      console.error(err);
    }
  };

  // Vocab Handlers
  const handleOpenAddVocab = () => {
    setVocabModalMode('add');
    setEditingVocabId(null);
    setVocabKanji('');
    setVocabKana('');
    setVocabRomaji('');
    setVocabMeaning('');
    setVocabWordType('Danh từ');
    setVocabExampleJa('');
    setVocabExampleVi('');
    setVocabError('');
    setIsVocabModalOpen(true);
  };

  const handleOpenEditVocab = (v: VocabularyItem) => {
    setVocabModalMode('edit');
    setEditingVocabId(v.id);
    setVocabKanji(v.kanji || '');
    setVocabKana(v.kana);
    setVocabRomaji(v.romaji);
    setVocabMeaning(v.meaning_vi);
    setVocabWordType(v.word_type || 'Danh từ');
    setVocabExampleJa(v.example_ja || '');
    setVocabExampleVi(v.example_vi || '');
    setVocabError('');
    setIsVocabModalOpen(true);
  };

  const handleSubmitVocab = async (e: React.FormEvent) => {
    e.preventDefault();
    setVocabSubmitting(true);
    setVocabError('');

    try {
      const payload = {
        id: editingVocabId,
        lesson_num: data?.lesson.lesson_num,
        kanji: vocabKanji.trim() || null,
        kana: vocabKana.trim(),
        romaji: vocabRomaji.trim(),
        meaning_vi: vocabMeaning.trim(),
        word_type: vocabWordType.trim(),
        example_ja: vocabExampleJa.trim() || null,
        example_vi: vocabExampleVi.trim() || null,
      };

      const res = await fetch(`/api/curriculum/${id}/vocab`, {
        method: vocabModalMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Lỗi lưu từ vựng');

      setIsVocabModalOpen(false);
      fetchDetail();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setVocabError(msg);
    } finally {
      setVocabSubmitting(false);
    }
  };

  const handleDeleteVocab = async (vocabId: number, word: string) => {
    if (!confirm(`Xóa từ vựng "${word}"?`)) return;

    try {
      const res = await fetch(
        `/api/curriculum/${id}/vocab?vocab_id=${vocabId}`,
        {
          method: 'DELETE',
        },
      );
      if (!res.ok) throw new Error('Không thể xóa từ vựng');
      fetchDetail();
    } catch (err) {
      alert('Lỗi xóa từ vựng');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-slate-400'>
        <Loader2 className='mb-2 size-8 animate-spin text-sky-500' />
        <span className='text-sm'>Đang tải nội dung bài học...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className='space-y-4 py-16 text-center text-slate-400'>
        <p className='text-base font-semibold text-rose-400'>
          Không tìm thấy bài học này
        </p>
        <Link
          href='/curriculum'
          className='inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs text-slate-100 hover:bg-slate-700'
        >
          <ArrowLeft className='size-4' />
          <span>Về danh sách bài học</span>
        </Link>
      </div>
    );
  }

  const { lesson, grammar_points, vocabularies } = data;

  return (
    <div className='space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div className='space-y-1'>
          <Link
            href='/curriculum'
            className='inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 transition-colors hover:text-sky-300'
          >
            <ArrowLeft className='size-4' />
            <span>Danh sách giáo án</span>
          </Link>

          <div className='flex items-center gap-3 pt-1'>
            <h1 className='font-japanese text-xl font-bold text-slate-100'>
              {lesson.title_ja} · Bài {lesson.lesson_num}: {lesson.title_vi}
            </h1>
            <span className='rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold text-sky-400 uppercase'>
              {lesson.level} · Tập {lesson.book_vol}
            </span>
          </div>
          {lesson.description && (
            <p className='text-xs text-slate-400'>{lesson.description}</p>
          )}
        </div>

        {/* Action button based on active tab */}
        {activeTab === 'grammar' ? (
          <button
            type='button'
            onClick={handleOpenAddGrammar}
            className='inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-sky-600 sm:self-auto'
          >
            <Plus className='size-4' />
            <span>Thêm mẫu ngữ pháp</span>
          </button>
        ) : (
          <button
            type='button'
            onClick={handleOpenAddVocab}
            className='inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-emerald-600 sm:self-auto'
          >
            <Plus className='size-4' />
            <span>Thêm từ vựng mới</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className='flex items-center gap-2 border-b border-slate-800'>
        <button
          type='button'
          onClick={() => setActiveTab('grammar')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
            activeTab === 'grammar'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className='size-4' />
          <span>Ngữ pháp ({grammar_points.length})</span>
        </button>

        <button
          type='button'
          onClick={() => setActiveTab('vocab')}
          className={`flex cursor-pointer items-center gap-2 border-b-2 px-4 pb-3 text-xs font-bold transition-all ${
            activeTab === 'vocab'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className='size-4' />
          <span>Từ vựng ({vocabularies.length})</span>
        </button>
      </div>

      {/* Content for Grammar Tab */}
      {activeTab === 'grammar' && (
        <div className='space-y-4'>
          {grammar_points.length > 0 ? (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {grammar_points.map(g => (
                <div
                  key={g.id}
                  className='space-y-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-sm transition-all hover:border-slate-700'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div>
                      <h3 className='font-mixed text-base font-bold text-slate-100'>
                        {g.title}
                      </h3>
                      <p className='mt-0.5 text-xs font-medium text-sky-400'>
                        {g.summary_vi}
                      </p>
                    </div>

                    <div className='flex shrink-0 items-center gap-1'>
                      <button
                        type='button'
                        onClick={() => handleOpenEditGrammar(g)}
                        className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100'
                        title='Sửa mẫu ngữ pháp'
                      >
                        <Edit className='size-3.5' />
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteGrammar(g.id, g.title)}
                        className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400'
                        title='Xóa mẫu ngữ pháp'
                      >
                        <Trash2 className='size-3.5' />
                      </button>
                    </div>
                  </div>

                  {g.structure && (
                    <div className='rounded-xl border border-sky-500/20 bg-sky-500/5 px-3 py-2 font-mono text-xs font-semibold text-sky-300'>
                      {g.structure}
                    </div>
                  )}

                  <div className='line-clamp-3 rounded-xl border border-slate-800 bg-slate-800/40 p-3 text-xs leading-relaxed text-slate-300'>
                    {g.explanation_vi}
                  </div>

                  {g.examples && g.examples.length > 0 && (
                    <div className='flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-400'>
                      <span>{g.examples.length} câu ví dụ minh họa</span>
                      <span className='font-japanese text-slate-500'>
                        {g.examples[0].ja}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 py-16 text-center text-slate-400'>
              <BookOpen className='mx-auto mb-2 size-8 opacity-40' />
              <p className='text-sm font-medium'>Chưa có mẫu ngữ pháp nào</p>
              <p className='mt-1 text-xs'>
                Bấm nút &quot;Thêm mẫu ngữ pháp&quot; phía trên để thêm mới.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Content for Vocab Tab */}
      {activeTab === 'vocab' && (
        <div className='overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-sm'>
          {vocabularies.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='w-full text-left text-xs text-slate-300'>
                <thead className='border-b border-slate-800 bg-slate-800/60 text-[11px] tracking-wider text-slate-400 uppercase'>
                  <tr>
                    <th className='px-4 py-3 font-semibold'>Chữ Hán</th>
                    <th className='px-4 py-3 font-semibold'>Kana (Cách đọc)</th>
                    <th className='px-4 py-3 font-semibold'>Romaji</th>
                    <th className='px-4 py-3 font-semibold'>
                      Nghĩa tiếng Việt
                    </th>
                    <th className='px-4 py-3 font-semibold'>Từ loại</th>
                    <th className='px-4 py-3 font-semibold'>Câu ví dụ</th>
                    <th className='px-4 py-3 text-right font-semibold'>
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-800/80'>
                  {vocabularies.map(v => (
                    <tr
                      key={v.id}
                      className='transition-colors hover:bg-slate-800/40'
                    >
                      <td className='font-japanese px-4 py-3 text-sm font-bold text-slate-100'>
                        {v.kanji || '—'}
                      </td>
                      <td className='font-japanese px-4 py-3 text-sm font-medium text-sky-400'>
                        {v.kana}
                      </td>
                      <td className='px-4 py-3 font-mono text-xs text-slate-400'>
                        {v.romaji}
                      </td>
                      <td className='px-4 py-3 font-medium text-slate-200'>
                        {v.meaning_vi}
                      </td>
                      <td className='px-4 py-3'>
                        {v.word_type && (
                          <span className='rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300'>
                            {v.word_type}
                          </span>
                        )}
                      </td>
                      <td className='max-w-xs truncate px-4 py-3 text-[11px] text-slate-400'>
                        {v.example_ja || '—'}
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          <button
                            type='button'
                            onClick={() => handleOpenEditVocab(v)}
                            className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-100'
                            title='Sửa từ vựng'
                          >
                            <Edit className='size-3.5' />
                          </button>
                          <button
                            type='button'
                            onClick={() => handleDeleteVocab(v.id, v.kana)}
                            className='cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400'
                            title='Xóa từ vựng'
                          >
                            <Trash2 className='size-3.5' />
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
              <Layers className='mx-auto mb-2 size-8 opacity-40' />
              <p className='text-sm font-medium'>
                Chưa có từ vựng nào trong bài này
              </p>
              <p className='mt-1 text-xs'>
                Bấm nút &quot;Thêm từ vựng mới&quot; phía trên để thêm vào bài
                học.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal Add / Edit Grammar */}
      {isGrammarModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
          <div className='max-h-[90vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3'>
              <h3 className='text-base font-bold text-slate-100'>
                {grammarModalMode === 'add'
                  ? 'Thêm mẫu ngữ pháp mới'
                  : 'Sửa mẫu ngữ pháp'}
              </h3>
              <button
                type='button'
                onClick={() => setIsGrammarModalOpen(false)}
                className='cursor-pointer text-lg text-slate-400 hover:text-slate-100'
              >
                ✕
              </button>
            </div>

            {grammarError && (
              <div className='flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{grammarError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitGrammar} className='space-y-4 text-xs'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Tiêu đề mẫu ngữ pháp (tiếng Nhật):
                  </label>
                  <input
                    type='text'
                    value={grammarTitle}
                    onChange={e => setGrammarTitle(e.target.value)}
                    placeholder='VD: N1 は N2 です'
                    required
                    className='font-mixed w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Ý nghĩa tóm tắt (tiếng Việt):
                  </label>
                  <input
                    type='text'
                    value={grammarSummary}
                    onChange={e => setGrammarSummary(e.target.value)}
                    placeholder='VD: N1 là N2'
                    required
                    className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Công thức cấu trúc:
                </label>
                <input
                  type='text'
                  value={grammarStructure}
                  onChange={e => setGrammarStructure(e.target.value)}
                  placeholder='VD: N1 [Danh từ 1] は N2 [Danh từ 2] です'
                  className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Giải thích & Cách dùng:
                </label>
                <textarea
                  value={grammarExplanation}
                  onChange={e => setGrammarExplanation(e.target.value)}
                  rows={4}
                  placeholder='Giải thích chi tiết cách dùng, trợ từ, lưu ý...'
                  required
                  className='w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              {/* Dynamic Examples List */}
              <div className='space-y-3 border-t border-slate-800 pt-2'>
                <div className='flex items-center justify-between'>
                  <label className='font-semibold text-slate-300'>
                    Câu ví dụ minh họa:
                  </label>
                  <button
                    type='button'
                    onClick={handleAddExampleRow}
                    className='inline-flex cursor-pointer items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300'
                  >
                    <Plus className='size-3' />
                    <span>Thêm câu ví dụ</span>
                  </button>
                </div>

                <div className='space-y-3'>
                  {grammarExamples.map((ex, idx) => (
                    <div
                      key={idx}
                      className='relative space-y-2 rounded-xl border border-slate-800 bg-slate-800/40 p-3'
                    >
                      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        <input
                          type='text'
                          value={ex.ja}
                          onChange={e =>
                            handleExampleChange(idx, 'ja', e.target.value)
                          }
                          placeholder='Tiếng Nhật (VD: わたしは マイク・ミラーです。)'
                          className='font-japanese w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100'
                        />
                        <input
                          type='text'
                          value={ex.kana}
                          onChange={e =>
                            handleExampleChange(idx, 'kana', e.target.value)
                          }
                          placeholder='Cách đọc Kana'
                          className='font-japanese w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100'
                        />
                      </div>
                      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        <input
                          type='text'
                          value={ex.romaji || ''}
                          onChange={e =>
                            handleExampleChange(idx, 'romaji', e.target.value)
                          }
                          placeholder='Romaji'
                          className='w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 font-mono text-xs text-slate-100'
                        />
                        <input
                          type='text'
                          value={ex.vi}
                          onChange={e =>
                            handleExampleChange(idx, 'vi', e.target.value)
                          }
                          placeholder='Dịch nghĩa tiếng Việt'
                          className='w-full rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs text-slate-100'
                        />
                      </div>
                      {grammarExamples.length > 1 && (
                        <button
                          type='button'
                          onClick={() => handleRemoveExampleRow(idx)}
                          className='flex cursor-pointer items-center gap-1 text-[10px] font-semibold text-rose-400 hover:text-rose-300'
                        >
                          <Trash2 className='size-3' />
                          <span>Xóa câu này</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-slate-800 pt-3'>
                <button
                  type='button'
                  onClick={() => setIsGrammarModalOpen(false)}
                  className='cursor-pointer rounded-xl px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={grammarSubmitting}
                  className='flex cursor-pointer items-center gap-2 rounded-xl bg-sky-500 px-5 py-2 font-semibold text-white hover:bg-sky-600 disabled:opacity-50'
                >
                  {grammarSubmitting && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  <span>
                    {grammarModalMode === 'add'
                      ? 'Thêm mẫu câu'
                      : 'Lưu thay đổi'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Vocabulary */}
      {isVocabModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'>
          <div className='max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl'>
            <div className='flex items-center justify-between border-b border-slate-800 pb-3'>
              <h3 className='text-base font-bold text-slate-100'>
                {vocabModalMode === 'add' ? 'Thêm từ vựng mới' : 'Sửa từ vựng'}
              </h3>
              <button
                type='button'
                onClick={() => setIsVocabModalOpen(false)}
                className='cursor-pointer text-lg text-slate-400 hover:text-slate-100'
              >
                ✕
              </button>
            </div>

            {vocabError && (
              <div className='flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400'>
                <AlertCircle className='size-4 shrink-0' />
                <span>{vocabError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitVocab} className='space-y-3 text-xs'>
              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Chữ Hán (nếu có):
                  </label>
                  <input
                    type='text'
                    value={vocabKanji}
                    onChange={e => setVocabKanji(e.target.value)}
                    placeholder='VD: 私, 先生'
                    className='font-japanese w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Cách đọc Kana (*bắt buộc):
                  </label>
                  <input
                    type='text'
                    value={vocabKana}
                    onChange={e => setVocabKana(e.target.value)}
                    placeholder='VD: わたし, せんせい'
                    required
                    className='font-japanese w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Romaji:
                  </label>
                  <input
                    type='text'
                    value={vocabRomaji}
                    onChange={e => setVocabRomaji(e.target.value)}
                    placeholder='VD: watashi, sensei'
                    className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 font-mono text-slate-100 focus:border-sky-500 focus:outline-none'
                  />
                </div>
                <div>
                  <label className='mb-1 block font-semibold text-slate-300'>
                    Từ loại:
                  </label>
                  <select
                    value={vocabWordType}
                    onChange={e => setVocabWordType(e.target.value)}
                    className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                  >
                    <option value='Danh từ'>Danh từ</option>
                    <option value='Đại từ'>Đại từ</option>
                    <option value='Động từ nhóm I'>Động từ nhóm I</option>
                    <option value='Động từ nhóm II'>Động từ nhóm II</option>
                    <option value='Động từ nhóm III'>Động từ nhóm III</option>
                    <option value='Tính từ đuôi い'>Tính từ đuôi い</option>
                    <option value='Tính từ đuôi な'>Tính từ đuôi な</option>
                    <option value='Phó từ'>Phó từ</option>
                    <option value='Liên từ'>Liên từ</option>
                    <option value='Câu chào hỏi'>Câu chào hỏi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Nghĩa tiếng Việt (*bắt buộc):
                </label>
                <input
                  type='text'
                  value={vocabMeaning}
                  onChange={e => setVocabMeaning(e.target.value)}
                  placeholder='VD: Tôi (ngôi thứ nhất)'
                  required
                  className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Câu ví dụ (tiếng Nhật):
                </label>
                <input
                  type='text'
                  value={vocabExampleJa}
                  onChange={e => setVocabExampleJa(e.target.value)}
                  placeholder='VD: わたしは ベトナム人です。'
                  className='font-japanese w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div>
                <label className='mb-1 block font-semibold text-slate-300'>
                  Dịch câu ví dụ (tiếng Việt):
                </label>
                <input
                  type='text'
                  value={vocabExampleVi}
                  onChange={e => setVocabExampleVi(e.target.value)}
                  placeholder='VD: Tôi là người Việt Nam.'
                  className='w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 focus:border-sky-500 focus:outline-none'
                />
              </div>

              <div className='flex items-center justify-end gap-3 border-t border-slate-800 pt-3'>
                <button
                  type='button'
                  onClick={() => setIsVocabModalOpen(false)}
                  className='cursor-pointer rounded-xl px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                >
                  Hủy
                </button>
                <button
                  type='submit'
                  disabled={vocabSubmitting}
                  className='flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white hover:bg-emerald-600 disabled:opacity-50'
                >
                  {vocabSubmitting && (
                    <Loader2 className='size-4 animate-spin' />
                  )}
                  <span>
                    {vocabModalMode === 'add' ? 'Thêm từ vựng' : 'Lưu thay đổi'}
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
