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

export const BadgeImageContainer = styled('div')({
  position: 'absolute',
  top: '-6.25%',
  right: '-6.25%',

  width: '50%',
  height: '50%',

  filter: 'drop-shadow(-0.1rem 0.1rem 0.1rem rgba(0, 0, 0, 0.5))',

  '& > img': {
    width: '100%',
    height: '100%',
  },
});

export const CoinAfterImage = styled('div')({
  position: 'absolute',
  top: '10%',

  zIndex: -1,

  opacity: 0.8,

  '&:last-child': {
    opacity: 0.6,
  },

  '& > img': {
    width: '100%',
    height: '100%',
  },
});
