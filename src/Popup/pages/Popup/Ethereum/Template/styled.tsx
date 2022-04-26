import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '1.6rem',

  position: 'relative',

  height: '100%',
});

export const ContentContainer = styled('div')({
  height: 'calc(100% - 6.4rem)',
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
