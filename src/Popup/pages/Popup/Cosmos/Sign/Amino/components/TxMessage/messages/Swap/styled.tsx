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
  alignItems: 'center',
});

export const StyledDivider = styled(Divider)({
  marginTop: '1.6rem',
});

export const ContentContainer = styled('div')({
  margin: '0 -1.6rem',
  padding: '1.2rem 1.6rem 0',

  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',

  overflow: 'auto',
});

export const InputCoinContainer = styled('div')({});

export const OutputCoinContainer = styled('div')({
  marginTop: '0.4rem',
});

export const RoutesContainer = styled('div')({
  marginTop: '0.4rem',
});

export const RoutesValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  display: 'flex',
}));

export const PoolContainer = styled('div')({
  marginTop: '0.4rem',
});

export const PoolValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  display: 'flex',
}));

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

export const LeftDenomContainer = styled('div')({
  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '7rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RightColumnContainer = styled('div')({});

export const RightAmountContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightValueContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',

  color: theme.colors.text02,
}));
