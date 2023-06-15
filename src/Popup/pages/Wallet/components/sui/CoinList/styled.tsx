import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  paddingBottom: '1.6rem',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ListTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'space-between',

  flexShrink: 0,
});

export const ListTitleLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-start',
});

export const ListTitleLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ListTitleLeftCountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  marginLeft: '0.4rem',
}));

export const ListTitleRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-end',
});

export const ListContainer = styled('div')({
  marginTop: '0.9rem',

  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',

  overflow: 'auto',
});
