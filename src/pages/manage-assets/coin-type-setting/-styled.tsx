import { styled } from '@mui/material/styles';

export const Body = styled('div')({
  paddingTop: '0.8rem',
});

export const Footer = styled('div')(({ theme }) => ({
  width: '100%',
  height: 'fit-content',

  boxSizing: 'border-box',

  position: 'sticky',
  bottom: 0,
  zIndex: 1000,

  margin: '0 -1.2rem -1.2rem',
  paddingBottom: '1.2rem',

  backgroundColor: theme.palette.color.base50,
}));
