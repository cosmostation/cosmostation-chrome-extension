import { styled } from '@mui/material/styles';

import { THEME_TYPE } from '~/constants/theme';
import { darkEnTheme, lightEnTheme } from '~/Popup/styles/theme';
import type { ThemeType } from '~/types/theme';

export const Container = styled('div')({
  padding: '0 0 1.6rem 0',

  position: 'relative',

  height: '100%',
});

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  rowGap: '0.8rem',

  padding: '0 1.6rem 0 1.6rem',

  marginTop: '10rem',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',
  left: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'flex',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  whiteSpace: 'pre-wrap',

  textAlign: 'center',
}));

type Description2ContainerProps = {
  'data-theme-type': ThemeType;
};

export const Description2Container = styled('div')<Description2ContainerProps>(({ theme, ...props }) => ({
  color: props['data-theme-type'] === THEME_TYPE.LIGHT ? darkEnTheme.colors.base05 : lightEnTheme.colors.base05,

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
