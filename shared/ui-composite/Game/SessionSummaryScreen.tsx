'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  RotateCcw,
  Timer,
  Zap,
  Target,
  Star,
  Trophy,
  Activity,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { getBestTime, formatTime as formatGauntletTime } from '@/shared/utils/gauntletStats';
import {
  DIFFICULTY_CONFIG,
  type GauntletSessionStats,
} from '@/shared/ui-composite/Gauntlet/types';
import type { GoalTimer } from '@/shared/ui-composite/Blitz/types';

type DojoType = 'kana' | 'kanji' | 'vocabulary';
type GauntletStats = Omit<GauntletSessionStats, 'id'>;

const sessionStatIconBadgeStyle = {
  base: 'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 [--float-distance:-0px]',
  selected:
    'border-(--main-color-accent) bg-(--main-color) text-(--background-color)',
  unselected:
    'border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) opacity-85',
} as const;

interface ClassicSessionSummaryProps {
  mode?: 'classic';
  title?: string;
  subtitle?: string;
  correct: number;
  wrong: number;
  bestStreak: number;
  stars: number;
  totalTimeMs?: number;
  correctAnswerTimes?: number[];
  onBackToSelection: () => void;
  onNewSession: () => void;
}

interface BlitzSessionSummaryProps {
  mode: 'blitz';
  dojoType: DojoType;
  challengeDuration: number;
  stats: { correct: number; wrong: number; bestStreak: number };
  showGoalTimers: boolean;
  goals: GoalTimer[];
  endedReason?: 'completed' | 'manual_quit';
  onBackToSelection: () => void;
  onNewSession: () => void;
}

interface GauntletSessionSummaryProps {
  mode: 'gauntlet';
  dojoType: DojoType;
  stats: GauntletStats;
  isNewBest: boolean;
  endedReason?: 'completed' | 'failed' | 'manual_quit';
  onBackToSelection: () => void;
  onNewSession: () => void;
}

export type SessionSummaryProps =
  | ClassicSessionSummaryProps
  | BlitzSessionSummaryProps
  | GauntletSessionSummaryProps;

