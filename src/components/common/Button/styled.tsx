import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { TypoVariantKeys } from '@/styles/theme';

type StyledButtonProps = {
  'data-typo-varient': TypoVariantKeys;
  variants?: 'light' | 'dark' | 'red';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => {
  const backgroundColor = (() => {
    const variants = props['variants'];
    if (variants === 'light') {
      return theme.palette.accentColor.purple200;
    }
    if (variants === 'dark') {
      return 'grey';
    }
    if (variants === 'red') {
      return theme.palette.accentColor.red200;
    }
    return theme.palette.accentColor.purple200;
  })();

  const hoverBackgroundColor = (() => {
    const variants = props['variants'];
    if (variants === 'light') {
      return theme.palette.accentColor.purple300;
    }
    if (variants === 'dark') {
      return 'grey';
    }
    if (variants === 'red') {
      return theme.palette.accentColor.red300;
    }
    return theme.palette.accentColor.purple300;
  })();

  return {
    border: 'none',

    width: '100%',
    height: '4.8rem',

    borderRadius: '0.8rem',

    backgroundColor: backgroundColor,
    color: theme.palette.color.base1300,

    cursor: 'pointer',

    '&:hover': {
      backgroundColor: hoverBackgroundColor,
    },

    '&:disabled': {
      backgroundColor: theme.palette.color.base600,
      color: theme.palette.color.base1200,

      cursor: 'default',

      '& svg': {
        fill: theme.palette.color.base1200,

        '& > path': {
          fill: theme.palette.color.base1200,
        },
      },
    },
  };
});

type ContentContainerProps = {
  'data-is-icon'?: boolean;
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
    color: theme.palette.color.base600,
  },
}));
