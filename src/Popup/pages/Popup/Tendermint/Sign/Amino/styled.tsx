import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '6rem 1.6rem 1.6rem 1.6rem',

  position: 'relative',

  height: '100%',
});

export const BottomContainer = styled('div')({
  position: 'absolute',

  bottom: '1.6rem',

  width: 'calc(100% - 3.2rem)',
});

export const BottomButtonContainer = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  columnGap: '0.8rem',
});
