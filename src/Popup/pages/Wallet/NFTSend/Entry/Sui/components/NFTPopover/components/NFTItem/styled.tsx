import { styled } from '@mui/material/styles';

type NFTButtonProps = {
  'data-is-active'?: number;
};

export const NFTButton = styled('button')<NFTButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '1.2rem',

  height: '8.96rem',
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
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const LeftImageContainer = styled('div')({
  width: '6.4rem',
  height: '6.4rem',
  '& > img': {
    width: '6.4rem',
    height: '6.4rem',
  },
});

export const LeftInfoContainer = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',

  rowGap: '0.6rem',

  marginLeft: '1.4rem',
});

export const LeftInfoHeaderContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,

  maxWidth: '17rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const LeftInfoBodyContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const LeftInfoFooterContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const RightContainer = styled('div')(({ theme }) => ({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',

  '& > svg': {
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));
