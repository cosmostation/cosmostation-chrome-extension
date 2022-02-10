import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  cursor: 'pointer',

  display: 'flex',
  alignContent: 'center',

  backgroundColor: 'transparent',

  '&:hover': {
    '& > :nth-child(3n-2)': {
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

  padding: '0',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.colors.base06,
    width: '2rem',
    height: '2rem',
  },
}));

export const AccountRightContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.6rem',
}));
export const AccountRightFirstContainer = styled('div')(({ theme }) => ({
  height: '1.5rem',
  color: theme.colors.text01,
}));
export const AccountRightSecendContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

export const AccountRightSecendTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  marginLeft: '0.4rem',
}));

export const Badge = styled('div')<{ is_connected: number }>(({ theme, is_connected }) => ({
  width: '0.6rem',
  height: '0.6rem',

  borderRadius: '50%',

  backgroundColor: is_connected ? theme.accentColors.green : theme.accentColors.red,
}));
