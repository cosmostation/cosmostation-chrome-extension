import type { TextFieldProps } from '@mui/material';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledInput = styled(TextField)<TextFieldProps>(({ theme, ...props }) => ({
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
      padding: '0 0.4rem 1.1rem',

      height: 'fit-content',

      fontFamily: theme.typography.b1_R.fontFamily,
      fontStyle: theme.typography.b1_R.fontStyle,
      fontSize: theme.typography.b1_R.fontSize,
      lineHeight: theme.typography.b1_R.lineHeight,
      letterSpacing: theme.typography.b1_R.letterSpacing,

      color: theme.palette.color.base1300,

      WebkitTextSecurity: props.type === 'password' ? 'disc' : 'none',
      MoxTextSecurity: props.type === 'password' ? 'disc' : 'none',
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

    fontFamily: theme.typography.b4_R.fontFamily,
    fontStyle: theme.typography.b4_R.fontStyle,
    fontSize: theme.typography.b4_R.fontSize,
    lineHeight: theme.typography.b4_R.lineHeight,
    letterSpacing: theme.typography.b4_R.letterSpacing,

    color: theme.palette.color.base1000,
  },
}));

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
