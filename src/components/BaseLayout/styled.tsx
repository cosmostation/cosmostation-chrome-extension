import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',
  height: '100%',
});

export const Body = styled('div')({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 1.2rem 1.2rem',

  boxSizing: 'border-box',
});

export const BodyContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  height: '100%',
  width: '100%',
});

export const Footer = styled('div')({
  width: '100%',

  marginTop: 'auto',
});
