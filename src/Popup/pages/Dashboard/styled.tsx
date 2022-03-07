import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0 1.2rem',
});

export const TotalValueTextContainer = styled('div')(({ theme }) => ({
  paddingTop: '0.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const TotalValueContainer = styled('div')(({ theme }) => ({
  paddingTop: '0.2rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const CountContainer = styled('div')({
  marginTop: '1.6rem',

  display: 'flex',
  alignItems: 'center',
});

export const CountLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const CountRightContainer = styled('div')(({ theme }) => ({
  paddingLeft: '0.4rem',

  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const ChainList = styled('div')(({ theme }) => ({
  paddingTop: '0.8rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
}));
