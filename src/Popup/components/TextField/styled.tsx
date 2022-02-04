import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTextField = styled(TextField)(({ theme }) => ({
  borderRadius: '0.8rem',

  backgroundColor: theme.colors.base01,
  color: theme.colors.text01,

  //   fontFamily: theme.typography.h1.fontFamily,

  '.MuiOutlinedInput-root': {
    height: '4.8rem',

    '.MuiOutlinedInput-input': {
      '&::placeholder': {
        fontFamily: theme.typography.h5.fontFamily,
        fontStyle: theme.typography.h5.fontStyle,
        fontSize: theme.typography.h5.fontSize,
        lineHeight: theme.typography.h5.lineHeight,
        letterSpacing: theme.typography.h5.letterSpacing,
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
  },
}));
