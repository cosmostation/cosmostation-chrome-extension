import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '5.2rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 0.8rem 0 1.2rem',

  backgroundColor: 'transparent',
});

export const LeftContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const LeftContentLogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg': {
    '& > rect': {
      fill: theme.colors.base06,
    },
    '& > path': {
      stroke: theme.colors.base01,
    },
  },
}));
export const LeftContentTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.7rem',
  color: theme.colors.text01,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg': {
    fill: theme.colors.text01,
  },
}));

export const RightContentContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',

  '& svg > path': {
    fill: theme.colors.text01,
  },
}));
