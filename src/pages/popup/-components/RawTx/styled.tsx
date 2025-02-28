import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  backgroundColor: theme.palette.color.base200,

  color: theme.palette.commonColor.commonWhite,
  borderRadius: '0.8rem',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
  boxSizing: 'border-box',
}));
