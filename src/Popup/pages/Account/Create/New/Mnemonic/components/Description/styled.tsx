import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',

  padding: '1.2rem 4.25rem',

  textAlign: 'center',

  color: theme.colors.text02,

  wordBreak: 'break-word',
}));
