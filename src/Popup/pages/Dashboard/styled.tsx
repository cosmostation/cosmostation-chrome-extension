import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

import Visibility from '~/images/icons/Visibility.svg';
import VisibilityOff from '~/images/icons/VisibilityOff.svg';

export const Container = styled('div')({
  padding: '0 1.2rem',

  height: '100%',
  overflow: 'hidden',

  display: 'flex',
  flexDirection: 'column',
});

export const HeaderContainer = styled('div')({
  margin: '0.4rem 0 1.6rem',

  flexShrink: 0,
});

export const ContentsContainer = styled('div')({
  height: '100%',
  overflow: 'auto',

  display: 'flex',
  flexDirection: 'column',

  margin: '0 -1.2rem',
  padding: '0 1.2rem ',
});

export const TotalContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem 0',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base02,
}));

export const TotalValueTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text02,
}));

export const TotalValueContainer = styled('div')(({ theme }) => ({
  height: '4.1rem',

  paddingTop: '0.4rem',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  flexShrink: 0,

  color: theme.colors.text01,
}));

export const SubInfoContainer = styled('div')({
  marginTop: '1.1rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  flexShrink: 0,
});

export const CountContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const CountLeftContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const CountRightContainer = styled('div')(({ theme }) => ({
  paddingLeft: '0.4rem',

  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text02,
}));

export const ChainListContainer = styled('div')({
  marginTop: '1rem',

  display: 'flex',
  flexDirection: 'column',

  paddingBottom: '1rem',
});

export const ChainList = styled('div')({
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.8rem',
});

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
