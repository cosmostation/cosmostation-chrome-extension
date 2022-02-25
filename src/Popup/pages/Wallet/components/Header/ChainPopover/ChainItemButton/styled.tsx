import { styled } from '@mui/material/styles';

import IconButton from '~/Popup/components/common/IconButton';

type StyledButtonProps = {
  'data-is-active'?: number;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: '2.8rem',

  borderRadius: '0.8rem',

  backgroundColor: props['data-is-active'] ? theme.colors.base02 : 'transparent',
  color: theme.colors.text01,

  padding: '0',

  '&:hover': {
    backgroundColor: theme.colors.base02,

    '& > div': {
      '& > div:nth-of-type(3)': {
        backgroundColor: theme.colors.base02,
        display: 'flex',
      },
    },
  },

  cursor: 'pointer',

  position: 'relative',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',

  width: '100%',

  paddingLeft: '0.8rem',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '0 0.4rem 0 0',

  '& > img': {
    width: '1.6rem',
    height: '1.6rem',
  },
});

export const ContentLeftTextContainer = styled('div')(({ theme }) => ({
  color: theme.colors.text01,
}));

export const ContentRightContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
});

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  paddingRight: '0.6rem',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base06,
  },
}));

export const DeleteContainer = styled('div')(({ theme }) => ({
  display: 'none',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'absolute',

  right: '0.6rem',

  '& > svg': {
    fill: theme.colors.base05,
  },
}));
