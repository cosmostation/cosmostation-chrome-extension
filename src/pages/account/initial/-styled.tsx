import { styled } from '@mui/material/styles';

import CheckBoxTextButton from '@/components/common/CheckBoxTextButton';

import backgroungImg from '@/assets/images/backgroundImage/background.png';

export const Container = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  padding: '1.2rem',

  boxSizing: 'border-box',

  backgroundImage: `url(${backgroungImg})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundColor: theme.palette.common.black,
}));

export const TermsContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  marginBottom: '2.4rem',
});

export const StyledCheckBoxTextButton = styled(CheckBoxTextButton)(({ theme }) => ({
  color: theme.palette.color.base1300,
}));

export const Body = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  height: '100%',
});
