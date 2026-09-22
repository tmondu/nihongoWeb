// All supported locales
export const allLocales = ['vi', 'en'] as const;
export type AllLocale = (typeof allLocales)[number];

export const locales = ['vi', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'vi';

export const localeNames: Record<AllLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

export const localeLabels: Record<AllLocale, string> = {
  vi: 'VI',
  en: 'EN',
};
