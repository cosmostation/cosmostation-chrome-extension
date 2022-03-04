import { styled } from '@mui/material/styles';

export const Body = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.colors.base02,

  // snackbar
  '& > .SnackbarContainer-root': {
    bottom: '7rem !important',

    '& .SnackbarContent-root': {
      fontFamily: theme.typography.h6.fontFamily,
      fontStyle: theme.typography.h6.fontStyle,
      fontSize: theme.typography.h6.fontSize,
      lineHeight: theme.typography.h6.lineHeight,
      letterSpacing: theme.typography.h6.letterSpacing,

      borderRadius: '0.8rem',

      minWidth: '29.2rem',

      height: '4rem',

      paddingTop: 0,
      paddingBottom: 0,

      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',

      '& svg': {
        fill: theme.accentColors.white,

        marginRight: '0.4rem',
      },

      '&.SnackbarItem-variantSuccess': {
        backgroundColor: theme.accentColors.green,
        color: theme.accentColors.white,
      },

      '&.SnackbarItem-variantError': {
        backgroundColor: theme.accentColors.red,
        color: theme.accentColors.white,
      },
    },
  },
}));

export const Container = styled('div')(({ theme }) => ({
  width: '36rem',
  height: '60rem',

  overflow: 'hidden',
}));
