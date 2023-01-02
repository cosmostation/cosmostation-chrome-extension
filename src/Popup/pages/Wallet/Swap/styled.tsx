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

export const ContentContainer = styled('div')({});

export const SwapContainer = styled('div')({
  marginTop: '1.4rem',
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
  alignItems: 'center',
  color: theme.colors.text02,
}));

export const StyledInput = styled(Input)(({ theme }) => ({
  '&.MuiOutlinedInput-root': {
    '.MuiOutlinedInput-input': {
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
        opacity: 0.8,
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
  width: '2.8rem',
  display: 'flex',
  alignItems: 'center',
  textAlign: 'right',
  padding: '0',
  border: 0,

  marginLeft: '0.4rem',

  backgroundColor: 'transparent',
  color: theme.accentColors.purple01,

  cursor: 'pointer',

  textDecorationLine: 'underline',
  '&:hover': {
    backgroundColor: theme.accentColors.purple02,
  },
}));

export const SwapCoinContainerButton = styled('button')({
  backgroundColor: 'transparent',
  border: `none`,

  padding: '0',
  paddingTop: '1.3rem',

  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',
});

export const SwapCoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const SwapCoinLeftImageContainer = styled('div')({
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const SwapCoinLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const SwapCoinLeftTitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const SwapCoinLeftSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

type SwapCoinLeftIconButtonProps = {
  'data-is-active'?: number;
};
export const SwapCoinLeftIconButton = styled('div')<SwapCoinLeftIconButtonProps>(({ theme, ...props }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  marginLeft: '0.5rem',

  '& > svg': {
    transform: props['data-is-active'] ? 'rotate(180deg)' : 'none',
    '& > path': {
      stroke: theme.colors.base05,
    },
  },
}));

export const SwapCoinRightContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

type SwapCoinRightTitleContainerProps = {
  'data-is-active'?: boolean;
};
export const SwapCoinRightTitleContainer = styled('div')<SwapCoinRightTitleContainerProps>(({ theme, ...props }) => ({
  color: props['data-is-active'] ? theme.colors.text01 : theme.colors.text02,
}));

export const SwapCoinRightSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const SwapInfoContainer = styled('div')(({ theme }) => ({
  padding: '1.6rem 1.6rem 1.9rem',

  marginTop: '0.8rem',

  border: `0.1rem solid ${theme.colors.base03}`,
  borderRadius: '0.8rem',
}));

export const SwapInfoHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  // alignItems: 'center',
  color: theme.colors.text01,
}));

export const SwapInfoSubContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  rowGap: '0.6rem',
  marginTop: '1.1rem',
});

export const SwapInfoSubTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: theme.colors.text02,
}));

export const SwapInfoSubRightTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
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
