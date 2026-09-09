'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/utils/utils';
import type { CategoryWithCount } from '../types';
import { CATEGORY_NAMES_VI } from '../lib/translations';

// ============================================================================
// Types
// ============================================================================

export interface CategoryNavProps {
  /** Categories with resource counts */
  categories: CategoryWithCount[];
  /** Currently active category ID */
  activeCategory?: string;
  /** Base path for category links */
  basePath?: string;
  /** Additional CSS classes */
  className?: string;
  /** Current active locale */
  locale?: string;
}

// ============================================================================
// CategoryNav Component (Editorial Style)
// ============================================================================

/**
 * CategoryNav displays a refined editorial navigation for resource categories.
 */
export function CategoryNav({
  categories,
  activeCategory,
  basePath = '/resources',
  className,
  locale = 'vi',
}: CategoryNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const isVi = locale === 'vi';

  const getCategoryName = (category: CategoryWithCount) => {
    if (isVi && CATEGORY_NAMES_VI[category.id]) {
      return CATEGORY_NAMES_VI[category.id];
    }
    return category.name;
  };

  return (
    <nav
      ref={navRef}
      className={cn('flex flex-col space-y-8', className)}
      aria-label={isVi ? 'Danh mục tài nguyên' : 'Resource categories'}
    >
      <div>
        <h2 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
          {isVi ? 'Danh mục' : 'Collections'}
        </h2>
        <ul className='space-y-1' role='list'>
          <li>
            <Link
              href={basePath}
              className={cn(
                'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                !activeCategory
                  ? 'font-bold text-(--main-color)'
                  : 'text-(--secondary-color) hover:text-(--main-color)',
              )}
              aria-current={!activeCategory ? 'page' : undefined}
            >
              <span>{isVi ? 'Tất cả tài nguyên' : 'Library Index'}</span>
              <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                {categories.reduce((acc, cat) => acc + cat.resourceCount, 0)}
              </span>
            </Link>
          </li>

          {categories.slice(0, 8).map(category => {
            const isActive = activeCategory === category.id;
            return (
              <li key={category.id}>
                <Link
                  href={`${basePath}/${category.id}`}
                  className={cn(
                    'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                    isActive
                      ? 'font-bold text-(--main-color)'
                      : 'text-(--secondary-color) hover:text-(--main-color)',
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className='flex items-center gap-2'>
                    {isActive && (
                      <span className='h-1 w-1 rounded-full bg-(--main-color)' />
                    )}
                    {getCategoryName(category)}
                  </span>
                  <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                    {category.resourceCount}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {categories.length > 8 && (
        <div className='border-t border-(--border-color) pt-8'>
          <h2 className='mb-4 text-[10px] font-bold tracking-[0.2em] text-(--secondary-color) uppercase opacity-40'>
            {isVi ? 'Danh mục khác' : 'More Collections'}
          </h2>
          <ul className='space-y-1' role='list'>
            {categories.slice(8).map(category => {
              const isActive = activeCategory === category.id;
              return (
                <li key={category.id}>
                  <Link
                    href={`${basePath}/${category.id}`}
                    className={cn(
                      'group flex cursor-pointer items-center justify-between py-1.5 text-sm transition-all duration-300',
                      isActive
                        ? 'font-bold text-(--main-color)'
                        : 'text-(--secondary-color) hover:text-(--main-color)',
                    )}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className='flex items-center gap-2'>
                      {isActive && (
                        <span className='h-1 w-1 rounded-full bg-(--main-color)' />
                      )}
                      {getCategoryName(category)}
                    </span>
                    <span className='font-mono text-[10px] opacity-40 group-hover:opacity-100'>
                      {category.resourceCount}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}

export default CategoryNav;
