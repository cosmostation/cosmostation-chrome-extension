import { styled } from '@mui/material/styles';

export const Button = styled('button')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  backgroundColor: 'transparent',
  cursor: 'pointer',
  border: 0,
  padding: '0',
  marginLeft: '0.4rem',

  '& svg': {
    '& > path': {
      fill: theme.colors.base05,
    },
    '&:hover': {
      '& > path': {
        fill: theme.colors.base06,
      },
    },
  },
}));
