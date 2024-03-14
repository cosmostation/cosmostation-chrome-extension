import { styled } from '@mui/material/styles';

export const StyledButton = styled('button')(({ theme }) => ({
  position: 'relative',

  backgroundColor: theme.colors.base02,
  border: 0,

  padding: '1.2rem',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  borderRadius: '0.8rem',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',

    '&:hover': {
      backgroundColor: theme.colors.base02,
    },
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,

    '#deleteButton': {
      display: 'block',
    },
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  textAlign: 'left',
});

export const LeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const LeftTextContainer = styled('div')({
  paddingLeft: '0.8rem',

  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const LeftTextChainContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',

  color: theme.colors.text01,

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '15rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const LeftTextChainNameContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',

  color: theme.colors.text02,
}));

export const RightContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  textAlign: 'right',
});

export const RightTextContainer = styled('div')({
  display: 'grid',

  gridTemplateColumns: '1fr',

  rowGap: '0.3rem',
});

export const RightTextValueContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightTextChangeRateContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));
