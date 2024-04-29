import { styled } from '@mui/material/styles';

import BottomArrow from '~/images/icons/BottomArrow2.svg';

export const StyledButton = styled('button')(({ theme }) => ({
  width: '100%',

  borderRadius: '0.8rem',

  backgroundColor: 'transparent',
  color: theme.accentColors.white,

  border: `0.1rem solid ${theme.colors.base04}`,

  padding: '0.6rem 1.2rem 0.6rem 0.8rem',

  textAlign: 'left',

  '&:hover': {
    border: `0.1rem solid ${theme.colors.base03}`,
  },

  cursor: 'pointer',
}));

export const ContentContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const ContentLeftContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
});

export const ContentLeftImageContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  position: 'relative',

  width: '2.8rem',
  height: '2.8rem',
});

type ContentLeftAbsoluteImageContainerProps = {
  'data-is-custom'?: boolean;
};

export const ContentLeftAbsoluteImageContainer = styled('div')<ContentLeftAbsoluteImageContainerProps>(({ ...props }) => ({
  position: 'absolute',

  width: '2.8rem',
  height: '2.8rem',

  '& > img': {
    width: props['data-is-custom'] ? '2rem' : '2.8rem',
    height: props['data-is-custom'] ? '2rem' : '2.8rem',

    margin: props['data-is-custom'] ? '0.4rem' : '0',
  },
}));

export const ContentLeftTextContainer = styled('div')(({ theme }) => ({
  marginLeft: '0.4rem',
  color: theme.colors.text01,
}));

export const ContentRightImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',

  '& > svg': {
    width: '1.6rem',
    height: '1.6rem',

    fill: theme.colors.base05,
  },
}));

export const StyledBottomArrow = styled(BottomArrow)(({ theme }) => ({
  fill: theme.colors.base05,

  '& > path': {
    fill: theme.colors.base05,
  },
}));

export const StyledUpArrow = styled(BottomArrow)(({ theme }) => ({
  fill: theme.colors.base05,

  transform: 'rotate(180deg)',

  '& > path': {
    fill: theme.colors.base05,
  },
}));
