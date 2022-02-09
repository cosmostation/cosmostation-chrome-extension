import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: 'none',

  width: 'max-content',
  height: '2.8rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base03,
  color: theme.accentColors.white,

  padding: '0',

  '&:hover': {
    backgroundColor: theme.colors.base04,
  },

  cursor: 'pointer',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const ContentCenterTextContainer = styled('div')(({ theme }) => ({
  paddingLeft: '0.8rem',
  color: theme.colors.text01,
}));

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.4rem 0 0.2rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));
