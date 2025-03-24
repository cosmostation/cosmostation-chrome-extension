import { styled } from '@mui/material/styles';

export const SideTextButton = styled('button')(({ theme }) => ({
  border: 0,

  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  alignItems: 'center',

  background: 'none',

  cursor: 'pointer',

  padding: '0',

  columnGap: '0.4rem',

  color: theme.palette.color.base1200,

  '&:hover': {
    opacity: 0.7,
  },
}));

export const AmountContainer = styled('div')({
  display: 'flex',
  alignItems: 'baseline',
  textDecorationLine: 'underline',
});
