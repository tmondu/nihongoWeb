'use client';

import React, { useState, useMemo } from 'react';
import {
  Gamepad2,
  Layers,
  RotateCw,
  CheckCircle2,
  XCircle,
  Award,
  Volume2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import type { ThamLessonDetail } from '../types';
import { playJapaneseSpeech } from '../utils/speech';
import { Link } from '@/core/i18n/routing';

interface PracticeTabProps {
  lessonDetail: ThamLessonDetail;
  onCompleteLesson?: () => void;
  isCompleted?: boolean;
}

export function PracticeTab({
  lessonDetail,
  onCompleteLesson,
  isCompleted = false,
}: PracticeTabProps) {
  const [practiceMode, setPracticeMode] = useState<'flashcard' | 'quiz'>(
    'flashcard',
  );

  // Flashcard state
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const vocabList = lessonDetail.vocabularies;

  // Generate interactive quiz questions from vocabulary & grammar
  const quizQuestions = useMemo(() => {
    if (!vocabList || vocabList.length === 0) return [];

    return vocabList.slice(0, 10).map((item, idx) => {
      const wordText = item.word_ja || item.kanji || item.kana;
      const readingText = item.reading_kana || item.kana;

      // 1 correct answer + 3 random distractors
      const distractors = vocabList
        .filter(v => v.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(v => v.meaning_vi);

      const options = [...distractors, item.meaning_vi].sort(
        () => 0.5 - Math.random(),
      );
      const correctOptionIndex = options.indexOf(item.meaning_vi);

      return {
        id: idx + 1,
        word: wordText,
        kana: readingText,
        romaji: item.romaji,
        options,
        correctIndex: correctOptionIndex,
      };
    });
  }, [vocabList]);

  // Flashcard controls
  const currentCard = vocabList[cardIndex];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex(prev => (prev + 1) % vocabList.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex(prev => (prev - 1 + vocabList.length) % vocabList.length);
  };

  // Quiz answer handler
  const handleSelectAnswer = (index: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(index);

    if (index === quizQuestions[quizIndex]?.correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className='space-y-8'>
      {/* Top Banner: Oni Escape Game Banner */}
      <div className='relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-amber-950/20 to-slate-900/60 p-5 shadow-sm sm:p-6'>
        <div className='relative z-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
          <div className='space-y-1'>
            <div className='inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/20 px-2.5 py-0.5 text-xs font-bold text-rose-400'>
              <Flame className='size-3.5' />
              <span>Chế độ Sinh Tồn</span>
            </div>
            <h3 className='text-lg font-extrabold tracking-tight text-(--main-color) sm:text-xl'>
              Luyện từ vựng cùng Oni Escape!
            </h3>
            <p className='max-w-xl text-xs text-(--secondary-color) sm:text-sm'>
              Thử thách phản xạ gõ tiếng Nhật và tiêu diệt quỷ Oni dựa trên vốn
              từ bài {lessonDetail.lesson_num}.
            </p>
          </div>

          <Link
            href='/oni-escape'
            className='inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:from-rose-500 hover:to-amber-500 hover:shadow-lg active:scale-95'
          >
            <Gamepad2 className='size-4' />
            <span>Chiến ngay</span>
            <ArrowRight className='size-4' />
          </Link>
        </div>
      </div>

      {/* Practice Mode Selector */}
      <div className='mx-auto flex max-w-sm items-center justify-center gap-2 rounded-xl border border-(--border-color) bg-(--card-color) p-1.5'>
        <button
          type='button'
          onClick={() => setPracticeMode('flashcard')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all sm:text-sm ${
            practiceMode === 'flashcard'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-(--secondary-color) hover:text-(--main-color)'
          }`}
        >
          <Layers className='size-4' />
          <span>Flashcards ({vocabList.length})</span>
        </button>

        <button
          type='button'
          onClick={() => setPracticeMode('quiz')}
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all sm:text-sm ${
            practiceMode === 'quiz'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'text-(--secondary-color) hover:text-(--main-color)'
          }`}
        >
          <Award className='size-4' />
          <span>Trắc nghiệm ({quizQuestions.length})</span>
        </button>
      </div>

      {/* Mode 1: Flashcards */}
      {practiceMode === 'flashcard' && currentCard && (
        <div className='mx-auto max-w-md space-y-4'>
          <div
            role='button'
            tabIndex={0}
            onClick={() => setIsFlipped(prev => !prev)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsFlipped(prev => !prev);
              }
            }}
            className='flex min-h-[260px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-(--border-color) bg-(--card-color) p-6 text-center shadow-sm transition-all select-none hover:border-sky-500/50 hover:shadow-md'
          >
            {!isFlipped ? (
              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-widest text-sky-500 uppercase'>
                  Mặt trước · Tiếng Nhật
                </div>
                <div className='font-japanese text-3xl font-extrabold text-(--main-color) sm:text-4xl'>
                  {currentCard.word_ja || currentCard.kanji || currentCard.kana}
                </div>
                {(currentCard.reading_kana || currentCard.kana) && (
                  <div className='font-japanese text-base text-(--secondary-color)'>
                    {currentCard.reading_kana || currentCard.kana}
                  </div>
                )}
                {currentCard.romaji && (
                  <div className='font-mono text-xs text-(--secondary-color)/70'>
                    {currentCard.romaji}
                  </div>
                )}
                <div className='flex items-center justify-center gap-1 pt-4 text-xs text-(--secondary-color)'>
                  <RotateCw className='size-3' />
                  <span>Chạm để lật xem nghĩa</span>
                </div>
              </div>
            ) : (
              <div className='space-y-3'>
                <div className='text-xs font-semibold tracking-widest text-emerald-500 uppercase'>
                  Mặt sau · Ý nghĩa
                </div>
                <div className='text-2xl font-bold text-(--main-color) sm:text-3xl'>
                  {currentCard.meaning_vi}
                </div>
                {currentCard.word_type && (
                  <div className='inline-block rounded-full bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold text-sky-600 dark:text-sky-400'>
                    {currentCard.word_type}
                  </div>
                )}
                {currentCard.example_ja && (
                  <div className='font-japanese pt-2 text-xs text-(--secondary-color)'>
                    {currentCard.example_ja}
                  </div>
                )}
                <div className='flex items-center justify-center gap-1 pt-4 text-xs text-(--secondary-color)'>
                  <RotateCw className='size-3' />
                  <span>Chạm để lật lại</span>
                </div>
              </div>
            )}
          </div>

          {/* Flashcard Navigation */}
          <div className='flex items-center justify-between'>
            <button
              type='button'
              onClick={handlePrevCard}
              className='cursor-pointer rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold transition-colors hover:bg-(--background-color) sm:text-sm'
            >
              Từ trước
            </button>

            <div className='flex items-center gap-3'>
              <button
                type='button'
                onClick={() => {
                  const speechWord =
                    currentCard.reading_kana ||
                    currentCard.kana ||
                    currentCard.word_ja ||
                    currentCard.kanji ||
                    '';
                  playJapaneseSpeech(speechWord);
                }}
                aria-label='Phát âm từ vựng'
                className='flex size-9 cursor-pointer items-center justify-center rounded-xl bg-sky-500/10 text-sky-600 transition-all hover:bg-sky-500 hover:text-white dark:text-sky-400'
              >
                <Volume2 className='size-4' />
              </button>
              <span className='text-xs font-semibold text-(--secondary-color)'>
                {cardIndex + 1} / {vocabList.length}
              </span>
            </div>

            <button
              type='button'
              onClick={handleNextCard}
              className='cursor-pointer rounded-xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold transition-colors hover:bg-(--background-color) sm:text-sm'
            >
              Từ tiếp
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Multiple Choice Quiz */}
      {practiceMode === 'quiz' && quizQuestions.length > 0 && (
        <div className='mx-auto max-w-lg'>
          {!quizFinished ? (
            <div className='space-y-6 rounded-2xl border border-(--border-color) bg-(--card-color) p-6 shadow-sm'>
              {/* Header Progress */}
              <div className='flex items-center justify-between text-xs font-bold text-(--secondary-color)'>
                <span>
                  Câu {quizIndex + 1} / {quizQuestions.length}
                </span>
                <span className='text-emerald-500'>Điểm: {score}</span>
              </div>

              {/* Question */}
              <div className='space-y-2 border-y border-(--border-color)/50 py-4 text-center'>
                <div className='text-xs font-semibold tracking-wider text-sky-500 uppercase'>
                  Chọn nghĩa đúng của từ:
                </div>
                <div className='font-japanese text-3xl font-extrabold text-(--main-color)'>
                  {quizQuestions[quizIndex].word}
                </div>
                {quizQuestions[quizIndex].kana && (
                  <div className='font-japanese text-sm text-(--secondary-color)'>
                    {quizQuestions[quizIndex].kana}
                  </div>
                )}
              </div>

              {/* Options */}
              <div className='space-y-2.5'>
                {quizQuestions[quizIndex].options.map((option, optIdx) => {
                  const isChosen = selectedAnswer === optIdx;
                  const isCorrect =
                    optIdx === quizQuestions[quizIndex].correctIndex;
                  const showResult = selectedAnswer !== null;

                  let buttonStyle =
                    'border-(--border-color) bg-(--background-color) text-(--main-color) hover:border-sky-500';
                  if (showResult) {
                    if (isCorrect) {
                      buttonStyle =
                        'border-emerald-500 bg-emerald-500/15 text-emerald-500 font-bold';
                    } else if (isChosen) {
                      buttonStyle =
                        'border-rose-500 bg-rose-500/15 text-rose-500 font-bold';
                    } else {
                      buttonStyle =
                        'border-(--border-color) bg-(--background-color)/40 text-(--secondary-color) opacity-50';
                    }
                  }

                  return (
                    <button
                      key={option}
                      type='button'
                      disabled={showResult}
                      onClick={() => handleSelectAnswer(optIdx)}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-3.5 text-left text-sm font-medium transition-all ${buttonStyle}`}
                    >
                      <span>{option}</span>
                      {showResult && isCorrect && (
                        <CheckCircle2 className='size-4 shrink-0 text-emerald-500' />
                      )}
                      {showResult && isChosen && !isCorrect && (
                        <XCircle className='size-4 shrink-0 text-rose-500' />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Question Button */}
              {selectedAnswer !== null && (
                <button
                  type='button'
                  onClick={handleNextQuestion}
                  className='w-full cursor-pointer rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-sky-600'
                >
                  {quizIndex < quizQuestions.length - 1
                    ? 'Câu tiếp theo'
                    : 'Xem kết quả'}
                </button>
              )}
            </div>
          ) : (
            <div className='space-y-6 rounded-2xl border border-(--border-color) bg-(--card-color) p-8 text-center shadow-sm'>
              <div className='mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500'>
                <Award className='size-8' />
              </div>
              <div className='space-y-1'>
                <h4 className='text-xl font-bold text-(--main-color)'>
                  Hoàn thành bài luyện tập!
                </h4>
                <p className='text-sm text-(--secondary-color)'>
                  Bạn đã trả lời đúng {score} / {quizQuestions.length} câu hỏi.
                </p>
              </div>

              <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
                <button
                  type='button'
                  onClick={handleRestartQuiz}
                  className='w-full cursor-pointer rounded-xl border border-(--border-color) px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-(--background-color) sm:w-auto'
                >
                  Luyện lại
                </button>

                {onCompleteLesson && !isCompleted && (
                  <button
                    type='button'
                    onClick={onCompleteLesson}
                    className='w-full cursor-pointer rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 sm:w-auto'
                  >
                    Đánh dấu đã học xong bài này
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
