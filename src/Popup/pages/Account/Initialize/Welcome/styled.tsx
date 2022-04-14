import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0 2.4rem',

  position: 'relative',
});

export const LogoContainer = styled('div')({
  paddingTop: '12rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
export const LogoImageContainer = styled('div')(({ theme }) => ({
  '& svg': {
    '& > rect': {
      fill: theme.colors.base06,
    },
    '& > path': {
      stroke: theme.colors.base01,
    },
  },
}));
export const LogoTextContainer = styled('div')(({ theme }) => ({
  marginTop: '1.5rem',

  '& svg > g > path': {
    fill: theme.colors.base06,
  },
}));

export const WelcomeContainer = styled('div')(({ theme }) => ({
  marginTop: '4rem',

  color: theme.colors.text01,

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const WelcomeTitleContainer = styled('div')({
  marginBottom: '1.2rem',
});

export const WelcomeDescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  display: 'flex',

  flexDirection: 'column',

  alignItems: 'center',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});

export const TermContainer = styled('div')({
  marginBottom: '2.3rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const TermTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'pre',
}));

export const TermButton = styled('button')(({ theme }) => ({
  cursor: 'pointer',

  padding: 0,
  border: 0,

  backgroundColor: 'transparent',

  color: theme.accentColors.purple01,
}));
