import { styled } from '@mui/material/styles';

export const Body = styled('div')(({ theme }) => ({
  width: '100%',
  minWidth: '36rem',
  height: '100vh',
  minHeight: '60rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.colors.base02,

  // snackbar
  '& > .SnackbarContainer-root': {
    bottom: '2.4rem !important',

    '& .SnackbarContent-root': {
      fontFamily: theme.typography.h6.fontFamily,
      fontStyle: theme.typography.h6.fontStyle,
      fontSize: theme.typography.h6.fontSize,
      lineHeight: theme.typography.h6.lineHeight,
      letterSpacing: theme.typography.h6.letterSpacing,

      borderRadius: '0.8rem',

      minWidth: '29.2rem',

      minHeight: '4rem',

      paddingTop: 0,
      paddingBottom: 0,

      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '& svg': {
        fill: theme.accentColors.white,

        marginRight: '0.4rem',

        minWidth: '1.6rem',
        height: '1.6rem',
      },

      '&.SnackbarItem-variantSuccess': {
        backgroundColor: theme.accentColors.green01,
        color: theme.accentColors.white,
      },

      '&.SnackbarItem-variantError': {
        backgroundColor: theme.accentColors.red,
        color: theme.accentColors.white,
      },
    },
  },

  'div::-webkit-scrollbar': {
    width: '0.1rem',
    height: '0.1rem',
    backgroundColor: 'transparent',
  },
  'div::-webkit-scrollbar-thumb': {
    backgroundColor: theme.colors.base05,
  },
  'div::-webkit-scrollbar-corner': {
    backgroundColor: 'transparent',
  },
}));

export const Container = styled('div')({
  width: '36rem',
  height: '60rem',

  overflow: 'hidden',
});
