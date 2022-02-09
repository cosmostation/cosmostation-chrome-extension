import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  height: '2.8rem',
  width: '2.8rem',

  borderRadius: '50%',

  backgroundColor: theme.colors.base03,
  color: theme.accentColors.white,

  padding: '0',

  '&:hover': {
    backgroundColor: theme.colors.base04,
  },

  '& > svg': {
    fill: theme.colors.base06,
    width: '2rem',
    height: '2rem',
  },

  cursor: 'pointer',

  position: 'relative',
}));

export const Badge = styled('div')<{ is_connected: number }>(({ theme, is_connected }) => ({
  width: '0.7rem',
  height: '0.7rem',

  borderRadius: '50%',

  position: 'absolute',

  top: '0.1rem',
  right: '0.1rem',

  backgroundColor: is_connected ? theme.accentColors.green : theme.accentColors.red,
}));
