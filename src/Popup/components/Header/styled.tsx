import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: 'calc(100% - 1.6rem)',
  height: '5.2rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  margin: '0 0.4rem 0 1.2rem',

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
    fill: theme.colors.base06,
  },
}));
export const LeftContentTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.7rem',
  color: theme.colors.text01,
}));

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});