const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const uiTranslations = {
  vi: {
    accuracy: 'độ chính xác',
    timeSpent: 'thời gian',
    menu: 'Menu',
    perfectRun: 'Hoàn hảo',
    attempts: (total: number, correct: number) => `Trong số ${total} lượt trả lời, bạn đã trả lời đúng ${correct} câu.`,
    stars: 'Ngôi sao',
    qMin: 'câu/phút',
    lives: 'Lượt chơi',
    reached: (count: number) => `đạt được (${count})`,
    missed: (count: number) => `bỏ lỡ (${count})`,
    difficultyLabel: 'độ khó',
    newBest: 'kỷ lục cá nhân mới!',
    best: (time: string) => `kỷ lục: ${time}`,

    // Titles
    sessionSummary: 'Tổng kết lượt chơi',
    progressSaved: 'Tiến trình đã được lưu.',
    sessionEnded: 'Lượt chơi kết thúc',
    challengeComplete: 'Thử thách đã hoàn thành!',
    blitzQuit: 'Bạn đã thoát lượt chơi chớp nhoáng sớm.',
    blitzFinished: (duration: number) => `Thử thách ${duration < 60 ? `${duration} giây` : `${duration / 60} phút`} đã hoàn thành`,
    victory: 'Chiến thắng!',
    gameOver: 'Kết thúc lượt chơi',
    gauntletQuit: (pct: number) => `Bạn đã kết thúc thử thách sớm ở mức ${pct}%.`,
    gauntletCleared: 'Đã vượt qua thử thách.',
    gauntletFailed: (pct: number) => `Bạn đã vượt qua được ${pct}% chặng đường thử thách`,

    // Stat labels
    bestStreak: 'chuỗi tốt nhất',
    avgSpeed: 'tốc độ t.bình',
    topSpeed: 'tốc độ cao nhất',
    answersMin: 'số câu/phút',
    correct: 'đúng',
    wrong: 'sai',
    avgQuestion: 't.bình/câu',
    fastest: 'nhanh nhất',

    // Buttons
    newSession: 'Lượt chơi mới',
    newMobile: 'mới',
    tryAgain: 'Thử lại',
    againMobile: 'lại',
  },
  en: {
    accuracy: 'accuracy',
    timeSpent: 'time spent',
    menu: 'menu',
    perfectRun: 'perfect run',
    attempts: (total: number, correct: number) => `out of ${total} attempts, you answered ${correct} correctly.`,
    stars: 'stars',
    qMin: 'q/min',
    lives: 'lives',
    reached: (count: number) => `reached (${count})`,
    missed: (count: number) => `missed (${count})`,
    difficultyLabel: 'difficulty',
    newBest: 'new personal best!',
    best: (time: string) => `best: ${time}`,

    // Titles
    sessionSummary: 'session summary',
    progressSaved: 'your progress is saved.',
    sessionEnded: 'session ended',
    challengeComplete: 'challenge complete!',
    blitzQuit: 'you quit this blitz session early.',
    blitzFinished: (duration: number) => `${duration < 60 ? `${duration} seconds` : `${duration / 60} minute${duration > 60 ? 's' : ''}`} challenge finished`,
    victory: 'victory!',
    gameOver: 'game over',
    gauntletQuit: (pct: number) => `you ended this run early at ${pct}%.`,
    gauntletCleared: 'gauntlet cleared.',
    gauntletFailed: (pct: number) => `you got ${pct}% through the gauntlet`,

    // Stat labels
    bestStreak: 'best streak',
    avgSpeed: 'avg. speed',
    topSpeed: 'top speed',
    answersMin: 'answers/min',
    correct: 'correct',
    wrong: 'wrong',
    avgQuestion: 'avg/question',
    fastest: 'fastest',

    // Buttons
    newSession: 'new session',
    newMobile: 'new',
    tryAgain: 'try again',
    againMobile: 'again',
  },
  es: {
    accuracy: 'precisión',
    timeSpent: 'tiempo',
    menu: 'menu',
    perfectRun: 'ronda perfecta',
    attempts: (total: number, correct: number) => `de ${total} intentos, respondiste ${correct} correctamente.`,
    stars: 'estrellas',
    qMin: 'p/min',
    lives: 'vidas',
    reached: (count: number) => `alcanzados (${count})`,
    missed: (count: number) => `fallados (${count})`,
    difficultyLabel: 'dificultad',
    newBest: '¡nueva marca personal!',
    best: (time: string) => `mejor: ${time}`,

    // Titles
    sessionSummary: 'Resumen de sesión',
    progressSaved: 'Tu progreso ha sido guardado.',
    sessionEnded: 'Sesión terminada',
    challengeComplete: '¡desafío completo!',
    blitzQuit: 'terminaste esta sesión blitz antes de tiempo.',
    blitzFinished: (duration: number) => `desafío de ${duration < 60 ? `${duration} segundos` : `${duration / 60} minuto${duration > 60 ? 's' : ''}`} finalizado`,
    victory: '¡victoria!',
    gameOver: 'fin de la partida',
    gauntletQuit: (pct: number) => `terminaste este desafío antes de tiempo al ${pct}%.`,
    gauntletCleared: 'desafío superado.',
    gauntletFailed: (pct: number) => `llegaste al ${pct}% del desafío`,

    // Stat labels
    bestStreak: 'mejor racha',
    avgSpeed: 'vel. promedio',
    topSpeed: 'vel. máxima',
    answersMin: 'respuestas/min',
    correct: 'correctas',
    wrong: 'incorrectas',
    avgQuestion: 'prom/pregunta',
    fastest: 'más rápido',

    // Buttons
    newSession: 'nueva sesión',
    newMobile: 'nueva',
    tryAgain: 'intentar de nuevo',
    againMobile: 'otra vez',
  },
};

export default function SessionSummaryScreen(props: SessionSummaryProps) {
  if (props.mode === 'blitz') return <BlitzSummary {...props} />;
  if (props.mode === 'gauntlet') return <GauntletSummary {...props} />;
  return <ClassicSummary {...props} />;
}

