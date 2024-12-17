import { styled } from '@mui/material/styles';

export const StyledChipButton = styled('button')(({ theme }) => ({
  minWidth: '5.6rem',
  height: 'fit-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  background: 'none',
  backgroundColor: theme.palette.color.base100,

  borderRadius: '1.9rem',
  border: `0.1rem solid ${theme.palette.color.base200}`,

  color: theme.palette.color.base1300,
  cursor: 'pointer',

  padding: '0.7rem 1.1rem',

  '&:hover': {
    opacity: 0.7,
  },
}));
