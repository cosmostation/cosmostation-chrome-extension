import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';
import Input from '~/Popup/components/common/Input';

export const Container = styled('div')({
  height: '100%',
  padding: '0.6rem 1.6rem 1.2rem',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  position: 'relative',
});

export const SwapContainer = styled('div')({
  marginTop: '1.4rem',

  display: 'flex',
  flexDirection: 'column',

  rowGap: '0.8rem',
  position: 'relative',
});

export const SwapIconButton = styled(IconButton)(({ theme }) => ({
  padding: '0.6rem',

  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-50%, -50%)`,
  borderRadius: '5rem',

  backgroundColor: theme.colors.base04,

  '&:hover': {
    backgroundColor: theme.colors.base05,
  },
}));

export const SwapCoinContainer = styled('div')(({ theme }) => ({
  padding: '1.3rem 1.6rem 2.5rem',

  background: theme.colors.base02,
  borderRadius: '0.8rem',
}));

export const SwapCoinHeaderContainer = styled('div')({
  height: '1.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const SwapCoinBodyLeftHeaderContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const SwapCoinBodyRightHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.colors.text02,
}));

export const StyledInput = styled(Input)(({ theme }) => ({
  '&.MuiOutlinedInput-root': {
    width: '13rem',
    '.MuiOutlinedInput-input': {
      height: '1.8rem',
      textAlign: 'right',
      fontFamily: theme.typography.h4n.fontFamily,
      fontStyle: theme.typography.h4n.fontStyle,
      fontSize: theme.typography.h4n.fontSize,
      lineHeight: theme.typography.h4n.lineHeight,
      letterSpacing: theme.typography.h4n.letterSpacing,

      '&::placeholder': {
        fontFamily: theme.typography.h4n.fontFamily,
        fontStyle: theme.typography.h4n.fontStyle,
        fontSize: theme.typography.h4n.fontSize,
        lineHeight: theme.typography.h4n.lineHeight,
        letterSpacing: theme.typography.h4n.letterSpacing,

        color: theme.colors.text02,
        opacity: 1,
      },
    },
    '.MuiOutlinedInput-notchedOutline': {
      border: `none`,
    },
    '& .MuiOutlinedInput-input': {
      padding: '0',
    },
    '&.Mui-focused': {
      '.MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
    },
  },
}));

export const MaxButton = styled('button')(({ theme }) => ({
  padding: '0',
  border: 0,

  marginLeft: '0.4rem',

  backgroundColor: 'transparent',
  color: theme.accentColors.purple01,

  cursor: 'pointer',

  textDecorationLine: 'underline',
  '&:hover': {
    color: theme.accentColors.purple02,
  },
}));

export const SwapCoinBodyContainer = styled('div')({
  paddingTop: '0.9rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

type SwapCoinBodyLeftButtonProps = {
  'data-is-active'?: boolean;
};

export const SwapCoinBodyLeftButton = styled('button')<SwapCoinBodyLeftButtonProps>(({ theme, ...props }) => ({
  backgroundColor: 'transparent',
  border: `none`,

  padding: '0',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  cursor: 'pointer',

  '& > svg': {
    transform: props['data-is-active'] ? 'rotate(180deg)' : 'none',
    '& > path': {
      stroke: theme.colors.base05,
    },
  },
  '&:hover': {
    '& > svg': {
      '& > path': {
        stroke: theme.colors.base06,
      },
    },
  },
}));

export const SwapCoinBodyLeftImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const SwapCoinBodyLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.2rem',

  marginRight: '0.3rem',
});

export const SwapCoinBodyLeftTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const SwapCoinBodyLeftSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  textAlign: 'left',
}));

export const SwapCoinBodyRightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

type SwapCoinBodyRightTitleContainerProps = {
  'data-is-active'?: boolean;
};

export const SwapCoinBodyRightTitleContainer = styled('div')<SwapCoinBodyRightTitleContainerProps>(({ theme, ...props }) => ({
  height: '1.8rem',
  width: '13rem',
  color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,

  textAlign: 'right',
  overflow: 'hidden',
}));

export const SwapCoinBodyRightSubTitleContainer = styled('div')(({ theme }) => ({
  height: '1.7rem',

  color: theme.colors.text02,
}));

export const SwapInfoContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem',

  marginTop: '0.8rem',

  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',
}));

export const SwapInfoHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  color: theme.colors.text01,
}));

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

export const TopContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'relative',

  backgroundColor: 'transparent',
});

export const TextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  height: '2.8rem',

  color: theme.colors.text01,
}));

export const BackButton = styled('button')(({ theme }) => ({
  left: 0,

  width: '2.8rem',
  height: '2.8rem',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  position: 'absolute',

  backgroundColor: theme.colors.base03,

  borderRadius: '50%',

  border: 0,
  margin: 0,

  cursor: 'pointer',

  '& svg': {
    fill: theme.colors.base06,
  },
}));

export const SideButton = styled(IconButton)({
  right: 0,
  position: 'absolute',
  padding: '0',
});
