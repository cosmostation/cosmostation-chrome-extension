import { styled } from '@mui/material/styles';

const baseZIndex = 0;
const backgroundLayerZIndex = -1;

export const Container = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative',
  backgroundColor: 'rgba(0, 0, 0, 0.88)',
  zIndex: baseZIndex,
});

export const CircularGradientBackground = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  background: `radial-gradient(circle, rgba(230, 200, 255, 0.75) 10%, rgba(0, 0, 0, 0) 60%)`,
  mixBlendMode: 'difference',
  zIndex: backgroundLayerZIndex,
});

export const RadialGradientLayer = styled('div')({
  position: 'absolute',
  width: '100%',
  height: '100%',
  background: 'rgba(0, 0, 0, 0.88)',
  filter: 'blur(30rem)',
  zIndex: backgroundLayerZIndex,
});

export const Star = styled('div')({
  position: 'absolute',
  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)',
  borderRadius: '50%',
  animation: 'twinkle 2s infinite ease-in-out',
  zIndex: backgroundLayerZIndex,
  '@keyframes twinkle': {
    '0%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0,
    },
    '100%': {
      opacity: 1,
    },
  },
});

export const Ellipse = styled('div')({
  position: 'absolute',
  border: '0.2rem solid white',
  borderRadius: '50%',
  transform: 'rotate(8deg)',
  opacity: 0.1,

  zIndex: backgroundLayerZIndex,
});
