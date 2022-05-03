import { styled } from '@mui/material/styles';

import Divider from '~/Popup/components/common/Divider';

export const Container = styled('div')({
  display: 'flex',
  flexDirection: 'column',

  alignItems: 'center',
});

export const ChainNameContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const OriginContainer = styled('div')(({ theme }) => ({
  marginTop: '0.4rem',

  padding: '0.4rem 1rem',

  color: theme.colors.text02,

  border: `0.1rem solid ${theme.colors.base04}`,

  borderRadius: '5rem',
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
}));

export const StyledDivider = styled(Divider)({
  marginBottom: '0.7rem',
  width: '100%',
});
