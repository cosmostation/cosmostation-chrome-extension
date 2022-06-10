import { styled } from '@mui/material/styles';

export const Button = styled('button')(({ theme }) => ({
  padding: '0.4rem 1rem 0.4rem 0.8rem',
  border: 0,

  backgroundColor: theme.accentColors.purple01,

  borderRadius: '5rem',

  display: 'flex',
  alignItems: 'center',

  cursor: 'pointer',
}));

export const TextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.2rem',

  color: theme.accentColors.white,
}));
