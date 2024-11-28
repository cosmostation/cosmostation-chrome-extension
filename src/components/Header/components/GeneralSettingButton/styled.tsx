import { styled } from '@mui/material/styles';

export const StyledCheckBoxTextButton = styled('button')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  width: 'fit-content',
  height: 'fit-content',

  cursor: 'pointer',

  padding: '0',
  border: 'none',
  background: 'none',

  color: theme.palette.color.base1000,

  '&:hover': {
    opacity: '0.8',
  },
}));

export const StyledCheckBox = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.palette.color.base300,

  borderRadius: '0.2rem',

  cursor: 'pointer',

  '&:hover': {
    opacity: 0.7,
  },

  '& > svg': {
    maxWidth: '60%',
    maxheight: '40%',
  },
}));
