'use client';

import React from 'react';
import {
  CheckCircle2,
  Bookmark,
  Lightbulb,
  Star,
  FileText,
} from 'lucide-react';
import { SolutionExam } from '../data/solutionsData';
import { ExerciseWatermark } from '@/features/Exercises/components/ExerciseWatermark';

interface SolutionA4PaperProps {
  exam: SolutionExam;
  userAnswers?: Record<number, string>;
  onSelectAnswer?: (globalNum: number, option: string) => void;
  filterWrongOnly?: boolean;
}

export const SolutionA4Paper: React.FC<SolutionA4PaperProps> = ({
  exam,
  userAnswers = {},
  onSelectAnswer,
  filterWrongOnly = false,
}) => {
  const scrollToQuestion = (globalNum: number) => {
    const el = document.getElementById(`solution-q-${globalNum}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-amber-400', 'transition-all');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-amber-400');
      }, 2000);
    }
  };

  const filteredQuestions = filterWrongOnly
    ? exam.questions.filter(q => {
        const userAns = userAnswers[q.globalNumber];
        return userAns && !q.correctOption.includes(userAns);
      })
    : exam.questions;

  return (
    <div className='relative mx-auto w-full max-w-[860px] space-y-8 print:max-w-none print:space-y-4'>
      {/* ========================================================================= */}
      {/* TRANG A4 BÌA & BẢNG ĐÁP ÁN NHANH (PAGE 1)                                */}
      {/* ========================================================================= */}
      <div className='relative min-h-[1100px] overflow-hidden rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xl sm:p-10 md:p-12 print:min-h-0 print:rounded-none print:border-none print:bg-white print:p-6 print:shadow-none'>
        {/* Authentic Watermark Mascot from /public/images/exercise-watermark.png */}
        <ExerciseWatermark
          imageSrc={exam.watermarkImage}
          text='Phan Thắm SS'
          subText='MINATO NIHONGO'
        />

        <div className='relative z-10'>
          {/* Header Organization Bar */}
          <div className='flex items-center justify-between border-b-2 border-(--border-color) pb-3 print:border-black'>
            <div className='flex items-center gap-2.5'>
              <div className='flex size-9 items-center justify-center rounded-lg bg-(--main-color) font-bold text-(--background-color) shadow-sm'>
                SS
              </div>
              <div>
                <h3 className='font-bold text-(--main-color) print:text-black'>
                  {exam.author}
                </h3>
                <p className='text-xs text-(--secondary-color) print:text-slate-700'>
                  Khóa luyện thi tiếng Nhật JLPT {exam.level.toUpperCase()}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <span className='inline-block rounded-full border border-(--border-color) bg-(--background-color) px-3 py-1 text-xs font-black tracking-wider text-(--main-color) uppercase print:border print:border-slate-400'>
                {exam.level.toUpperCase()} • ĐỀ SỐ {exam.examNumber}
                {exam.sessionNumber ? ` • BÀI ${exam.sessionNumber}` : ''}
              </span>
            </div>
          </div>

          {/* Title Banner */}
          <div className='my-8 text-center sm:my-10'>
            <h1 className='font-sans text-2xl font-black tracking-wide text-(--main-color) sm:text-3xl print:text-2xl print:text-black'>
              {exam.title}
            </h1>
            <p className='mt-2 font-bold tracking-widest text-(--main-color) uppercase sm:text-lg print:text-emerald-800'>
              {exam.subtitle}
            </p>
            <div className='mx-auto mt-3 h-1 w-24 rounded-full bg-(--main-color)' />
          </div>

          {/* BẢNG ĐÁP ÁN TỔNG HỢP NHANH (Quick Answer Key Grid) */}
          <div className='mb-10 rounded-xl border-2 border-(--border-color) bg-(--background-color)/60 p-4 sm:p-6 print:border-black print:bg-white'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='flex items-center gap-2 text-sm font-black tracking-wider text-(--main-color) uppercase sm:text-base print:text-black'>
                <Bookmark className='size-4 text-(--main-color)' />
                <span>BẢNG ĐÁP ÁN TỔNG HỢP NHANH</span>
              </h3>
              <span className='text-xs text-(--secondary-color) italic print:hidden'>
                (Bấm vào câu bất kỳ để xem giải thích chi tiết)
              </span>
            </div>

            {exam.sections && exam.sections.length > 0 ? (
              <div className='space-y-4'>
                {exam.sections.map(section => (
                  <div key={`section-quick-${section.sectionNumber}`}>
                    <div className='mb-1.5 flex items-center justify-between text-xs font-bold text-(--main-color) print:text-black'>
                      <span>
                        • {section.sectionTitle} (Câu {section.questionRange}):
                      </span>
                    </div>
                    <div className='grid grid-cols-5 gap-1 text-center sm:grid-cols-9 sm:gap-2 md:grid-cols-10'>
                      {section.questions.map(item => {
                        const userAns = userAnswers[item.globalNumber];
                        const isCorrect = userAns
                          ? item.correctOption.includes(userAns)
                          : null;

                        return (
                          <button
                            key={`quick-sec-${section.sectionNumber}-q-${item.questionNumber}-${item.globalNumber}`}
                            type='button'
                            onClick={() => scrollToQuestion(item.globalNumber)}
                            className={`group flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all hover:scale-105 ${
                              isCorrect === true
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                : isCorrect === false
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                  : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) print:border-slate-400'
                            }`}
                            title={`Xem chi tiết Câu ${item.questionNumber} (${section.sectionTitle})`}
                          >
                            <span className='text-[10px] font-semibold text-(--secondary-color) group-hover:text-(--main-color) sm:text-xs'>
                              C{item.questionNumber}
                            </span>
                            <span className='font-japanese text-xs font-black text-(--main-color) sm:text-sm print:text-black'>
                              {item.correctOption}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : exam.quickAnswerSummary ? (
              <>
                {/* Phần 1: Từ vựng (Câu 1 - 9) */}
                <div className='mb-4'>
                  <div className='mb-1.5 text-xs font-bold text-(--main-color) print:text-black'>
                    • Từ vựng (問題②):
                  </div>
                  <div className='grid grid-cols-9 gap-1 text-center sm:gap-2'>
                    {exam.quickAnswerSummary.vocab.map(item => {
                      const userAns = userAnswers[item.qNum];
                      const isCorrect = userAns
                        ? userAns === item.answer
                        : null;

                      return (
                        <button
                          key={`quick-vocab-${item.qNum}`}
                          type='button'
                          onClick={() => scrollToQuestion(item.qNum)}
                          className={`group flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all hover:scale-105 ${
                            isCorrect === true
                              ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                              : isCorrect === false
                                ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) print:border-slate-400'
                          }`}
                          title={`Xem chi tiết Câu ${item.qNum} (Từ vựng)`}
                        >
                          <span className='text-[10px] font-semibold text-(--secondary-color) group-hover:text-(--main-color) sm:text-xs'>
                            C{item.qNum}
                          </span>
                          <span className='font-japanese text-sm font-black text-(--main-color) sm:text-base print:text-black'>
                            {item.answer}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Phần 2: Ngữ pháp (Câu 1 - 26) */}
                <div>
                  <div className='mb-1.5 text-xs font-bold text-(--main-color) print:text-black'>
                    • Ngữ pháp & Điền đoạn văn (Câu 1 - 26):
                  </div>
                  <div className='space-y-1.5 sm:space-y-2'>
                    {/* Hàng 1: Câu 1 - 9 */}
                    <div className='grid grid-cols-9 gap-1 text-center sm:gap-2'>
                      {exam.quickAnswerSummary.grammar.slice(0, 9).map(item => {
                        const globalIdx = 9 + item.qNum;
                        const userAns = userAnswers[globalIdx];
                        const isCorrect = userAns
                          ? item.answer.includes(userAns)
                          : null;

                        return (
                          <button
                            key={`quick-gram-1-${item.qNum}`}
                            type='button'
                            onClick={() => scrollToQuestion(globalIdx)}
                            className={`group flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all hover:scale-105 ${
                              isCorrect === true
                                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                : isCorrect === false
                                  ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                  : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) print:border-slate-400'
                            }`}
                            title={`Xem chi tiết Câu ${item.qNum} (Ngữ pháp)`}
                          >
                            <span className='text-[10px] font-semibold text-(--secondary-color) group-hover:text-(--main-color) sm:text-xs'>
                              C{item.qNum}
                            </span>
                            <span className='font-japanese text-sm font-black text-(--main-color) sm:text-base print:text-black'>
                              {item.answer}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Hàng 2: Câu 10 - 18 */}
                    <div className='grid grid-cols-9 gap-1 text-center sm:gap-2'>
                      {exam.quickAnswerSummary.grammar
                        .slice(9, 18)
                        .map(item => {
                          const globalIdx = 9 + item.qNum;
                          const userAns = userAnswers[globalIdx];
                          const isCorrect = userAns
                            ? item.answer.includes(userAns)
                            : null;

                          return (
                            <button
                              key={`quick-gram-2-${item.qNum}`}
                              type='button'
                              onClick={() => scrollToQuestion(globalIdx)}
                              className={`group flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all hover:scale-105 ${
                                isCorrect === true
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                  : isCorrect === false
                                    ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                    : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) print:border-slate-400'
                              }`}
                              title={`Xem chi tiết Câu ${item.qNum} (Ngữ pháp)`}
                            >
                              <span className='text-[10px] font-semibold text-(--secondary-color) group-hover:text-(--main-color) sm:text-xs'>
                                C{item.qNum}
                              </span>
                              <span className='font-japanese text-sm font-black text-(--main-color) sm:text-base print:text-black'>
                                {item.answer}
                              </span>
                            </button>
                          );
                        })}
                    </div>

                    {/* Hàng 3: Câu 19 - 26 */}
                    <div className='grid grid-cols-8 gap-1 text-center sm:gap-2'>
                      {exam.quickAnswerSummary.grammar
                        .slice(18, 26)
                        .map(item => {
                          const globalIdx = 9 + item.qNum;
                          const userAns = userAnswers[globalIdx];
                          const isCorrect = userAns
                            ? item.answer.includes(userAns)
                            : null;

                          return (
                            <button
                              key={`quick-gram-3-${item.qNum}`}
                              type='button'
                              onClick={() => scrollToQuestion(globalIdx)}
                              className={`group flex flex-col items-center justify-center rounded-lg border py-1.5 transition-all hover:scale-105 ${
                                isCorrect === true
                                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-600 dark:text-emerald-300'
                                  : isCorrect === false
                                    ? 'border-rose-500 bg-rose-500/20 text-rose-600 dark:text-rose-300'
                                    : 'border-(--border-color) bg-(--card-color) hover:border-(--main-color) print:border-slate-400'
                              }`}
                              title={`Xem chi tiết Câu ${item.qNum}`}
                            >
                              <span className='text-[10px] font-semibold text-(--secondary-color) group-hover:text-(--main-color) sm:text-xs'>
                                C{item.qNum}
                              </span>
                              <span className='font-japanese text-xs font-black text-(--main-color) sm:text-sm print:text-black'>
                                {item.answer}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>

          {/* CHÂN TRANG TRANG 1 */}
          <div className='mt-16 flex items-center justify-between border-t border-(--border-color) pt-3 text-xs text-(--secondary-color) print:mt-8 print:border-black print:text-black'>
            <span>Tài liệu được biên soạn bởi Phan Thắm SS</span>
            <span>Trang 1 / {exam.totalPages}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DANH SÁCH CHI TIẾT TỪNG CÂU HỎI (A4 SHEETS CONTINUOUS)                     */}
      {/* ========================================================================= */}
      <div className='space-y-6 sm:space-y-8'>
        {filteredQuestions.map(q => {
          const userAns = userAnswers[q.globalNumber];
          const isUserCorrect = userAns
            ? q.correctOption.includes(userAns)
            : null;

          return (
            <div
              key={q.id}
              id={`solution-q-${q.globalNumber}`}
              className='relative overflow-hidden rounded-2xl border border-(--border-color) bg-(--card-color) p-5 shadow-lg sm:p-7 print:mb-4 print:break-inside-avoid print:rounded-none print:border-none print:bg-white print:p-4 print:shadow-none'
            >
              {/* Watermark in each card for authentic feel */}
              <div className='pointer-events-none absolute top-4 right-4 text-(--main-color)/5 opacity-40 select-none print:text-slate-200'>
                <span className='font-japanese text-5xl font-black'>
                  {q.partId === 'kanji'
                    ? '漢字'
                    : q.partId === 'vocab'
                      ? '語彙'
                      : q.partId === 'similar'
                        ? '類義'
                        : q.partId === 'star'
                          ? '並替'
                          : q.partId === 'passage'
                            ? '読解'
                            : '文法'}
                </span>
              </div>

              <div className='relative z-10'>
                {/* Header câu hỏi */}
                <div className='mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-(--border-color)/60 pb-2.5'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center justify-center rounded-lg bg-(--main-color) px-2.5 py-1 text-xs font-black text-(--background-color)'>
                      Câu {q.questionNumber}
                    </span>
                    {(q.sessionNumber || exam.sessionNumber) && (
                      <span className='inline-flex items-center justify-center rounded-md border border-(--border-color) bg-(--background-color) px-2 py-0.5 text-[11px] font-bold text-(--main-color)'>
                        Bài {q.sessionNumber || exam.sessionNumber}
                      </span>
                    )}
                    <span className='text-xs font-semibold text-(--secondary-color)'>
                      ({q.sectionTitle || q.partTitle.split('(')[0].trim()})
                    </span>
                    {q.globalNumber !== q.questionNumber && (
                      <span className='text-[11px] text-(--secondary-color)/80 italic'>
                        (STT {q.globalNumber})
                      </span>
                    )}
                  </div>

                  {/* Interactive Options ① ② ③ ④ selector for students */}
                  {onSelectAnswer && (
                    <div className='flex items-center gap-1.5 print:hidden'>
                      <span className='text-xs font-medium text-(--secondary-color)'>
                        Bạn chọn:
                      </span>
                      {['①', '②', '③', '④'].map(opt => (
                        <button
                          key={opt}
                          type='button'
                          onClick={() => onSelectAnswer(q.globalNumber, opt)}
                          className={`flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all ${
                            userAns === opt
                              ? isUserCorrect
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
                                : 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-400/40'
                              : 'border border-(--border-color) bg-(--background-color) text-(--secondary-color) hover:border-(--main-color) hover:text-(--main-color)'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Đề bài tiếng Nhật */}
                <div className='mb-4 rounded-xl border border-(--border-color)/70 bg-(--background-color)/60 p-3.5 sm:p-4 print:bg-slate-50'>
                  <p className='font-japanese text-base font-bold text-(--main-color) sm:text-lg print:text-black'>
                    {q.questionText}
                  </p>
                </div>

                {/* Đáp án đúng & Hán Việt & Dịch nghĩa */}
                <div className='mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                  <div className='flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-emerald-600 dark:text-emerald-400 print:border print:border-emerald-700 print:bg-emerald-50'>
                    <CheckCircle2 className='size-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                    <div>
                      <span className='text-xs font-semibold tracking-wider text-emerald-600 uppercase dark:text-emerald-400'>
                        Đáp án đúng:
                      </span>
                      <p className='font-japanese text-base font-black'>
                        {q.correctOption} – {q.correctText}
                      </p>
                    </div>
                  </div>

                  {q.hanviet && (
                    <div className='flex items-center gap-2 rounded-xl border border-(--border-color) bg-(--background-color)/60 px-3.5 py-2.5 text-(--main-color) print:border print:border-amber-600 print:bg-amber-50'>
                      <FileText className='size-5 shrink-0 text-amber-500' />
                      <div>
                        <span className='text-xs font-semibold tracking-wider text-(--secondary-color) uppercase'>
                          Âm Hán-Việt:
                        </span>
                        <p className='font-sans text-sm font-bold text-(--main-color)'>
                          {q.hanviet}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dịch nghĩa */}
                <div className='mb-4 text-sm text-(--main-color) print:text-black'>
                  <span className='font-bold text-(--main-color) print:text-black'>
                    Dịch nghĩa:{' '}
                  </span>
                  <span className='font-vietnamese text-(--main-color)/90'>
                    {q.meaning}
                  </span>
                </div>

                {/* Phần dành riêng cho Star questions (Sắp xếp câu) */}
                {q.starOrder && (
                  <div className='mb-4 rounded-xl border border-(--main-color)/25 bg-(--main-color)/5 p-3.5 text-xs text-(--main-color)'>
                    <div className='flex items-center gap-1.5 font-bold text-(--main-color)'>
                      <Star className='size-4' />
                      <span>Thứ tự đúng: {q.starOrder}</span>
                    </div>
                    {q.fullSentence && (
                      <p className='font-japanese mt-1 text-sm font-bold text-(--main-color) print:text-black'>
                        Câu hoàn chỉnh: {q.fullSentence}
                      </p>
                    )}
                    {q.starPositions && q.starPositions.length > 0 && (
                      <div className='mt-2 space-y-0.5 border-t border-(--border-color)/60 pt-2'>
                        <span className='font-semibold text-(--main-color)'>
                          Vị trí các lựa chọn:
                        </span>
                        <ul className='list-inside list-disc space-y-0.5 pl-1 text-(--secondary-color)'>
                          {q.starPositions.map((pos, pIdx) => (
                            <li key={pIdx}>{pos}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Giải thích chi tiết */}
                {q.explanation && (
                  <div className='mb-4 rounded-xl border border-(--border-color)/60 bg-(--background-color)/50 p-3.5 text-sm text-(--main-color) print:bg-slate-50'>
                    <p className='mb-1 font-bold text-(--main-color) print:text-black'>
                      Giải thích:
                    </p>
                    <p className='font-vietnamese leading-relaxed whitespace-pre-line text-(--main-color)/90'>
                      {q.explanation}
                    </p>
                    {q.conclusion && (
                      <p className='mt-2 font-bold text-(--main-color)'>
                        {q.conclusion}
                      </p>
                    )}
                  </div>
                )}

                {/* Phân tích các đáp án sai */}
                {q.wrongOptions && q.wrongOptions.length > 0 && (
                  <div className='mb-4 space-y-1.5 rounded-xl border border-rose-500/25 bg-rose-500/5 p-3.5 print:border-slate-300'>
                    <span className='text-xs font-bold tracking-wider text-rose-500 uppercase'>
                      Các đáp án sai:
                    </span>
                    <ul className='space-y-1.5 text-xs text-(--main-color) sm:text-sm'>
                      {q.wrongOptions.map((w, wIdx) => (
                        <li
                          key={wIdx}
                          className='flex items-start gap-1.5 leading-relaxed'
                        >
                          <span className='font-bold text-rose-500'>•</span>
                          <span>
                            <strong className='font-japanese text-(--main-color) print:text-black'>
                              {w.option}
                            </strong>{' '}
                            <span className='text-(--secondary-color)'>
                              {w.text}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lưu ý / Ghi nhớ */}
                {q.note && (
                  <div className='flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 sm:text-sm dark:text-amber-400 print:border-amber-400 print:bg-amber-50'>
                    <Lightbulb className='size-4.5 shrink-0 text-amber-500' />
                    <div>
                      <span className='font-bold text-amber-600 dark:text-amber-300'>
                        Ghi nhớ:{' '}
                      </span>
                      <span className='font-vietnamese text-(--main-color)'>
                        {q.note}
                      </span>
                    </div>
                  </div>
                )}

                {/* Chân trang mỗi card */}
                <div className='mt-5 flex items-center justify-between border-t border-(--border-color)/60 pt-2 text-[11px] text-(--secondary-color)'>
                  <span>Phan Thắm SS - Minato</span>
                  <span>Câu {q.globalNumber} / 35</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* ĐOẠN VĂN HOÀN CHỈNH BÀI 4 (PASSAGE FULL CONTEXT)                            */}
      {/* ========================================================================= */}
      {exam.passageSection && (
        <div className='rounded-2xl border-2 border-(--border-color) bg-(--card-color) p-6 shadow-xl print:border-black print:p-4'>
          <h3 className='mb-3 text-base font-black tracking-wide text-(--main-color) uppercase sm:text-lg print:text-black'>
            📖 ĐOẠN VĂN HOÀN CHỈNH{' '}
            {exam.examNumber === 2 ? '(PHẦN ĐIỀN ĐOẠN VĂN)' : '(BÀI 4)'}
          </h3>
          <div className='space-y-4'>
            <div className='rounded-xl border border-(--border-color) bg-(--background-color)/60 p-4 text-(--main-color) print:bg-slate-50'>
              <p className='font-japanese text-base leading-relaxed sm:text-lg'>
                {exam.passageSection.fullText}
              </p>
            </div>
            <div>
              <span className='text-xs font-bold tracking-wider text-(--secondary-color) uppercase'>
                Bản dịch nghĩa tiếng Việt:
              </span>
              <p className='font-vietnamese mt-1 text-sm leading-relaxed text-(--main-color) sm:text-base print:text-black'>
                {exam.passageSection.translation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionA4Paper;