function ClassicSummary({
  title,
  subtitle,
  correct,
  wrong,
  bestStreak,
  stars,
  totalTimeMs = 0,
  correctAnswerTimes = [],
  onBackToSelection,
  onNewSession,
}: ClassicSessionSummaryProps) {
  const locale = useLocale();
  const t = uiTranslations[locale as 'vi' | 'en' | 'es'] || uiTranslations.en;

  const displayTitle = title || t.sessionSummary;
  const displaySubtitle = subtitle || t.progressSaved;

  const { playClick } = useClick();
  const total = correct + wrong;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timeFormatted = formatTime(totalTimeMs);

  const avgResponseTime = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    const sum = correctAnswerTimes.reduce((a, b) => a + b, 0);
    return sum / correctAnswerTimes.length;
  }, [correctAnswerTimes]);

  const fastestResponse = useMemo(() => {
    if (correctAnswerTimes.length === 0) return 0;
    return Math.min(...correctAnswerTimes);
  }, [correctAnswerTimes]);

  const apm = useMemo(() => {
    if (totalTimeMs === 0) return 0;
    return Math.round((total / (totalTimeMs / 60000)) * 10) / 10;
  }, [total, totalTimeMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        playClick();
        onBackToSelection();
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        playClick();
        onNewSession();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackToSelection, onNewSession, playClick]);

  return (
    <SummaryLayout
      title={displayTitle}
      subtitle={displaySubtitle}
      total={total}
      correct={correct}
      accuracy={accuracy}
      heroValue={accuracy === 100 ? t.perfectRun : `${correct} / ${total}`}
      heroDescription={t.attempts(total, correct)}
      timeValue={timeFormatted}
      topRightLabel={t.stars}
      topRightValue={`+${stars}`}
      firstStatLabel={t.bestStreak}
      firstStatValue={bestStreak}
      secondStatLabel={t.avgSpeed}
      secondStatValue={`${avgResponseTime.toFixed(1)}s`}
      thirdStatLabel={t.topSpeed}
      thirdStatValue={`${fastestResponse.toFixed(2)}s`}
      fourthStatLabel={t.answersMin}
      fourthStatValue={apm}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction={t.newSession}
      mobilePrimaryAction={t.newMobile}
    />
  );
}

