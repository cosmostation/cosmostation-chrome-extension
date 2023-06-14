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
  '& > img': {
    width: '6.4rem',
    height: '6.4rem',

    borderRadius: '0.4rem',
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

  maxWidth: '15rem',

  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export const LeftInfoBodyContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  color: theme.colors.text01,
}));

export const LeftInfoFooterContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',

  columnGap: '0.3rem',

  color: theme.colors.text02,
}));

export const RightContainer = styled('div')(({ theme }) => ({
  '& > svg': {
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));
