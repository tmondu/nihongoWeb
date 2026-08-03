'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Copy, Check, Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useTranslations } from 'next-intl';
import type {
  ConjugationResult,
  ConjugationCategory as CategoryType,
  ConjugationForm,
} from '../types';
import { ALL_CONJUGATION_CATEGORIES } from '../types';
import VerbInfoCard from './VerbInfoCard';
import ConjugationCategory from './ConjugationCategory';

interface ConjugationResultsProps {
  /** Conjugation result to display */
  result: ConjugationResult | null;
  /** Whether conjugation is in progress */
  isLoading: boolean;
  /** Callback to copy a single form */
  onCopyForm: (form: ConjugationForm) => void;
}

/**
 * ConjugationResults - Displays all conjugated forms organized by category
 */
export default function ConjugationResults({
  result,
  isLoading,
  onCopyForm,
}: ConjugationResultsProps) {
  const t = useTranslations('conjugator');
  const tNav = useTranslations('navigation');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const previousResultRef = useRef<ConjugationResult | null>(null);

  // Group forms by category
  const formsByCategory = useMemo(() => {
    if (!result) return new Map<CategoryType, ConjugationForm[]>();

    const grouped = new Map<CategoryType, ConjugationForm[]>();
    for (const form of result.forms) {
      const existing = grouped.get(form.category) || [];
      existing.push(form);
      grouped.set(form.category, existing);
    }
    return grouped;
  }, [result]);

  const categoryCount = useMemo(() => {
    let count = 0;
    for (const [, forms] of formsByCategory) {
      if (forms.length > 0) count++;
    }
    return count;
  }, [formsByCategory]);

  // Update status message when result changes for screen readers
  useEffect(() => {
    if (result && result !== previousResultRef.current) {
      setStatusMessage(
        t('results.statusMessage', {
          verb: result.verb.dictionaryForm,
          formCount: result.forms.length,
          categoryCount,
        })
      );
      previousResultRef.current = result;
    } else if (isLoading) {
      setStatusMessage(t('results.loading'));
    }
  }, [result, isLoading, categoryCount, t]);

  if (isLoading) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-center'>
        <Loader2 className='h-8 w-8 animate-spin text-(--main-color) opacity-20' />
        <p className='mt-4 text-xl font-bold tracking-tight text-(--main-color) opacity-40'>
          {t('results.loading')}
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <p className='text-3xl font-black tracking-tight text-(--main-color) opacity-20 sm:text-4xl'>
          {t('results.empty.title')}
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex flex-col gap-6'
      role='region'
      aria-label={t('accessibility.resultsRegion')}
    >
      <div
        className='sr-only'
        role='status'
        aria-live='polite'
        aria-atomic='true'
      >
        {statusMessage}
      </div>

      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-2'>
          <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
            <div className='h-[1px] w-4 bg-(--main-color)' />
            <span>{t('verbInfo.conjugationRules')}</span>
          </div>
          <h2 className='text-2xl font-bold tracking-tight text-(--main-color)'>
            {tNav('menu.conjugate')}
          </h2>
        </div>

        <section className='border-b border-(--border-color)/10 pb-8'>
          <VerbInfoCard verb={result.verb} />
        </section>
      </div>

      <div className='flex flex-col gap-24' role='list'>
        {ALL_CONJUGATION_CATEGORIES.map(category => (
          <ConjugationCategory
            key={category}
            category={category}
            forms={formsByCategory.get(category) || []}
            isExpanded={true}
            onToggle={() => {}}
            onCopy={onCopyForm}
          />
        ))}
      </div>

      <footer className='mt-8 border-t border-(--border-color)/10 py-12'>
        <p className='text-center text-xs font-bold text-(--secondary-color)/40'>
          {t('results.formCount', { count: result.forms.length, categories: categoryCount })}
        </p>
      </footer>
    </div>
  );
}

