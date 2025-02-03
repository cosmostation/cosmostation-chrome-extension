import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',
  position: 'sticky',
  top: '3rem',
  zIndex: 1,

  boxSizing: 'border-box',

  padding: '1.6rem 1.6rem 1rem',
  backgroundColor: theme.palette.color.base50,
}));
