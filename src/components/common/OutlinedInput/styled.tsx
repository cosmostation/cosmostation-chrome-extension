import { OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledTextField = styled(OutlinedInput)(({ theme }) => ({
  borderRadius: '0.4rem',

  backgroundColor: theme.palette.color.base100,
  color: theme.palette.color.base1300,

  width: '100%',

  '&.MuiOutlinedInput-root': {
    backgroundColor: theme.palette.color.base100,
  },

  '.MuiOutlinedInput-input': {
    fontFamily: theme.typography.b4_R.fontFamily,
    fontStyle: theme.typography.b4_R.fontStyle,
    fontSize: theme.typography.b4_R.fontSize,
    lineHeight: theme.typography.b4_R.lineHeight,
    letterSpacing: theme.typography.b4_R.letterSpacing,

    '&::placeholder': {
      fontFamily: theme.typography.b4_R.fontFamily,
      fontStyle: theme.typography.b4_R.fontStyle,
      fontSize: theme.typography.b4_R.fontSize,
      lineHeight: theme.typography.b4_R.lineHeight,
      letterSpacing: theme.typography.b4_R.letterSpacing,

      color: theme.palette.color.base600,
    },
  },

  '.MuiOutlinedInput-notchedOutline': {
    border: `0.1rem solid ${theme.palette.color.base200}`,
  },

  '&:hover': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '0.1rem solid #9C6CFF',
    },
  },
  '&.Mui-focused': {
    '.MuiOutlinedInput-notchedOutline': {
      border: '0.1rem solid #9C6CFF',
    },
  },
}));
