import { styled } from '@mui/material/styles';

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
}));
