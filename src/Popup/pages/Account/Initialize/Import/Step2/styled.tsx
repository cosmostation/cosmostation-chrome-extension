import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0.8rem 2.4rem 0',

  position: 'relative',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 4.8rem)',

  bottom: '2.4rem',
});

export const SelectChainContainer = styled('div')({
  height: 'calc(100% - 7.2rem)',

  padding: '2rem 0',

  overflow: 'auto',
});
