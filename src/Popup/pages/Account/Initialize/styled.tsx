import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0 3.2rem',
});

export const LogoContainer = styled('div')({
  paddingTop: '12rem',
  paddingBottom: '13rem',

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

export const ButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '1.6rem',
});
