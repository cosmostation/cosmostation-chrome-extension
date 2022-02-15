import BaseButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import BaseTextField from '@mui/material/TextField';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.colors.base01,
}));

export const ContentContainer = styled('div')({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
});

export const TitleContainer = styled('div')(({ theme }) => ({
  marginTop: '19.2rem',
  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')(({ theme }) => ({
  marginTop: '1rem',
  color: theme.colors.text02,
}));

export const PasswordContainer = styled('div')({
  marginTop: '4.2rem',
  width: '32rem',
});

export const RestoreContainer = styled('div')(({ theme }) => ({
  marginTop: '3.6rem',
  color: theme.colors.text02,
}));

export const UnlockButtonContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: '2rem',
  width: '32rem',
}));

export const Button = styled(BaseButton)({});

export const TextField = styled(BaseTextField)({});
