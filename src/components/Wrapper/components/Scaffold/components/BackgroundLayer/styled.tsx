import { styled } from '@mui/material/styles';

const baseZIndex = 0;

export const BackgroundContainer = styled('div')({
  display: 'flex',
  overflow: 'hidden',
  position: 'relative',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #101113 0%, #15161b 100%)',
  zIndex: baseZIndex,
});
