import { styled } from '@mui/material/styles';

const baseZIndex = 0;
const backgroundLayerZIndex = -1;

export const BackgroundContainer = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  justifyContent: 'center',
  background: ' linear-gradient(180deg, #101113 0%, #15161b 100%)',
  zIndex: baseZIndex,
});

export const SubtleGradientLayer = styled('div')({
  width: '100%',
  position: 'absolute',
  height: '100%',
  background: 'radial-gradient(50% 50% at 50% 50%, #000000 0%, #8A60FF 100%)',
  opacity: 0.01,
  filter: 'blur(10rem)',
  zIndex: backgroundLayerZIndex,
});

export const PurpleRadialGradientLayer = styled('div')({
  position: 'absolute',
  width: '100vh',
  height: '100vh',
  background: `radial-gradient(50% 50% at 50% 50%, rgba(230, 200, 255, 0.75) 0%, rgba(0, 0, 0, 0) 100%)`,
  opacity: 0.65,
  filter: 'blur(5rem)',
  zIndex: backgroundLayerZIndex,
});

export const BlackRadialGradientLayer = styled('div')({
  position: 'absolute',
  width: '100vh',
  height: '100vh',
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
  transform: 'rotate(15deg)',
  zIndex: backgroundLayerZIndex,
  filter: 'blur(1.5rem)',
  top: '5%',
  '::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '120%',
    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%) border-box',
    WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'xor',
    maskComposite: 'exclude',
    opacity: 0.23,
  },
});

export const ellipseStyles = [
  {
    width: '120%',
    minWidth: '180rem',
    height: '75%',
    '::before': {
      border: '0.8rem solid transparent',
    },
  },
  {
    width: '110%',
    minWidth: '170rem',
    height: '65%',
    '::before': {
      border: '0.6rem solid transparent',
    },
  },
  {
    width: '100%',
    minWidth: '160rem',
    height: '55%',
    '::before': {
      border: '0.4rem solid transparent',
    },
  },
  {
    width: '90%',
    minWidth: '150rem',
    height: '45%',
    '::before': {
      border: '0.2rem solid transparent',
    },
  },
];
