import { styled } from '@mui/material/styles';

export const TopContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  marginBottom: '1.3rem',
});

export const BodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '1rem',
});

export const BodyContentsContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const AmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'baseline',
  color: theme.palette.color.base1300,
}));

export const BottomContainer = styled('div')({
  padding: '1.7rem 1.2rem 1.2rem',
  boxSizing: 'border-box',
});

export const StakeButton = styled('button')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  padding: '1rem 0',

  backgroundColor: 'rgba(255, 255, 255, 0.01)',
  backdropFilter: 'blur(1rem)',
  WebkitBackdropFilter: 'blur(1rem)',

  border: '0.1rem solid rgba(255, 255, 255, 0.1)',

  color: theme.palette.color.base1300,
  borderRadius: '0.4rem',
  cursor: 'pointer',

  boxSizing: 'border-box',

  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
}));

export const StakeIconContainer = styled('div')({
  width: '1.8rem',
  height: '1.8rem',
  marginRight: '0.4rem',
  '& > svg': {
    width: '100%',
    height: '100%',
  },
});

export const RightArrowIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  height: '1.6rem',

  marginLeft: '0.2rem',
  '& > svg': {
    width: '100%',
    height: '100%',

    fill: theme.palette.color.base800,

    '& > path': {
      fill: theme.palette.color.base800,
    },
  },
}));
