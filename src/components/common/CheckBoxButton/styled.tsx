import { styled } from '@mui/material/styles';

export const StyledCheckBoxButton = styled('button')(({ theme }) => ({
  border: 0,

  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base300,

  borderRadius: '0.2rem',

  cursor: 'pointer',

  padding: '0',

  '&:hover': {
    opacity: 0.7,
  },

  '& > svg': {
    maxWidth: '60%',
    maxheight: '40%',
  },
}));
