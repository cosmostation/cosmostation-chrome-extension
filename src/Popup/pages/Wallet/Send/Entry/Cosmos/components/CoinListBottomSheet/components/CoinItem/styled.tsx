import { styled } from '@mui/material/styles';

type CoinButtonProps = {
  'data-is-active'?: boolean;
};

export const CoinButton = styled('button')<CoinButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0.8rem 1.2rem 0.6rem 1.2rem',

  height: '4.8rem',
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const LeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const LeftImageContainer = styled('div')({
  '& > img': {
    width: '2.8rem',
    height: '2.8rem',
  },
});

export const LeftInfoContainer = styled('div')({
  marginLeft: '0.6rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const LeftTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '23rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const LeftSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,

  whiteSpace: 'nowrap',
  wordBreak: 'keep-all',

  maxWidth: '23rem',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const RightInfoContainer = styled('div')({
  marginRight: '0.8rem',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
});

export const RightTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const RightSubTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  '& > svg': {
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));

export const RightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});
