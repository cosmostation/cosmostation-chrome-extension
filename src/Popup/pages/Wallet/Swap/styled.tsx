import { CircularProgress } from '@mui/material';
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

export const SwapContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  rowGap: '0.8rem',
  position: 'relative',

  marginBottom: '0.8rem',
});

export const SwapIconButton = styled(IconButton)(({ theme }) => ({
  '&.MuiIconButton-root': {
    padding: '0.6rem',

    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: `translate(-50%, -50%)`,
    borderRadius: '5rem',

    backgroundColor: theme.colors.base02,

    '&:hover': {
      backgroundColor: theme.colors.base01,
    },
    '&:disabled': {
      backgroundColor: theme.colors.base01,
      '&:hover': {
        backgroundColor: theme.colors.base01,
      },
    },
  },
}));

export const SwapCoinContainer = styled('div')(({ theme }) => ({
  padding: '1.3rem 1.6rem 2.5rem',

  background: theme.colors.base02,
  borderRadius: '0.8rem',
}));

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

type SwapCoinInputAmountContainerProps = {
  'data-is-error'?: boolean;
};

export const SwapCoinInputAmountContainer = styled('div')<SwapCoinInputAmountContainerProps>(({ ...props }) => ({
  marginBottom: props['data-is-error'] ? '0.1rem' : '1.6rem',
}));

type SwapCoinOutputAmountContainerProps = {
  'data-is-active'?: boolean;
};

export const SwapCoinOutputAmountContainer = styled('div')<SwapCoinOutputAmountContainerProps>(({ theme, ...props }) => ({
  height: '2.6rem',

  color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,
  opacity: props['data-is-active'] ? 1 : 0.8,

  overflow: 'hidden',

  marginBottom: '1.6rem',
}));

export const BodyContainer = styled('div')({
  height: 'calc(100% - 11rem)',
  overflow: 'auto',
});

export const SwapInfoContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  marginTop: '0.8rem',

  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',
}));

export const SwapInfoHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const SwapInfoHeaderRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const SwapInfoBodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '0.9rem',
});

export const SwapInfoBodyTextContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  height: '2.1rem',
});

export const SwapInfoBodyLeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const SwapInfoBodyRightContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

type SwapInfoBodyRightTextContainerProps = {
  'data-is-invalid'?: boolean;
};

export const SwapInfoBodyRightTextContainer = styled('div')<SwapInfoBodyRightTextContainerProps>(({ theme, ...props }) => ({
  display: 'flex',
  alignItems: 'center',

  color: props['data-is-invalid'] ? theme.accentColors.red : theme.colors.text01,
}));

export const BottomContainer = styled('div')({
  position: 'absolute',

  width: 'calc(100% - 3.2rem)',

  bottom: '1.6rem',
});

export const SideButton = styled(IconButton)({
  padding: '0',
});

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.accentColors.purple01,
  },
}));
