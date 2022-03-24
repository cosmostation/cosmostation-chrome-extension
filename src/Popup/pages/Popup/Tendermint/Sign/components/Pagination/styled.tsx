import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const Button = styled('button')(({ theme }) => ({
  padding: 0,
  border: 0,
  backgroundColor: theme.colors.base02,
  borderRadius: '0.5rem',

  '&:hover': {
    cursor: 'pointer',
    backgroundColor: theme.colors.base03,
  },

  '&:disabled': {
    backgroundColor: theme.colors.base02,
    opacity: 0.5,

    '&:hover': {
      cursor: 'default',
    },
  },

  '& > svg': {
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const PageContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  margin: '0 1.2rem',
}));
