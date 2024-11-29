import { CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

import type { TypoVariantKeys } from '@/styles/theme';

type StyledButtonProps = {
  'data-typo-varient': TypoVariantKeys;
  variants?: 'light' | 'dark';
};

export const StyledButton = styled('button')<StyledButtonProps>(({ theme, ...props }) => ({
  border: 'none',

  width: '100%',
  height: '4.8rem',

  borderRadius: '0.8rem',

  backgroundColor: props['variants'] === 'light' ? theme.palette.accentColor.purple200 : 'grey',
  color: theme.palette.color.base1300,

  cursor: 'pointer',

  '&:hover': {
    backgroundColor: props['variants'] === 'light' ? 'blue' : 'black',
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
}));

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
