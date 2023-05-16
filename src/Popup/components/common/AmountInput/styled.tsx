import { OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTextField = styled(OutlinedInput)(({ theme }) => ({
  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base01,
  color: theme.colors.text01,

  width: '100%',

  '& input:-webkit-autofill': {
    border: '0',
    WebkitTextFillColor: theme.colors.text01,
    WebkitBoxShadow: `0 0 0 0 ${theme.colors.base03} inset`,
    transition: 'background-color 5000s ease-in-out 0s',
  },
  '& input:-webkit-autofill:hover': {
    border: '0',
    WebkitTextFillColor: theme.colors.text01,
    WebkitBoxShadow: `0 0 0 0 ${theme.colors.base03} inset`,
    transition: 'background-color 5000s ease-in-out 0s',
  },
  '& input:-webkit-autofill:focus': {
    border: '0',
    WebkitTextFillColor: theme.colors.text01,
    WebkitBoxShadow: `0 0 0 0 ${theme.colors.base03} inset`,
    transition: 'background-color 5000s ease-in-out 0s',
  },

  '&.MuiOutlinedInput-root': {
    backgroundColor: theme.colors.base02,

    height: '2.6rem',
    padding: '0',
  },

  '.MuiOutlinedInput-input': {
    padding: '0',

    fontFamily: theme.typography.h3n.fontFamily,
    fontStyle: theme.typography.h3n.fontStyle,
    fontSize: theme.typography.h3n.fontSize,
    lineHeight: theme.typography.h3n.lineHeight,
    letterSpacing: theme.typography.h3n.letterSpacing,

    '&::placeholder': {
      fontFamily: theme.typography.h3n.fontFamily,
      fontStyle: theme.typography.h3n.fontStyle,
      fontSize: theme.typography.h3n.fontSize,
      lineHeight: theme.typography.h3n.lineHeight,
      letterSpacing: theme.typography.h3n.letterSpacing,

      color: theme.colors.text02,
      opacity: 0.8,
    },

    '&::-webkit-scrollbar': {
      width: '0.1rem',
      height: '0.1rem',
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.colors.base05,
    },
    '&::-webkit-scrollbar-corner': {
      backgroundColor: 'transparent',
    },
  },
  '.MuiOutlinedInput-notchedOutline': {
    border: `none`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  },
}));

export const HelperContainer = styled('div')({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  height: '1.5rem',
});

export const HelperTextContainer = styled('div')(({ theme }) => ({
  color: theme.accentColors.red,
}));
