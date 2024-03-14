import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  width: '14.4rem',
  height: '3.2rem',

  borderRadius: '0.8rem',
  '&:disabled': {
    backgroundColor: theme.colors.base03,
    '&:hover': {
      backgroundColor: theme.colors.base03,
    },
  },
  backgroundColor: theme.colors.base01,
  color: theme.accentColors.white,

  padding: '0',

  textAlign: 'left',

  '&:hover': {
    backgroundColor: theme.colors.base04,
  },

  cursor: 'pointer',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  paddingLeft: '0.8rem',
});

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.4rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));
