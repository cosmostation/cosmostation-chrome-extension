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

export const InformationPanelContainer = styled('div')({
  marginBottom: '2.4rem',
});

export const UniversalContainer = styled('div')(({ theme }) => ({
  color: theme.palette.accentColor.blue400,
}));
