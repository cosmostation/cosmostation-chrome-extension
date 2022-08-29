import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  position: 'fixed',
  top: '0',
  bottom: '0',
  left: '0',
  right: '0',
  zIndex: 10000,
});

export const DescriptionContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  width: '24rem',

  marginTop: '0.8rem',

  textAlign: 'center',
}));

export const ButtonContainer = styled('div')({
  marginTop: '2.4rem',

  width: '14.8rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});
