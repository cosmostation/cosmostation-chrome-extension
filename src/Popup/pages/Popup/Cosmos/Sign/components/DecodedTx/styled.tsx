import { styled } from '@mui/material/styles';

export const Container = styled('div')({});

export const ContentContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.colors.base02,

  color: theme.colors.text01,
  borderRadius: '0.8rem',

  height: '30.6rem',
  overflow: 'auto',

  marginTop: '1rem',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));
