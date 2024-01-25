import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.colors.base02,

  color: theme.colors.text01,
  borderRadius: '0.8rem',

  marginTop: '1rem',

  height: '32.1rem',
  overflow: 'auto',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));
