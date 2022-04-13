import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '100%',
  height: '100%',

  padding: '0 1.2rem 0 1.2rem',

  display: 'flex',
  flexDirection: 'column',
});

export const HeaderContainer = styled('div')({
  marginTop: '0.4rem',

  flexShrink: 0,
});

export const NativeChainCardContainer = styled('div')({
  marginTop: '1.6rem',

  flexShrink: 0,
});

export const BottomContainer = styled('div')({
  marginTop: '1.6rem',

  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});
