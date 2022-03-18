import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  marginTop: '1.6rem',
}));

export const ListTitleContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
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
});
