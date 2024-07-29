import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

import Visibility from '~/images/icons/Visibility.svg';
import VisibilityOff from '~/images/icons/VisibilityOff.svg';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.6rem 0',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,
}));

export const HeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text02,
}));

export const BodyContainer = styled('div')(({ theme }) => ({
  height: '4.1rem',

  paddingTop: '0.4rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text01,
}));

export const VisibilityIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0',

  marginLeft: '0.6rem',

  '&:hover': {
    opacity: 0.8,
  },

  '& > svg': {
    '& > path': {
      fill: theme.colors.base05,
    },
  },
}));

export const StyledVisibility = styled(Visibility)({
  width: '1.65rem',
  height: '1.65rem',
});

export const StyledVisibilityOff = styled(VisibilityOff)({
  width: '1.65rem',
  height: '1.65rem',
});
