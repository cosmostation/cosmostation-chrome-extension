import { styled } from '@mui/material/styles';

export const FooterContainer = styled('div')({
  position: 'relative',
});

export const FloatingButtonContainer = styled('div')({
  position: 'absolute',
  right: '2rem',
  bottom: '7rem',
});

export const IconContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',
  },
});
