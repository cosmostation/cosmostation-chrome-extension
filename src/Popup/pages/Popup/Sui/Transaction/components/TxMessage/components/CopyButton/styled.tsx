import { styled } from '@mui/material/styles';

export const Button = styled('button')(({ theme }) => ({
  backgroundColor: 'transparent',
  cursor: 'pointer',
  border: 0,
  padding: '0',
  marginLeft: '0.4rem',

  '& > svg': {
    fill: theme.colors.text02,

    '& > path': {
      fill: theme.colors.text02,
    },
  },
}));
