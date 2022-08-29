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

export const StepContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',

  backgroundColor: theme.colors.base01,
  height: '16.6rem',
  width: '32.8rem',

  borderRadius: '0.8rem',
  border: `0.1rem solid ${theme.colors.base03}`,
}));

export const StepImage = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const StepTitle = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '1.6rem',

  textAlign: 'center',
}));

export const StepDescription = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  marginTop: '0.8rem',

  textAlign: 'center',
}));

export const BottomArrowContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  margin: '1.6rem 0',
});
