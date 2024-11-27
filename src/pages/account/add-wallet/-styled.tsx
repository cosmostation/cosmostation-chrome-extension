import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const FooterContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginBottom: '2.8rem',
});

export const Body = styled('div')({
  paddingTop: '0.8rem',
});

export const OptionButtonsContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: '0.8rem',
});

export const DescriptionText = styled(Typography)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const PasswordInputContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '2.2rem',

  marginTop: '3rem',
});
