import { OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';

import Visibility from '~/images/icons/Visibility.svg';
import VisibilityOff from '~/images/icons/VisibilityOff.svg';

type StyledTextFieldProps = {
  'data-is-multiline-password'?: number;
};

export const StyledTextField = styled(OutlinedInput)<StyledTextFieldProps>(({ theme, ...props }) => ({
  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base01,
  color: theme.colors.text01,

  // height: '4.8rem',

  width: '100%',

  '.MuiOutlinedInput-input': {
    fontFamily: theme.typography.h5.fontFamily,
    fontStyle: theme.typography.h5.fontStyle,
    fontSize: theme.typography.h5.fontSize,
    lineHeight: theme.typography.h5.lineHeight,
    letterSpacing: theme.typography.h5.letterSpacing,

    WebkitTextSecurity: props['data-is-multiline-password'] ? 'disc' : 'none',
    MoxTextSecurity: props['data-is-multiline-password'] ? 'disc' : 'none',

    '&::placeholder': {
      fontFamily: theme.typography.h5.fontFamily,
      fontStyle: theme.typography.h5.fontStyle,
      fontSize: theme.typography.h5.fontSize,
      lineHeight: theme.typography.h5.lineHeight,
      letterSpacing: theme.typography.h5.letterSpacing,

      color: theme.colors.text02,
      opacity: 0.8,
    },

    '&[type=password]': {
      letterSpacing: '5px',
    },
  },
  '.MuiOutlinedInput-notchedOutline': {
    border: `1px solid ${theme.colors.base03}`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '1px solid #9C6CFF',
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '1px solid #9C6CFF',
    },
  },
}));

export const StyledVisibility = styled(Visibility)(({ theme }) => ({
  width: '1.65rem',
  height: '1.65rem',
  fill: theme.colors.base05,
}));

export const StyledVisibilityOff = styled(VisibilityOff)(({ theme }) => ({
  width: '1.65rem',
  height: '1.65rem',
  fill: theme.colors.base05,
}));

export const HelperContainer = styled('div')({
  marginTop: '0.8rem',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const HelperImageContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  '& > svg': {
    fill: theme.accentColors.red,
  },
}));

export const HelperTextContainer = styled('div')<{ error: number }>(({ theme, error }) => ({
  paddingLeft: '0.4rem',
  color: error ? theme.accentColors.red : theme.colors.text02,
}));
