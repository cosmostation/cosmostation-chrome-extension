import type { TextFieldProps } from '@mui/material';
import { CircularProgress, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

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
      borderBottom: `0.2rem solid ${theme.palette.accentColor.purple400}`,
      transition: 'none',
    },

    ':hover:not(.Mui-focused)': {
      '&:before': {
        borderBottom: `0.2rem solid ${theme.palette.color.base500}`,
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

      '&[type=number]': {
        fontFamily: theme.typography.h3n_B.fontFamily,
        fontStyle: theme.typography.h3n_B.fontStyle,
        fontSize: theme.typography.h3n_B.fontSize,
        lineHeight: theme.typography.h3n_B.lineHeight,
        letterSpacing: theme.typography.h3n_B.letterSpacing,

        MozAppearance: 'textfield',
        '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
          WebkitAppearance: 'none',
          margin: '0',
        },
      },

      '&::placeholder': {
        color: theme.palette.color.base700,
      },
    },
    '& .MuiInputBase-input.Mui-disabled': {
      WebkitTextFillColor: theme.palette.color.base1300,
    },
  },

  '& .MuiInput-underline.Mui-disabled': {
    '&:before': {
      borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
    },

    '&:after': {
      borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
      transition: 'none',
    },

    ':hover:not(.Mui-focused):before': {
      borderBottom: `0.1rem solid ${theme.palette.color.base200}`,
      transition: 'none',
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
      color: theme.palette.accentColor.purple400,
    },
  },

  '& .MuiInputLabel-shrink': {
    padding: '0 0.4rem 0.8rem',

    color: theme.palette.color.base1000,
  },
}));

export const BottomWrapper = styled('div')({});

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
  display: 'flex',
  justifyContent: 'flex-end',

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

export const StyledCircularProgress = styled(CircularProgress)(({ theme }) => ({
  '&.MuiCircularProgress-root': {
    color: theme.palette.accentColor.purple200,
  },
}));

export const StyledIconButton = styled(IconButton)(({ theme }) => ({
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
}));
