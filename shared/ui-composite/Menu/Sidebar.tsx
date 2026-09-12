/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import { Link, useRouter, usePathname } from '@/core/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  House,
  Star,
  Sparkles,
  BookOpen,
  FlaskConical,
  Languages,
  ChevronDown,
  ChevronRight,
  Repeat,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
  Heart,
  User,
  Search,
  LayoutGrid,
  Layers,
  Video,
  GraduationCap,
  ClipboardCheck,
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useClick } from '@/shared/hooks/generic/useAudio';
import { useScrollVisibility } from '@/shared/hooks/generic/useScrollVisibility';
import { ReactNode, useEffect, useRef, memo, useState } from 'react';
import { useInputPreferences } from '@/features/Preferences';
import { removeLocaleFromPath } from '@/shared/utils/pathUtils';
import type { Experiment } from '@/shared/data/experiments';
import AuroraText from '@/shared/ui/components/magicui/AuroraText';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/shared/ui/components/popover';

const SIDEBAR_SECTION_STORAGE_PREFIX = 'sidebar-collapsible-';
const SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY = 'sidebar-preferences-visited';
const SIDEBAR_ACTIVE_FLOAT_CLASSES =
  'motion-safe:animate-float [--float-distance:-3px]';

// ============================================================================
// Types
// ============================================================================

type NavItem = {
  href: string;
  labelKey: string;
  icon?: LucideIcon | null;
  /** Japanese character to use as icon (e.g., あ, 語, 字) */
  charIcon?: string;
  /** Custom icon class overrides */
  iconClassName?: string;
  /** Whether to animate the icon when not active */
  animateWhenInactive?: boolean;
  /** Whether this is a sub-item nested under a main parent */
  isSubItem?: boolean;
  /** Sub-items nested under this parent item */
  subItems?: NavItem[];
  /** Whether this item is only displayed on mobile BottomBar */
  isMobileOnly?: boolean;
};

type NavSection = {
  titleKey: string;
  items: NavItem[];
  collapsible?: boolean;
};

// ============================================================================
// Navigation Data
// ============================================================================

const mainNavItems: NavItem[] = [
  { href: '/', labelKey: 'home', icon: House },
  { href: '/progress', labelKey: 'progress', icon: Star },
  { href: '/kana', labelKey: 'kana', charIcon: 'あ' },
  { href: '/vocabulary', labelKey: 'vocabulary', charIcon: '語' },
  {
    href: '/kanji',
    labelKey: 'kanji',
    charIcon: '字',
    subItems: [
      {
        href: '/kanji/search',
        labelKey: 'kanjiSearch',
        icon: Search,
        isSubItem: true,
      },
      {
        href: '/kanji/thamkanji',
        labelKey: 'thamKanji',
        icon: LayoutGrid,
        isSubItem: true,
      },
    ],
  },
  {
    href: '/kanji/search',
    labelKey: 'kanjiSearch',
    icon: Search,
    isSubItem: true,
  },
  {
    href: '/kanji/thamkanji',
    labelKey: 'thamKanji',
    icon: LayoutGrid,
    isSubItem: true,
  },
  {
    href: '/thamlet',
    labelKey: 'thamlet',
    icon: Layers,
  },
  {
    href: '/shadowing',
    labelKey: 'shadowing',
    icon: Video,
  },
  {
    href: '/classroom',
    labelKey: 'classroom',
    icon: GraduationCap,
  },
  {
    href: '/exercises',
    labelKey: 'exercises',
    icon: ClipboardCheck,
  },
  {
    href: '/translate',
    labelKey: 'tools',
    icon: Languages,
    isMobileOnly: true,
  },
  {
    href: '/experiments',
    labelKey: 'experiments',
    icon: FlaskConical,
    isMobileOnly: true,
  },
  {
    href: '/preferences',
    labelKey: 'preferences',
    icon: Sparkles,
    animateWhenInactive: true,
  },
  {
    href: '/profile',
    labelKey: 'profile',
    icon: User,
  },
];

