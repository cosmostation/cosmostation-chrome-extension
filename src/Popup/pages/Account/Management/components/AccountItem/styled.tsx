import { styled } from '@mui/material/styles';

export const Container = styled('div')(({ theme }) => ({
  backgroundColor: theme.colors.base02,

  padding: '0 0.8rem 0 1.6rem',

  width: '100%',
  height: '4.8rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',

  border: 0,
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const LeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const LeftLedgerContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.2rem',
  width: '1.4rem',
  height: '1.4rem',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));

export const RightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  backgroundColor: 'transparent',

  border: 0,
  padding: 0,

  height: '2.4rem',

  cursor: 'pointer',

  '& > svg': {
    fill: props['data-is-active'] ? theme.colors.base06 : theme.colors.base05,
  },

  '&:hover': {
    '& > svg': {
      fill: theme.colors.base06,
    },
  },
}));
