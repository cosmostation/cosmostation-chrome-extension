import { styled } from '@mui/material/styles';

type ChainButtonProps = {
  'data-is-active'?: number;
};

export const ChainButton = styled('button')<ChainButtonProps>(({ theme, ...props }) => ({
  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  border: 0,

  borderRadius: '0.8rem',

  padding: '0 1.2rem 0 0.8rem',

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

export const ChainLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ChainLeftImageContainer = styled('div')({
  width: '3.2rem',
  height: '3.2rem',

  '& > img': {
    width: '3.2rem',
    height: '3.2rem',
  },
});

export const ChainLeftInfoContainer = styled('div')({
  marginLeft: '0.4rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const ChainLeftChainNameContainer = styled('div')(({ theme }) => ({
  textAlign: 'left',
  color: theme.colors.text01,
}));

export const ChainLeftChannelIdContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text02,
}));

export const ChainRightContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg > path': {
    fill: theme.colors.base06,
  },
}));
