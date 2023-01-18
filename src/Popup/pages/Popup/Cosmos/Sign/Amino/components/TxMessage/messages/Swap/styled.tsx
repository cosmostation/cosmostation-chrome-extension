import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')(({ theme }) => ({
  padding: '1.3rem 1.6rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  height: '15.7rem',
}));

export const HeaderContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const SwapCoinContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
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
}));

export const StyledDivider = styled(Divider)({
  marginTop: '1.6rem',
  marginBottom: '1.2rem',
});
type ContentContainerProps = {
  'data-height': string;
};
export const ContentContainer = styled('div')<ContentContainerProps>(({ theme, ...props }) => ({
  color: theme.colors.text01,

  height: props['data-height'],

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  overflow: 'auto',
}));

export const InputCoinContainer = styled('div')({});

export const InputCoinImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const OutputCoinImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',
  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const OutputCoinContainer = styled('div')({});

export const RoutesContainer = styled('div')({});

export const PoolContainer = styled('div')({});

export const LabelContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '0.4rem',
}));

export const AmountInfoContainer = styled('div')({
  paddingTop: '0.4rem',
  paddingBottom: '0.4rem',
  display: 'flex',
  justifyContent: 'space-between',
});

export const LeftContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
});

export const RightColumnContainer = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text01,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  marginTop: '0.2rem',

  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
