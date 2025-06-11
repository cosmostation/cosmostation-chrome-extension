import { styled } from '@mui/material/styles';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
});

export const BodyContainer = styled('div')({});

export const BodyTopContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  margin: '1.2rem 0 0.2rem',

  columnGap: '0.4rem',

  color: theme.palette.color.base1300,
}));

export const BodyBottomContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'baseline',

  marginBottom: '1.4rem',

  color: theme.palette.color.base1000,
}));
