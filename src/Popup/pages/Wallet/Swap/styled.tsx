import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

export const Container = styled('div')({
  height: '100%',
  padding: '0.6rem 1.6rem 1.2rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  position: 'relative',
});

export const ContentContainer = styled('div')({});

export const SwapContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  rowGap: '0.8rem',
  position: 'relative',
});

export const SwapIconButton = styled(IconButton)(({ theme }) => ({
  width: '3.2rem',
  height: '3.2rem',

  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%)`,
  padding: '0',
  borderRadius: '5rem',

  backgroundColor: theme.colors.base04,

  '&:hover': {
    backgroundColor: theme.colors.base05,
  },
}));

export const SwapCoinContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '10rem',
  padding: '1.3rem 1.6rem',

  background: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const SwapCoinHeaderContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
export const SwapCoinLeftHeaderContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const SwapCoinRightHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',

  color: theme.colors.text02,
}));

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0',
  border: 0,
  borderRadius: '5rem',

  marginLeft: '0.4rem',

  //   height: 'max-content',

  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   backgroundColor: theme.colors.base03,
  backgroundColor: 'transparent',

  color: theme.accentColors.purple01,

  cursor: 'pointer',
  textDecorationLine: 'underline',
  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const SwapInfoContainer = styled('div')(({ theme }) => ({
  width: '100%',
  height: '10rem',
  padding: '1.6rem',

  marginTop: '0.8rem',

  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});
