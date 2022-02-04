export type ThemeStyle = {
  colors: Colors;
  typography: {
    htmlFontSize: number;
    h1: Record<string, unknown>;
    h2: Record<string, unknown>;
    h3: Record<string, unknown>;
    h4: Record<string, unknown>;
    h5: Record<string, unknown>;
    h6: Record<string, unknown>;
    h1n: Record<string, unknown>;
    h2n: Record<string, unknown>;
    h3n: Record<string, unknown>;
    h4n: Record<string, unknown>;
  };
};

export type Colors = {
  base01: string;
  base02: string;
  base03: string;
  base04: string;
  base05: string;
  base06: string;
  text01: string;
  text02: string;
};

const lightThemeColors: Colors = {
  base01: '#FFFFFF',
  base02: '#F5F6F9',
  base03: '#E7EEF6',
  base04: '#E7EEF6',
  base05: '#96A6BF',
  base06: '#1A1D26',
  text01: '#1A1D26',
  text02: '#96A6BF',
};

const darkThemeColors: Colors = {
  base01: '#1A1D26',
  base02: '#2D3241',
  base03: '#363C4D',
  base04: '#444860',
  base05: '#727E91',
  base06: '#FFFFFF',
  text01: '#FFFFFF',
  text02: '#727E91',
};

const htmlFontSize = 10;

const h1En = { fontFamily: 'Inter600', fontStyle: 'normal', fontSize: '2.8rem', lineHeight: '3.4rem' };
const h2En = { fontFamily: 'Inter600', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '2.9rem' };
const h3En = { fontFamily: 'Inter600', fontStyle: 'normal', fontSize: '1.8rem', lineHeight: '2.2rem' };
const h4En = { fontFamily: 'Inter600', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.8rem' };
const h5En = { fontFamily: 'Inter500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem' };
const h6En = { fontFamily: 'Inter500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.5rem' };

const h1Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '2.8rem', lineHeight: '3.5rem', letterSpacing: '-0.02em' };
const h2Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '2.4rem', lineHeight: '3.0rem', letterSpacing: '-0.02em' };
const h3Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.8rem', lineHeight: '2.3rem', letterSpacing: '-0.02em' };
const h4Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.5rem', lineHeight: '1.9rem', letterSpacing: '-0.02em' };
const h5Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.6rem', letterSpacing: '-0.02em' };
const h6Ko = { fontFamily: 'Spoqa400', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.5rem', letterSpacing: '-0.02em' };

const h1n = { fontFamily: 'Heebo500', fontStyle: 'normal', fontSize: '1.3rem', lineHeight: '1.909rem' };
const h2n = { fontFamily: 'Heebo500', fontStyle: 'normal', fontSize: '1.2rem', lineHeight: '1.763rem' };
const h3n = { fontFamily: 'Heebo500', fontStyle: 'normal', fontSize: '1.1rem', lineHeight: '1.616rem' };
const h4n = { fontFamily: 'Heebo500', fontStyle: 'normal', fontSize: '1rem', lineHeight: '1.469rem' };

const hn = { h1n, h2n, h3n, h4n };

export const darkEnTheme: ThemeStyle = {
  colors: darkThemeColors,
  typography: {
    htmlFontSize,
    h1: h1En,
    h2: h2En,
    h3: h3En,
    h4: h4En,
    h5: h5En,
    h6: h6En,
    ...hn,
  },
};

export const darkKoTheme: ThemeStyle = {
  colors: darkThemeColors,
  typography: {
    htmlFontSize,
    h1: h1Ko,
    h2: h2Ko,
    h3: h3Ko,
    h4: h4Ko,
    h5: h5Ko,
    h6: h6Ko,
    ...hn,
  },
};

export const lightEnTheme: ThemeStyle = {
  colors: lightThemeColors,
  typography: {
    htmlFontSize,
    h1: h1En,
    h2: h2En,
    h3: h3En,
    h4: h4En,
    h5: h5En,
    h6: h6En,
    ...hn,
  },
};

export const lightKoTheme: ThemeStyle = {
  colors: lightThemeColors,
  typography: {
    htmlFontSize,
    h1: h1Ko,
    h2: h2Ko,
    h3: h3Ko,
    h4: h4Ko,
    h5: h5Ko,
    h6: h6Ko,
    ...hn,
  },
};
