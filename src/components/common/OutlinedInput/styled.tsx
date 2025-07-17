import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

import IconButton from '../IconButton';

export const StyledInput = styled(OutlinedInput)<OutlinedInputProps>(({ theme, ...props }) => ({
  borderRadius: '0.4rem',

  backgroundColor: theme.palette.color.base100,
  color: theme.palette.color.base1300,

  width: '100%',

  '&.MuiOutlinedInput-root': {
    backgroundColor: theme.palette.color.base100,
  },

  '.MuiOutlinedInput-input': {
    fontFamily: theme.typography.b2_M.fontFamily,
    fontStyle: theme.typography.b2_M.fontStyle,
    fontSize: theme.typography.b2_M.fontSize,
    lineHeight: theme.typography.b2_M.lineHeight,
    letterSpacing: theme.typography.b2_M.letterSpacing,

    WebkitTextSecurity: props.type === 'password' ? 'disc' : 'none',
    MoxTextSecurity: props.type === 'password' ? 'disc' : 'none',

    '&[type=password]': {
      letterSpacing: '0.3rem',
    },

    '&::placeholder': {
      fontFamily: theme.typography.b4_R.fontFamily,
      fontStyle: theme.typography.b4_R.fontStyle,
      fontSize: theme.typography.b4_R.fontSize,
      lineHeight: theme.typography.b4_R.lineHeight,
      letterSpacing: theme.typography.b4_R.letterSpacing,

      color: theme.palette.color.base700,
    },
  },

  '.MuiOutlinedInput-notchedOutline': {
    border: props['error'] ? `0.1rem solid ${theme.palette.accentColor.red400}` : `0.1rem solid ${theme.palette.color.base200}`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: `0.1rem solid ${theme.palette.accentColor.purple400}`,
      '&: disabled': {
        border: `0.1rem solid ${theme.palette.color.base200}`,
      },
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: `0.1rem solid ${theme.palette.accentColor.purple400}`,
    },
  },

  '&.MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': {
    borderColor: theme.palette.color.base200,
  },
  '& .MuiInputBase-input.Mui-disabled': {
    WebkitTextFillColor: theme.palette.color.base600,
  },
}));

export const Container = styled('div')({
  width: '100%',
});

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

  color: props['data-is-error'] ? theme.palette.accentColor.red400 : theme.palette.color.base1300,
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
