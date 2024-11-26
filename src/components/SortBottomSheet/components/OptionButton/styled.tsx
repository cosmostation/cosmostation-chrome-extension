import { styled } from '@mui/material/styles';

export const StyledOptionButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '2.2rem 1.6rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  border: 'none',

  color: theme.palette.color.base1300,
  backgroundColor: 'transparent',

  '&:hover': {
    backgroundColor: theme.palette.color.base200,
  },
}));

export const ActiveBadge = styled('div')({
  width: '1.5rem',
  height: '1.5rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '50%',

  background: 'rgba(124, 79, 252, 1)',
});
