import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  padding: '0 1rem',

  backgroundColor: 'transparent',

  width: 'max-content',
  height: '2.4rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '5rem',

  border: `0.1rem solid ${theme.colors.base04}`,

  color: theme.colors.text01,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },
}));