function BlitzSummary({
  challengeDuration,
  stats,
  showGoalTimers,
  goals,
  endedReason = 'completed',
  onBackToSelection,
  onNewSession,
}: BlitzSessionSummaryProps) {
  const locale = useLocale();
  const t = uiTranslations[locale as 'vi' | 'en' | 'es'] || uiTranslations.en;

  const total = stats.correct + stats.wrong;
  const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
  const qpm = total > 0 ? ((total / challengeDuration) * 60).toFixed(1) : '0';
  const reached = goals.filter(goal => goal.reached);
  const missed = goals.filter(goal => !goal.reached);

  return (
    <SummaryLayout
      title={endedReason === 'manual_quit' ? t.sessionEnded : t.challengeComplete}
      subtitle={
        endedReason === 'manual_quit'
          ? t.blitzQuit
          : t.blitzFinished(challengeDuration)
      }
      total={total}
      correct={stats.correct}
      accuracy={accuracy}
      heroValue={`${stats.correct} / ${total}`}
      heroDescription={t.attempts(total, stats.correct)}
      timeValue={formatTime(challengeDuration * 1000)}
      topRightLabel={t.qMin}
      topRightValue={qpm}
      firstStatLabel={t.bestStreak}
      firstStatValue={stats.bestStreak}
      secondStatLabel={t.correct}
      secondStatValue={stats.correct}
      thirdStatLabel={t.wrong}
      thirdStatValue={stats.wrong}
      fourthStatLabel={t.answersMin}
      fourthStatValue={qpm}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction={t.tryAgain}
      mobilePrimaryAction={t.againMobile}
      extraContent={
        showGoalTimers && goals.length > 0 ? (
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <span
                  className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.selected}`}
                >
                  <CheckCircle2 className='h-5 w-5 fill-current' />
                </span>
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  {t.reached(reached.length)}
                </span>
              </div>
              <div className='space-y-2'>
                {reached.map(goal => (
                  <div key={goal.id} className='rounded-xl border border-(--main-color)/20 p-2 text-sm text-(--main-color)'>
                    {goal.label}
                  </div>
                ))}
              </div>
            </div>
            <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
              <div className='mb-2 flex items-center gap-2'>
                <span
                  className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.unselected}`}
                >
                  <XCircle className='h-5 w-5 fill-current' />
                </span>
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                  {t.missed(missed.length)}
                </span>
              </div>
              <div className='space-y-2'>
                {missed.map(goal => (
                  <div key={goal.id} className='rounded-xl border border-(--border-color) p-2 text-sm text-(--secondary-color) opacity-70'>
                    {goal.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null
      }
    />
  );
}

function GauntletSummary({
  dojoType,
  stats,
  isNewBest,
  endedReason = stats.completed ? 'completed' : 'failed',
  onBackToSelection,
  onNewSession,
}: GauntletSessionSummaryProps) {
  const locale = useLocale();
  const t = uiTranslations[locale as 'vi' | 'en' | 'es'] || uiTranslations.en;

  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const total = stats.correctAnswers + stats.wrongAnswers;
  const accuracy = total > 0 ? Math.round((stats.correctAnswers / total) * 100) : 0;

  useEffect(() => {
    if (isNewBest) {
      setPreviousBest(null);
      return;
    }
    const loadBest = async () => {
      const best = await getBestTime(
        dojoType,
        stats.difficulty,
        stats.repetitionsPerChar,
        stats.gameMode,
        stats.totalCharacters,
      );
      if (best) setPreviousBest(best);
    };
    void loadBest();
  }, [dojoType, isNewBest, stats]);

  const progressPct = Math.round((stats.questionsCompleted / stats.totalQuestions) * 100);

  return (
    <SummaryLayout
      title={endedReason === 'completed' ? t.victory : endedReason === 'manual_quit' ? t.sessionEnded : t.gameOver}
      subtitle={
        endedReason === 'manual_quit'
          ? t.gauntletQuit(progressPct)
          : endedReason === 'completed'
            ? t.gauntletCleared
            : t.gauntletFailed(progressPct)
      }
      total={total}
      correct={stats.correctAnswers}
      accuracy={accuracy}
      heroValue={`${stats.correctAnswers} / ${total}`}
      heroDescription={t.attempts(total, stats.correctAnswers)}
      timeValue={formatGauntletTime(stats.totalTimeMs)}
      topRightLabel={t.lives}
      topRightValue={`${stats.livesRemaining}/${stats.startingLives}`}
      firstStatLabel={t.bestStreak}
      firstStatValue={stats.bestStreak}
      secondStatLabel={t.avgQuestion}
      secondStatValue={formatGauntletTime(stats.averageTimePerQuestionMs)}
      thirdStatLabel={t.fastest}
      thirdStatValue={formatGauntletTime(stats.fastestAnswerMs)}
      fourthStatLabel={t.accuracy}
      fourthStatValue={`${accuracy}%`}
      onBackToSelection={onBackToSelection}
      onNewSession={onNewSession}
      primaryAction={t.tryAgain}
      mobilePrimaryAction={t.againMobile}
      extraContent={
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6'>
          <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
            <div className='mb-2 flex items-center gap-2'>
              <span
                className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.unselected}`}
              >
                <Flame className='h-5 w-5 fill-current' />
              </span>
              <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>
                {t.difficultyLabel}
              </span>
            </div>
            <div className='text-xl font-black tracking-tighter text-(--main-color) sm:text-2xl'>
              {DIFFICULTY_CONFIG[stats.difficulty].label} • {stats.gameMode}
            </div>
            {(isNewBest || previousBest) && (
              <p className='mt-2 text-sm text-(--secondary-color) opacity-60'>
                {isNewBest ? t.newBest : t.best(formatGauntletTime(previousBest!))}
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}

interface SummaryLayoutProps {
  title: string;
  subtitle: string;
  total: number;
  correct: number;
  accuracy: number;
  heroValue: string;
  heroDescription: string;
  timeValue: string | number;
  topRightLabel: string;
  topRightValue: string | number;
  firstStatLabel: string;
  firstStatValue: string | number;
  secondStatLabel: string;
  secondStatValue: string | number;
  thirdStatLabel: string;
  thirdStatValue: string | number;
  fourthStatLabel: string;
  fourthStatValue: string | number;
  onBackToSelection: () => void;
  onNewSession: () => void;
  primaryAction: string;
  mobilePrimaryAction: string;
  extraContent?: React.ReactNode;
}

function SummaryLayout({
  title,
  subtitle,
  total: _total,
  correct: _correct,
  accuracy,
  heroValue,
  heroDescription,
  timeValue,
  topRightLabel,
  topRightValue,
  firstStatLabel,
  firstStatValue,
  secondStatLabel,
  secondStatValue,
  thirdStatLabel,
  thirdStatValue,
  fourthStatLabel,
  fourthStatValue,
  onBackToSelection,
  onNewSession,
  primaryAction,
  mobilePrimaryAction,
  extraContent,
}: SummaryLayoutProps) {
  const locale = useLocale();
  const t = uiTranslations[locale as 'vi' | 'en' | 'es'] || uiTranslations.en;
  const { playClick } = useClick();

  return (
    <div className='fixed inset-0 z-50 flex h-full w-full flex-col overflow-x-hidden overflow-y-auto bg-(--background-color)'>
      <div className='mx-auto flex w-full max-w-7xl flex-col px-4 py-8 pb-24 sm:px-8 sm:py-12 sm:pb-32 lg:px-12 lg:py-16 lg:pb-40'>
        <div className='mb-8 flex flex-col items-center gap-1 text-center select-none sm:mb-12 sm:items-start sm:text-left lg:mb-16'>
          <h1 className='text-3xl font-black tracking-tighter text-(--main-color) sm:text-5xl lg:text-6xl'>{title}</h1>
          <p className='text-base font-medium tracking-tight text-(--secondary-color) opacity-60 sm:text-xl'>{subtitle}</p>
        </div>

        <div className='mb-8 flex flex-col gap-4 sm:mb-12 sm:gap-6 lg:mb-16'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
            <div className='relative flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:col-span-2 sm:flex-row sm:gap-12 sm:p-10'>
              <div className='relative flex aspect-square w-full max-w-36 flex-col items-center justify-center sm:max-w-44'>
                <div className='h-full w-full rounded-full' style={{ background: `conic-gradient(var(--main-color) 0deg ${accuracy * 3.6}deg, var(--border-color) ${accuracy * 3.6}deg 360deg)` }} />
                <div className='absolute inset-[12%] rounded-full bg-(--background-color)' />
                <div className='absolute inset-0 flex flex-col items-center justify-center'>
                  <span className='text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{accuracy}%</span>
                </div>
              </div>
              <div className='mt-6 flex flex-col items-center text-center sm:mt-0 sm:items-start sm:text-left'>
                <div className='mb-1 flex items-center gap-2'>
                  <span
                    className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.selected}`}
                  >
                    <Target className='h-5 w-5' />
                  </span>
                  <span className='text-sm leading-none font-bold tracking-wider text-(--secondary-color) uppercase opacity-60'>{t.accuracy}</span>
                </div>
                <div className='text-3xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{heroValue}</div>
                <p className='mt-2 text-sm text-(--secondary-color) opacity-60 sm:text-base'>{heroDescription}</p>
              </div>
            </div>

            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <span
                  className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.selected}`}
                >
                  <Timer className='h-5 w-5' />
                </span>
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>{t.timeSpent}</span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{timeValue}</div>
            </div>

            <div className='flex flex-col justify-between rounded-[2.5rem] border-2 border-(--main-color)/20 bg-(--background-color) p-6 sm:p-8'>
              <div className='mb-auto flex items-center gap-2'>
                <span
                  className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.selected}`}
                >
                  <Star className='h-5 w-5 fill-current' />
                </span>
                <span className='text-xs leading-none font-bold tracking-widest text-(--secondary-color) uppercase opacity-60'>{topRightLabel}</span>
              </div>
              <div className='mt-4 text-4xl font-black tracking-tighter text-(--main-color) sm:text-5xl'>{topRightValue}</div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4'>
            <MiniStat icon={<Trophy className='fill-current' />} label={firstStatLabel} value={firstStatValue} />
            <MiniStat icon={<Zap className='fill-current' />} label={secondStatLabel} value={secondStatValue} />
            <MiniStat icon={<Activity />} label={thirdStatLabel} value={thirdStatValue} />
            <MiniStat icon={<Zap className='fill-current' />} label={fourthStatLabel} value={fourthStatValue} />
          </div>

          {extraContent}
        </div>

        <div className='sticky bottom-0 z-10 -mx-4 mt-auto flex w-auto items-center justify-center gap-3 border-t-2 border-(--border-color) bg-(--background-color) py-4 px-4 select-none sm:static sm:mx-0 sm:w-full sm:justify-start sm:gap-5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0'>
          <button onClick={() => { playClick(); onBackToSelection(); }} className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--secondary-color) px-4 text-lg font-bold text-(--background-color) outline-hidden transition-all duration-150 sm:px-10 sm:text-xl md:flex-none'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color) text-(--secondary-color)'>
              <ArrowLeft className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6' strokeWidth={2.5} />
            </span>
            <span className='leading-none'>{t.menu}</span>
          </button>
          <button onClick={() => { playClick(); onNewSession(); }} className='group flex h-14 flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl bg-(--main-color) px-4 text-lg font-bold text-(--background-color) outline-hidden transition-all duration-150 sm:px-12 sm:text-xl md:flex-none'>
            <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-(--background-color) bg-(--background-color) text-(--main-color)'>
              <RotateCcw className='h-5 w-5 group-hover:animate-none sm:h-6 sm:w-6' strokeWidth={2.5} />
            </span>
            <span className='leading-none sm:hidden'>{mobilePrimaryAction}</span>
            <span className='hidden leading-none sm:inline'>{primaryAction}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className='flex flex-col rounded-[2rem] border-2 border-(--secondary-color)/10 bg-(--background-color) p-5 sm:p-6'>
      <div className='mb-2 flex items-center gap-2'>
        <span
          className={`${sessionStatIconBadgeStyle.base} ${sessionStatIconBadgeStyle.unselected}`}
        >
          {icon}
        </span>
        <span className='text-[0.65rem] leading-tight font-bold tracking-widest text-(--secondary-color) uppercase opacity-60 sm:text-xs sm:leading-none'>{label}</span>
      </div>
      <div className='text-2xl font-black tracking-tighter text-(--main-color) sm:text-3xl'>{value}</div>
    </div>
  );
}

