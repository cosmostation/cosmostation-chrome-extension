import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { AccentColorsType } from '~/types/theme';

type StyledButtonProps = {
  'data-typo-varient': 'h4' | 'h5';
  'data-accent-color': AccentColorsType;
  'data-accent-hover-color': AccentColorsType;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: props['data-typo-varient'] === 'h4' ? '4.8rem' : '3.2rem',

  borderRadius: '0.8rem',

  backgroundColor: theme.accentColors[props['data-accent-color']],
  color: theme.accentColors.white,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: theme.accentColors[props['data-accent-hover-color']],
  },

  '&:disabled': {
    backgroundColor: theme.colors.base04,
    color: theme.colors.text02,

    cursor: 'default',

    '& svg': {
      fill: theme.colors.text02,

      '& > path': {
        fill: theme.colors.text02,
      },
    },
  },
}));

type ContentContainerProps = {
  'data-is-icon'?: number;
};

export const ContentContainer = styled('div')<ContentContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: props['data-is-icon'] ? '-0.6rem' : '0',

  '& :first-of-type': {
    marginRight: props['data-is-icon'] ? '0.4rem' : '0',
  },
}));

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.accentColors.purple01,
  },
}));
