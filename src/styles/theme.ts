import { createTheme } from '@mui/material/styles';

export type Color = {
  base50: string;
  base100: string;
  base200: string;
  base300: string;
  base400: string;
  base500: string;
  base600: string;
  base700: string;
  base800: string;
  base900: string;
  base1000: string;
  base1100: string;
  base1200: string;
  base1300: string;
};

const darkThemeColor: Color = {
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

// const lightThemeColor: Color = {
//   base50: '#23272F',
//   base100: '#292E38',
//   base200: '#303541',
//   base300: '#343A46',
//   base400: '#434852',
//   base500: '#4E545F',
//   base600: '#585E6B',
//   base700: 'red',
//   base800: '#777F91',
//   base900: '#838B9C',
//   base1000: '#949BA8',
//   base1100: '#ABB0BA',
//   base1200: '#C7CAD1',
//   base1300: '#F7F7F8',
// };

export const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: { color: { ...darkThemeColor } },
    },
    // light: {
    //   palette: { color: { ...lightThemeColor } },
    // },
  },
  typography: {
    fontFamily: 'Spoqa400',
    h1: {
      fontFamily: 'Spoqa400',
      fontSize: '5rem',
    },
    h10: {
      fontFamily: 'Spoqa400',
      fontSize: '3rem',
    },
    h20: {
      fontFamily: 'Spoqa400',
      fontSize: '3rem',
    },
  },
});
