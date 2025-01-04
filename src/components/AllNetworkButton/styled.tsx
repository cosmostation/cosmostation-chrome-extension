import { Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

import BaseChainImage from '../common/BaseChainImage';
import IconTextButton from '../common/IconTextButton';

type StyledIconTextButton = {
  variants?: 'normal' | 'chip';
};

export const StyledIconButton = styled(IconTextButton)<StyledIconTextButton>(({ theme, ...props }) => ({
  backgroundColor: props['variants'] === 'chip' ? theme.palette.commonColor.commonBlack : 'transparent',
  borderRadius: props['variants'] === 'chip' ? '1.9rem' : 'none',
  padding: props['variants'] === 'chip' ? '0.4rem 0.5rem' : '0',
}));

type GridMenuIconContainer = {
  sizeVariant: 'small' | 'medium' | 'large';
};

export const GridMenuIconContainer = styled('div')<GridMenuIconContainer>(({ ...props }) => {
  const size = {
    small: '1.4rem',
    medium: '1.6rem',
    large: '2rem',
  };

  return {
    width: size[props['sizeVariant']],
    height: size[props['sizeVariant']],

    '& svg': {
      width: '100%',
      height: '100%',
    },
  };
});

type ChevronIconContainer = {
  sizeVariant: 'small' | 'medium' | 'large';
  'data-is-open': boolean;
};

export const ChevronIconContainer = styled('div')<ChevronIconContainer>(({ ...props }) => {
  const size = {
    small: '1rem',
    medium: '1.2rem',
    large: '2rem',
  };

  return {
    width: size[props['sizeVariant']],
    height: size[props['sizeVariant']],
    transform: props['data-is-open'] ? 'rotate(180deg)' : 'rotate(0deg)',

    '& svg': {
      width: '100%',
      height: '100%',
    },
  };
});

export const TextContainer = styled(Typography)(({ theme }) => ({
  margin: '0 0.2rem',

  color: theme.palette.color.base1300,
}));

type ChainImageContainer = {
  sizeVariant: 'small' | 'medium' | 'large';
};

export const ChainImageContainer = styled(BaseChainImage)<ChainImageContainer>(({ ...props }) => {
  const size = {
    small: '1.4rem',
    medium: '1.6rem',
    large: '2rem',
  };

  return {
    width: size[props['sizeVariant']],
    height: size[props['sizeVariant']],
  };
});
