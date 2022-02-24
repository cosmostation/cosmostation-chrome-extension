import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: 'calc(100% - 2.4rem)',
  height: 'calc(100% - 0.8rem)',

  padding: '0.8rem 1.2rem 0',

  position: 'relative',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'inherit',

  bottom: '1.6rem',
});
