import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  border: `0.1rem solid ${theme.colors.base04}`,

  width: '16rem',

  borderRadius: '0.8rem',

  color: theme.accentColors.white,
  backgroundColor: 'transparent',

  padding: '0',

  textAlign: 'left',

  '&:hover': {
    backgroundColor: theme.colors.base02,
  },

  cursor: 'pointer',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  padding: '0.65rem 0.5rem 0.65rem 0.8rem',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'left',
  alignItems: 'center',
});

export const ContentLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  maxWidth: '12rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const ContentLeftNumberContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text02,
}));

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));
