import BaseButton from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import BaseTextField from '@mui/material/TextField';

import backgroundDarkImg from '~/images/backgrounds/dark.png';
import backgroundLightImg from '~/images/backgrounds/light.png';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')(({ theme }) => ({
  width: '100%',
  height: '100%',
  backgroundColor: theme.colors.base01,
  backgroundImage: `url(${theme.mode === 'dark' ? backgroundDarkImg : backgroundLightImg})`,
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
  marginTop: '19.3rem',
  color: theme.colors.text01,
}));

export const DescriptionContainer = styled('div')({
  marginTop: '1.5rem',
});

export const PasswordContainer = styled('div')({
  marginTop: '4.1rem',

  width: '32rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const ButtonContainer = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: '2rem',
  width: '32rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  color: theme.accentColors.white,
}));

export const RestoreContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',

  marginBottom: '2.8rem',
});

export const RestoreButton = styled('button')(({ theme }) => ({
  border: 0,
  padding: 0,
  backgroundColor: 'transparent',
  color: theme.accentColors.white,

  cursor: 'pointer',
}));

export const Button = styled(BaseButton)({});

export const TextField = styled(BaseTextField)({});
