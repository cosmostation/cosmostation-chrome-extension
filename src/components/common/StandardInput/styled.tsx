import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { theme } from '@/styles/theme';

import IconButton from '../IconButton';

export const Container = styled('div')({
  width: '100%',
});

export const StyledInput = styled(TextField)<TextFieldProps>(({ theme, ...props }) => ({
  width: '100%',

  '& .MuiInput-root': {
    marginTop: '2.2rem',

    '&:before': {
      borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
    },

    '&:after': {
      borderBottom: `0.2rem solid rgba(154, 120, 253, 1)`,
      transition: 'none',
    },

    ':hover:not(.Mui-focused)': {
      '&:before': {
        borderBottom: `0.2rem solid rgba(154, 120, 253, 1)`,
      },
    },

    '& .MuiInputAdornment-root': {
      margin: '0 0.4rem 1.1rem',
    },

    '& .MuiInputBase-input': {
      padding: '0 0 1.1rem 0.4rem',

      height: 'fit-content',

      fontFamily: theme.typography.b1_R.fontFamily,
      fontStyle: theme.typography.b1_R.fontStyle,
      fontSize: theme.typography.b1_R.fontSize,
      lineHeight: theme.typography.b1_R.lineHeight,
      letterSpacing: theme.typography.b1_R.letterSpacing,

      color: theme.palette.color.base1300,

      WebkitTextSecurity: props.type === 'password' ? 'disc' : 'none',
      MoxTextSecurity: props.type === 'password' ? 'disc' : 'none',

      '&[type=password]': {
        letterSpacing: '0.5rem',
      },
    },
  },

  '& .MuiInputLabel-standard': {
    padding: '0 0.4rem',

    fontFamily: theme.typography.b1_R.fontFamily,
    fontStyle: theme.typography.b1_R.fontStyle,
    fontSize: theme.typography.b1_R.fontSize,
    lineHeight: theme.typography.b1_R.lineHeight,
    letterSpacing: theme.typography.b1_R.letterSpacing,

    color: theme.palette.color.base700,

    '&.Mui-focused': {
      color: 'rgba(154, 120, 253, 1)',
    },
  },

  '& .MuiInputLabel-shrink': {
    padding: '0 0.4rem 0.8rem',

    color: theme.palette.color.base1000,
  },
}));

export const BottomWrapper = styled('div')({
  height: '2rem',

  display: 'flex',
  alignItems: 'flex-start',
});

export const BottomContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',

  margin: '0.6rem 0.4rem 0',

  maxWidth: '100%',
  wordBreak: 'keep-all',
  whiteSpace: 'nowrap',

  '& > *': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RightBottomAdornmentContainer = styled('div')({
  marginLeft: 'auto',

  overflow: 'visible',
});

type HelperTextContainerProps = {
  'data-is-error': boolean;
};

export const HelperTextContainer = styled('div')<HelperTextContainerProps>(({ theme, ...props }) => ({
  width: '100%',

  color: props['data-is-error'] ? 'red' : theme.palette.color.base1300,
}));

export const StyledIconButton = styled(IconButton)({
  width: '2rem',
  height: '2rem',

  margin: '0',

  '& > svg': {
    width: '2rem',
    height: '2rem',
  },

  '&:hover': {
    opacity: 1,

    '& > svg': {
      fill: theme.palette.color.base1100,
      '& > path': {
        fill: theme.palette.color.base1100,
      },
    },
  },
});
