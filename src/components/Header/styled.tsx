import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  height: '3rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 1rem',

  backgroundColor: theme.palette.color.base100,

  boxSizing: 'border-box',

  position: 'sticky',
  top: 0,
  zIndex: 1000,
}));

export const LeftContentContainer = styled('div')({
  position: 'absolute',
  left: '1rem',

  width: 'fit-content',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const MiddleContentContainer = styled('div')({
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});
