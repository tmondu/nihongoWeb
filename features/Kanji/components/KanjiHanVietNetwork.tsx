'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';
import { Link } from '@/core/i18n/routing';
import hanvietMapRaw from '@/shared/data/kanji_hanviet.json';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { Network } from 'lucide-react';

const hanvietMap = hanvietMapRaw as Record<string, string>;

interface KanjiHanVietNetworkProps {
  kanjiChar: string;
  className?: string;
}

interface KanjiNode {
  char: string;
  hanviet: string;
  isCurrent: boolean;
}

interface ReadingGroup {
  reading: string;
  nodes: KanjiNode[];
}

/**
 * Displays a visual "Kanji Family Network" — kanji that share the same
 * primary Hán-Việt (Sino-Vietnamese) reading as the current character.
 *
 * Each group is shown as a star cluster with the shared reading in center.
 * Clicking any sibling kanji navigates to its detail page.
 */
export default function KanjiHanVietNetwork({
  kanjiChar,
  className,
}: KanjiHanVietNetworkProps) {
  const { playClick } = useClick();

  const groups = useMemo<ReadingGroup[]>(() => {
    const currentReadings = hanvietMap[kanjiChar];
    if (!currentReadings) return [];

    const readingList = currentReadings
      .split(',')
      .map(r => r.trim())
      .filter(Boolean);

    // Build reverse map: reading → [kanji]
    const reverseMap = new Map<string, string[]>();
    for (const [char, readings] of Object.entries(hanvietMap)) {
      const rList = readings
        .split(',')
        .map(r => r.trim())
        .filter(Boolean);
      for (const r of rList) {
        if (!reverseMap.has(r)) reverseMap.set(r, []);
        reverseMap.get(r)!.push(char);
      }
    }

    return readingList
      .map(reading => {
        const siblings = reverseMap.get(reading) || [];
        const nodes: KanjiNode[] = siblings.map(char => ({
          char,
          hanviet: reading,
          isCurrent: char === kanjiChar,
        }));
        return { reading, nodes };
      })
      .filter(g => g.nodes.length > 1); // Only show groups with siblings
  }, [kanjiChar]);

  if (groups.length === 0) return null;

  return (
    <div className={clsx('flex flex-col gap-5', className)}>
      {/* Section Header */}
      <div className='flex items-center gap-2 border-b border-(--border-color)/60 pb-3'>
        <div className='flex size-7 items-center justify-center rounded-lg bg-violet-500/15 text-violet-500'>
          <Network className='size-4' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-violet-600 dark:text-violet-400'>
            Gia đình Hán-Việt
          </h3>
          <p className='text-[11px] text-(--secondary-color)/60'>
            Chữ Hán cùng âm Hán-Việt với{' '}
            <span className='font-japanese font-bold text-(--main-color)'>
              {kanjiChar}
            </span>
          </p>
        </div>
      </div>

      {/* Reading Groups */}
      <div className='flex flex-col gap-6'>
        {groups.map(group => (
          <ReadingGroupView
            key={group.reading}
            group={group}
            currentChar={kanjiChar}
            onNodeClick={playClick}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------- Sub-component: one reading group ---------- */

interface ReadingGroupViewProps {
  group: ReadingGroup;
  currentChar: string;
  onNodeClick: () => void;
}

function ReadingGroupView({
  group,
  currentChar,
  onNodeClick,
}: ReadingGroupViewProps) {
  const { reading, nodes } = group;
  const siblings = nodes.filter(n => !n.isCurrent);

  return (
    <div className='flex flex-col gap-3'>
      {/* Reading badge */}
      <div className='flex items-center gap-2'>
        <span className='rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-black tracking-widest text-violet-600 uppercase dark:text-violet-400'>
          {reading}
        </span>
        <span className='text-xs text-(--secondary-color)/50'>
          {nodes.length} chữ cùng âm
        </span>
      </div>

      {/* Network visual: radial star from current kanji */}
      <div className='relative flex flex-wrap items-center gap-2 rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4'>
        {/* Current kanji node (always first) */}
        <div
          className='font-japanese flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-violet-500 bg-violet-500/20 text-2xl font-black text-violet-600 shadow-md ring-4 ring-violet-500/20 dark:text-violet-300'
          title={`${currentChar} — ${reading}`}
        >
          {currentChar}
        </div>

        {/* Connector arrow */}
        {siblings.length > 0 && (
          <div className='flex items-center'>
            <div className='flex h-[2px] w-5 items-center bg-violet-500/30' />
            <div className='-ml-px text-[10px] text-violet-500/50'>→</div>
          </div>
        )}

        {/* Sibling kanji nodes */}
        <div className='flex flex-wrap gap-2'>
          {siblings.map(node => (
            <SiblingNode
              key={node.char}
              char={node.char}
              reading={reading}
              onClick={onNodeClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sub-component: individual sibling node ---------- */

interface SiblingNodeProps {
  char: string;
  reading: string;
  onClick: () => void;
}

function SiblingNode({ char, reading, onClick }: SiblingNodeProps) {
  const allReadings = hanvietMap[char] || '';
  const meanings = ''; // Could enrich with kanji data if available

  return (
    <Link
      href={`/kanji/thamkanji/${encodeURIComponent(char)}`}
      prefetch={false}
      onClick={onClick}
      className='group relative flex flex-col items-center gap-0.5'
      title={`${char} — ${reading}${allReadings && allReadings !== reading ? ` (còn: ${allReadings})` : ''}`}
    >
      {/* Kanji cell */}
      <div className='font-japanese flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-violet-500/20 bg-(--card-color) text-2xl font-black text-(--secondary-color) shadow-xs transition-all duration-150 group-hover:border-violet-500/60 group-hover:bg-violet-500/10 group-hover:text-violet-600 group-hover:shadow-md active:scale-90 dark:group-hover:text-violet-300'>
        {char}
      </div>
      {/* All readings of this sibling */}
      {allReadings && (
        <span className='max-w-[48px] truncate text-center text-[9px] font-semibold text-(--secondary-color)/50 uppercase group-hover:text-violet-500'>
          {allReadings.split(',')[0].trim()}
        </span>
      )}
      {meanings && (
        <span className='max-w-[48px] truncate text-center text-[9px] text-(--secondary-color)/40'>
          {meanings}
        </span>
      )}
    </Link>
  );
}
