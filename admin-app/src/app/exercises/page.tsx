/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle2,
  FileText,
  Upload,
  Code2,
  Download,
  Clock,
  HelpCircle,
  GraduationCap,
  Eye,
  RefreshCw,
  Users,
  AlertCircle,
  BookOpen,
  Sparkles,
  X,
} from 'lucide-react';
import {
  ExerciseRecord,
  ExerciseQuestion,
  ExerciseSubmissionRecord,
  parseAikenFormat,
  parseCsvFormat,
  parseJsonFormat,
  generateSampleCsvTemplate,
  generateSampleAikenTemplate,
  generateSampleReadingAikenTemplate,
  questionsToAiken,
} from '@/lib/exerciseParser';

const LEVELS = [
  { id: '', label: 'Tất cả' },
  { id: 'n5', label: 'JLPT N5' },
  { id: 'n4', label: 'JLPT N4' },
  { id: 'n3', label: 'JLPT N3' },
  { id: 'n2', label: 'JLPT N2' },
  { id: 'n1', label: 'JLPT N1' },
];

export default function AdminExercisesPage() {
  const [activeTab, setActiveTab] = useState<'exercises' | 'submissions'>(
    'exercises',
  );

  // Exercise list states
  const [exercises, setExercises] = useState<ExerciseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<number | string | null>(
    null,
  );
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modal create/edit states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLevel, setFormLevel] = useState('n5');
  const [formTimeLimit, setFormTimeLimit] = useState(15);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formQuestions, setFormQuestions] = useState<ExerciseQuestion[]>([]);
  const [formError, setFormError] = useState('');

  // Builder method tabs inside modal: 'manual' | 'source' | 'import'
  const [builderTab, setBuilderTab] = useState<'manual' | 'source' | 'import'>(
    'manual',
  );
  const [sourceText, setSourceText] = useState('');
  const [parsedPreviewQuestions, setParsedPreviewQuestions] = useState<
    ExerciseQuestion[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submissions states
  const [submissions, setSubmissions] = useState<ExerciseSubmissionRecord[]>(
    [],
  );
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [selectedSubmission, setSelectedSubmission] =
    useState<ExerciseSubmissionRecord | null>(null);

  // Notify helper
  const showToast = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch exercises
  const fetchExercises = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (levelFilter) params.set('level', levelFilter);
      if (searchQuery) params.set('query', searchQuery);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setExercises(data.exercises || []);
      } else {
        showToast(data.message || 'Lỗi tải bài tập', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setLoading(false);
    }
  }, [levelFilter, searchQuery]);

  // Fetch submissions
  const fetchSubmissions = useCallback(async () => {
    setLoadingSubmissions(true);
    try {
      const params = new URLSearchParams();
      if (submissionSearch) params.set('query', submissionSearch);

      const res = await fetch(
        `/api/exercises/submissions?${params.toString()}`,
      );
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch {
      showToast('Lỗi tải bảng điểm', 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  }, [submissionSearch]);

  useEffect(() => {
    if (activeTab === 'exercises') {
      fetchExercises();
    } else {
      fetchSubmissions();
    }
  }, [activeTab, fetchExercises, fetchSubmissions]);

  // Open Create Modal
  const handleOpenCreate = () => {
    setDialogMode('create');
    setEditingId(null);
    setFormTitle('');
    setFormDescription('');
    setFormLevel('n5');
    setFormTimeLimit(15);
    setFormIsPublished(true);
    setFormQuestions([
      {
        id: 1,
        question: '',
        options: ['', '', '', ''],
        correct_answer: 'A',
        explanation: '',
        explanation_image: '',
      },
    ]);
    setSourceText('');
    setParsedPreviewQuestions([]);
    setBuilderTab('manual');
    setFormError('');
    setIsDialogOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (ex: ExerciseRecord) => {
    setDialogMode('edit');
    setEditingId(ex.id);
    setFormTitle(ex.title);
    setFormDescription(ex.description || '');
    setFormLevel(ex.level);
    setFormTimeLimit(ex.time_limit || 0);
    setFormIsPublished(Boolean(ex.is_published));
    let questions: ExerciseQuestion[] = [];
    if (typeof ex.questions === 'string') {
      try {
        questions = JSON.parse(ex.questions);
      } catch {
        questions = [];
      }
    } else if (Array.isArray(ex.questions)) {
      questions = ex.questions;
    }
    setFormQuestions(questions);

    // Pre-populate Aiken source text so user can view/edit in Source tab as well
    try {
      const aikenText = questionsToAiken(questions);
      setSourceText(aikenText);
    } catch {
      setSourceText('');
    }

    setBuilderTab('manual');
    setFormError('');
    setIsDialogOpen(true);
  };

  // Delete exercise
  const handleDelete = async (id: number) => {
    if (
      !confirm(
        'Bạn có chắc chắn muốn xóa bài tập này? Toàn bộ lịch sử điểm số của bài này cũng sẽ bị xóa.',
      )
    ) {
      return;
    }

    setActionLoading(id);
    try {
      const res = await fetch(`/api/exercises/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Đã xóa bài tập');
        setExercises(prev => prev.filter(e => e.id !== id));
      } else {
        showToast(data.message || 'Lỗi khi xóa bài tập', 'error');
      }
    } catch {
      showToast('Không thể kết nối đến máy chủ', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  // Add question in manual mode
  const handleAddQuestion = () => {
    setFormQuestions(prev => [
      ...prev,
      {
        id: prev.length + 1,
        question: '',
        options: ['', '', '', ''],
        correct_answer: 'A',
        explanation: '',
        explanation_image: '',
      },
    ]);
  };

  // Remove question in manual mode
  const handleRemoveQuestion = (index: number) => {
    if (formQuestions.length <= 1) {
      alert('Bài tập cần có tối thiểu 1 câu hỏi.');
      return;
    }
    setFormQuestions(prev => prev.filter((_, idx) => idx !== index));
  };

  // Update question field
  const handleQuestionChange = (
    index: number,
    field: keyof ExerciseQuestion,
    value: any,
  ) => {
    setFormQuestions(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Update option text
  const handleOptionChange = (
    qIndex: number,
    optIndex: number,
    text: string,
  ) => {
    setFormQuestions(prev => {
      const updated = [...prev];
      const newOptions = [...updated[qIndex].options];
      newOptions[optIndex] = text;
      updated[qIndex] = { ...updated[qIndex], options: newOptions };
      return updated;
    });
  };

  // Parse source text (Aiken / Text)
  const handleParseSource = () => {
    if (!sourceText.trim()) {
      showToast('Vui lòng nhập nội dung câu hỏi nguồn.', 'error');
      return;
    }
    const parsed = parseAikenFormat(sourceText);
    if (parsed.length === 0) {
      showToast(
        'Không nhận diện được câu hỏi theo định dạng Aiken. Vui lòng kiểm tra lại cú pháp.',
        'error',
      );
      return;
    }
    setParsedPreviewQuestions(parsed);
    setFormQuestions(parsed);
    showToast(`Đã nhận diện & áp dụng ${parsed.length} câu hỏi từ Aiken!`);
  };

  // Apply parsed questions from Source or File to current form questions
  const handleApplyParsedQuestions = (questionsToApply: ExerciseQuestion[]) => {
    if (questionsToApply.length === 0) return;
    setFormQuestions(questionsToApply);
    setBuilderTab('manual');
    showToast(
      `Đã nạp thành công ${questionsToApply.length} câu hỏi vào bài tập!`,
    );
  };

  // Handle File Upload (CSV or JSON)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      let parsed: ExerciseQuestion[] = [];
      if (file.name.endsWith('.json')) {
        parsed = parseJsonFormat(content);
      } else {
        parsed = parseCsvFormat(content);
      }

      if (parsed.length === 0) {
        alert(
          'Không thể đọc dữ liệu câu hỏi từ file. Vui lòng kiểm tra lại định dạng file hoặc tải file mẫu.',
        );
        return;
      }

      setParsedPreviewQuestions(parsed);
      showToast(`Đã đọc ${parsed.length} câu hỏi từ file "${file.name}"`);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent = '\uFEFF' + generateSampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mau_cau_hoi_pthamss.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save Exercise (Create or Update)
  const handleSaveExercise = async () => {
    setFormError('');
    if (!formTitle.trim()) {
      setFormError('Vui lòng nhập tiêu đề bài tập.');
      return;
    }

    let questionsToSave = [...formQuestions];
    if (builderTab === 'source' && sourceText.trim()) {
      const parsed = parseAikenFormat(sourceText);
      if (parsed.length > 0) {
        questionsToSave = parsed;
        setFormQuestions(parsed);
      }
    }

    if (questionsToSave.length === 0) {
      setFormError('Bài tập phải có ít nhất 1 câu hỏi.');
      return;
    }

    for (let i = 0; i < questionsToSave.length; i++) {
      const q = questionsToSave[i];
      if (!q.question.trim()) {
        setFormError(`Câu hỏi số ${i + 1} chưa có nội dung.`);
        return;
      }
      if (!q.options || q.options.filter(o => o.trim().length > 0).length < 2) {
        setFormError(`Câu hỏi số ${i + 1} cần có ít nhất 2 đáp án lựa chọn.`);
        return;
      }
    }

    setActionLoading('save');
    try {
      const payload = {
        title: formTitle,
        description: formDescription,
        level: formLevel,
        time_limit: Number(formTimeLimit) || 0,
        questions: questionsToSave,
        is_published: formIsPublished,
      };

      const url =
        dialogMode === 'create'
          ? '/api/exercises'
          : `/api/exercises/${editingId}`;
      const method = dialogMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast(
          dialogMode === 'create'
            ? 'Đã tạo bài tập mới thành công!'
            : 'Đã cập nhật bài tập thành công!',
        );
        setIsDialogOpen(false);
        fetchExercises();
      } else {
        setFormError(data.message || 'Không thể lưu bài tập');
      }
    } catch {
      setFormError('Lỗi kết nối máy chủ');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-8 right-8 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all ${
            notification.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/80 text-emerald-200'
              : 'border-rose-500/30 bg-rose-950/80 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className='size-5 text-emerald-400' />
          ) : (
            <AlertCircle className='size-5 text-rose-400' />
          )}
          <span className='text-sm font-medium'>{notification.message}</span>
        </div>
      )}

      {/* Header & Page Action */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='flex items-center gap-2.5 text-2xl font-black tracking-tight text-white'>
            <BookOpen className='size-7 text-purple-400' />
            Quản Lý Bài Tập & Điểm Số
          </h1>
          <p className='mt-1 text-xs text-slate-400'>
            Tạo bài tập trắc nghiệm bằng tay, từ nguồn Aiken hoặc import file;
            quản lý điểm số học sinh.
          </p>
        </div>

        <div className='flex items-center gap-3'>
          <button
            type='button'
            onClick={handleOpenCreate}
            className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 transition-all hover:bg-purple-500'
          >
            <Plus className='size-4' />
            <span>Tạo bài tập mới</span>
          </button>
        </div>
      </div>

      {/* Main Tabs: Danh sách bài tập vs Bảng điểm học sinh */}
      <div className='flex border-b border-[#1e1e24]'>
        <button
          type='button'
          onClick={() => setActiveTab('exercises')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'exercises'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className='size-4' />
          <span>Danh sách bài tập ({exercises.length})</span>
        </button>
        <button
          type='button'
          onClick={() => setActiveTab('submissions')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-xs font-semibold transition-colors ${
            activeTab === 'submissions'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className='size-4' />
          <span>Bảng điểm học sinh</span>
        </button>
      </div>

      {/* TAB 1: DANH SÁCH BÀI TẬP */}
      {activeTab === 'exercises' && (
        <div className='space-y-4'>
          {/* Filter Bar */}
          <div className='flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 shadow-sm'>
            <div className='flex flex-wrap items-center gap-1.5'>
              {LEVELS.map(lvl => (
                <button
                  key={lvl.id}
                  type='button'
                  onClick={() => setLevelFilter(lvl.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    levelFilter === lvl.id
                      ? 'bg-purple-600 font-bold text-white shadow-md shadow-purple-600/20'
                      : 'bg-[#18181c] text-slate-400 hover:bg-[#22222a] hover:text-white'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <div className='flex items-center gap-3'>
              <div className='relative w-64'>
                <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='Tìm kiếm bài tập...'
                  className='w-full rounded-xl border border-[#2d2d38] bg-[#16161c] py-2 pr-3 pl-9 text-xs text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none'
                />
              </div>
              <button
                type='button'
                onClick={fetchExercises}
                className='flex size-8 items-center justify-center rounded-lg border border-[#2d2d38] bg-[#16161c] text-slate-400 hover:text-white'
              >
                <RefreshCw className='size-3.5' />
              </button>
            </div>
          </div>

          {/* Exercises Cards / Grid */}
          {loading ? (
            <div className='flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e]'>
              <Loader2 className='size-8 animate-spin text-purple-500' />
              <p className='text-xs text-slate-400'>
                Đang tải danh sách bài tập...
              </p>
            </div>
          ) : exercises.length === 0 ? (
            <div className='flex h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-8 text-center'>
              <GraduationCap className='size-12 text-slate-700' />
              <h3 className='text-base font-semibold text-slate-200'>
                Chưa có bài tập nào
              </h3>
              <p className='max-w-md text-xs text-slate-400'>
                Hãy bấm &quot;Tạo bài tập mới&quot; để tạo đề trắc nghiệm bằng
                tay, paste văn bản Aiken hoặc import file CSV.
              </p>
              <button
                type='button'
                onClick={handleOpenCreate}
                className='mt-2 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500'
              >
                <Plus className='size-4' />
                <span>Tạo bài tập đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {exercises.map(ex => (
                <div
                  key={ex.id}
                  className='group relative flex flex-col justify-between rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-5 transition-all hover:border-purple-500/40 hover:bg-[#121217]'
                >
                  <div>
                    <div className='flex items-center justify-between'>
                      <span className='rounded-md border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-xs font-bold text-purple-300 uppercase'>
                        {ex.level}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          ex.is_published
                            ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ex.is_published ? 'Công khai' : 'Bản nháp'}
                      </span>
                    </div>

                    <h3 className='mt-3 line-clamp-1 text-base font-bold text-white transition-colors group-hover:text-purple-300'>
                      {ex.title}
                    </h3>
                    {ex.description && (
                      <p className='mt-1 line-clamp-2 text-xs text-slate-400'>
                        {ex.description}
                      </p>
                    )}

                    <div className='mt-4 flex items-center gap-4 text-xs text-slate-400'>
                      <span className='flex items-center gap-1'>
                        <HelpCircle className='size-3.5 text-slate-500' />
                        {ex.total_questions} câu hỏi
                      </span>
                      <span className='flex items-center gap-1'>
                        <Clock className='size-3.5 text-slate-500' />
                        {ex.time_limit > 0
                          ? `${ex.time_limit} phút`
                          : 'Không giới hạn'}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Users className='size-3.5 text-slate-500' />
                        {ex.submissions_count} lượt nộp
                      </span>
                    </div>
                  </div>

                  <div className='mt-5 flex items-center justify-between border-t border-[#1e1e24] pt-4'>
                    <span className='text-[11px] text-slate-500'>
                      {new Date(ex.created_at).toLocaleDateString('vi-VN')}
                    </span>
                    <div className='flex items-center gap-1.5'>
                      <button
                        type='button'
                        onClick={() => handleOpenEdit(ex)}
                        className='inline-flex items-center gap-1 rounded-lg bg-[#18181c] px-2.5 py-1 text-xs font-semibold text-purple-300 hover:bg-[#22222a] hover:text-white'
                      >
                        <Edit className='size-3.5' />
                        <span>Sửa</span>
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(ex.id)}
                        disabled={actionLoading === ex.id}
                        className='flex size-7 items-center justify-center rounded-lg text-rose-400 hover:bg-rose-950/20 hover:text-rose-300'
                      >
                        {actionLoading === ex.id ? (
                          <Loader2 className='size-3.5 animate-spin' />
                        ) : (
                          <Trash2 className='size-3.5' />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BẢNG ĐIỂM HỌC SINH (SUBMISSIONS) */}
      {activeTab === 'submissions' && (
        <div className='space-y-4'>
          <div className='flex items-center justify-between rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] p-4 shadow-sm'>
            <div className='relative w-80'>
              <Search className='absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400' />
              <input
                type='text'
                value={submissionSearch}
                onChange={e => setSubmissionSearch(e.target.value)}
                placeholder='Tìm theo email học sinh hoặc bài tập...'
                className='w-full rounded-xl border border-[#2d2d38] bg-[#16161c] py-2 pr-3 pl-9 text-xs text-white'
              />
            </div>
            <button
              type='button'
              onClick={fetchSubmissions}
              className='flex size-8 items-center justify-center rounded-lg border border-[#2d2d38] bg-[#16161c] text-slate-400 hover:text-white'
            >
              <RefreshCw className='size-3.5' />
            </button>
          </div>

          {loadingSubmissions ? (
            <div className='flex h-64 items-center justify-center rounded-2xl border border-[#1e1e24] bg-[#0c0c0e]'>
              <Loader2 className='size-8 animate-spin text-purple-500' />
            </div>
          ) : submissions.length === 0 ? (
            <div className='flex h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-[#1e1e24] bg-[#0c0c0e] text-center'>
              <Users className='size-10 text-slate-600' />
              <p className='text-sm text-slate-300'>
                Chưa có học sinh nào nộp bài tập
              </p>
            </div>
          ) : (
            <div className='overflow-hidden rounded-2xl border border-[#1e1e24] bg-[#0c0c0e]'>
              <table className='w-full text-left text-xs'>
                <thead className='border-b border-[#1e1e24] bg-[#121215] text-slate-400'>
                  <tr>
                    <th className='px-5 py-3 font-semibold'>Học sinh</th>
                    <th className='px-5 py-3 font-semibold'>Bài tập</th>
                    <th className='px-5 py-3 text-center font-semibold'>
                      Điểm số
                    </th>
                    <th className='px-5 py-3 text-center font-semibold'>
                      Tỷ lệ đúng
                    </th>
                    <th className='px-5 py-3 text-center font-semibold'>
                      Thời gian làm
                    </th>
                    <th className='px-5 py-3 font-semibold'>Ngày nộp</th>
                    <th className='px-5 py-3 text-right font-semibold'>
                      Chi tiết
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-[#1a1a20] text-slate-300'>
                  {submissions.map(sub => (
                    <tr
                      key={sub.id}
                      className='transition-colors hover:bg-[#16161a]'
                    >
                      <td className='px-5 py-4 font-medium text-white'>
                        {sub.user_email || `User #${sub.user_id}`}
                      </td>
                      <td className='px-5 py-4'>
                        <div className='font-medium text-slate-200'>
                          {sub.exercise_title}
                        </div>
                        <span className='text-[10px] font-bold text-purple-400 uppercase'>
                          {sub.exercise_level}
                        </span>
                      </td>
                      <td className='px-5 py-4 text-center font-bold text-white'>
                        {sub.score} / {sub.total_questions}
                      </td>
                      <td className='px-5 py-4 text-center'>
                        <span
                          className={`inline-block rounded-md px-2.5 py-1 font-bold ${
                            sub.percentage >= 60
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                              : 'border border-rose-500/20 bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {sub.percentage}%
                        </span>
                      </td>
                      <td className='px-5 py-4 text-center text-slate-400'>
                        {Math.floor(sub.time_spent / 60)}:
                        {(sub.time_spent % 60).toString().padStart(2, '0')}
                      </td>
                      <td className='px-5 py-4 text-slate-400'>
                        {new Date(sub.created_at).toLocaleString('vi-VN')}
                      </td>
                      <td className='px-5 py-4 text-right'>
                        <button
                          type='button'
                          onClick={() => setSelectedSubmission(sub)}
                          className='inline-flex items-center gap-1 rounded-lg bg-purple-500/10 px-2.5 py-1 text-xs font-semibold text-purple-300 hover:bg-purple-500/20'
                        >
                          <Eye className='size-3.5' />
                          <span>Xem bài làm</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL: TẠO / SỬA BÀI TẬP */}
      {isDialogOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm'>
          <div className='max-h-[90vh] w-full max-w-4xl space-y-5 overflow-y-auto rounded-2xl border border-[#26262e] bg-[#0f0f13] p-6 text-slate-100 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-[#1e1e24] pb-4'>
              <h2 className='flex items-center gap-2 text-lg font-bold text-white'>
                <BookOpen className='size-5 text-purple-400' />
                <span>
                  {dialogMode === 'create'
                    ? 'Tạo bài tập mới'
                    : 'Chỉnh sửa bài tập'}
                </span>
              </h2>
              <button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='text-slate-400 hover:text-white'
              >
                <X className='size-5' />
              </button>
            </div>

            {formError && (
              <div className='flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-950/50 p-3 text-xs text-rose-300'>
                <AlertCircle className='size-4 shrink-0 text-rose-400' />
                <span>{formError}</span>
              </div>
            )}

            {/* Thông tin cơ bản */}
            <div className='grid grid-cols-1 gap-4 border-b border-[#1e1e24] pb-5 sm:grid-cols-3'>
              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-slate-300'>
                  Tiêu đề bài tập *
                </label>
                <input
                  type='text'
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder='Ví dụ: Luyện tập ngữ pháp & từ vựng bài 1'
                  className='w-full rounded-xl border border-[#262630] bg-[#16161c] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-slate-300'>
                  Cấp độ JLPT
                </label>
                <select
                  value={formLevel}
                  onChange={e => setFormLevel(e.target.value)}
                  className='w-full rounded-xl border border-[#262630] bg-[#16161c] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none'
                >
                  <option value='n5'>JLPT N5</option>
                  <option value='n4'>JLPT N4</option>
                  <option value='n3'>JLPT N3</option>
                  <option value='n2'>JLPT N2</option>
                  <option value='n1'>JLPT N1</option>
                </select>
              </div>

              <div className='space-y-1.5 sm:col-span-2'>
                <label className='text-xs font-semibold text-slate-300'>
                  Mô tả ngắn
                </label>
                <input
                  type='text'
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder='Mô tả tóm tắt nội dung bài tập...'
                  className='w-full rounded-xl border border-[#262630] bg-[#16161c] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-xs font-semibold text-slate-300'>
                  Thời gian làm (phút)
                </label>
                <input
                  type='number'
                  min='0'
                  value={formTimeLimit}
                  onChange={e => setFormTimeLimit(Number(e.target.value))}
                  placeholder='0 = Không giới hạn'
                  className='w-full rounded-xl border border-[#262630] bg-[#16161c] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none'
                />
              </div>
            </div>

            {/* Sub-tabs chọn phương thức tạo câu hỏi */}
            <div className='space-y-4 pt-1'>
              <div className='flex items-center justify-between'>
                <label className='text-xs font-bold tracking-wider text-slate-400 uppercase'>
                  Danh sách câu hỏi ({formQuestions.length} câu)
                </label>

                <div className='flex rounded-xl border border-[#262630] bg-[#16161c] p-1'>
                  <button
                    type='button'
                    onClick={() => {
                      if (sourceText.trim()) {
                        const parsed = parseAikenFormat(sourceText);
                        if (parsed.length > 0) setFormQuestions(parsed);
                      }
                      setBuilderTab('manual');
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      builderTab === 'manual'
                        ? 'bg-purple-600 font-bold text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Edit className='size-3.5' />
                    <span>Tạo bằng tay</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      if (formQuestions && formQuestions.length > 0) {
                        const aiken = questionsToAiken(formQuestions);
                        if (aiken) setSourceText(aiken);
                      }
                      setBuilderTab('source');
                    }}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      builderTab === 'source'
                        ? 'bg-purple-600 font-bold text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Code2 className='size-3.5' />
                    <span>Tạo bằng Source (Aiken)</span>
                  </button>
                  <button
                    type='button'
                    onClick={() => setBuilderTab('import')}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                      builderTab === 'import'
                        ? 'bg-purple-600 font-bold text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Upload className='size-3.5' />
                    <span>Import File</span>
                  </button>
                </div>
              </div>

              {/* 1. TẠO BẰNG TAY */}
              {builderTab === 'manual' && (
                <div className='max-h-[50vh] space-y-4 overflow-y-auto pr-1'>
                  {formQuestions.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className='relative space-y-3 rounded-xl border border-[#262630] bg-[#14141a] p-4'
                    >
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-2 text-xs font-bold text-purple-300'>
                          <span className='flex size-5 items-center justify-center rounded-full bg-purple-500/20 text-[11px] text-purple-300'>
                            {qIdx + 1}
                          </span>
                          Câu hỏi {qIdx + 1}
                        </span>
                        <button
                          type='button'
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className='inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300'
                        >
                          <Trash2 className='size-3.5' />
                          <span>Xóa</span>
                        </button>
                      </div>

                      <div className='grid grid-cols-1 gap-2 sm:grid-cols-3'>
                        <input
                          type='text'
                          value={q.passage_title || ''}
                          onChange={e =>
                            handleQuestionChange(
                              qIdx,
                              'passage_title',
                              e.target.value,
                            )
                          }
                          placeholder='Tiêu đề bài đọc (tùy chọn)...'
                          className='rounded-xl border border-[#262630] bg-[#14141a] px-3 py-1.5 text-xs text-indigo-300 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none'
                        />
                        <input
                          type='text'
                          value={q.passage || ''}
                          onChange={e =>
                            handleQuestionChange(
                              qIdx,
                              'passage',
                              e.target.value,
                            )
                          }
                          placeholder='Bài đọc chung (Passage nếu có)...'
                          className='rounded-xl border border-[#262630] bg-[#14141a] px-3 py-1.5 text-xs text-indigo-300 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none sm:col-span-2'
                        />
                      </div>

                      <input
                        type='text'
                        value={q.question}
                        onChange={e =>
                          handleQuestionChange(qIdx, 'question', e.target.value)
                        }
                        placeholder='Nhập nội dung câu hỏi (VD: Từ nào sau đây có nghĩa là Ngày mai?)...'
                        className='w-full rounded-xl border border-[#262630] bg-[#1a1a22] px-3 py-2 text-sm text-white focus:border-purple-500 focus:outline-none'
                      />

                      <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                        {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                          <div key={letter} className='flex items-center gap-2'>
                            <button
                              type='button'
                              onClick={() =>
                                handleQuestionChange(
                                  qIdx,
                                  'correct_answer',
                                  letter,
                                )
                              }
                              className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                                q.correct_answer === letter
                                  ? 'bg-emerald-500 text-black shadow-md ring-2 shadow-emerald-500/20 ring-emerald-400'
                                  : 'bg-[#1e1e26] text-slate-400 hover:bg-[#282834]'
                              }`}
                              title={`Chọn ${letter} làm đáp án đúng`}
                            >
                              {letter}
                            </button>
                            <input
                              type='text'
                              value={q.options[optIdx] || ''}
                              onChange={e =>
                                handleOptionChange(qIdx, optIdx, e.target.value)
                              }
                              placeholder={`Lựa chọn ${letter}...`}
                              className='w-full rounded-lg border border-[#262630] bg-[#1a1a22] px-3 py-1.5 text-xs text-white focus:border-purple-500 focus:outline-none'
                            />
                          </div>
                        ))}
                      </div>

                      <input
                        type='text'
                        value={q.explanation || ''}
                        onChange={e =>
                          handleQuestionChange(
                            qIdx,
                            'explanation',
                            e.target.value,
                          )
                        }
                        placeholder='Giải thích / dịch nghĩa khi chấm bài (tùy chọn)...'
                        className='w-full rounded-lg border border-[#262630] bg-[#1a1a22] px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none'
                      />

                      {/* Explanation Image (Cloudflare R2 / URL) */}
                      <div className='space-y-1.5'>
                        <div className='flex items-center gap-2'>
                          <input
                            type='text'
                            value={q.explanation_image || ''}
                            onChange={e =>
                              handleQuestionChange(
                                qIdx,
                                'explanation_image',
                                e.target.value,
                              )
                            }
                            placeholder='Link ảnh đáp án / bài giải R2 (tùy chọn, ví dụ: https://pub-xxx.r2.dev/dapan.png)...'
                            className='w-full rounded-lg border border-[#262630] bg-[#1a1a22] px-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-500 focus:border-purple-500 focus:outline-none'
                          />
                          {q.explanation_image && (
                            <a
                              href={q.explanation_image}
                              target='_blank'
                              rel='noreferrer'
                              className='shrink-0 rounded-lg border border-purple-500/40 bg-purple-500/10 px-2.5 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20'
                            >
                              Xem ảnh
                            </a>
                          )}
                        </div>

                        {q.explanation_image && (
                          <div className='relative inline-block overflow-hidden rounded-lg border border-[#262630] bg-black/40 p-1'>
                            <img
                              src={q.explanation_image}
                              alt='Preview đáp án'
                              className='h-20 w-auto rounded object-contain'
                              onError={e => {
                                (e.target as HTMLImageElement).style.display =
                                  'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    type='button'
                    onClick={handleAddQuestion}
                    className='flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#333340] bg-[#14141a] py-3 text-xs font-semibold text-slate-300 hover:bg-[#1a1a24] hover:text-white'
                  >
                    <Plus className='size-4 text-purple-400' />
                    <span>Thêm câu hỏi mới</span>
                  </button>
                </div>
              )}

              {/* 2. TẠO BẰNG SOURCE TEXT (AIKEN) */}
              {builderTab === 'source' && (
                <div className='space-y-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <p className='text-xs text-slate-400'>
                      Nhập đề thi định dạng Aiken. Hỗ trợ bài đọc hiểu với thẻ{' '}
                      <code className='rounded bg-purple-500/20 px-1 py-0.5 text-[11px] text-purple-300'>
                        [PASSAGE: Tiêu đề] ... [/PASSAGE]
                      </code>
                      :
                    </p>
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() =>
                          setSourceText(generateSampleAikenTemplate())
                        }
                        className='inline-flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20'
                      >
                        <Sparkles className='size-3.5' />
                        <span>Mẫu Trắc nghiệm</span>
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          setSourceText(generateSampleReadingAikenTemplate())
                        }
                        className='inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/15 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/25'
                      >
                        <BookOpen className='size-3.5' />
                        <span>Mẫu Đọc hiểu [PASSAGE]</span>
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    rows={9}
                    placeholder={`[PASSAGE: 初めての野球]\n日本に来る前に まんがで 野球という スポーツを 知って...\n[/PASSAGE]\n\nCâu 1: Từ nào sau đây có nghĩa là "Ngày mai"?\nA. きのう\nB. あした\nC. きょう\nD. あさって\nANSWER: B\nEXPLANATION: あした nghĩa là ngày mai.`}
                    className='w-full rounded-xl border border-[#262630] bg-[#14141a] p-4 font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:border-purple-500 focus:outline-none'
                  />

                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <button
                      type='button'
                      onClick={handleParseSource}
                      className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500'
                    >
                      <CheckCircle2 className='size-4' />
                      <span>Phân tích & Xem trước</span>
                    </button>

                    {parsedPreviewQuestions.length > 0 && (
                      <div className='flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400'>
                        <CheckCircle2 className='size-3.5' />
                        Đã nhận diện {parsedPreviewQuestions.length} câu hỏi.
                        Bạn chỉ cần nhấn &quot;Lưu thay đổi&quot; bên dưới để
                        hoàn tất!
                      </div>
                    )}
                  </div>

                  {parsedPreviewQuestions.length > 0 && (
                    <div className='max-h-48 space-y-2.5 overflow-y-auto rounded-xl border border-[#262630] bg-[#14141a] p-4'>
                      <div className='text-xs font-bold text-emerald-400'>
                        ✓ Nhận diện thành công {parsedPreviewQuestions.length}{' '}
                        câu hỏi:
                      </div>
                      {parsedPreviewQuestions.map((q, idx) => (
                        <div
                          key={idx}
                          className='border-b border-[#1e1e24] pb-2 text-xs text-slate-300'
                        >
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-white'>
                              Câu {idx + 1}:
                            </span>
                            {q.passage && (
                              <span className='rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300'>
                                📖 {q.passage_title || 'Có đoạn văn'}
                              </span>
                            )}
                          </div>
                          <p className='mt-0.5 text-slate-200'>{q.question}</p>
                          <div className='mt-1 flex flex-wrap gap-3 text-slate-400'>
                            <span>
                              Đáp án đúng:{' '}
                              <b className='text-emerald-400'>
                                {q.correct_answer}
                              </b>
                            </span>
                            {q.explanation && <span>• {q.explanation}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. IMPORT FILE */}
              {builderTab === 'import' && (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-xl border border-[#262630] bg-[#14141a] p-4'>
                    <div>
                      <h4 className='text-xs font-bold text-white'>
                        Tải về file mẫu Excel/CSV
                      </h4>
                      <p className='text-xs text-slate-400'>
                        File mẫu chuẩn có sẵn cột câu hỏi, 4 đáp án và giải
                        thích.
                      </p>
                    </div>
                    <button
                      type='button'
                      onClick={handleDownloadSampleCsv}
                      className='inline-flex items-center gap-1.5 rounded-xl border border-[#333340] bg-[#1e1e26] px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white'
                    >
                      <Download className='size-3.5 text-purple-400' />
                      <span>Tải mẫu CSV</span>
                    </button>
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className='flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#333344] bg-[#14141a] p-8 text-center transition-all hover:border-purple-500/50'
                  >
                    <Upload className='size-8 text-purple-400' />
                    <div>
                      <p className='text-sm font-semibold text-white'>
                        Nhấn để chọn file câu hỏi (.csv hoặc .json)
                      </p>
                      <p className='mt-1 text-xs text-slate-500'>
                        Hệ thống tự động đọc và nhập câu hỏi vào đề
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='.csv,.json'
                      onChange={handleFileUpload}
                      className='hidden'
                    />
                  </div>

                  {parsedPreviewQuestions.length > 0 && (
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-xs font-bold text-emerald-400'>
                          Đã nạp {parsedPreviewQuestions.length} câu hỏi từ file
                        </span>
                        <button
                          type='button'
                          onClick={() =>
                            handleApplyParsedQuestions(parsedPreviewQuestions)
                          }
                          className='rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500'
                        >
                          Áp dụng vào bài tập
                        </button>
                      </div>

                      <div className='max-h-48 space-y-2 overflow-y-auto rounded-xl border border-[#262630] bg-[#14141a] p-4 text-xs'>
                        {parsedPreviewQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className='border-b border-[#1e1e24] pb-2 text-slate-300'
                          >
                            <b className='text-white'>Câu {idx + 1}:</b>{' '}
                            {q.question} ({q.options.length} lựa chọn, Đáp án:{' '}
                            <b className='text-emerald-400'>
                              {q.correct_answer}
                            </b>
                            )
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className='flex items-center justify-end gap-3 border-t border-[#1e1e24] pt-4'>
              <button
                type='button'
                onClick={() => setIsDialogOpen(false)}
                className='rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white'
              >
                Hủy
              </button>
              <button
                type='button'
                onClick={handleSaveExercise}
                disabled={actionLoading === 'save'}
                className='inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500 disabled:opacity-50'
              >
                {actionLoading === 'save' ? (
                  <>
                    <Loader2 className='size-3.5 animate-spin' />
                    <span>Đang lưu...</span>
                  </>
                ) : dialogMode === 'create' ? (
                  'Tạo bài tập'
                ) : (
                  'Lưu thay đổi'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: XEM BÀI LÀM HỌC SINH */}
      {selectedSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm'>
          <div className='max-h-[85vh] w-full max-w-2xl space-y-4 overflow-y-auto rounded-2xl border border-[#26262e] bg-[#0f0f13] p-6 text-slate-100 shadow-2xl'>
            <div className='flex items-center justify-between border-b border-[#1e1e24] pb-4'>
              <div>
                <h3 className='text-base font-bold text-white'>
                  {selectedSubmission.exercise_title}
                </h3>
                <span className='text-xs font-bold text-purple-400 uppercase'>
                  Cấp độ: {selectedSubmission.exercise_level}
                </span>
              </div>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold ${
                  selectedSubmission.percentage >= 60
                    ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border border-rose-500/20 bg-rose-500/10 text-rose-400'
                }`}
              >
                {selectedSubmission.score} /{' '}
                {selectedSubmission.total_questions} (
                {selectedSubmission.percentage}%)
              </span>
            </div>

            <div className='grid grid-cols-2 gap-4 rounded-xl border border-[#1e1e24] bg-[#14141a] p-4 text-xs'>
              <div>
                <span className='text-slate-400'>Học sinh:</span>{' '}
                <b className='text-white'>{selectedSubmission.user_email}</b>
              </div>
              <div>
                <span className='text-slate-400'>Thời gian làm:</span>{' '}
                <b className='text-white'>
                  {Math.floor(selectedSubmission.time_spent / 60)} phút{' '}
                  {selectedSubmission.time_spent % 60} giây
                </b>
              </div>
              <div>
                <span className='text-slate-400'>Ngày nộp:</span>{' '}
                <b className='text-white'>
                  {new Date(selectedSubmission.created_at).toLocaleString(
                    'vi-VN',
                  )}
                </b>
              </div>
            </div>

            <div>
              <h4 className='mb-3 text-xs font-bold tracking-wider text-slate-400 uppercase'>
                Đáp án học sinh đã chọn
              </h4>
              <div className='space-y-2 rounded-xl border border-[#1e1e24] bg-[#14141a] p-4'>
                {Object.entries(selectedSubmission.answers).map(
                  ([qKey, answer]) => (
                    <div
                      key={qKey}
                      className='flex items-center justify-between border-b border-[#1a1a20] pb-2 text-xs last:border-0 last:pb-0'
                    >
                      <span className='font-medium text-slate-300'>
                        Câu {qKey}:
                      </span>
                      <span className='rounded bg-[#1c1c24] px-2.5 py-0.5 font-mono font-bold text-purple-400'>
                        {answer}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className='flex justify-end border-t border-[#1e1e24] pt-4'>
              <button
                type='button'
                onClick={() => setSelectedSubmission(null)}
                className='rounded-xl border border-[#2d2d38] bg-[#16161c] px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white'
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
