import { useState } from 'react';
import { Trash2, Clock, X, History } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useTranslations } from 'next-intl';
import { ActionButton } from '@/shared/ui/components/ActionButton';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/components/alert-dialog';
import type { HistoryEntry, VerbType } from '../types';

interface ConjugationHistoryProps {
  /** History entries to display */
  entries: HistoryEntry[];
  /** Callback when an entry is selected */
  onSelect: (entry: HistoryEntry) => void;
  /** Callback when an entry is deleted */
  onDelete: (id: string) => void;
  /** Callback when all entries are cleared */
  onClearAll: () => void;
}

/**
 * ConjugationHistory - Displays recent conjugated verbs
 *
 * Features:
 * - Recent verbs as clickable chips/cards
 * - Delete button for individual entries
 * - Clear all button
 * - Proper ARIA labels and roles
 *
 * Requirements: 8.2, 8.3, 8.4, 10.2
 */
export default function ConjugationHistory({
  entries,
  onSelect,
  onDelete,
  onClearAll,
}: ConjugationHistoryProps) {
  const t = useTranslations('conjugator');
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Empty state
  if (entries.length === 0) {
    return (
      <div
        className='flex flex-col items-start gap-4 py-6 text-left opacity-30'
        role='region'
        aria-label={t('accessibility.resultsRegion')}
      >
        <span className='text-[10px] font-bold tracking-widest uppercase'>
          {t('history.empty.title')}
        </span>
        <p className='text-sm font-medium'>
          {t('history.empty.hint')}
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex flex-col gap-10 transition-all duration-700'
      role='region'
      aria-label={t('accessibility.resultsRegion')}
    >
      {/* Header - Sidebar Style */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-col gap-1'>
          <h3 className='text-[10px] font-bold tracking-widest text-(--main-color) uppercase'>
            {t('history.title')}
          </h3>
          <p className='text-[10px] font-bold text-(--secondary-color)/40'>
            {t('history.verbCount', { count: entries.length })}
          </p>
        </div>

        {/* Clear all button - Ghost style */}
        <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <AlertDialogTrigger asChild>
            <button
              className='flex h-8 w-8 items-center justify-center rounded-full text-(--secondary-color)/40 transition-colors hover:bg-red-500/10 hover:text-red-500'
              aria-label={t('history.clearButton')}
            >
              <Trash2 className='h-4 w-4' />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent
            className={cn(
              'border-(--border-color) bg-(--background-color)',
              'rounded-3xl',
            )}
          >
            <AlertDialogHeader>
              <AlertDialogTitle className='text-3xl font-black tracking-tighter text-(--main-color)'>
                {t('history.clearDialog.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className='text-base leading-relaxed font-semibold text-(--secondary-color)/60'>
                {t('history.clearDialog.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className='flex-row gap-4 pt-6'>
              <ActionButton
                colorScheme='secondary'
                borderRadius='full'
                borderBottomThickness={0}
                className='flex-1 border border-(--border-color)/50 text-xs font-black tracking-widest uppercase'
                onClick={() => setClearDialogOpen(false)}
              >
                {t('history.clearDialog.cancel')}
              </ActionButton>
              <ActionButton
                colorScheme='main'
                borderRadius='full'
                borderBottomThickness={0}
                className='flex-1 bg-red-600 text-xs font-black tracking-widest uppercase hover:bg-red-700'
                onClick={() => {
                  onClearAll();
                  setClearDialogOpen(false);
                }}
              >
                {t('history.clearDialog.confirm')}
              </ActionButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div
        className='flex flex-col'
        role='list'
        aria-label={t('accessibility.resultsRegion')}
      >
        {entries.map(entry => (
          <HistoryRecord
            key={entry.id}
            entry={entry}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual history record component
 */
function HistoryRecord({
  entry,
  onSelect,
  onDelete,
}: {
  entry: HistoryEntry;
  onSelect: (entry: HistoryEntry) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations('conjugator');
  const typeInfo = getVerbTypeInfo(entry.verbType, t);

  return (
    <div
      className='group flex items-center justify-between border-b border-(--border-color)/5 last:border-0'
      role='listitem'
    >
      {/* Clickable verb part */}
      <button
        onClick={() => onSelect(entry)}
        className='flex min-w-0 flex-1 items-center gap-4 py-4 text-left focus:outline-none'
        aria-label={`Conjugate ${entry.verb}`}
      >
        <div
          className={cn('h-1.5 w-1.5 shrink-0 rounded-full', typeInfo.bgClass)}
        />

        <div className='flex min-w-0 flex-col'>
          <span
            className='font-japanese truncate text-lg font-bold text-(--main-color) opacity-60 transition-opacity group-hover:opacity-100'
            lang='ja'
          >
            {entry.verb}
          </span>
          <div className='flex items-center gap-2'>
            <span className='text-[8px] font-bold text-(--secondary-color)/40 uppercase'>
              {typeInfo.label}
            </span>
          </div>
        </div>
      </button>

      {/* Action Area - Subtle Trash */}
      <div className='flex items-center pb-4 opacity-0 transition-all duration-500 group-hover:opacity-100'>
        <button
          onClick={e => {
            e.stopPropagation();
            onDelete(entry.id);
          }}
          className='flex h-8 w-8 items-center justify-center rounded-full text-red-500/30 transition-all hover:bg-red-500/10 hover:text-red-500'
          aria-label={t('history.removeEntry', { verb: entry.verb })}
        >
          <X className='h-3 w-3' aria-hidden='true' />
        </button>
      </div>
    </div>
  );
}

/**
 * Format timestamp to relative time
 */
function formatTimestamp(timestamp: number, t: (key: string, options?: any) => string): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('history.timeAgo.now');
  if (diffMins < 60) return t('history.timeAgo.minutes', { count: diffMins });
  if (diffHours < 24) return t('history.timeAgo.hours', { count: diffHours });
  if (diffDays < 7) return t('history.timeAgo.days', { count: diffDays });

  return new Date(timestamp).toLocaleDateString();
}

/**
 * Get display info for verb type
 */
function getVerbTypeInfo(type: VerbType, t: (key: string) => string): {
  label: string;
  abbrev: string;
  bgClass: string;
  textClass: string;
} {
  switch (type) {
    case 'godan':
      return {
        label: t('verbTypes.godan.label'),
        abbrev: 'G',
        bgClass: 'bg-blue-500/20',
        textClass: 'text-blue-500',
      };
    case 'ichidan':
      return {
        label: t('verbTypes.ichidan.label'),
        abbrev: 'I',
        bgClass: 'bg-green-500/20',
        textClass: 'text-green-500',
      };
    case 'irregular':
      return {
        label: t('verbTypes.irregular.label'),
        abbrev: '!',
        bgClass: 'bg-purple-500/20',
        textClass: 'text-purple-500',
      };
    default:
      return {
        label: 'Unknown',
        abbrev: '?',
        bgClass: 'bg-gray-500/20',
        textClass: 'text-gray-500',
      };
  }
}

