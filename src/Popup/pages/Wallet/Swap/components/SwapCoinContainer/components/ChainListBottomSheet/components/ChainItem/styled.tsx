import { styled } from '@mui/material/styles';

type ChainButtonProps = {
  'data-is-active'?: boolean;
};

export const ChainButton = styled('button')<ChainButtonProps>(({ theme, ...props }) => ({
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

export const ChainButtonLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
});

export const ChainButtonLeftImageContainer = styled('div')({
  '& > img': {
    width: '2.4rem',
    height: '2.4rem',
  },
});

export const ChainButtonLeftTitleContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.8rem',

  color: theme.colors.text01,
}));

export const ChainButtonRightIconContainer = styled('div')(({ theme }) => ({
  width: '1.6rem',
  '& > svg': {
    '& > path': {
      fill: theme.colors.base06,
    },
  },
}));

export const ChainButtonRightContainer = styled('div')({});
