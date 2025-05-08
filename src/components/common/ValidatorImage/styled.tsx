import { styled } from '@mui/material/styles';

export const ImageContainer = styled('div')({
  position: 'relative',
  width: '3.2rem',
  height: '3.2rem',
  zIndex: 0,
  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const AbsoluteImageContainer = styled('div')({
  position: 'absolute',

  width: '100%',
  height: '100%',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const AbsoluteSVGContainer = styled('div')({
  position: 'absolute',

  width: '100%',
  height: '100%',

  '& > svg': {
    width: '100%',
    height: '100%',
  },
});
