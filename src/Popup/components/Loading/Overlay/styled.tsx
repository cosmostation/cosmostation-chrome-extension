import { styled } from '@mui/material/styles';

import atomImage from './assets/atom.gif';

export const Container = styled('div')({
  background: `url(${atomImage}) no-repeat center center`,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  backgroundSize: '70px',
  position: 'fixed',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  zIndex: 10000,
});
