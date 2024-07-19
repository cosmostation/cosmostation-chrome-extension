import { styled } from '@mui/material/styles';

import { darkEnTheme, lightEnTheme } from '~/Popup/styles/theme';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  rowGap: '0.8rem',

  flexGrow: 1,
});

export const WrapperContainer = styled('div')({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',

  padding: '0 1.6rem 1.6rem 1.6rem',
});

export const BottomContainer = styled('div')({
  width: '100%',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  whiteSpace: 'pre-wrap',
  textAlign: 'center',
}));

export const Description2Container = styled('div')(({ theme }) => ({
  color: theme.mode === 'light' ? darkEnTheme.colors.base05 : lightEnTheme.colors.base05,

  fontFamily: theme.typography.h4.fontFamily,
  fontStyle: theme.typography.h4.fontStyle,
  fontSize: theme.typography.h5.fontSize,
  lineHeight: theme.typography.h4.lineHeight,
  letterSpacing: theme.typography.h5.letterSpacing,
}));

export const ReportContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',

  marginBottom: '2rem',

  columnGap: '0.4rem',

  color: theme.colors.text01,
}));

export const ReportButton = styled('button')(({ theme }) => ({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  color: theme.accentColors.purple01,

  cursor: 'pointer',

  position: 'relative',

  '&:hover': {
    color: theme.accentColors.purple02,
  },
}));
