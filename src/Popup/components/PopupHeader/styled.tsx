import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  alignItems: 'center',
});

export const ChainNameContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const OriginContainer = styled('div')(({ theme }) => ({
  padding: '0.4rem 1rem',

  color: theme.colors.text02,

  border: `0.1rem solid ${theme.colors.base04}`,

  borderRadius: '5rem',

  maxWidth: '100%',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const AccountContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  height: '2.8rem',
});

type AccountIconProps = {
  'data-account-color'?: string;
};

export const AccountIcon = styled('div')<AccountIconProps>(({ theme, ...props }) => ({
  height: '1.6rem',
  width: '1.6rem',

  borderRadius: '50%',

  backgroundColor: props['data-account-color'] ? `${props['data-account-color']}66` : theme.colors.base03,
  color: theme.accentColors.white,

  padding: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.colors.base06,

    '& > path': {
      fill: theme.colors.base06,
    },

    '& > circle': {
      fill: theme.colors.base06,
    },
  },
}));

export const AccountText = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,

  maxWidth: '25rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const StyledDivider = styled(Divider)({
  marginBottom: '0.7rem',
  width: '100%',
});

export const ChainImageContainer = styled('div')({
  width: '2.4rem',
  height: '2.4rem',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const LedgerIconContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const Div = styled('div')({});
