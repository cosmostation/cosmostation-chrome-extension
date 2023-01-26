import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

type ContainerProps = {
  'data-is-multiple': boolean;
};
export const Container = styled('div')<ContainerProps>(({ theme, ...props }) => ({
  padding: '1.3rem 1.6rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  height: props['data-is-multiple'] ? '15.7rem' : '18.7rem',

  display: 'flex',
  flexDirection: 'column',
}));

export const HeaderContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',

  position: 'relative',
});

export const SwapCoinContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const AfterSwapCoinContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: `translate(-1.2rem, -50%)`,
});

export const SwapArrowIconContainer = styled('div')({
  marginRight: '1.2rem',
});

export const SwapCoinImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const SwapCoinInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.1rem',
});

export const SwapCoinTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const SwapCoinSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  textAlign: 'left',

  display: 'flex',

  whiteSpace: 'nowrap',

  maxWidth: '7.5rem',
  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const StyledDivider = styled(Divider)({
  marginTop: '1.6rem',
});

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  paddingTop: '1.2rem',

  overflow: 'auto',
}));

export const InputCoinContainer = styled('div')({});

export const OutputCoinContainer = styled('div')({
  marginTop: '0.4rem',
});

export const RoutesContainer = styled('div')({
  marginTop: '0.4rem',
});

export const PoolContainer = styled('div')({
  marginTop: '0.4rem',
});

export const LabelContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  display: 'flex',
  justifyContent: 'space-between',
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '0.4rem',

  display: 'flex',
  justifyContent: 'space-between',
}));

export const RightColumnContainer = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
