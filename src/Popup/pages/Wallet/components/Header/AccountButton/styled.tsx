import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  position: 'relative',
});

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  padding: 0,

  cursor: 'pointer',

  textAlign: 'left',

  display: 'flex',
  alignContent: 'center',

  backgroundColor: 'transparent',

  '&:hover': {
    '& > :nth-of-type(1)': {
      backgroundColor: theme.colors.base04,
    },
  },
}));
export const AccountLeftContainer = styled('div')(({ theme }) => ({
  height: '2.8rem',
  width: '2.8rem',

  borderRadius: '50%',

  backgroundColor: theme.colors.base03,
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
  marginLeft: '0.6rem',
});

export const AccountRightFirstContainer = styled('div')(({ theme }) => ({
  height: '1.5rem',
  color: theme.colors.text01,
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

  backgroundColor: props['data-is-connected'] ? theme.accentColors.green : theme.accentColors.red,
}));
