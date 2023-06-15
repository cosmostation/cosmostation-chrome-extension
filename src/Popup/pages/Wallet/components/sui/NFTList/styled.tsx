import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  paddingBottom: '0.9rem',
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

export const ListTitleRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  justifyContent: 'flex-end',
});

export const ListContainer = styled('div')({
  marginTop: '0.9rem',

  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(16.4rem, 1fr))',

  gridColumnGap: '0.7rem',
  gridRowGap: '0.8rem',

  overflow: 'auto',
});
