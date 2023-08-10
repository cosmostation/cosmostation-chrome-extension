import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  position: 'relative',
});

type AccountColorProps = {
  'data-account-color'?: string;
};

export const StyledButton = styled('button')<AccountColorProps>(({ theme, ...props }) => ({
  border: 'none',

  padding: 0,

  cursor: 'pointer',

  textAlign: 'left',

  display: 'flex',
  alignContent: 'center',

  backgroundColor: 'transparent',

  '&:hover': {
    '& > :nth-of-type(1)': {
      backgroundColor: props['data-account-color'] ? `${props['data-account-color']}44` : theme.colors.base04,
    },
  },
}));

export const AccountLeftContainer = styled('div')<AccountColorProps>(({ theme, ...props }) => ({
  height: '2.8rem',
  width: '2.8rem',

  borderRadius: '50%',

  backgroundColor: props['data-account-color'] ? `${props['data-account-color']}66` : theme.colors.base03,
  color: theme.accentColors.white,

  padding: 0,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.colors.base06,
    width: '2rem',
    height: '2rem',
  },
}));

export const AccountRightContainer = styled('div')({
  display: 'flex',
  marginLeft: '0.6rem',
});

export const AccountRightFirstContainer = styled('div')(({ theme }) => ({
  height: '1.5rem',
  color: theme.colors.text01,

  maxWidth: '9rem',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const AccountRightLedgerContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.2rem',
  width: '1.4rem',
  height: '1.4rem',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const ConnectButton = styled('button')(({ theme }) => ({
  border: 'none',

  backgroundColor: 'transparent',

  padding: '0 0.3rem',

  left: '3.4rem',
  bottom: 0,

  cursor: 'pointer',

  position: 'absolute',

  textAlign: 'left',
  display: 'flex',
  alignItems: 'center',

  borderRadius: '5rem',

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const ConnectButtonText = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  width: 'max-content',

  marginLeft: '0.4rem',
}));

type BadgeProps = {
  'data-is-connected': number;
};

export const ConnectButtonBadge = styled('div')<BadgeProps>(({ theme, ...props }) => ({
  width: '0.6rem',
  height: '0.6rem',

  borderRadius: '50%',

  backgroundColor: props['data-is-connected'] ? theme.accentColors.green01 : theme.accentColors.red,
}));
