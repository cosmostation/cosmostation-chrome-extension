import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  height: '3rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const LeftContentContainer = styled('div')({
  position: 'absolute',
  left: '1rem',

  width: 'fit-content',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const MiddleContentContainer = styled('div')({
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
});

export const RightContentContainer = styled('div')({
  position: 'absolute',
  right: '1rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});
