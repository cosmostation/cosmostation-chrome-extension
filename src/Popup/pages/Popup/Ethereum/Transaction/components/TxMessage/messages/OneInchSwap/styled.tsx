import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const SwapTxMessageContainer = styled('div')(({ theme }) => ({
  padding: '1.3rem 1.6rem',

  backgroundColor: theme.colors.base02,
  borderRadius: '0.8rem',

  height: '18.7rem',

  display: 'flex',
  flexDirection: 'column',
}));

export const HeaderContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const StyledDivider = styled(Divider)({
  marginTop: '1.6rem',
});

export const SwapTxMessageContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  margin: '0 -1.6rem',
  padding: '1.2rem 1.6rem 0',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  overflow: 'auto',
}));

export const ContentContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  margin: '0 -1.6rem',
  padding: '1.2rem 1.6rem 0',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  overflow: 'auto',
}));

export const ContentItemContainer = styled('div')({});

export const LabelContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
  display: 'flex',
}));

export const ValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
  marginTop: '0.4rem',
}));

export const ImageContainer = styled('div')({
  width: '1.6rem',
  height: '1.6rem',
  '& > img': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const TokenContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.3rem',
});

export const TokenAmountContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.3rem',
});

export const SwapTokenContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
});

export const RightColumnContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

export const DenomContainer = styled('div')({
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '10rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});
