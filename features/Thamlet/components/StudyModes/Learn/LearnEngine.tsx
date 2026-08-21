'use client';

import React, { useState, useEffect } from 'react';
import { Deck, FlashCard } from '../../../types';
import {
  ArrowLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Volume2,
} from 'lucide-react';
import { Link } from '@/core/i18n/routing';
import {
  useClick,
  useCorrect,
  useError,
} from '@/shared/hooks/generic/useAudio';
import { useThamletStore } from '../../../store/useThamletStore';
import clsx from 'clsx';

interface Question {
  card: FlashCard;
  prompt: string;
  correctAnswer: string;
  options: string[];
}

function buildQuestion(card: FlashCard, allCards: FlashCard[]): Question {
  const correctAnswer = card.definition;
  const otherDefs = allCards
    .filter(c => c.id !== card.id)
    .map(c => c.definition);

  const shuffledOthers = [...otherDefs].sort(() => Math.random() - 0.5);
  const wrongOptions = shuffledOthers.slice(0, 3);
  const options = [correctAnswer, ...wrongOptions].sort(
    () => Math.random() - 0.5,
  );

  return {
    card,
    prompt: card.term,
    correctAnswer,
    options,
  };
}

interface LearnEngineProps {
  deck: Deck;
}

export const LearnEngine: React.FC<LearnEngineProps> = ({ deck }) => {
  const { playClick } = useClick();
  const { playCorrect } = useCorrect();
  const { playError: playWrong } = useError();
  const { recordCardStudyResult } = useThamletStore();

  // Hàng đợi thẻ cần học
  const [queue, setQueue] = useState<FlashCard[]>(() => [...deck.cards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Thống kê
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentCard = queue[currentIndex];
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(() =>
    currentCard ? buildQuestion(currentCard, deck.cards) : null,
  );

  useEffect(() => {
    if (currentCard) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentQuestion(buildQuestion(currentCard, deck.cards));
    }
  }, [currentCard, deck.cards]);

  const handleSelectOption = (option: string) => {
    if (isAnswerChecked || !currentQuestion) return;
    playClick();
    setSelectedOption(option);
    setIsAnswerChecked(true);

    const isCorrect = option === currentQuestion.correctAnswer;

    if (isCorrect) {
      playCorrect();
      setCorrectCount(prev => prev + 1);
      recordCardStudyResult(deck.id, currentQuestion.card.id, true);
    } else {
      playWrong();
      setWrongCount(prev => prev + 1);
      recordCardStudyResult(deck.id, currentQuestion.card.id, false);
      // Nếu sai, thêm lại thẻ này vào cuối hàng đợi để học lại!
      setQueue(prev => [...prev, currentQuestion.card]);
    }
  };

  const handleNextQuestion = () => {
    playClick();
    setSelectedOption(null);
    setIsAnswerChecked(false);

    if (currentIndex < queue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const playAudio = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleRestart = () => {
    playClick();
    setQueue([...deck.cards]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerChecked(false);
    setCorrectCount(0);
    setWrongCount(0);
    setIsFinished(false);
  };

  if (isFinished || !currentCard || !currentQuestion) {
    const accuracy =
      correctCount + wrongCount > 0
        ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
        : 100;

    return (
      <div className='mx-auto max-w-lg space-y-6 px-4 py-12 text-center'>
        <div className='mx-auto flex size-20 items-center justify-center rounded-3xl bg-purple-500/20 text-purple-500 shadow-lg'>
          <Trophy className='size-10' />
        </div>

        <h2 className='text-3xl font-black text-(--main-color)'>
          Hoàn thành vòng học!
        </h2>
        <p className='text-sm text-(--secondary-color)'>
          Bạn đã ôn tập và thuộc toàn bộ từ vựng trong bộ thẻ này.
        </p>

        {/* Score summary */}
        <div className='grid grid-cols-2 gap-4 rounded-3xl border border-(--border-color) bg-(--card-color) p-6'>
          <div>
            <div className='text-4xl font-black text-(--main-color)'>
              {accuracy}%
            </div>
            <div className='mt-1 text-xs font-semibold text-(--secondary-color)'>
              Độ chính xác
            </div>
          </div>
          <div>
            <div className='text-4xl font-black text-emerald-500'>
              {correctCount}
            </div>
            <div className='mt-1 text-xs font-semibold text-(--secondary-color)'>
              Câu đúng
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className='flex flex-wrap items-center justify-center gap-3 pt-4'>
          <button
            type='button'
            onClick={handleRestart}
            className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-6 py-3 text-sm font-bold text-(--background-color) shadow-md transition-all hover:opacity-90 active:scale-95'
          >
            <RotateCcw className='size-4' />
            Học lại lần nữa
          </button>

          <Link
            href={`/thamlet/${deck.id}`}
            onClick={playClick}
            className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-6 py-3 text-sm font-semibold text-(--secondary-color) hover:text-(--main-color)'
          >
            <ArrowLeft className='size-4' />
            Về bộ thẻ
          </Link>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / queue.length) * 100);

  return (
    <div className='mx-auto max-w-xl space-y-6 px-4 py-6'>
      {/* Top Bar */}
      <div className='flex items-center justify-between'>
        <Link
          href={`/thamlet/${deck.id}`}
          onClick={playClick}
          className='inline-flex items-center gap-2 rounded-2xl border border-(--border-color) bg-(--card-color) px-4 py-2 text-xs font-semibold text-(--secondary-color) hover:text-(--main-color)'
        >
          <ArrowLeft className='size-3.5' />
          Thoát
        </Link>

        <div className='text-xs font-bold text-(--main-color)'>
          Tiến độ: {currentIndex + 1} / {queue.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className='h-2 w-full overflow-hidden rounded-full bg-(--card-color)'>
        <div
          className='h-full bg-purple-500 transition-all duration-300'
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Prompt Card */}
      <div className='flex flex-col items-center justify-center rounded-3xl border-2 border-(--border-color) bg-(--card-color) p-8 text-center shadow-md'>
        <div className='flex items-center gap-2'>
          <h2 className='text-4xl font-black text-(--main-color) sm:text-5xl'>
            {currentQuestion.prompt}
          </h2>
          <button
            type='button'
            onClick={() => playAudio(currentQuestion.prompt)}
            className='rounded-xl p-2 text-(--secondary-color) hover:text-(--main-color)'
          >
            <Volume2 className='size-5' />
          </button>
        </div>
        {currentCard.reading && (
          <p className='mt-2 text-sm font-medium text-(--secondary-color)'>
            [{currentCard.reading}]
          </p>
        )}
      </div>

      {/* Options */}
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        {currentQuestion.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === currentQuestion.correctAnswer;

          let btnStyle =
            'border-2 border-(--border-color) bg-(--card-color) text-(--main-color) hover:border-(--main-color)';

          if (isAnswerChecked) {
            if (isCorrect) {
              btnStyle =
                'border-2 border-emerald-500 bg-emerald-500/20 text-emerald-500 font-bold';
            } else if (isSelected) {
              btnStyle =
                'border-2 border-red-500 bg-red-500/20 text-red-500 font-bold';
            } else {
              btnStyle =
                'border border-(--border-color) bg-(--card-color)/40 text-(--secondary-color) opacity-60';
            }
          }

          return (
            <button
              key={idx}
              type='button'
              disabled={isAnswerChecked}
              onClick={() => handleSelectOption(opt)}
              className={clsx(
                'flex items-center justify-between rounded-2xl p-4 text-left text-sm font-semibold transition-all duration-200',
                'active:scale-98',
                btnStyle,
              )}
            >
              <span>{opt}</span>
              {isAnswerChecked && isCorrect && (
                <CheckCircle2 className='size-5 shrink-0 text-emerald-500' />
              )}
              {isAnswerChecked && isSelected && !isCorrect && (
                <XCircle className='size-5 shrink-0 text-red-500' />
              )}
            </button>
          );
        })}
      </div>

      {/* Next Question Button */}
      {isAnswerChecked && (
        <div className='flex justify-end pt-2'>
          <button
            type='button'
            onClick={handleNextQuestion}
            className='inline-flex items-center gap-2 rounded-2xl bg-(--main-color) px-8 py-3 text-sm font-bold text-(--background-color) shadow-lg transition-all hover:opacity-90 active:scale-95'
          >
            <span>Tiếp tục</span>
          </button>
        </div>
      )}
    </div>
  );
};
