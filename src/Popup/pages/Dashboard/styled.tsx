import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '0 1.2rem',

  height: '100%',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const TotalValueTextContainer = styled('div')(({ theme }) => ({
  paddingTop: '0.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text02,
}));

export const TotalValueContainer = styled('div')(({ theme }) => ({
  paddingTop: '0.2rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text01,
}));

export const SubInfoContainer = styled('div')({
  marginTop: '1.6rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  flexShrink: 0,
});

export const CountContainer = styled('div')({
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

export const ChainListContainer = styled('div')({
  marginTop: '1rem',

  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',

  paddingBottom: '1rem',
});

export const ChainList = styled('div')({
  overflow: 'auto',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});
