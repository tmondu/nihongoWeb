import {
  Be_Vietnam_Pro,
  Nunito,
  Inter,
  Montserrat,
  Roboto,
} from 'next/font/google';

export type FontConfig = {
  name: string;
  font: {
    className: string;
    style?: {
      fontFamily: string;
    };
  };
};

const beVietnamPro = Be_Vietnam_Pro({
  weight: ['400', '500', '600', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

const nunito = Nunito({
  weight: ['400', '600', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

const inter = Inter({
  weight: ['400', '500', '600', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

const montserrat = Montserrat({
  weight: ['400', '500', '600', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['vietnamese', 'latin'],
  display: 'swap',
  preload: false,
  fallback: ['system-ui', 'sans-serif'],
});

export const vietnameseFonts: FontConfig[] = [
  {
    name: 'Be Vietnam Pro',
    font: beVietnamPro,
  },
  {
    name: 'Nunito',
    font: nunito,
  },
  {
    name: 'Inter',
    font: inter,
  },
  {
    name: 'Montserrat',
    font: montserrat,
  },
  {
    name: 'Roboto',
    font: roboto,
  },
];

export default vietnameseFonts;
