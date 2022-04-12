import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  marginTop: '1.6rem',

  display: 'flex',
  paddingBottom: '1.6rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ListTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  flexShrink: 0,
});

export const ListTitleLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ListTitleRightContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  marginLeft: '0.4rem',
}));

export const ListContainer = styled('div')({
  marginTop: '0.8rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',
});
