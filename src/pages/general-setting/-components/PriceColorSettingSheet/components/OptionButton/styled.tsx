import { styled } from '@mui/material/styles';

export const StyledOptionButton = styled('button')(({ theme }) => ({
  width: '100%',
  padding: '1.3rem 1.6rem',

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

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  columnGap: '1rem',
});

export const LeftTextContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  rowGap: '0.4rem',
});

export const ActiveBadge = styled('div')(({ theme }) => ({
  width: '1.5rem',
  height: '1.5rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '50%',

  background: theme.palette.accentColor.purple200,
}));
