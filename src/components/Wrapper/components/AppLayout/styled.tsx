import { styled } from '@mui/material/styles';

export const PopupLayout = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: '55rem',
  minWidth: '36rem',
  height: '100vh',
  minHeight: '60rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  backgroundColor: theme.palette.color.base300,
}));
