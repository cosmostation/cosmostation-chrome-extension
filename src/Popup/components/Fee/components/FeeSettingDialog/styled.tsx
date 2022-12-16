import { styled } from '@mui/material/styles';

export const Container = styled('div')({
  padding: '1.7rem 1.6rem 1.6rem',
});

export const FeeCoinListContainer = styled('div')({
  maxHeight: '15.2rem',
  display: 'grid',
  gridTemplateColumns: '1fr',
  rowGap: '0.4rem',
  overflow: 'auto',
});

type FeeCoinButtonProps = {
  'data-is-active'?: boolean;
};

export const FeeCoinButton = styled('button')<FeeCoinButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0.7rem 1.2rem',

  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  cursor: 'pointer',

  '&:disabled': {
    cursor: 'default',

    '&:hover': {
      backgroundColor: theme.colors.base02,
    },
  },

  '&:hover': {
    backgroundColor: theme.colors.base03,
  },
}));

export const FeeCoinLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const FeeCoinLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const FeeCoinLeftInfoContainer = styled('div')({
  marginLeft: '0.8rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const FeeCoinTitleContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const FeeCoinLeftHeaderTitleContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const FeeCoinRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));
