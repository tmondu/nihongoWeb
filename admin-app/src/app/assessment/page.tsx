'use client';

import React, { useState, useEffect } from 'react';

interface SubmissionSummary {
  id: number;
  user_id: number;
  test_title: string;
  student_name: string | null;
  student_email: string;
  student_sbd: string | null;
  mcq_status: string;
  essay_status: string;
  overall_status: string;
  mcq_score: number;
  essay_score: number;
  total_score: number;
  mcq_time_spent_seconds?: number;
  essay_time_spent_seconds?: number;
  completed_at: string | null;
  created_at: string;
}

function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}p ${s}s` : `${m}p`;
}

interface QuestionGradeDetail {
  orderNum: number;
  isCorrect: boolean;
  userAnswer?: string;
  correctAnswer?: string;
  acceptableAnswers?: string[];
  userHanViet?: string;
  userMeaning?: string;
  correctHanViet?: string;
  meaningVi?: string;
  explanation?: string;
}

interface SubmissionDetail extends SubmissionSummary {
  answers: Record<number, unknown>;
  grading_details: Record<number, QuestionGradeDetail>;
}

export default function AdminAssessmentPage() {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState<1 | 2>(1);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('query', searchQuery.trim());
      const res = await fetch(
        `/api/assessment/submissions?${params.toString()}`,
      );
      if (!res.ok) throw new Error('Lỗi tải danh sách bài thi');
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchSubmissions();
  }, [searchQuery]);

  const handleOpenDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await fetch(`/api/assessment/submissions?id=${id}`);
      if (!res.ok) throw new Error('Lỗi tải chi tiết bài thi');
      const data = await res.json();
      setSelectedSubmission(data.submission);
      setDetailTab(1);
    } catch (err) {
      console.error(err);
      alert('Không thể tải chi tiết bài thi.');
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      {/* Header */}
      <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>
            Bài kiểm tra đầu vào
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Theo dõi kết quả làm bài và điểm số của học viên.
          </p>
        </div>

        {/* Search */}
        <div className='flex items-center gap-3'>
          <input
            type='text'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Tìm kiếm học viên...'
            className='w-64 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs text-white transition-colors outline-none focus:border-blue-500'
          />
        </div>
      </div>

      {/* Submissions Table */}
      <div className='overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/30'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead>
              <tr className='border-b border-slate-800 bg-slate-900/60 font-semibold text-slate-400'>
                <th className='px-5 py-3.5'>Học viên</th>
                <th className='px-5 py-3.5'>Email / SBD</th>
                <th className='px-5 py-3.5'>Trạng thái</th>
                <th className='px-5 py-3.5 text-center'>Điểm Trắc nghiệm</th>
                <th className='px-5 py-3.5 text-center'>Điểm Tự luận</th>
                <th className='px-5 py-3.5 text-center'>Tổng điểm</th>
                <th className='px-5 py-3.5 text-center'>Thời gian làm</th>
                <th className='px-5 py-3.5'>Ngày hoàn thành</th>
                <th className='px-5 py-3.5 text-right'>Thao tác</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-800/60'>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-5 py-8 text-center text-slate-500'
                  >
                    Đang tải dữ liệu bài thi...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-5 py-8 text-center text-slate-500'
                  >
                    Chưa có học viên nào nộp bài kiểm tra.
                  </td>
                </tr>
              ) : (
                submissions.map(sub => (
                  <tr
                    key={sub.id}
                    className='transition-colors hover:bg-slate-800/30'
                  >
                    <td className='px-5 py-4 font-semibold text-white'>
                      {sub.student_name || 'Học viên'}
                    </td>
                    <td className='px-5 py-4 text-slate-400'>
                      <div>{sub.student_email}</div>
                      {sub.student_sbd && (
                        <div className='text-[11px] text-slate-500'>
                          SBD: {sub.student_sbd}
                        </div>
                      )}
                    </td>
                    <td className='px-5 py-4'>
                      <div className='flex flex-col gap-1'>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            sub.mcq_status === 'completed'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Trắc nghiệm:{' '}
                          {sub.mcq_status === 'completed'
                            ? 'Xong'
                            : 'Chưa xong'}
                        </span>
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                            sub.essay_status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          Tự luận:{' '}
                          {sub.essay_status === 'completed'
                            ? 'Xong'
                            : 'Chưa xong'}
                        </span>
                      </div>
                    </td>
                    <td className='px-5 py-4 text-center font-mono font-bold text-blue-400'>
                      {sub.mcq_score}/100
                    </td>
                    <td className='px-5 py-4 text-center font-mono font-bold text-emerald-400'>
                      {sub.essay_score}/100
                    </td>
                    <td className='px-5 py-4 text-center font-mono text-sm font-bold text-white'>
                      {sub.total_score}/200
                    </td>
                    <td className='px-5 py-4 text-center font-mono text-xs'>
                      <div className='font-bold text-white'>
                        {formatDuration(
                          (sub.mcq_time_spent_seconds || 0) +
                            (sub.essay_time_spent_seconds || 0),
                        )}
                      </div>
                      <div className='text-[10px] text-slate-500'>
                        TN: {formatDuration(sub.mcq_time_spent_seconds)} | TL:{' '}
                        {formatDuration(sub.essay_time_spent_seconds)}
                      </div>
                    </td>
                    <td className='px-5 py-4 text-slate-400'>
                      {sub.completed_at
                        ? new Date(sub.completed_at).toLocaleString('vi-VN')
                        : new Date(sub.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className='px-5 py-4 text-right'>
                      <button
                        type='button'
                        onClick={() => handleOpenDetail(sub.id)}
                        className='rounded-lg bg-blue-600/15 px-3 py-1.5 text-xs font-semibold text-blue-400 transition-colors hover:bg-blue-600/25 active:scale-95'
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs'>
          <div className='flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl'>
            {/* Modal Header */}
            <div className='flex items-center justify-between border-b border-slate-800 px-6 py-4'>
              <div>
                <h2 className='text-lg font-bold text-white'>
                  Chi tiết bài thi — {selectedSubmission.student_name}
                </h2>
                <div className='mt-1 flex items-center gap-3 text-xs text-slate-400'>
                  <span>Email: {selectedSubmission.student_email}</span>
                  <span>•</span>
                  <span>
                    Tổng điểm:{' '}
                    <strong className='text-white'>
                      {selectedSubmission.total_score}/200
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Trắc nghiệm: {selectedSubmission.mcq_score}/100 | Tự luận:{' '}
                    {selectedSubmission.essay_score}/100
                  </span>
                  <span>•</span>
                  <span>
                    Thời gian:{' '}
                    <strong className='text-white'>
                      {formatDuration(
                        (selectedSubmission.mcq_time_spent_seconds || 0) +
                          (selectedSubmission.essay_time_spent_seconds || 0),
                      )}
                    </strong>{' '}
                    (TN:{' '}
                    {formatDuration(selectedSubmission.mcq_time_spent_seconds)}{' '}
                    | TL:{' '}
                    {formatDuration(
                      selectedSubmission.essay_time_spent_seconds,
                    )}
                    )
                  </span>
                </div>
              </div>
              <button
                type='button'
                onClick={() => setSelectedSubmission(null)}
                className='rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition-colors hover:bg-slate-800'
              >
                Đóng
              </button>
            </div>

            {/* Modal Tabs */}
            <div className='flex border-b border-slate-800 px-6 pt-2'>
              <button
                type='button'
                onClick={() => setDetailTab(1)}
                className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                  detailTab === 1
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Phần 1: Trắc nghiệm (1 – 100) • {selectedSubmission.mcq_score}
                /100 điểm
              </button>
              <button
                type='button'
                onClick={() => setDetailTab(2)}
                className={`border-b-2 px-4 py-2.5 text-xs font-bold transition-colors ${
                  detailTab === 2
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                Phần 2: Tự luận (101 – 200) • {selectedSubmission.essay_score}
                /100 điểm
              </button>
            </div>

            {/* Questions Grading List */}
            <div className='flex-1 overflow-y-auto p-6'>
              {detailLoading ? (
                <div className='py-12 text-center text-slate-500'>
                  Đang tải chi tiết...
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {Array.from({ length: 100 }, (_, i) =>
                    detailTab === 1 ? i + 1 : i + 101,
                  ).map(num => {
                    const detail = selectedSubmission.grading_details?.[num];
                    const isCorrect = detail?.isCorrect ?? false;

                    return (
                      <div
                        key={num}
                        className={`rounded-xl border p-3.5 text-xs leading-relaxed ${
                          isCorrect
                            ? 'border-emerald-500/25 bg-emerald-500/5'
                            : 'border-rose-500/25 bg-rose-500/5'
                        }`}
                      >
                        <div className='mb-2 flex items-center justify-between'>
                          <span className='font-bold text-white'>
                            Câu {num}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {isCorrect ? 'Đúng (+1đ)' : 'Sai (0đ)'}
                          </span>
                        </div>

                        {detailTab === 1 ? (
                          /* MCQ details */
                          <div className='flex flex-col gap-1'>
                            <div className='text-slate-400'>
                              Học sinh chọn:{' '}
                              <strong className='text-white'>
                                {detail?.userAnswer || '(Trống)'}
                              </strong>
                            </div>
                            <div className='text-slate-400'>
                              Đáp án chuẩn:{' '}
                              <strong className='text-emerald-400'>
                                {detail?.correctAnswer}
                              </strong>
                            </div>
                            {detail?.explanation && (
                              <div className='mt-1 text-[11px] text-slate-500'>
                                {detail.explanation}
                              </div>
                            )}
                          </div>
                        ) : num <= 180 ? (
                          /* Essay Hiragana details */
                          <div className='flex flex-col gap-1'>
                            <div className='text-slate-400'>
                              Học sinh nhập:{' '}
                              <strong className='text-white'>
                                {detail?.userAnswer || '(Trống)'}
                              </strong>
                            </div>
                            <div className='text-slate-400'>
                              Đáp án chuẩn:{' '}
                              <strong className='text-emerald-400'>
                                {detail?.correctAnswer}
                              </strong>
                            </div>
                            {detail?.explanation && (
                              <div className='mt-1 text-[11px] text-slate-500'>
                                {detail.explanation}
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Essay Kanji meaning details (181-200) */
                          <div className='flex flex-col gap-1'>
                            <div className='text-slate-400'>
                              Âm Hán Việt học sinh gõ:{' '}
                              <strong className='text-white'>
                                {detail?.userHanViet || '(Trống)'}
                              </strong>
                            </div>
                            <div className='text-slate-400'>
                              Hán Việt chuẩn:{' '}
                              <strong className='text-emerald-400'>
                                {detail?.correctHanViet}
                              </strong>
                            </div>
                            <div className='text-slate-400'>
                              Nghĩa tiếng Việt học sinh gõ:{' '}
                              <span className='text-slate-200 italic'>
                                {detail?.userMeaning || '(Trống)'}
                              </span>
                            </div>
                            <div className='text-slate-400'>
                              Nghĩa tham khảo chuẩn:{' '}
                              <span className='text-emerald-300'>
                                {detail?.meaningVi}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex justify-end border-t border-slate-800 px-6 py-3'>
              <button
                type='button'
                onClick={() => setSelectedSubmission(null)}
                className='rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-blue-500'
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
