'use client';

import React, { useState, useEffect, useId } from 'react';
import {
  X,
  FileUp,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  Save,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Edit3,
  Key,
  Eye,
  EyeOff,
  Check,
  Search,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import type { SolutionExam, SolutionQuestion } from '../types';

interface PdfExamImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: string;
  existingExamNumbers?: number[];
  onImportSuccess?: (exam: SolutionExam) => void;
}

const LEVELS = [
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export const PdfExamImportModal: React.FC<PdfExamImportModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = 'n5',
  existingExamNumbers = [1],
  onImportSuccess,
}) => {
  const { playClick } = useClick();
  const fileInputId = useId();

  // Step state: 'form' | 'analyzing' | 'preview' | 'success'
  const [step, setStep] = useState<
    'form' | 'analyzing' | 'preview' | 'success'
  >('form');

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [level, setLevel] = useState<string>(
    ['n5', 'n4', 'n3', 'n2', 'n1'].includes(defaultLevel.toLowerCase())
      ? defaultLevel.toLowerCase()
      : 'n5',
  );
  const [examNumber, setExamNumber] = useState<number>(() => {
    const maxNum =
      existingExamNumbers.length > 0 ? Math.max(...existingExamNumbers) : 1;
    return maxNum + 1;
  });
  const [title, setTitle] = useState<string>('');
  const [author, setAuthor] = useState<string>('Phan Thắm SS - Minato');
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [promptHint, setPromptHint] = useState<string>('');

  // Analysis result state
  const [parsedExam, setParsedExam] = useState<SolutionExam | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Preview filtering & editing
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(
    null,
  );
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(
    null,
  );

  // Sync title whenever level or examNumber changes (if user hasn't heavily customized)
  useEffect(() => {
    setTitle(`Đề Thi Thử JLPT ${level.toUpperCase()} - Số ${examNumber}`);
  }, [level, examNumber]);

  // Load saved API key from localStorage
  useEffect(() => {
    void (async () => {
      await Promise.resolve();
      try {
        const savedKey = localStorage.getItem('solutions_gemini_api_key');
        if (savedKey) setApiKey(savedKey);
      } catch {
        // ignore storage errors
      }
    })();
  }, []);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !file.name.toLowerCase().endsWith('.pdf') &&
      file.type !== 'application/pdf'
    ) {
      setErrorMessage('Vui lòng chọn tệp tài liệu định dạng PDF (.pdf).');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (
      !file.name.toLowerCase().endsWith('.pdf') &&
      file.type !== 'application/pdf'
    ) {
      setErrorMessage('Vui lòng chọn tệp tài liệu định dạng PDF (.pdf).');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setErrorMessage('Vui lòng chọn một tệp PDF trước khi phân tích.');
      return;
    }

    setErrorMessage(null);
    setStep('analyzing');

    try {
      if (apiKey.trim()) {
        try {
          localStorage.setItem('solutions_gemini_api_key', apiKey.trim());
        } catch {
          // ignore
        }
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('level', level);
      formData.append('examNumber', String(examNumber));
      formData.append('title', title.trim());
      formData.append('author', author.trim());
      if (apiKey.trim()) formData.append('apiKey', apiKey.trim());
      if (promptHint.trim()) formData.append('promptHint', promptHint.trim());

      const res = await fetch('/api/solutions/parse-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Lỗi khi phân tích tệp PDF bằng AI.');
      }

      setParsedExam(data.exam);
      setStep('preview');
    } catch (err) {
      console.error('Error analyzing PDF:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Đã xảy ra lỗi không xác định khi gọi AI.',
      );
      setStep('form');
    }
  };

  const handleSaveToDatabase = async () => {
    if (!parsedExam) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/solutions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam: parsedExam }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Không thể lưu đề thi vào cơ sở dữ liệu.',
        );
      }

      setSaveSuccessMsg(data.message || 'Đã lưu đề thi thành công!');
      setStep('success');

      if (onImportSuccess) {
        onImportSuccess(parsedExam);
      }
    } catch (err) {
      console.error('Error saving exam:', err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Lỗi khi lưu đề thi vào cơ sở dữ liệu.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadJson = () => {
    if (!parsedExam) return;
    const jsonStr = JSON.stringify(parsedExam, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution_${parsedExam.level}_de${String(parsedExam.examNumber).padStart(2, '0')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateQuestion = (
    questionId: string,
    field: keyof SolutionQuestion,
    value: string,
  ) => {
    if (!parsedExam) return;
    setParsedExam(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.map(q => {
        if (q.id === questionId) {
          return { ...q, [field]: value };
        }
        return q;
      });

      // Also update quickAnswerSummary
      const vocab = updatedQuestions
        .filter(q => ['vocab', 'kanji', 'similar'].includes(q.partId))
        .map(q => ({ qNum: q.globalNumber, answer: q.correctOption }));
      const grammar = updatedQuestions
        .filter(q => ['grammar', 'star', 'passage'].includes(q.partId))
        .map(q => ({ qNum: q.globalNumber, answer: q.correctOption }));

      return {
        ...prev,
        questions: updatedQuestions,
        quickAnswerSummary: { vocab, grammar },
      };
    });
  };

  // Filter questions in preview
  const filteredQuestions = parsedExam?.questions.filter(q => {
    if (!searchFilter.trim()) return true;
    const filter = searchFilter.toLowerCase();
    return (
      String(q.globalNumber).includes(filter) ||
      q.questionText.toLowerCase().includes(filter) ||
      q.meaning.toLowerCase().includes(filter) ||
      q.explanation.toLowerCase().includes(filter) ||
      q.partTitle.toLowerCase().includes(filter)
    );
  });

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity'
        onClick={step === 'analyzing' ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className='relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-(--border-color) bg-(--card-color) text-(--main-color) shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-(--border-color) px-6 py-4'>
          <div className='flex items-center gap-3'>
            <div className='flex size-10 items-center justify-center rounded-2xl bg-(--main-color)/10 text-(--main-color)'>
              <FileUp className='size-5' />
            </div>
            <div>
              <h2 className='text-base font-black tracking-tight text-(--main-color) sm:text-lg'>
                Nhập Đề Thi Từ File PDF
              </h2>
              <p className='text-xs text-(--secondary-color)'>
                Hệ thống AI tự động bóc tách từng câu, tạo lời giải và giải
                thích bẫy
              </p>
            </div>
          </div>

          <button
            type='button'
            onClick={() => {
              playClick();
              onClose();
            }}
            disabled={step === 'analyzing'}
            className='flex size-8 items-center justify-center rounded-xl text-(--secondary-color) transition-colors hover:bg-(--background-color) hover:text-(--main-color) disabled:opacity-40'
          >
            <X className='size-4' />
          </button>
        </div>

        {/* Modal Body */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Global Error Banner */}
          {errorMessage && (
            <div className='mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-600 dark:text-red-400'>
              <AlertCircle className='size-4 shrink-0' />
              <div className='flex-1'>
                <p className='font-bold'>Đã xảy ra lỗi:</p>
                <p className='mt-0.5 leading-relaxed'>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* STEP 1: FORM CONFIGURATION */}
          {step === 'form' && (
            <div className='space-y-6'>
              {/* PDF File Dropzone */}
              <div>
                <label className='mb-2 block text-xs font-bold text-(--main-color)'>
                  File PDF Đề Thi <span className='text-red-500'>*</span>
                </label>
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
                    selectedFile
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-(--border-color) bg-(--background-color)/60 hover:border-(--main-color)'
                  }`}
                >
                  <input
                    type='file'
                    id={fileInputId}
                    accept='.pdf,application/pdf'
                    onChange={handleFileChange}
                    className='sr-only'
                  />
                  <label
                    htmlFor={fileInputId}
                    className='flex cursor-pointer flex-col items-center'
                  >
                    <div className='mb-3 flex size-12 items-center justify-center rounded-2xl bg-(--card-color) text-(--main-color) shadow-2xs transition-transform group-hover:scale-105'>
                      <FileText className='size-6 text-(--main-color)' />
                    </div>

                    {selectedFile ? (
                      <div className='space-y-1'>
                        <p className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                          {selectedFile.name}
                        </p>
                        <p className='text-[11px] text-(--secondary-color)'>
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB •
                          Nhấn để chọn file khác
                        </p>
                      </div>
                    ) : (
                      <div className='space-y-1'>
                        <p className='text-sm font-bold text-(--main-color)'>
                          Kéo thả file PDF vào đây hoặc{' '}
                          <span className='underline'>chọn từ máy tính</span>
                        </p>
                        <p className='text-[11px] text-(--secondary-color)'>
                          Hỗ trợ định dạng PDF (Dung lượng tối đa 25MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Grid 2 Columns for Exam Parameters */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                {/* Level Selection */}
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-(--main-color)'>
                    Cấp Độ JLPT
                  </label>
                  <div className='grid grid-cols-5 gap-1.5'>
                    {LEVELS.map(lvl => (
                      <button
                        key={lvl.id}
                        type='button'
                        onClick={() => {
                          playClick();
                          setLevel(lvl.id);
                        }}
                        className={`rounded-xl py-2 text-center text-xs font-bold transition-all ${
                          level === lvl.id
                            ? 'bg-(--main-color) text-(--background-color) shadow-2xs'
                            : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:text-(--main-color)'
                        }`}
                      >
                        {lvl.label.replace('JLPT ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exam Number */}
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-(--main-color)'>
                    Số Thứ Tự Đề (Đề số)
                  </label>
                  <input
                    type='number'
                    min={1}
                    max={99}
                    value={examNumber}
                    onChange={e =>
                      setExamNumber(parseInt(e.target.value, 10) || 1)
                    }
                    className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-xs font-bold text-(--main-color) focus:border-(--main-color) focus:outline-hidden'
                  />
                </div>

                {/* Exam Title */}
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-(--main-color)'>
                    Tiêu Đề Đề Thi
                  </label>
                  <input
                    type='text'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='Ví dụ: Đề Thi Thử JLPT N5 - Số 2'
                    className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-xs font-medium text-(--main-color) focus:border-(--main-color) focus:outline-hidden'
                  />
                </div>

                {/* Author */}
                <div>
                  <label className='mb-1.5 block text-xs font-bold text-(--main-color)'>
                    Tác Giả / Đơn Vị Biên Soạn
                  </label>
                  <input
                    type='text'
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder='Phan Thắm SS - Minato'
                    className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-xs font-medium text-(--main-color) focus:border-(--main-color) focus:outline-hidden'
                  />
                </div>
              </div>

              {/* Gemini API Key (Optional or stored) */}
              <div className='rounded-2xl border border-(--border-color) bg-(--background-color)/40 p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <Key className='size-4 text-(--secondary-color)' />
                    <span className='text-xs font-bold text-(--main-color)'>
                      Google Gemini API Key (Tùy chọn)
                    </span>
                  </div>
                  <span className='text-[11px] text-(--secondary-color)'>
                    Tự động lưu vào trình duyệt
                  </span>
                </div>

                <div className='relative mt-2.5'>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder='Nhập API key nếu chưa cài sẵn trên máy chủ...'
                    className='w-full rounded-xl border border-(--border-color) bg-(--card-color) py-2 pr-9 pl-3 font-mono text-xs text-(--main-color) placeholder:text-(--secondary-color)/50 focus:border-(--main-color) focus:outline-hidden'
                  />
                  <button
                    type='button'
                    onClick={() => setShowApiKey(!showApiKey)}
                    className='absolute top-1/2 right-2.5 -translate-y-1/2 text-(--secondary-color) hover:text-(--main-color)'
                  >
                    {showApiKey ? (
                      <EyeOff className='size-3.5' />
                    ) : (
                      <Eye className='size-3.5' />
                    )}
                  </button>
                </div>
                <p className='mt-1.5 text-[11px] text-(--secondary-color)'>
                  Nếu server đã cấu hình <code>GEMINI_API_KEY</code>, bạn có thể
                  để trống mục này.
                </p>
              </div>

              {/* Optional Prompt Hint */}
              <div>
                <label className='mb-1.5 block text-xs font-bold text-(--main-color)'>
                  Ghi Chú Hoặc Hướng Dẫn Thêm Cho AI (Tùy chọn)
                </label>
                <input
                  type='text'
                  value={promptHint}
                  onChange={e => setPromptHint(e.target.value)}
                  placeholder='Ví dụ: Đề thi này gồm 35 câu, đáp án ở trang cuối'
                  className='w-full rounded-xl border border-(--border-color) bg-(--background-color) px-3 py-2 text-xs font-medium text-(--main-color) focus:border-(--main-color) focus:outline-hidden'
                />
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING LOADING STATE */}
          {step === 'analyzing' && (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='relative mb-6 flex size-20 items-center justify-center rounded-3xl bg-(--main-color)/10 text-(--main-color)'>
                <RefreshCw className='size-10 animate-spin text-(--main-color)' />
              </div>

              <h3 className='text-lg font-black text-(--main-color)'>
                AI Đang Đọc & Phân Tích Đề Thi PDF...
              </h3>
              <p className='mt-2 max-w-md text-xs leading-relaxed text-(--secondary-color)'>
                Hệ thống đang trích xuất từng câu hỏi, giải nghĩa ngữ pháp, bóc
                tách bẫy câu trả lời và định dạng dữ liệu chuẩn JLPT{' '}
                {level.toUpperCase()}.
              </p>

              {/* Steps Progress Checklist */}
              <div className='mt-8 flex flex-col gap-2.5 text-left text-xs'>
                <div className='flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='size-4' />
                  <span>Mã hóa tệp PDF và tải lên thành công</span>
                </div>
                <div className='flex items-center gap-2.5 font-bold text-(--main-color)'>
                  <div className='size-4 animate-pulse rounded-full border-2 border-(--main-color) border-t-transparent' />
                  <span>
                    Gemini AI đang đọc từng trang đề thi và bóc tách đáp án...
                  </span>
                </div>
                <div className='flex items-center gap-2.5 text-(--secondary-color) opacity-60'>
                  <div className='size-4 rounded-full border border-(--border-color)' />
                  <span>
                    Dịch nghĩa tiếng Việt, phân tích bẫy và quy tắc cần nhớ
                  </span>
                </div>
              </div>

              <p className='mt-8 text-[11px] text-(--secondary-color)'>
                Quá trình này thường mất khoảng 15 đến 30 giây. Vui lòng giữ tab
                này mở.
              </p>
            </div>
          )}

          {/* STEP 3: PREVIEW & REVIEW RESULTS */}
          {step === 'preview' && parsedExam && (
            <div className='space-y-6'>
              {/* Summary Stats Banner */}
              <div className='rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='flex size-10 items-center justify-center rounded-xl bg-emerald-500 text-white'>
                      <Check className='size-5' />
                    </div>
                    <div>
                      <h3 className='text-sm font-black text-emerald-700 dark:text-emerald-300'>
                        Phân Tích Thành Công: {parsedExam.questions.length} Câu
                        Hỏi
                      </h3>
                      <p className='text-xs text-emerald-600/80 dark:text-emerald-400/80'>
                        {parsedExam.title} • Cấp độ{' '}
                        {parsedExam.level.toUpperCase()}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={handleDownloadJson}
                      className='inline-flex items-center gap-1.5 rounded-xl border border-(--border-color) bg-(--card-color) px-3 py-1.5 text-xs font-bold text-(--main-color) shadow-2xs hover:bg-(--background-color)'
                      title='Tải file JSON dự phòng về máy tính'
                    >
                      <Download className='size-3.5' />
                      <span>Tải JSON</span>
                    </button>
                  </div>
                </div>

                {/* Quick counts */}
                <div className='mt-4 flex flex-wrap gap-2 text-xs'>
                  <span className='rounded-lg bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-800 dark:text-emerald-200'>
                    Từ vựng & Chữ Hán:{' '}
                    {parsedExam.quickAnswerSummary.vocab.length} câu
                  </span>
                  <span className='rounded-lg bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-800 dark:text-emerald-200'>
                    Ngữ pháp & Đọc hiểu:{' '}
                    {parsedExam.quickAnswerSummary.grammar.length} câu
                  </span>
                  <span className='rounded-lg bg-emerald-500/20 px-2.5 py-1 font-semibold text-emerald-800 dark:text-emerald-200'>
                    Số phần: {parsedExam.sections?.length || 1} phần
                  </span>
                </div>
              </div>

              {/* Search Questions */}
              <div className='flex items-center gap-3'>
                <div className='relative flex-1'>
                  <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--secondary-color)' />
                  <input
                    type='text'
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    placeholder='Tìm nhanh theo số câu hoặc nội dung...'
                    className='w-full rounded-xl border border-(--border-color) bg-(--background-color) py-2 pr-4 pl-9 text-xs text-(--main-color) focus:border-(--main-color) focus:outline-hidden'
                  />
                </div>
                <span className='text-xs text-(--secondary-color)'>
                  Hiển thị {filteredQuestions?.length || 0} /{' '}
                  {parsedExam.questions.length} câu
                </span>
              </div>

              {/* Questions List */}
              <div className='max-h-96 space-y-3 overflow-y-auto pr-1'>
                {filteredQuestions?.map(q => {
                  const isExpanded = expandedQuestionId === q.id;
                  const isEditing = editingQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className='rounded-2xl border border-(--border-color) bg-(--background-color) p-4 transition-all'
                    >
                      {/* Top Bar of Card */}
                      <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-2'>
                          <span className='flex size-6 items-center justify-center rounded-lg bg-(--main-color) text-[11px] font-black text-(--background-color)'>
                            {q.globalNumber}
                          </span>
                          <span className='rounded-md border border-(--border-color) bg-(--card-color) px-2 py-0.5 text-[10px] font-bold text-(--secondary-color)'>
                            {q.partTitle.split(':')[0]}
                          </span>
                          <span className='inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-black text-emerald-600 dark:text-emerald-400'>
                            Đáp án: {q.correctOption} ({q.correctText})
                          </span>
                        </div>

                        <div className='flex items-center gap-1'>
                          <button
                            type='button'
                            onClick={() =>
                              setEditingQuestionId(isEditing ? null : q.id)
                            }
                            className={`flex size-7 items-center justify-center rounded-lg transition-colors ${
                              isEditing
                                ? 'bg-(--main-color) text-(--background-color)'
                                : 'text-(--secondary-color) hover:text-(--main-color)'
                            }`}
                            title='Chỉnh sửa câu hỏi'
                          >
                            <Edit3 className='size-3.5' />
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              setExpandedQuestionId(isExpanded ? null : q.id)
                            }
                            className='flex size-7 items-center justify-center rounded-lg text-(--secondary-color) hover:text-(--main-color)'
                          >
                            {isExpanded ? (
                              <ChevronUp className='size-4' />
                            ) : (
                              <ChevronDown className='size-4' />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Question Sentence */}
                      <div className='mt-2.5 text-xs font-medium text-(--main-color)'>
                        {q.questionText}
                      </div>

                      {/* Editing View */}
                      {isEditing && (
                        <div className='mt-4 space-y-3 rounded-xl border border-(--border-color) bg-(--card-color) p-3 text-xs'>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='mb-1 block font-bold text-(--main-color)'>
                                Đáp án đúng (1, 2, 3, 4)
                              </label>
                              <select
                                value={q.correctOption}
                                onChange={e =>
                                  handleUpdateQuestion(
                                    q.id,
                                    'correctOption',
                                    e.target.value,
                                  )
                                }
                                className='w-full rounded-lg border border-(--border-color) bg-(--background-color) px-2 py-1.5 font-bold text-(--main-color)'
                              >
                                <option value='1'>Phương án 1</option>
                                <option value='2'>Phương án 2</option>
                                <option value='3'>Phương án 3</option>
                                <option value='4'>Phương án 4</option>
                              </select>
                            </div>

                            <div>
                              <label className='mb-1 block font-bold text-(--main-color)'>
                                Chữ/Nội dung đáp án đúng
                              </label>
                              <input
                                type='text'
                                value={q.correctText}
                                onChange={e =>
                                  handleUpdateQuestion(
                                    q.id,
                                    'correctText',
                                    e.target.value,
                                  )
                                }
                                className='w-full rounded-lg border border-(--border-color) bg-(--background-color) px-2 py-1.5 text-(--main-color)'
                              />
                            </div>
                          </div>

                          <div>
                            <label className='mb-1 block font-bold text-(--main-color)'>
                              Dịch nghĩa tiếng Việt
                            </label>
                            <input
                              type='text'
                              value={q.meaning}
                              onChange={e =>
                                handleUpdateQuestion(
                                  q.id,
                                  'meaning',
                                  e.target.value,
                                )
                              }
                              className='w-full rounded-lg border border-(--border-color) bg-(--background-color) px-2 py-1.5 text-(--main-color)'
                            />
                          </div>

                          <div>
                            <label className='mb-1 block font-bold text-(--main-color)'>
                              Giải thích chi tiết
                            </label>
                            <textarea
                              rows={2}
                              value={q.explanation}
                              onChange={e =>
                                handleUpdateQuestion(
                                  q.id,
                                  'explanation',
                                  e.target.value,
                                )
                              }
                              className='w-full rounded-lg border border-(--border-color) bg-(--background-color) px-2 py-1.5 text-(--main-color)'
                            />
                          </div>
                        </div>
                      )}

                      {/* Expanded View (Details) */}
                      {!isEditing && isExpanded && (
                        <div className='mt-3 space-y-2 border-t border-(--border-color) pt-2 text-xs'>
                          {q.meaning && (
                            <p className='text-(--secondary-color)'>
                              <span className='font-bold text-(--main-color)'>
                                Nghĩa:{' '}
                              </span>
                              {q.meaning}
                            </p>
                          )}
                          {q.explanation && (
                            <p className='text-(--secondary-color)'>
                              <span className='font-bold text-(--main-color)'>
                                Giải thích:{' '}
                              </span>
                              {q.explanation}
                            </p>
                          )}
                          {q.wrongOptions && q.wrongOptions.length > 0 && (
                            <div className='rounded-lg bg-(--card-color) p-2 text-[11px] text-(--secondary-color)'>
                              <span className='font-bold text-(--main-color)'>
                                Phân tích bẫy:{' '}
                              </span>
                              {q.wrongOptions.map(w => (
                                <span
                                  key={w.option}
                                  className='mr-3 inline-block'
                                >
                                  [{w.option}] {w.text}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {step === 'success' && (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <div className='mb-4 flex size-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='size-8' />
              </div>

              <h3 className='text-lg font-black text-(--main-color)'>
                Đã Lưu Đề Thi Thành Công!
              </h3>
              <p className='mt-2 max-w-sm text-xs leading-relaxed text-(--secondary-color)'>
                {saveSuccessMsg ||
                  'Đề thi mới đã được cập nhật vào cơ sở dữ liệu và sẵn sàng để học sinh tra cứu.'}
              </p>

              <div className='mt-8 flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    playClick();
                    onClose();
                  }}
                  className='rounded-xl bg-(--main-color) px-5 py-2.5 text-xs font-bold text-(--background-color) shadow-sm transition-opacity hover:opacity-90'
                >
                  Xem Danh Sách Đề Thi
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className='flex items-center justify-between border-t border-(--border-color) bg-(--card-color) px-6 py-4'>
          {step === 'form' && (
            <>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className='rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-bold text-(--secondary-color) hover:text-(--main-color)'
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={handleStartAnalysis}
                disabled={!selectedFile}
                className='inline-flex items-center gap-2 rounded-xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 disabled:opacity-40'
              >
                <FileUp className='size-4' />
                <span>Bắt Đầu Phân Tích PDF</span>
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                type='button'
                onClick={() => setStep('form')}
                className='rounded-xl border border-(--border-color) bg-(--background-color) px-4 py-2 text-xs font-bold text-(--secondary-color) hover:text-(--main-color)'
              >
                Đổi File Khác
              </button>

              <button
                type='button'
                onClick={handleSaveToDatabase}
                disabled={isSaving}
                className='inline-flex items-center gap-2 rounded-xl bg-(--main-color) px-6 py-2 text-xs font-bold text-(--background-color) shadow-sm transition-all hover:opacity-90 disabled:opacity-50'
              >
                {isSaving ? (
                  <>
                    <RefreshCw className='size-4 animate-spin' />
                    <span>Đang Lưu Vào Hệ Thống...</span>
                  </>
                ) : (
                  <>
                    <Save className='size-4' />
                    <span>Lưu Vào Hệ Thống</span>
                  </>
                )}
              </button>
            </>
          )}

          {step === 'success' && (
            <div className='w-full text-right'>
              <button
                type='button'
                onClick={() => {
                  playClick();
                  onClose();
                }}
                className='rounded-xl bg-(--main-color) px-5 py-2 text-xs font-bold text-(--background-color)'
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PdfExamImportModal;
