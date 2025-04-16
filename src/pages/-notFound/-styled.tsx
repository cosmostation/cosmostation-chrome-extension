import { styled } from '@mui/material/styles';

export const ContentsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  flex: '1',
  alignItems: 'center',
  justifyContent: 'center',
});

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '4rem',
});
