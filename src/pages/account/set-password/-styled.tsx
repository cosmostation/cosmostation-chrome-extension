import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

export const CautionContainer = styled('div')({
  marginBottom: '2.4rem',
});

export const FormContainer = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});

export const Body = styled('div')({
  paddingTop: '1.2rem',
});

export const DescriptionContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',

  width: '100%',

  padding: '0.4rem 0.4rem 0',
  rowGap: '0.6rem',
});

export const DescriptionTitle = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const DescriptionSubTitle = styled(Typography)(({ theme }) => ({
  width: '95%',

  color: theme.palette.color.base1000,
}));

export const PasswordInputContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.2rem',

  marginTop: '3rem',
});
