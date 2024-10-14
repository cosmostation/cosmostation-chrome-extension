import type { BaseColor, ThemeStyle } from '@/types/theme';

const darkThemeColors: BaseColor = {
  base50: '#1A1D26',
  base100: '#252935',
  base150: '#363C4D',
  base200: '#7C4FFC',
};

const htmlFontSize = 10;

const h10 = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '3rem', lineHeight: '3.5rem', letterSpacing: '-0.02em' };
const h20 = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3.0rem', letterSpacing: '-0.02em' };
const h30 = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.8rem', lineHeight: '2.3rem', letterSpacing: '-0.02em' };

const h1n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '2.8rem', lineHeight: '4.1rem', letterSpacing: 'normal' };
const h2n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3.5rem', letterSpacing: 'normal' };
const h3n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.8rem', lineHeight: '2.6rem', letterSpacing: 'normal' };
const h4n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '2.2rem', letterSpacing: 'normal' };
const h5n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.9rem', letterSpacing: 'normal' };
const h6n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h7n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h8n = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.5rem', letterSpacing: 'normal' };

const hKo = { h10: h10, h20: h20, h30: h30 };
const hn = { h1n, h2n, h3n, h4n, h5n, h6n, h7n, h8n };

export const darkTheme: ThemeStyle = {
  mode: 'dark',
  baseColor: darkThemeColors,
  typography: {
    htmlFontSize,
    ...hKo,
    ...hn,
  },
};
