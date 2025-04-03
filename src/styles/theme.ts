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

export type CommonColor = typeof darkCommonColor;

const darkCommonColor = {
  commonBlack: '#16181D',
  commonWhite: '#FFFFFF',
};

export type AccentColor = typeof darkThemeAccentColor;

const darkThemeAccentColor = {
  purple50: '#6432F1',
  purple100: '#7040F7',
  purple200: '#7C4FFC',
  purple300: '#8B63FD',
  purple400: '#9A77FD',
  purple500: '#A98BFD',

  green50: '#29A376',
  green100: '#2BAB7C',
  green200: '#2DB482',
  green300: '#2FBC88',
  green400: '#32C891',
  green500: '#3BCE98',

  red50: '#D4465D',
  red100: '#DB4860',
  red200: '#E34B63',
  red300: '#EB4D67',
  red400: '#F24F6A',
  red500: '#F7516C',

  yellow50: '#DF8E16',
  yellow100: '#EF9A1A',
  yellow200: '#F6A328',
  yellow300: '#F7AC3B',
  yellow400: '#F8B44F',
  yellow500: '#F8BC62',

  blue50: '#3084E8',
  blue100: '#398CEF',
  blue200: '#4294F5',
  blue300: '#4C9CFA',
  blue400: '#5BA4FB',
  blue500: '#6CADFB',
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
const b2_M_Multiline = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '2rem', letterSpacing: 'normal' };
const b3_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b3_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const b3_M_Multiline = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const b3_R_Multiline = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const b4_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const b4_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const b4_R_Multiline = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const c1_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const c2_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '0.9rem', lineHeight: '1.2rem', letterSpacing: 'normal' };

const h1n_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3rem', letterSpacing: 'normal' };
const h2n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '2rem', lineHeight: '2rem', letterSpacing: 'normal' };
const h3n_B = { fontFamily: 'Spoqa700', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h3n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h4n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.4rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const h5n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h5n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h6n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h6n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const h7n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h7n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h8n_M = { fontFamily: 'Spoqa500', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };
const h8n_R = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.4rem', letterSpacing: 'normal' };

const nh1_B = { fontFamily: 'Inter700', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3rem', letterSpacing: 'normal' };
const nh3_B = { fontFamily: 'Inter700', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const nh4_B = { fontFamily: 'Inter700', fontStyle: 'normal', fontSize: '1.4rem', lineHeight: '1.8rem', letterSpacing: 'normal' };
const nh5_B = { fontFamily: 'Inter700', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: 'normal' };
const nh6_B = { fontFamily: 'Inter700', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.6rem', letterSpacing: 'normal' };

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
  b2_M_Multiline,
  b3_M,
  b3_R,
  b3_M_Multiline,
  b3_R_Multiline,
  b4_M,
  b4_R,
  b4_R_Multiline,
  c1_M,
  c2_B,
};

export const numberTypoVariants = {
  h1n_B,
  h2n_M,
  h3n_B,
  h3n_M,
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

export const numberHideTypoVariants = { nh1_B, nh3_B, nh4_B, nh5_B, nh6_B };

export type TypoVariantKeys = keyof typeof typoVariants;
export type NumberTypoVariants = keyof typeof numberTypoVariants;
export type NumberHideTypoVariants = keyof typeof numberHideTypoVariants;

export type TypoVariants = Record<TypoVariantKeys | NumberTypoVariants | NumberHideTypoVariants, React.CSSProperties>;
export type TypeVariantsTrue = Record<TypoVariantKeys | NumberTypoVariants | NumberHideTypoVariants, true>;

export const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: { color: darkThemeColor, commonColor: darkCommonColor, accentColor: darkThemeAccentColor },
    },
    light: {
      palette: { color: darkThemeColor, commonColor: darkCommonColor, accentColor: darkThemeAccentColor },
    },
  },
  typography: {
    ...typoVariants,
    ...numberTypoVariants,
    ...numberHideTypoVariants,
  },
});
