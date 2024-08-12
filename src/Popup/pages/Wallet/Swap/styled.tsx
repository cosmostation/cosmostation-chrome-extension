import { styled } from '@mui/material/styles';
import { tooltipClasses } from '@mui/material/Tooltip';

import Button from '~/Popup/components/common/Button';
import IconButton from '~/Popup/components/common/IconButton';
import Tooltip from '~/Popup/components/common/Tooltip';

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

    backgroundColor: theme.colors.base04,

    '&:hover': {
      backgroundColor: theme.colors.base05,
    },
    '&:disabled': {
      backgroundColor: theme.colors.base01,
      '&:hover': {
        backgroundColor: theme.colors.base01,
      },
    },
  },
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

export const OutputAmountCircularProgressContainer = styled('div')({
  height: '4.2rem',
});

export const MinimumReceivedCircularProgressContainer = styled('div')({
  height: '2.2rem',
});

export const BodyContainer = styled('div')({
  margin: '0 -1.6rem',
  padding: '0 1.6rem',

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
  flexDirection: 'column',

  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  color: theme.colors.text01,
}));
export const SwapInfoHeaderTextContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.2rem',
});

export const SwapInfoSubHeaderContainer = styled('div')({
  height: '2.2rem',

  display: 'flex',
});

export const StyledTooltipTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const StyledTooltipBodyContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  marginTop: '0.8rem',

  rowGap: '0.5rem',
});

export const SwapInfoStyledTooltip = styled(Tooltip)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.base02,
    marginLeft: '1.75rem',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginTop: '0.7rem !important',
    marginRight: '3.5rem',

    backgroundColor: theme.colors.base02,

    padding: '0.8rem',
    textAlign: 'start',

    maxWidth: '23.5rem',
    maxHeight: 'fit-content',
  },
}));

export const GasInfoStyledTooltip = styled(Tooltip)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.base02,
    marginLeft: '-1.5rem',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginBottom: '0.7rem !important',
    marginLeft: '3rem',

    backgroundColor: theme.colors.base02,

    padding: '0.8rem',
    textAlign: 'start',

    maxWidth: '26.7rem',
    maxHeight: 'fit-content',
  },
}));

export const ProcessingTimeStyledTooltip = styled(Tooltip)(({ theme }) => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.colors.base02,
    marginLeft: '8rem',
  },
  [`& .${tooltipClasses.tooltip}`]: {
    marginTop: '0.7rem !important',
    marginRight: '16rem',

    backgroundColor: theme.colors.base02,

    padding: '0.8rem',
    textAlign: 'start',

    maxWidth: '23.5rem',
    maxHeight: 'fit-content',
  },
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
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.2rem',

  color: theme.colors.text02,
}));

export const SwapInfoBodyLeftIconContainer = styled('div')(({ theme }) => ({
  height: '1.6rem',
  '& > svg': {
    fill: theme.colors.base05,
    '&:hover': {
      fill: theme.colors.base06,
    },
  },
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

export const FeePriceButton = styled('button')({
  border: 0,
  padding: 0,

  backgroundColor: 'transparent',

  cursor: 'pointer',
});

export const FeePriceButtonTextContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  color: theme.colors.text01,

  '&:hover': {
    color: theme.colors.text02,
  },
}));

export const ButtonTextIconContaier = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.4rem',
});

export const StyledButton = styled(Button)({});

export const SwapVenueImageContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',
  '& > img': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const NoticeTextContainer = styled('div')(({ theme }) => ({
  width: '91%',

  margin: '1.6rem 0 0',

  color: theme.colors.text02,

  whiteSpace: 'pre-wrap',
}));

export const NoticeAddressContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  rowGap: '0.6rem',

  margin: '4rem 0 6rem',
});

export const NoticeAddressHeaderContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  marginLeft: '0.8rem',

  color: theme.colors.text01,
}));

export const NoticeAddressHeaderImageContainer = styled('div')({
  marginRight: '0.4rem',

  width: '2rem',
  height: '2rem',

  '& > img': {
    width: '2rem',
    height: '2rem',
  },
});

export const NoticeAddressBottomContainer = styled('div')(({ theme }) => ({
  width: '100%',

  padding: '2rem 1.2rem',

  color: theme.colors.text01,
  backgroundColor: theme.colors.base02,

  borderRadius: '0.8rem',
}));
