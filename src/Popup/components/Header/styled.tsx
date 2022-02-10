import { IconButton as BaseIconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  width: '36rem',
  height: '5.2rem',

  boxSizing: 'border-box',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0 0.4rem 0 1.2rem',

  backgroundColor: 'transparent',
});

export const LeftContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const LeftContentLogoContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& svg': {
    fill: theme.colors.base06,
  },
}));
export const LeftContentTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.7rem',
  color: theme.colors.text01,
}));

export const RightContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const IconButton = styled(BaseIconButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
  },

  '& svg': {
    fill: theme.colors.text01,
  },
}));
