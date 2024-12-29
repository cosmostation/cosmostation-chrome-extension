import { styled } from '@mui/material/styles';

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Container = styled('div')({
  padding: '1.8rem 0',
});

export const InputWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  rowGap: '2.2rem',
});

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  columnGap: '0.4rem',

  marginBottom: '2.8rem',
});

export const UniversalContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.blue400,
}));

export const RedTextContainer = styled('div')(({ theme }) => ({
  color: `${theme.palette.accentColor.red400} !important`,
}));
