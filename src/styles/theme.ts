import { createTheme } from '@mui/material/styles';

export type Color = typeof darkThemeColor;

const darkThemeColor = {
  base50: '#23272F',
  base100: '#292E38',
  base200: '#303541',
  base300: '#343A46',
  base400: '#434852',
  base500: '#4E545F',
  base600: '#585E6B',
  base700: '#636A79',
  base800: '#777F91',
  base900: '#838B9C',
  base1000: '#949BA8',
  base1100: '#ABB0BA',
  base1200: '#C7CAD1',
  base1300: '#F7F7F8',
};

const h1_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3rem', letterSpacing: 'normal' };
const h2_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.6rem', lineHeight: '2rem', letterSpacing: 'normal' };
const h2_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.6rem', lineHeight: '2rem', letterSpacing: 'normal' };
const h3_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.4rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h3_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.4rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h4_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b1_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '2rem', letterSpacing: 'normal' };
const b1_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '2rem', letterSpacing: 'normal' };
const b2_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b2_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b3_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b3_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b4_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const b4_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const c1_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };

const h1n_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3rem', letterSpacing: 'normal' };
const h2n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '2rem', lineHeight: '2rem', letterSpacing: 'normal' };
const h3n_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h4n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.4rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h5n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h5n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h6n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h6n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h7n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h7n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h8n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h8n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };

export const typoVariants = {
  h1_B,
  h2_B,
  h2_M,
  h3_B,
  h3_M,
  h4_B,
  b1_B,
  b1_R,
  b2_B,
  b2_M,
  b3_M,
  b3_R,
  b4_M,
  b4_R,
  c1_M,
};

export const numberTypoVariants = {
  h1n_B,
  h2n_M,
  h3n_B,
  h4n_M,
  h5n_M,
  h5n_R,
  h6n_M,
  h6n_R,
  h7n_M,
  h7n_R,
  h8n_M,
  h8n_R,
};

type TypoVariantKeys = keyof typeof typoVariants;
type NumberTypoVariants = keyof typeof numberTypoVariants;

export type TypoVariants = Record<TypoVariantKeys | NumberTypoVariants, React.CSSProperties>;
export type TypeVariantsTrue = Record<TypoVariantKeys | NumberTypoVariants, true>;

export const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: { color: darkThemeColor },
    },
    light: {
      palette: { color: darkThemeColor },
    },
  },
  typography: {
    ...typoVariants,
    ...numberTypoVariants,
  },
});
