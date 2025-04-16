import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { TypoVariantKeys } from '@/styles/theme';

type StyledButtonProps = {
  'data-typo-varient': TypoVariantKeys;
  variants?: 'light' | 'dark' | 'red' | 'primaryHoverGray';
  isSelected?: boolean;
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => {
  const borderColor = (() => {
    const variants = props['variants'];
    if (variants === 'light') {
      return theme.palette.accentColor.purple400;
    }
    if (variants === 'dark' || variants === 'primaryHoverGray') {
      return theme.palette.color.base300;
    }
    if (variants === 'red') {
      return theme.palette.accentColor.red200;
    }
    return theme.palette.accentColor.purple400;
  })();

  const hoverBorderColor = (() => {
    const variants = props['variants'];

    if (variants === 'light' || variants === 'primaryHoverGray') {
      return theme.palette.accentColor.purple500;
    }
    if (variants === 'dark') {
      return theme.palette.color.base400;
    }
    if (variants === 'red') {
      return theme.palette.accentColor.red300;
    }
    return theme.palette.accentColor.purple500;
  })();

  return {
    width: '100%',
    height: '4.8rem',

    borderRadius: '0.4rem',

    backgroundColor: 'transparent',
    color: theme.palette.color.base1300,

    cursor: 'pointer',

    border: props['isSelected'] ? `0.1rem solid ${theme.palette.accentColor.purple400}` : `0.1rem solid ${borderColor}`,

    '&:hover': {
      border: `0.1rem solid ${hoverBorderColor}`,
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
  'data-is-leadingIcon'?: boolean;
  'data-is-trailingIcon'?: boolean;
};

export const ContentContainer = styled('div')<ContentContainerProps>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  marginLeft: props['data-is-leadingIcon'] ? '-0.6rem' : '0',
  marginRight: props['data-is-trailingIcon'] ? '-0.6rem' : '0',

  '& :first-of-type': {
    marginRight: props['data-is-leadingIcon'] ? '0.4rem' : '0',
    marginLeft: props['data-is-trailingIcon'] ? '0.4rem' : '0',
  },
}));

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.color.base1300,
  },
}));