// Static sections that don't need lazy loading
const staticSecondaryNavSections: NavSection[] = [
  // {
  //   titleKey: 'academy',
  //   items: [
  //     { href: '/academy', labelKey: 'guides', icon: BookOpen },
  //     { href: '/resources', labelKey: 'resources', icon: Library },
  //   ],
  //   collapsible: true,
  // },
  {
    titleKey: 'tools',
    items: [
      { href: '/translate', labelKey: 'translate', icon: Languages },
      { href: '/conjugate', labelKey: 'conjugate', icon: Repeat },
      { href: '/anki-converter', labelKey: 'converter', icon: Package },
    ],
    collapsible: true,
  },
];

// Base experiments section (without dynamic experiments)
const baseExperimentsSection: NavSection = {
  titleKey: 'experiments',
  items: [],
  collapsible: true,
};

/** Toggle between aurora gradient heading (true) and original heading style (false) */
const USE_AURORA_SIDEBAR_HEADING = false;
/** Toggle between new desktop expanded nav badge icons (true) and previous icon style (false) */
const USE_NEW_SIDEBAR_ICON_BADGES = false;

// ============================================================================
// Subcomponents
// ============================================================================

type NavLinkProps = {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
  variant: 'main' | 'secondary';
  label: string;
  /** When true, uses framer-motion sliding indicator behind nav item */
  useSlidingIndicator?: boolean;
  /** Whether desktop sidebar is collapsed */
  isDesktopCollapsed?: boolean;
  /** Overrides whether the icon should bounce while inactive */
  animateIconWhenInactive?: boolean;
  /** Function to check if a specific href is active */
  checkIsActive?: (href: string) => boolean;
  className?: string;
};

