import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  width: '33.6rem',
  maxHeight: '49.7rem',
  overflow: 'auto',

  color: theme.colors.text01,
}));

export const HeaderContainer = styled('div')(({ theme }) => ({
  height: '4.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  padding: '0 1.6rem',

  width: 'calc(100% - 3.2rem)',
}));

export const HeaderLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const HeaderRightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const BodyContainer = styled('div')(({ theme }) => ({
  boxSizing: 'border-box',
  padding: '1.6rem',
}));
