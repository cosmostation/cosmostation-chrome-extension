import { styled } from '@mui/material/styles';

import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({});

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0.4rem 0.8rem',
  border: 0,
  borderRadius: '5rem',

  marginLeft: '0.8rem',

  height: 'max-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  backgroundColor: theme.accentColors.purple01,
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const StyledInput = styled(Input)({
  height: '4.8rem',
});

export const StyledTextarea = styled(Input)({});

export const MarginTop8Div = styled('div')({
  marginTop: '0.8rem',
});

export const WarningContainer = styled('div')(({ theme }) => ({
  width: '33.6rem',
  height: '16.6rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',
}));
export const WarningTextContainer = styled('div')(({ theme }) => ({
  width: '19rem',
  // height: '100%',
  paddinfTop: '1.2rem',
  display: 'flex',
  flexDirection: 'column',
  columnGap: '0.8rem',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));
