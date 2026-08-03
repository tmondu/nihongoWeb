import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen, Info } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useTranslations, useLocale } from 'next-intl';
import type { VerbInfo, VerbType, IrregularType } from '../types';

interface VerbInfoCardProps {
  /** Verb information from classification */
  verb: VerbInfo;
}

/**
 * VerbInfoCard - Displays detected verb type and stem information
 *
 * Features:
 * - Shows verb type (Godan/Ichidan/Irregular)
 * - Displays verb stem
 * - Expandable section with conjugation rule explanation
 * - Proper ARIA labels and roles
 *
 * Requirements: 9.1, 9.2, 9.3, 10.2
 */
export default function VerbInfoCard({ verb }: VerbInfoCardProps) {
  const t = useTranslations('conjugator');
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);

  const verbTypeInfo = getVerbTypeInfo(verb.type, verb.irregularType, t);

  return (
    <div
      className='flex flex-col gap-6'
      role='region'
      aria-label={`${locale === 'vi' ? 'Thông tin động từ cho' : 'Verb information for'} ${verb.dictionaryForm}`}
    >
      {/* Main info header */}
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between'>
          <div className='flex flex-col gap-4'>
            <div className='flex items-center gap-3'>
              <span className='text-[10px] font-bold tracking-widest text-(--secondary-color) uppercase opacity-50'>
                {locale === 'vi' ? 'Thể từ điển' : 'Dictionary Entry'}
              </span>
              <div className='h-[1px] w-8 bg-(--main-color)/10' />
            </div>

            <div className='flex flex-col'>
              <h3
                className='font-japanese text-3xl font-bold text-(--main-color) sm:text-4xl'
                lang='ja'
              >
                {verb.dictionaryForm}
              </h3>
              <div className='flex items-center gap-4 text-base font-medium text-(--secondary-color) opacity-60'>
                <span className='font-japanese' lang='ja'>
                  {verb.reading}
                </span>
                <span className='opacity-20'>/</span>
                <span className='italic'>{verb.romaji}</span>
              </div>
            </div>
          </div>

          <div className='flex flex-col items-end gap-1 pb-2 text-right'>
            <span className='text-[10px] font-bold tracking-widest text-(--main-color) uppercase opacity-30'>
              {locale === 'vi' ? 'Trạng thái' : 'Status'}
            </span>
            <span className='text-xl font-bold tracking-tight text-(--main-color)/80'>
              {locale === 'vi' ? 'Đã kiểm chứng' : 'Verified Analysis'}
            </span>
          </div>
        </div>

        <div
          className='flex flex-wrap items-center gap-8'
          role='group'
          aria-label='Verb classification details'
        >
          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              {t('verbInfo.type')}
            </span>
            <span className={cn('text-xl font-bold', verbTypeInfo.colorClass)}>
              {verbTypeInfo.label}
            </span>
          </div>

          <div className='hidden h-8 w-[1px] bg-(--border-color)/10 sm:block' />

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              {t('verbInfo.stem')}
            </span>
            <span
              className='font-japanese text-xl font-bold text-(--main-color)'
              lang='ja'
            >
              {verb.stem || '—'}
            </span>
          </div>

          <div className='hidden h-8 w-[1px] bg-(--border-color)/10 sm:block' />

          <div className='flex flex-col gap-1'>
            <span className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              {t('verbInfo.ending')}
            </span>
            <span
              className='font-japanese text-xl font-bold text-(--main-color)'
              lang='ja'
            >
              {verb.ending || '—'}
            </span>
          </div>
        </div>

        {/* Compound Alert - Minimalist Integrated Line */}
        {verb.compoundPrefix && (
          <div className='flex items-center gap-8 border-l border-(--main-color)/20 py-2 pl-8'>
            <div className='flex h-2 w-2 rounded-full bg-(--main-color)' />
            <div className='flex items-baseline gap-4'>
              <span className='text-[10px] font-black tracking-widest text-(--main-color) uppercase opacity-40'>
                {locale === 'vi' ? 'Phát hiện dạng ghép:' : 'Complex Morph Detected:'}
              </span>
              <span
                className='font-japanese text-xl font-black text-(--main-color) opacity-80'
                lang='ja'
              >
                {verb.compoundPrefix}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Conjugation Rules */}
      <section className='border-t border-(--border-color)/10 pt-6'>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col gap-2'>
            <h4 className='text-[10px] font-bold tracking-widest text-(--secondary-color)/40 uppercase'>
              {t('verbInfo.conjugationRules')}
            </h4>
            <p className='text-base font-medium text-(--secondary-color)/70'>
              {verbTypeInfo.description}
            </p>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {verbTypeInfo.rules.map((rule, idx) => (
              <div
                key={idx}
                className='flex gap-3 text-sm font-medium text-(--secondary-color)/60'
              >
                <span className='text-(--main-color)/20'>{idx + 1}.</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Get display information for verb type
 */
function getVerbTypeInfo(
  type: VerbType,
  irregularType: IrregularType | undefined,
  t: any,
): {
  label: string;
  colorClass: string;
  description: string;
  rules: string[];
} {
  const key = type === 'irregular' && irregularType ? irregularType : type;
  const validKey = ['godan', 'ichidan', 'irregular', 'suru', 'kuru', 'aru', 'iku', 'honorific'].includes(key)
    ? key
    : 'unknown';

  const label = t(`verbTypes.${validKey}.label`);
  const description = t(`verbTypes.${validKey}.description`);
  const rules = t.raw(`verbTypes.${validKey}.rules`) as string[];

  let colorClass = 'text-blue-500';
  if (validKey === 'ichidan') {
    colorClass = 'text-green-500';
  } else if (['irregular', 'suru', 'kuru'].includes(validKey)) {
    colorClass = 'text-purple-500';
  } else if (['aru', 'iku'].includes(validKey)) {
    colorClass = 'text-orange-500';
  } else if (validKey === 'honorific') {
    colorClass = 'text-pink-500';
  } else if (validKey === 'unknown') {
    colorClass = 'text-(--secondary-color)';
  }

  return {
    label,
    colorClass,
    description,
    rules,
  };
}