const NavLink = memo(
  ({
    item,
    isActive,
    onClick,
    variant,
    label,
    useSlidingIndicator = false,
    isDesktopCollapsed = false,
    animateIconWhenInactive,
    checkIsActive,
    className,
  }: NavLinkProps) => {
    const t = useTranslations('navigation.menu');
    const Icon = item.icon;
    const isMain = variant === 'main';
    const shouldUseDesktopExpandedBadges =
      USE_NEW_SIDEBAR_ICON_BADGES && !isDesktopCollapsed;
    const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
      setIsFlyoutOpen(true);
    };

    const handleMouseLeave = () => {
      closeTimeoutRef.current = setTimeout(() => {
        setIsFlyoutOpen(false);
      }, 180);
    };

    useEffect(() => {
      return () => {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
        }
      };
    }, []);

    const inactiveClasses = 'text-(--secondary-color) hover:bg-(--card-color)';

    const renderIconGlyph = (className?: string): ReactNode => {
      if (item.charIcon) {
        return (
          <span
            className={clsx(
              'inline-flex items-center justify-center leading-none font-bold',
              isDesktopCollapsed ? 'text-xl' : !isMain ? 'text-sm' : 'text-2xl',
              className,
            )}
          >
            {item.charIcon}
          </span>
        );
      }

      if (Icon) {
        return (
          <Icon
            className={clsx(
              'shrink-0',
              isDesktopCollapsed
                ? 'h-5 w-5 sm:h-5.5 sm:w-5.5'
                : !isMain
                  ? 'h-4 w-4'
                  : 'h-6 w-6',
              (animateIconWhenInactive ?? item.animateWhenInactive) &&
                !isActive &&
                !(isDesktopCollapsed && isMain) &&
                'motion-safe:animate-bounce',
              item.iconClassName,
              className,
            )}
          />
        );
      }

      return null;
    };

    const renderIcon = (): ReactNode => {
      if (!shouldUseDesktopExpandedBadges) {
        return renderIconGlyph();
      }

      return (
        <>
          <span className='lg:hidden'>{renderIconGlyph()}</span>
          <span className='hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border-b-4 border-(--main-color-accent) bg-(--main-color) text-(--background-color) lg:flex'>
            {renderIconGlyph('text-(--background-color)')}
          </span>
        </>
      );
    };

    const renderFlyoutPopover = (triggerElement: ReactNode) => {
      if (!isDesktopCollapsed || !hasSubItems || !item.subItems) {
        return triggerElement;
      }

      return (
        <Popover open={isFlyoutOpen} onOpenChange={setIsFlyoutOpen}>
          <PopoverTrigger asChild>{triggerElement}</PopoverTrigger>
          <PopoverContent
            side='right'
            align='start'
            sideOffset={8}
            onOpenAutoFocus={e => e.preventDefault()}
            onCloseAutoFocus={e => e.preventDefault()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className='data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=right]:slide-in-from-left-2 z-50 w-52 rounded-2xl border border-(--border-color) bg-(--card-color)/95 p-2 text-(--foreground-color) shadow-2xl backdrop-blur-xl outline-none'
          >
            <div className='flex flex-col gap-1'>
              {/* Category Header */}
              <Link
                href={item.href}
                prefetch={false}
                onClick={() => {
                  setIsFlyoutOpen(false);
                  onClick();
                }}
                className='mb-0.5 flex items-center gap-2 border-b border-(--border-color)/50 px-3 py-1.5 text-xs font-bold tracking-wider text-(--main-color) uppercase transition-colors hover:text-(--main-color-accent)'
              >
                <span className='flex h-4 w-4 shrink-0 items-center justify-center font-bold'>
                  {item.charIcon || (Icon && <Icon className='h-3.5 w-3.5' />)}
                </span>
                <span>{label}</span>
              </Link>

              {/* Vertical Sub-Items List */}
              {item.subItems.map(sub => {
                const isSubActive = checkIsActive
                  ? checkIsActive(sub.href)
                  : false;
                const SubIcon = sub.icon;
                return (
                  <Link
                    key={sub.href}
                    href={sub.href}
                    prefetch={false}
                    onClick={() => {
                      setIsFlyoutOpen(false);
                      onClick();
                    }}
                    className={clsx(
                      'group/sub flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 sm:text-sm',
                      isSubActive
                        ? 'border-b-2 border-(--main-color-accent) bg-(--main-color) text-(--background-color) shadow-sm'
                        : 'text-(--secondary-color) hover:bg-(--background-color) hover:text-(--main-color)',
                    )}
                  >
                    <span
                      className={clsx(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isSubActive
                          ? 'text-(--background-color)'
                          : 'text-(--secondary-color) group-hover/sub:text-(--main-color)',
                      )}
                    >
                      {sub.charIcon ? (
                        <span className='text-base leading-none font-bold'>
                          {sub.charIcon}
                        </span>
                      ) : SubIcon ? (
                        <SubIcon className='h-4 w-4 shrink-0' />
                      ) : null}
                    </span>
                    <span className='font-medium whitespace-nowrap'>
                      {t(sub.labelKey as any)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      );
    };

    // Sliding indicator style - indicator is rendered separately and animates between items
    if (useSlidingIndicator) {
      const indicatorClasses = clsx(
        'h-full w-full rounded-2xl bg-(--main-color)',
        isDesktopCollapsed
          ? 'border-b-4 border-(--main-color-accent)'
          : 'border-b-6 lg:border-b-8 border-(--main-color-accent)',
      );
      const activeTextClass = 'text-(--background-color)';

      const element = (
        <div
          onMouseEnter={
            isDesktopCollapsed && hasSubItems ? handleMouseEnter : undefined
          }
          onMouseLeave={
            isDesktopCollapsed && hasSubItems ? handleMouseLeave : undefined
          }
          className={clsx(
            'relative overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:w-full',
            item.isSubItem && 'max-lg:hidden',
            item.isSubItem &&
              (isDesktopCollapsed
                ? 'lg:pointer-events-none lg:max-h-0 lg:opacity-0'
                : 'lg:max-h-12 lg:opacity-100'),
            item.isMobileOnly && 'lg:hidden',
            className,
          )}
        >
          {/* Sliding indicator - smooth spring animation */}
          {isActive && (
            <motion.div
              layoutId='sidebar-nav-indicator'
              className='absolute inset-0 rounded-2xl'
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
              }}
            >
              <div
                className={clsx(indicatorClasses, SIDEBAR_ACTIVE_FLOAT_CLASSES)}
              />
            </motion.div>
          )}
          <Link
            href={item.href}
            prefetch={false}
            onClick={onClick}
            title={label}
            className={clsx(
              'group relative z-10 flex rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              isDesktopCollapsed
                ? 'lg:w-full lg:flex-col lg:items-center lg:justify-center lg:px-1 lg:py-2'
                : 'lg:w-full lg:flex-row lg:items-center lg:gap-2.5 lg:px-2.5 lg:py-2',
              item.isSubItem ? 'lg:text-lg' : undefined,
              'max-lg:justify-center max-lg:px-1.5 max-lg:pt-1 max-lg:pb-2.5 sm:max-lg:px-2.5',
              item.isSubItem && 'lg:pr-4 lg:pl-8',
              (!isMain || item.isSubItem) && 'max-lg:hidden',
              item.isMobileOnly && 'lg:hidden',
              isActive && SIDEBAR_ACTIVE_FLOAT_CLASSES,
              isActive
                ? activeTextClass
                : 'text-(--secondary-color) hover:bg-(--card-color) hover:text-(--main-color)',
            )}
          >
            <span
              className={clsx(
                'flex shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
                isDesktopCollapsed ? 'h-7 w-7' : 'h-9 w-9',
                !isActive &&
                  !(isDesktopCollapsed && isMain) &&
                  'lg:text-(--main-color)',
                !isActive &&
                  isDesktopCollapsed &&
                  'text-(--secondary-color) group-hover:text-(--main-color)',
              )}
            >
              {renderIcon()}
            </span>
            <span
              className={clsx(
                isMain && 'max-lg:hidden',
                'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
                isDesktopCollapsed
                  ? 'lg:mt-0.5 lg:line-clamp-2 lg:block lg:w-full lg:px-0.5 lg:text-center lg:text-[11px] lg:leading-[1.15] lg:font-semibold lg:tracking-tight lg:break-words'
                  : 'lg:ml-2.5 lg:max-w-[200px] lg:translate-x-0 lg:overflow-hidden lg:text-left lg:text-base lg:font-bold lg:whitespace-nowrap lg:opacity-100',
              )}
            >
              {label}
            </span>
            {isDesktopCollapsed && hasSubItems && (
              <ChevronRight
                className={clsx(
                  'mt-0.5 h-2.5 w-2.5 shrink-0 transition-transform duration-200 max-lg:hidden',
                  isActive
                    ? 'text-(--background-color)'
                    : 'text-(--secondary-color)/70 group-hover:translate-x-0.5 group-hover:text-(--main-color)',
                )}
              />
            )}
          </Link>
        </div>
      );

      return renderFlyoutPopover(element);
    }

    // Default Link style (inactive)
    const defaultElement = (
      <div
        onMouseEnter={
          isDesktopCollapsed && hasSubItems ? handleMouseEnter : undefined
        }
        onMouseLeave={
          isDesktopCollapsed && hasSubItems ? handleMouseLeave : undefined
        }
        className='lg:w-full'
      >
        <Link
          href={item.href}
          prefetch={false}
          title={label}
          className={clsx(
            'group relative flex rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
            isDesktopCollapsed
              ? 'lg:w-full lg:flex-col lg:items-center lg:justify-center lg:px-1 lg:py-2'
              : 'lg:w-full lg:flex-row lg:items-center lg:gap-2.5 lg:px-2.5 lg:py-2',
            'max-lg:justify-center max-lg:px-3 max-lg:py-2',
            !isMain && 'max-lg:hidden',
            inactiveClasses,
            className,
          )}
          onClick={onClick}
        >
          <span
            className={clsx(
              'flex shrink-0 items-center justify-center rounded-xl transition-colors duration-200',
              isDesktopCollapsed ? 'h-7 w-7' : 'h-9 w-9',
            )}
          >
            {renderIcon()}
          </span>
          <span
            className={clsx(
              isMain && 'max-lg:hidden',
              'transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              isDesktopCollapsed
                ? 'lg:mt-0.5 lg:line-clamp-2 lg:block lg:w-full lg:px-0.5 lg:text-center lg:text-[11px] lg:leading-[1.15] lg:font-semibold lg:tracking-tight lg:break-words'
                : 'lg:ml-2.5 lg:max-w-[200px] lg:translate-x-0 lg:overflow-hidden lg:text-left lg:text-base lg:font-bold lg:whitespace-nowrap lg:opacity-100',
            )}
          >
            {label}
          </span>
          {isDesktopCollapsed && hasSubItems && (
            <ChevronRight
              className={clsx(
                'mt-0.5 h-2.5 w-2.5 shrink-0 transition-transform duration-200 max-lg:hidden',
                isActive
                  ? 'text-(--background-color)'
                  : 'text-(--secondary-color)/70 group-hover:translate-x-0.5 group-hover:text-(--main-color)',
              )}
            />
          )}
        </Link>
      </div>
    );

    return renderFlyoutPopover(defaultElement);
  },
);

NavLink.displayName = 'NavLink';

type SectionHeaderProps = {
  title: string;
  icon: LucideIcon;
  collapsible?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
};

const SectionHeader = ({
  title,
  icon: Icon,
  collapsible = false,
  isExpanded = false,
  onToggle,
}: SectionHeaderProps) => {
  if (collapsible) {
    return (
      <button
        onClick={onToggle}
        className='group mt-2 mb-2 flex w-full cursor-pointer items-center gap-2 px-4 text-base text-(--main-color) uppercase opacity-70 transition-opacity hover:opacity-100 max-lg:hidden'
      >
        {isExpanded ? (
          <ChevronDown className='h-4 w-4 text-(--border-color) transition-colors duration-300 group-hover:text-(--main-color)' />
        ) : (
          <ChevronRight className='h-4 w-4 text-(--border-color) transition-colors duration-300 group-hover:text-(--main-color)' />
        )}
        <span className='hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color-accent) group-hover:bg-(--main-color) lg:flex'>
          <Icon className='h-4 w-4 text-(--background-color)' />
        </span>
        {title}
      </button>
    );
  }

  return (
    <div className='mt-3 w-full px-4 text-sm text-(--main-color) uppercase opacity-70 max-lg:hidden'>
      <span className='flex items-center gap-1'>
        <span className='hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg border-b-4 border-(--secondary-color-accent) bg-(--secondary-color) text-(--background-color) transition-colors duration-300 group-hover:border-(--main-color-accent) group-hover:bg-(--main-color) lg:flex'>
          <Icon className='h-4 w-4 text-(--background-color)' />
        </span>
        {title}
      </span>
    </div>
  );
};

// ============================================================================
// Main Component
// ============================================================================

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const pathWithoutLocale = removeLocaleFromPath(pathname);
  const t = useTranslations('navigation.menu');

  const { hotkeysOn } = useInputPreferences();
  const { playClick } = useClick();

  const escButtonRef = useRef<HTMLButtonElement | null>(null);

  // Lazy load experiments
  const [loadedExperiments, setLoadedExperiments] = useState<Experiment[]>([]);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const isVisible = useScrollVisibility();
  const [hasMounted, setHasMounted] = useState(false);
  // Mặc định thu sidebar lại khi vào các trang
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(true);
  const [hasVisitedPreferences, setHasVisitedPreferences] = useState(false);
  const [isAcademyExpanded, setIsAcademyExpanded] = useState(false);
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);
  const [isExperimentsExpanded, setIsExperimentsExpanded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    setHasVisitedPreferences(
      localStorage.getItem(SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY) === 'true',
    );

    const storedAcademy = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}academy`,
    );
    if (storedAcademy !== null) setIsAcademyExpanded(storedAcademy === 'true');

    const storedTools = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}tools`,
    );
    if (storedTools !== null) setIsToolsExpanded(storedTools === 'true');

    const storedExperiments = sessionStorage.getItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}experiments`,
    );
    if (storedExperiments !== null)
      setIsExperimentsExpanded(storedExperiments === 'true');

    setHasMounted(true);
  }, []);

  useEffect(() => {
    const EXPERIMENTS_ORDER_KEY = 'sidebar-experiments-order';

    const shuffleExperiments = (experiments: Experiment[]) => {
      const shuffled = [...experiments];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const persistOrder = (experimentsList: Experiment[]) => {
      if (typeof window === 'undefined') return;
      sessionStorage.setItem(
        EXPERIMENTS_ORDER_KEY,
        JSON.stringify(experimentsList.map(exp => exp.href)),
      );
    };

    // Dynamically import experiments data
    import('@/shared/data/experiments').then(module => {
      const experiments = module.experiments;

      if (typeof window === 'undefined') {
        setLoadedExperiments(experiments);
        return;
      }

      const storedOrder = sessionStorage.getItem(EXPERIMENTS_ORDER_KEY);

      if (storedOrder) {
        try {
          const hrefOrder: string[] = JSON.parse(storedOrder);
          const orderMap = new Map(
            hrefOrder.map((href, index) => [href, index]),
          );

          const knownExperiments = experiments
            .filter(exp => orderMap.has(exp.href))
            .sort(
              (a, b) =>
                (orderMap.get(a.href) ?? 0) - (orderMap.get(b.href) ?? 0),
            );
          const newExperiments = experiments.filter(
            exp => !orderMap.has(exp.href),
          );
          const combined = [...knownExperiments, ...newExperiments];

          persistOrder(combined);
          setLoadedExperiments(combined);
          return;
        } catch {
          sessionStorage.removeItem(EXPERIMENTS_ORDER_KEY);
        }
      }

      const shuffledExperiments = shuffleExperiments(experiments);
      persistOrder(shuffledExperiments);
      setLoadedExperiments(shuffledExperiments);
    });
  }, []);

  useEffect(() => {
    if (!hasMounted || typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}academy`,
      String(isAcademyExpanded),
    );
  }, [isAcademyExpanded, hasMounted]);

  useEffect(() => {
    if (!hasMounted || typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}tools`,
      String(isToolsExpanded),
    );
  }, [isToolsExpanded, hasMounted]);

  useEffect(() => {
    if (!hasMounted || typeof window === 'undefined') return;

    sessionStorage.setItem(
      `${SIDEBAR_SECTION_STORAGE_PREFIX}experiments`,
      String(isExperimentsExpanded),
    );
  }, [isExperimentsExpanded, hasMounted]);

  // Khi chuyển trang hoặc vào các trang thì mặc định thu sidebar lại
  useEffect(() => {
    setIsDesktopSidebarCollapsed(true);
  }, [pathWithoutLocale]);

  useEffect(() => {
    if (!hasMounted || typeof window === 'undefined') return;
    if (pathWithoutLocale !== '/preferences' || hasVisitedPreferences) return;

    localStorage.setItem(SIDEBAR_PREFERENCES_VISITED_STORAGE_KEY, 'true');
    setHasVisitedPreferences(true);
  }, [hasVisitedPreferences, pathWithoutLocale, hasMounted]);

  useEffect(() => {
    if (pathWithoutLocale.startsWith('/experiments')) {
      setIsExperimentsExpanded(prev => (prev ? prev : true));
    }
  }, [pathWithoutLocale]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener('change', updateViewport);

    return () => {
      mediaQuery.removeEventListener('change', updateViewport);
    };
  }, []);

  // Build secondary nav sections with lazy-loaded experiments
  const secondaryNavSections: NavSection[] = [
    ...staticSecondaryNavSections,
    {
      ...baseExperimentsSection,
      items: [
        ...baseExperimentsSection.items,
        ...(isExperimentsExpanded
          ? loadedExperiments.map(exp => ({
              href: exp.href,
              labelKey: exp.name, // Will just render name directly since it's an experiment
              icon: exp.icon || null,
            }))
          : []),
      ],
    },
  ];

  useEffect(() => {
    if (!hotkeysOn) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in form elements
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (event.key === 'Escape') {
        escButtonRef.current?.click();
      } else if (event.key.toLowerCase() === 'h') {
        router.push('/');
      } else if (event.key.toLowerCase() === 'p') {
        router.push('/preferences');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hotkeysOn, router]);

  const isActive = (href: string) => {
    if (href === '/kana') {
      return (
        pathWithoutLocale === href || pathWithoutLocale.startsWith('/kana/')
      );
    }
    if (href === '/translate') {
      return (
        pathWithoutLocale === '/translate' ||
        pathWithoutLocale === '/conjugate' ||
        pathWithoutLocale === '/anki-converter'
      );
    }
    if (href === '/experiments') {
      return pathWithoutLocale.startsWith('/experiments');
    }
    if (href === '/thamlet') {
      return (
        pathWithoutLocale === href || pathWithoutLocale.startsWith('/thamlet/')
      );
    }
    if (href === '/shadowing') {
      return (
        pathWithoutLocale === href ||
        pathWithoutLocale.startsWith('/shadowing/')
      );
    }

    if (href === '/kanji') {
      if (isDesktopSidebarCollapsed) {
        return (
          pathWithoutLocale === '/kanji' ||
          pathWithoutLocale.startsWith('/kanji/')
        );
      }
      return pathWithoutLocale === href;
    }
    if (href === '/vocabulary') {
      return (
        pathWithoutLocale === '/vocabulary' ||
        pathWithoutLocale.startsWith('/vocabulary/')
      );
    }
    if (href === '/classroom') {
      return (
        pathWithoutLocale === '/classroom' ||
        pathWithoutLocale.startsWith('/classroom/')
      );
    }
    if (href === '/exercises') {
      return (
        pathWithoutLocale === '/exercises' ||
        pathWithoutLocale.startsWith('/exercises/')
      );
    }

    return pathWithoutLocale === href;
  };

  const toggleDesktopSidebarCollapse = () => {
    playClick();
    setIsDesktopSidebarCollapsed(prev => !prev);
  };

  return (
    <motion.aside
      id='main-sidebar'
      initial={false}
      animate={{
        y: isMobileViewport ? (isVisible ? 0 : '100%') : 0,
        opacity: isMobileViewport ? (isVisible ? 1 : 0) : 1,
      }}
      transition={{
        duration: 0.3,
        ease: [0.32, 0.72, 0, 1],
      }}
      className={clsx(
        'flex lg:flex-col lg:items-start',
        'lg:relative lg:sticky lg:top-0 lg:h-screen lg:overflow-x-hidden lg:overflow-y-hidden',
        'max-lg:fixed max-lg:bottom-0 max-lg:w-full',
        'max-lg:bg-(--card-color)',
        'z-50',
        'border-(--border-color) max-lg:items-center max-lg:justify-evenly max-lg:border-t-2 max-lg:py-2',
        'lg:border-r',
        'lg:transition-[width,padding] lg:duration-300 lg:ease-[cubic-bezier(0.32,0.72,0,1)]',
        isDesktopSidebarCollapsed
          ? 'lg:w-24 lg:px-1.5 lg:pt-3 lg:pb-3'
          : 'lg:w-80 lg:px-3 lg:pt-6 lg:pb-4',
      )}
      // style={{ scrollbarGutter: 'stable' }}
    >
      {/* Logo */}
      <div
        className={clsx(
          'hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:block',
          isDesktopSidebarCollapsed
            ? 'pointer-events-none mb-0 max-h-0 opacity-0'
            : 'mb-2 max-h-16 opacity-100',
        )}
      >
        <h1 className='flex items-center gap-1.5 pl-3 text-3xl whitespace-nowrap select-none'>
          {USE_AURORA_SIDEBAR_HEADING ? (
            <>
              <AuroraText className='font-bold'>PThamSS</AuroraText>
              <AuroraText className='font-normal'>
                <Heart className='ml-1 inline-block size-9 fill-current text-red-500' />
              </AuroraText>
            </>
          ) : (
            <>
              <span className='font-bold'> PThamSS</span>
              <span className='font-normal text-(--secondary-color)'>
                <Heart className='ml-1 inline-block size-9 fill-current text-red-500' />
              </span>
            </>
          )}
        </h1>
      </div>

      {/* Scrollable Navigation Area */}
      <div
        className={clsx(
          'max-lg:contents',
          'lg:flex lg:w-full lg:flex-1 lg:flex-col lg:gap-1 lg:overflow-x-hidden lg:overflow-y-auto lg:pr-0.5',
        )}
      >
        {/* Main Navigation - with sliding indicator */}
        <div
          className={clsx(
            'max-lg:flex max-lg:w-full max-lg:items-center max-lg:justify-evenly',
            'lg:flex lg:w-full lg:flex-col lg:gap-1',
          )}
        >
          {mainNavItems.map(item => (
            <NavLink
              key={item.href}
              item={item}
              label={t(item.labelKey as any)}
              isActive={isActive(item.href)}
              checkIsActive={isActive}
              onClick={playClick}
              variant='main'
              useSlidingIndicator={true}
              isDesktopCollapsed={isDesktopSidebarCollapsed}
              animateIconWhenInactive={
                !hasVisitedPreferences && item.href === '/preferences'
              }
              className={item.href === '/profile' ? 'lg:hidden' : undefined}
            />
          ))}
        </div>

        {/* Secondary Navigation Sections */}
        <div
          className={clsx(
            'hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:flex lg:flex-col',
            isDesktopSidebarCollapsed
              ? 'pointer-events-none max-h-0 opacity-0'
              : 'max-h-[1200px] opacity-100',
          )}
        >
          {secondaryNavSections.map(section => {
            // Determine which expand state and toggle function to use based on section title
            const sectionTitleKey = section.titleKey;
            const translatedTitle = t(sectionTitleKey as any);
            const isExpanded =
              sectionTitleKey === 'academy'
                ? isAcademyExpanded
                : sectionTitleKey === 'tools'
                  ? isToolsExpanded
                  : isExperimentsExpanded;
            const onToggle =
              sectionTitleKey === 'academy'
                ? () => setIsAcademyExpanded(prev => !prev)
                : sectionTitleKey === 'tools'
                  ? () => setIsToolsExpanded(prev => !prev)
                  : () => setIsExperimentsExpanded(prev => !prev);

            return (
              <div key={section.titleKey} className='contents'>
                <SectionHeader
                  title={translatedTitle}
                  icon={
                    section.titleKey === 'academy'
                      ? BookOpen
                      : section.titleKey === 'tools'
                        ? Languages
                        : FlaskConical
                  }
                  collapsible={section.collapsible}
                  isExpanded={isExpanded}
                  onToggle={onToggle}
                />
                {/* Only show items if section is expanded or not collapsible */}
                {(!section.collapsible || isExpanded) &&
                  section.items.length > 0 && (
                    <div className='flex w-full flex-col gap-0 max-lg:hidden'>
                      {section.items.map(item => {
                        // Experiments might not have translations, so we fallback to labelKey directly
                        const itemLabel =
                          section.titleKey === 'experiments'
                            ? item.labelKey
                            : t(item.labelKey as any);
                        return (
                          <NavLink
                            key={item.href}
                            item={item}
                            label={itemLabel}
                            isActive={isActive(item.href)}
                            onClick={playClick}
                            variant='secondary'
                            useSlidingIndicator={true}
                            isDesktopCollapsed={isDesktopSidebarCollapsed}
                          />
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Footer Area (Desktop Only) */}
      <div className='hidden lg:mt-auto lg:flex lg:w-full lg:shrink-0 lg:flex-col lg:gap-2 lg:pt-2'>
        <NavLink
          item={{ href: '/profile', labelKey: 'profile', icon: User }}
          label={t('profile' as any)}
          isActive={isActive('/profile')}
          onClick={playClick}
          variant='main'
          useSlidingIndicator={true}
          isDesktopCollapsed={isDesktopSidebarCollapsed}
        />

        <button
          onClick={toggleDesktopSidebarCollapse}
          className={clsx(
            'group flex cursor-pointer items-center rounded-2xl text-(--secondary-color) transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-(--card-color) hover:text-(--main-color)',
            isDesktopSidebarCollapsed
              ? 'w-full flex-col justify-center gap-0.5 px-1 py-2'
              : 'w-full gap-2.5 px-2.5 py-2',
          )}
          aria-label={
            isDesktopSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
          }
          title={isDesktopSidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-xl sm:h-8 sm:w-8'>
            {isDesktopSidebarCollapsed ? (
              <PanelLeftOpen className='h-5 w-5 shrink-0 transition-transform duration-300' />
            ) : (
              <PanelLeftClose className='h-5 w-5 shrink-0 transition-transform duration-300' />
            )}
          </span>
          <span
            className={clsx(
              'whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
              isDesktopSidebarCollapsed
                ? 'mt-0.5 text-center text-[10px] leading-none font-semibold'
                : 'max-w-[160px] translate-x-0 overflow-hidden text-xs font-semibold opacity-100',
            )}
          >
            {isDesktopSidebarCollapsed ? 'Mở rộng' : 'Thu gọn menu'}
          </span>
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
